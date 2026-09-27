# Backend Architecture Design

This document outlines the complete backend architecture for the **GitHub Pokémon Card Generator**. The backend is fully serverless, relying on Vercel's global edge network, Python serverless functions, and Upstash Redis.

## 🏗️ High-Level Architecture Diagram

```mermaid
graph TD
    Client([Client Browser])
    
    subgraph Vercel Edge Network
        CDN[Vercel CDN / Frontend]
        Middleware[Edge Middleware<br/>middleware.ts]
    end
    
    subgraph Vercel Serverless (Python 3.12)
        API_Card[api/card.py]
        API_Counter[api/counter.py]
        API_Health[api/health.py]
    end
    
    subgraph Upstash (Serverless Redis)
        Redis_Cache[(Redis Cache & Rate Limiting)]
    end
    
    subgraph External APIs
        GitHub[GitHub REST & GraphQL API]
    end
    
    Client -->|Static Assets| CDN
    Client -->|API Requests| Middleware
    
    Middleware -->|Check Limits| Redis_Cache
    Middleware -->|Blocked 429| Client
    Middleware -->|Allowed| API_Card
    Middleware -->|Allowed| API_Counter
    Middleware -->|Allowed| API_Health
    
    API_Card <-->|Check/Set Cache & Mutex| Redis_Cache
    API_Card <-->|Fetch Profile/Repos/PRs| GitHub
    API_Counter <-->|Get Total Cards| Redis_Cache
```

---

## 📂 Backend File Structure & Responsibilities

The backend is organized into distinct responsibilities inside the root directory, designed specifically to be zero-config on Vercel:

### 1. `middleware.ts` (Vercel Edge Middleware)
- **Role**: Sits at the Edge (closest to the user geographically).
- **Purpose**: Intercepts incoming `/api/*` traffic to perform IP-based rate limiting before the request even reaches the Python runtime.
- **Tech**: Uses `@upstash/ratelimit` to allow a maximum of 10 requests per 60 seconds per IP via a Sliding Window algorithm.

### 2. `api/card.py` (Core Logic)
- **Role**: The main Python Serverless Function.
- **Purpose**: 
  - Validates the `?user=` query parameter.
  - Checks if a cached card exists in Upstash Redis (to save GitHub API tokens).
  - Fetches live data concurrently from GitHub APIs (Profile, Repos, Events, Commits, PRs).
  - Computes the user's "XP", "Level", "HP", and "Top Languages" using dynamic math.
  - Generates the final card JSON, caches it in Redis (TTL: 5 minutes), and atomically increments the global cards generated counter.
- **Scale**: Because it's a Vercel Serverless function, it automatically scales from 0 to thousands of concurrent executions globally.

### 3. `api/counter.py`
- **Role**: Lightweight Counter Endpoint.
- **Purpose**: Reads the `gtc:cards_generated` key directly from Upstash Redis and returns it to the client. Used by the frontend for a live polling dashboard without heavy server load.

### 4. `api/health.py`
- **Role**: Diagnostics.
- **Purpose**: A quick endpoint to verify that the API is up, Upstash is reachable, and the GitHub token pool is loaded.

### 5. `vercel.json`
- **Role**: Deployment & Routing Config.
- **Purpose**: Instructs Vercel to build the `frontend` folder (`npm run build`) while redirecting `/api/*` routes back to the root `api/` folder. It stitches the React frontend and Python backend together on a single domain.

### 6. `requirements.txt`
- **Role**: Python Dependencies.
- **Purpose**: Installs `httpx` (for fast, async API calls) and `upstash-redis` (for serverless caching).

---

## 🔒 Security, Rate Limiting & Scaling Strategies

### API Rate Limiting (Edge Middleware)
To protect the backend from abuse and prevent excessive GitHub API consumption, the system uses Edge Rate Limiting:
- **Location**: Runs on Vercel's global Edge Network, meaning malicious requests are blocked near the user's location without invoking the Python backend.
- **Algorithm**: Sliding Window algorithm managed by `@upstash/ratelimit`.
- **Threshold**: 10 requests per 60 seconds per IP address.
- **Fail-Open Design**: If Upstash Redis experiences downtime, the rate limiter catches the exception and allows traffic to pass through, ensuring the app remains usable.
- **Headers Returned**: The middleware automatically injects rate limit tracking headers into responses:
  - `X-RateLimit-Limit`: Maximum allowed requests.
  - `X-RateLimit-Remaining`: Requests left in the current window.
  - `X-RateLimit-Reset`: Timestamp when the limit resets.
  - `Retry-After`: Provided when a client hits a `429 Too Many Requests` error.

### Cache Stampede Prevention
If a cache expires and 100 users request the same profile simultaneously, the backend utilizes an Upstash Redis Mutex lock. Only the *first* request hits GitHub; the others wait briefly for the new cache to be populated.

### Token Rotation Pool
GitHub restricts unauthenticated calls to 60/hr, and token calls to 5,000/hr. The backend supports an array of `GITHUB_TOKENS`. It stores token budgets in an Upstash Sorted Set and intelligently routes the request through the token with the highest remaining budget.

---

## 🔑 Environment Variables Required

For this architecture to function, the following environment variables must be configured in your Vercel Dashboard:

1. **`GITHUB_TOKENS`**: A comma-separated list of GitHub Personal Access Tokens. Used to bypass strict unauthenticated limits.
2. **`UPSTASH_REDIS_REST_URL`**: The REST API URL provided by your Upstash Redis database.
3. **`UPSTASH_REDIS_REST_TOKEN`**: The authentication token for Upstash REST access.

