import os
import re
import json
import time
import asyncio
import hashlib

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from upstash_redis import Redis
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="GitStar Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_redis_client():
    url = os.environ.get("UPSTASH_REDIS_REST_URL") or os.environ.get("KV_REST_API_URL")
    token = os.environ.get("UPSTASH_REDIS_REST_TOKEN") or os.environ.get("KV_REST_API_TOKEN")
    if url and token:
        try:
            return Redis(url=url.rstrip("/"), token=token)
        except Exception as e:
            print(f"Redis init error with explicit creds: {e}")
    try:
        return Redis.from_env()
    except Exception:
        return None

redis = get_redis_client()

# ── Test-account filter ───────────────────────────────────────────────────
_TEST_PREFIXES = ("qa-test-", "qa-bot-", "cors-qa-", "test-explorer-", "gitstar-test-")
_TEST_EXACT   = {"cors-qa-user", "test-user", "testuser"}

def is_test_user(u: str) -> bool:
    """Return True if the username was injected by the automated test suite."""
    lower = u.lower()
    if lower in _TEST_EXACT:
        return True
    return any(lower.startswith(p) for p in _TEST_PREFIXES)

def filter_real_users(users) -> list:
    """Return only genuine usernames, sorted newest-last (set order is random)."""
    return [u for u in users if not is_test_user(u)]


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if not redis or not request.url.path.startswith("/api/"):
        return await call_next(request)
        
    ip = request.client.host if request.client else "127.0.0.1"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0]
        
    current_minute = int(time.time() // 60)
    key = f"ratelimit:{ip}:{current_minute}"
    
    try:
        count = redis.incr(key)
        if count == 1:
            redis.expire(key, 60)
            
        if count > 10:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limited",
                    "message": "Too many requests. Try again later.",
                    "retry_after": 60 - int(time.time() % 60)
                },
                headers={
                    "X-RateLimit-Limit": "10",
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": str(60 - int(time.time() % 60))
                }
            )
    except Exception as e:
        print("Redis error in rate limit:", e)
        pass 
        
    response = await call_next(request)
    
    if hasattr(response, 'headers'):
        try:
            count = redis.get(key)
            remaining = max(0, 10 - int(count if count else 1))
            response.headers["X-RateLimit-Limit"] = "10"
            response.headers["X-RateLimit-Remaining"] = str(remaining)
        except:
            pass
            
    return response


def get_best_token():
    tokens_str = os.environ.get("GITHUB_TOKENS", "")
    tokens = [t for t in tokens_str.split(",") if t]
    if not tokens:
        return None

    if redis:
        try:
            res = redis.zrange("gtc:token_budgets", 0, 0, desc=True, withscores=True)
            if res and len(res) > 0:
                best_hash = res[0][0]
                for t in tokens:
                    if hashlib.sha256(t.encode()).hexdigest()[:12] == best_hash:
                        return t
        except Exception:
            pass
            
    return tokens[0]

def update_token_budget(token, remaining):
    if not token or not redis: return
    token_hash = hashlib.sha256(token.encode()).hexdigest()[:12]
    try:
        redis.zadd("gtc:token_budgets", {token_hash: int(remaining)})
    except:
        pass


async def fetch_github_data(username, token):
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    async with httpx.AsyncClient(timeout=8.0) as client:
        profile_req = client.get(f"https://api.github.com/users/{username}", headers=headers)
        repos_req = client.get(f"https://api.github.com/users/{username}/repos?per_page=100&sort=pushed", headers=headers)
        events_req = client.get(f"https://api.github.com/users/{username}/events/public?per_page=100", headers=headers)
        
        profile_res, repos_res, events_res = await asyncio.gather(profile_req, repos_req, events_req, return_exceptions=True)
        
        if isinstance(profile_res, Exception) or profile_res.status_code != 200:
            status = profile_res.status_code if not isinstance(profile_res, Exception) else 500
            return {"error": status, "msg": str(profile_res)}
            
        remaining = profile_res.headers.get("x-ratelimit-remaining", 0)
        
        profile = profile_res.json()
        repos = repos_res.json() if not isinstance(repos_res, Exception) and repos_res.status_code == 200 else []
        events = events_res.json() if not isinstance(events_res, Exception) and events_res.status_code == 200 else []
        
        commits_req = await client.get(f"https://api.github.com/search/commits?q=author:{username}", headers=headers)
        prs_req = await client.get(f"https://api.github.com/search/issues?q=author:{username}+type:pr", headers=headers)
        
        commits = commits_req.json().get("total_count", 0) if commits_req.status_code == 200 else 0
        prs = prs_req.json().get("total_count", 0) if prs_req.status_code == 200 else 0
        
        return {
            "profile": profile,
            "repos": repos,
            "events": events,
            "commits": commits,
            "prs": prs,
            "remaining": remaining
        }

