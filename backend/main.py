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

app = FastAPI(title="GitHub Pokemon Card API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    redis = Redis.from_env()
except Exception:
    redis = None

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

def compute_card_data(data):
    profile = data["profile"]
    repos = data["repos"]
    events = data["events"]
    
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    
    langs = {}
    for r in repos:
        lang = r.get("language")
        if lang:
            langs[lang] = langs.get(lang, 0) + 1
    top_lang = max(langs.items(), key=lambda x: x[1])[0] if langs else "Unknown"
    
    xp = (data["commits"] * 10) + (data["prs"] * 50) + (total_stars * 100)
    level = int(xp ** 0.5 / 5) + 1
    hp = min(999, level * 10 + 50)
    
    poke_id = (int(hashlib.md5(profile.get("login", "").encode()).hexdigest(), 16) % 151) + 1
    
    return {
        "username": profile.get("login"),
        "name": profile.get("name") or profile.get("login"),
        "avatar_url": profile.get("avatar_url"),
        "type": "normal",
        "rarity": "rare",
        "hp": hp,
        "level": level,
        "xp": xp,
        "xp_progress": xp % 100,
        "xp_to_next": 100 - (xp % 100),
        "total_commits": data["commits"],
        "recent_commits": len([e for e in events if e.get("type") == "PushEvent"]),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_prs": data["prs"],
        "public_repos": profile.get("public_repos", 0),
        "followers": profile.get("followers", 0),
        "top_language": top_lang,
        "language_breakdown": langs,
        "streak": { "label": "Active", "color": "#FF6B35" },
        "stage": "Basic",
        "account_age_years": 1,
        "pokemon_id": poke_id,
        "top_repos": [r.get("name") for r in sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:3]],
        "cached": False,
        "cache_age_seconds": 0
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
async def get_counter():
    count = 0
    if redis:
        try:
            val = redis.get("gtc:cards_generated")
            if val is not None:
                count = int(val)
        except:
            pass
    return {"count": count}

@app.get("/api/card")
async def get_card(user: str, refresh: bool = False):
    if not re.match(r"^[a-zA-Z0-9-]{1,39}$", user):
        return JSONResponse(status_code=400, content={"error": "invalid_username", "message": "Invalid username"})
        
    cache_key = f"gtc:card:{user}"
    
    if redis and not refresh:
        try:
            cached = redis.get(cache_key)
            if cached:
                cached_data = json.loads(cached) if isinstance(cached, str) else cached
                cached_data["cached"] = True
                return cached_data
        except:
            pass

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
    
    if redis:
        try:
            redis.setex(cache_key, 300, json.dumps(card_data))
            redis.incr("gtc:cards_generated")
        except:
            pass
            
    return card_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