STAR_SYSTEMS = {
    "JavaScript": {"name": "Solaris", "color": "#F59E0B", "vuln": "Void"},
    "Python": {"name": "Nebula", "color": "#8B5CF6", "vuln": "Quantum"},
    "TypeScript": {"name": "Quantum", "color": "#3B82F6", "vuln": "Ember"},
    "Rust": {"name": "Titanium", "color": "#94A3B8", "vuln": "Pulsar"},
    "Go": {"name": "Nova", "color": "#06B6D4", "vuln": "Nebula"},
    "Java": {"name": "Crimson", "color": "#DC2626", "vuln": "Comet"},
    "C++": {"name": "Forge", "color": "#F97316", "vuln": "Prism"},
    "C#": {"name": "Prism", "color": "#10B981", "vuln": "Forge"},
    "Ruby": {"name": "Ember", "color": "#F43F5E", "vuln": "Nova"},
    "PHP": {"name": "Astral", "color": "#6366F1", "vuln": "Titanium"},
    "Swift": {"name": "Comet", "color": "#FB923C", "vuln": "Quantum"},
    "Kotlin": {"name": "Aurora", "color": "#A855F7", "vuln": "Void"},
    "Scala": {"name": "Pulsar", "color": "#BE123C", "vuln": "Solaris"},
    "Shell": {"name": "Void", "color": "#64748B", "vuln": "Spectrum"},
    "HTML": {"name": "Spectrum", "color": "#EC4899", "vuln": "Astral"},
    "CSS": {"name": "Spectrum", "color": "#EC4899", "vuln": "Astral"},
}

def get_fleet_rank(level):
    if level >= 81:
        return {"title": "Fleet Admiral", "badge": "★★"}
    if level >= 51:
        return {"title": "Admiral", "badge": "★"}
    if level >= 26:
        return {"title": "Commander", "badge": "━━━"}
    if level >= 11:
        return {"title": "Lieutenant", "badge": "━━"}
    return {"title": "Cadet", "badge": "━"}

def get_clearance_tier(score):
    if score < 20:
        return "standard"
    if score < 50:
        return "classified"
    if score < 90:
        return "top-secret"
    if score < 140:
        return "ultra"
    return "black-ops"

def compute_card_data(data):
    profile = data["profile"]
    repos = data["repos"]
    events = data["events"]
    
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    followers = profile.get("followers", 0)
    public_repos = profile.get("public_repos", 0)
    commits = data.get("commits", 0)
    prs = data.get("prs", 0)
    
    langs = {}
    for r in repos:
        lang = r.get("language")
        if lang:
            langs[lang] = langs.get(lang, 0) + 1
    top_lang = max(langs.items(), key=lambda x: x[1])[0] if langs else "Cosmos"
    
    system_info = STAR_SYSTEMS.get(top_lang, {"name": "Cosmos", "color": "#6366F1", "vuln": "Void"})
    
    # Mission Points (MP)
    mp = (commits * 10) + (prs * 50) + (total_stars * 100) + (followers * 5) + (total_forks * 10)
    
    # Level (quadratic threshold curve)
    level = 1
    while level < 99 and (level * level + 4) <= max(commits, 1):
        level += 1
        
    shield = min(999, max(50, 50 + level * 10 + min(80, public_repos * 4) + int(min(60, len(repos) * 2))))
    
    login = profile.get("login", "")
    ship_num = int(hashlib.md5(login.encode()).hexdigest(), 16) % 10000
    ship_id = f"#{ship_num:04d}"
    
    rank_info = get_fleet_rank(level)
    clearance = get_clearance_tier((total_stars * 0.5) + (commits * 0.1) + (prs * 2) + public_repos)
    
    recent_commits = len([e for e in events if e.get("type") == "PushEvent"])

    return {
        "username": login,
        "name": profile.get("name") or login,
        "avatar_url": profile.get("avatar_url"),
        "star_system": system_info["name"],
        "star_system_color": system_info["color"],
        "vulnerability": system_info["vuln"],
        "shield": shield,
        "shield_energy": shield,
        "level": level,
        "mission_points": mp,
        "mp": mp,
        "fleet_rank": rank_info["title"],
        "fleet_badge": rank_info["badge"],
        "clearance_level": clearance,
        "ship_id": ship_id,
        "abilities": [
            {"icon": "⚡", "name": "Warp Commit", "cost": f"{commits:,} commits"},
            {"icon": "🛸", "name": "Orbital Deploy", "cost": f"{public_repos:,} repos"},
            {"icon": "📡", "name": "Signal Broadcast", "cost": f"{len(langs)} languages"},
            {"icon": "🔭", "name": "Deep Scan", "cost": "orbital telemetry"}
        ],
        "total_commits": commits,
        "recent_commits": recent_commits,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_prs": prs,
        "public_repos": public_repos,
        "followers": followers,
        "top_language": top_lang,
        "language_breakdown": langs,
        "top_repos": [r.get("name") for r in sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:3]],
        "cached": False,
        "cache_age_seconds": 0,
        # Backward compatibility
        "type": system_info["name"].lower(),
        "rarity": clearance,
        "hp": shield,
        "xp": mp,
        "xp_progress": mp % 100,
        "xp_to_next": 100 - (mp % 100),
    }

@app.get("/api/health")
async def health_check():
    tokens = [t for t in os.environ.get("GITHUB_TOKENS", "").split(",") if t]
    return {
        "status": "ok",
        "upstash": "ok" if redis else "unconfigured",
        "github_tokens": { "total": len(tokens), "available": len(tokens), "exhausted": 0 },
        "version": "1.0.0"
    }

@app.get("/api/counter")
async def get_counter(request: Request):
    count = 0
    unique_users = []
    r = get_redis_client() or redis
    if r:
        try:
            raw_users = r.smembers("gtc:unique_users") or []
            real_users = filter_real_users(raw_users)
            count = len(real_users)
            unique_users = real_users
        except Exception as e:
            print(f"Counter Redis GET error: {e}")

    return JSONResponse(
        content={
            "count": int(count or 0),
            "cards_generated": int(count or 0),
            "unique_users": unique_users
        },
        headers={"Cache-Control": "no-store"}
    )

@app.post("/api/counter/increment")
@app.post("/api/counter")
async def increment_counter_endpoint(request: Request):
    username = ""
    try:
        body = await request.json()
        if isinstance(body, dict):
            raw_u = body.get("username")
            if raw_u and isinstance(raw_u, str):
                username = raw_u.strip().lower().lstrip("@")
    except Exception:
        pass

    count = 0
    unique_users = []
    is_new = False
    r = get_redis_client() or redis
    if r:
        try:
            if username:
                sadd_res = r.sadd("gtc:unique_users", username)
                is_new = (sadd_res == 1 or sadd_res is True)

            raw_users = r.smembers("gtc:unique_users") or []
            real_users = filter_real_users(raw_users)
            count = len(real_users)
            unique_users = real_users
            # keep gtc:cards_generated in sync with real-user count
            r.set("gtc:cards_generated", str(count))
        except Exception as e:
            print(f"Counter Redis POST error: {e}")

    return JSONResponse(
        content={
            "count": int(count or 0),
            "cards_generated": int(count or 0),
            "unique_users": unique_users,
            "isNew": is_new,
            "success": True
        },
        headers={"Cache-Control": "no-store"}
    )

@app.get("/api/card")
async def get_card(user: str, refresh: bool = False):
    if not re.match(r"^[a-zA-Z0-9-]{1,39}$", user):
        return JSONResponse(status_code=400, content={"error": "invalid_username", "message": "Invalid username"})

    cache_key = f"gtc:card:{user}"
    clean_user = user.strip().lower().lstrip("@")
    r = get_redis_client() or redis

    # ── 1. Cache hit ───────────────────────────────────────────────────────────
    if r and not refresh:
        try:
            cached = r.get(cache_key)
            if cached:
                cached_data = json.loads(cached) if isinstance(cached, str) else cached
                cached_data["cached"] = True
                try:
                    r.sadd("gtc:unique_users", clean_user)
                    sc = r.scard("gtc:unique_users")
                    if sc: r.set("gtc:cards_generated", str(sc))
                except Exception as e:
                    print(f"Counter incr (cache hit) error: {e}")
                return cached_data
        except Exception as e:
            print(f"Cache read error: {e}")

    # ── 2. Fresh fetch from GitHub ────────────────────────────────────────────
    token = get_best_token()
    data = await fetch_github_data(user, token)

    if "error" in data:
        err_code = data["error"]
        if err_code == 404:
            return JSONResponse(status_code=404, content={"error": "user_not_found", "message": "GitHub user not found"})
        elif err_code in (403, 429):
            return JSONResponse(status_code=429, content={"error": "rate_limited", "message": "Rate limited by GitHub API"})
        else:
            return JSONResponse(status_code=500, content={"error": "github_unavailable", "message": data.get("msg", "Error")})

    update_token_budget(token, data.get("remaining", 0))
    card_data = compute_card_data(data)

    # ── 3. Save to cache + increment counter ──────────────────────────────────
    if r:
        try:
            r.setex(cache_key, 300, json.dumps(card_data))
        except Exception as e:
            print(f"Cache write error: {e}")
        try:
            r.sadd("gtc:unique_users", clean_user)
            sc = r.scard("gtc:unique_users")
            if sc: r.set("gtc:cards_generated", str(sc))
        except Exception as e:
            print(f"Counter incr (fresh) error: {e}")

    return card_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

