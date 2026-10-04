# GitStar Explorer Card

> Turn your GitHub profile into an interstellar explorer trading card!

Your code contributions become missions, your languages map to star systems, and your activity determines your rank in the fleet. A fully original, space-themed alternative to generic profile cards — no copyrighted content, just pure sci-fi.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://your-deployment-url.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

---

## Preview

```
┌─────────────────────────────────────────┐
│  EXPLORER: octocat          SHIELD: 847 │
│  ┌─────────────────────┐   Rank: Cmdr   │
│  │                     │   Clearance:    │
│  │    [Avatar/Ship     │   ★★★ TOP SEC  │
│  │     Illustration]   │                 │
│  │                     │                 │
│  └─────────────────────┘                 │
│  ◆ SOLARIS SYSTEM          LVL 42       │
├─────────────────────────────────────────┤
│  ⚡ Warp Commit ·········· 1,247 commits │
│  🛸 Orbital Deploy ·······  38 repos     │
│  📡 Signal Broadcast ······  7 languages │
│  🔭 Deep Scan ············ 1,460 days    │
├─────────────────────────────────────────┤
│  ║████████████░░░░║  MP: 12,450 / 15,000│
├─────────────────────────────────────────┤
│  VULN: Void    ID: #0847    Joined 2021 │
└─────────────────────────────────────────┘
```

---

## Features

- **Dynamic Stats** — Commits, PRs, stars, and repos transform into Mission Points (MP), Shield Energy, and Fleet Rank
- **Star System Theming** — Your top programming language determines your card's star system, color palette, and visual style
- **Clearance Levels** — Activity-based rarity tiers from Standard to Black Ops with unique card border effects
- **Fleet Ranks** — Progress from Cadet to Fleet Admiral based on your contribution level
- **Shareable URLs** — Every card has a unique URL by username (e.g., `/octocat`)
- **Responsive Design** — Mobile-friendly layout that works on any screen size
- **Space-Themed Animations** — Warp-speed loading effects while your explorer data is fetched
- **Contribution Heatmap** — Visual grid of your recent GitHub activity
- **Top Repositories** — Your best repos displayed with custom scoring

---

## How It Works

### GitHub Data → Explorer Stats

| GitHub Metric | Explorer Stat | Formula |
|---|---|---|
| Commits | **Mission Points (MP)** | `commits × 10` |
| Pull Requests | **Mission Points (MP)** | `PRs × 50` |
| Stars Received | **Mission Points (MP)** | `stars × 100` |
| Followers + Forks + Account Age | **Mission Points (MP)** | Added to total |
| Cumulative Commits | **Level** | Quadratic threshold curve |
| Level + Repos + Stars + Age | **Shield Energy** | Composite score (capped 50–999) |
| Weighted Activity Score | **Clearance Level** | Tiered classification |
| Top Language | **Star System** | Language-to-system mapping |
| Username | **Ship ID** | MD5 hash mod for consistent assignment |

### Star Systems

Each programming language maps to a star system with a unique color palette:

| Language | Star System | Color Palette | Lore |
|---|---|---|---|
| JavaScript | **Solaris** | Warm yellow / gold | Energy-based, powers everything |
| Python | **Nebula** | Deep purple / violet | Mysterious, vast, adaptable |
| TypeScript | **Quantum** | Electric blue | Precise, structured, powerful |
| Rust | **Titanium** | Gunmetal / silver | Indestructible engineering |
| Go | **Nova** | Cyan / teal | Fast, explosive, efficient |
| Java | **Crimson** | Deep red / maroon | Ancient, massive, reliable |
| C++ | **Forge** | Orange / molten | Raw power, forged in fire |
| C# | **Prism** | Green / emerald | Versatile, refractive |
| Ruby | **Ember** | Ruby red / pink | Elegant, radiant |
| PHP | **Astral** | Indigo / lavender | Everywhere, ethereal |
| Swift | **Comet** | Bright orange | Fast-moving, sleek |
| Kotlin | **Aurora** | Purple-teal gradient | Modern, beautiful |
| Scala | **Pulsar** | Dark red | Rhythmic, pulsing power |
| Shell | **Void** | Dark grey / charcoal | Low-level, foundational |
| HTML/CSS | **Spectrum** | Rainbow / multi | Visual, colorful |

### Vulnerability Table

Each star system has a counter-system — a thematic weakness:

| System | Vulnerable To | Reason |
|---|---|---|
| Solaris | Void | Light consumed by darkness |
| Nebula | Quantum | Chaos solved by precision |
| Quantum | Ember | Cold logic melted by passion |
| Titanium | Pulsar | Rigid metal shattered by vibration |
| Nova | Nebula | Explosion absorbed by vastness |
| Crimson | Comet | Ancient overtaken by speed |
| Forge | Prism | Brute force deflected |
| Prism | Forge | Elegance overwhelmed by power |
| Ember | Nova | Flame blown out by explosion |
| Astral | Titanium | Ethereal grounded by metal |
| Comet | Quantum | Speed trapped by precision |
| Aurora | Void | Beauty fades in darkness |
| Pulsar | Solaris | Pulses drowned by radiance |
| Void | Spectrum | Darkness broken by light |
| Spectrum | Astral | Colors dissolved into ether |

### Fleet Ranks

| Level Range | Rank | Badge |
|---|---|---|
| 1–10 | **Cadet** | One stripe |
| 11–25 | **Lieutenant** | Two stripes |
| 26–50 | **Commander** | Three stripes |
| 51–80 | **Admiral** | Star emblem |
| 81+ | **Fleet Admiral** | Double star |

### Clearance Levels

| Tier | Activity Level | Card Effect |
|---|---|---|
| **Standard** | Low | Plain border |
| **Classified** | Moderate | Silver border |
| **Top Secret** | High | Gold border + glow |
| **Ultra** | Very high | Holographic shimmer |
| **Black Ops** | Elite | Animated dark / neon border |

### Abilities (Card Moves)

| Ability | Maps To | Display |
|---|---|---|
| **Warp Commit** | Total commits | `⚡ 1,247 commits` |
| **Orbital Deploy** | Total repositories | `🛸 38 repos` |
| **Signal Broadcast** | Languages used | `📡 7 languages` |
| **Deep Scan** | Account age in days | `🔭 1,460 days` |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool and dev server |
| [React Router DOM](https://reactrouter.com) | Client-side routing |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com) | Accessible component primitives (Progress, Slot, Tooltip) |
| [Lucide React](https://lucide.dev) | Icon library |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Conditional class management |
| [class-variance-authority](https://cva.style) | Component variant styling |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Fast linter |

### Backend

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Python API framework |
| [Uvicorn](https://www.uvicorn.org) | ASGI server |
| [httpx](https://www.python-httpx.org) | Async HTTP client for GitHub API |
| [Upstash Redis](https://upstash.com) | Caching, rate limiting, counters |
| [python-dotenv](https://github.com/theskumar/python-dotenv) | Environment variable management |

### Infrastructure

| Technology | Purpose |
|---|---|
| [Vercel](https://vercel.com) | Deployment platform |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline (lint + build) |

---

## Project Structure

```
gitstar-explorer/
├── .github/
│   └── workflows/              # CI/CD pipeline configuration
│       └── ci.yml              # Lint + build on push/PR to main
├── api/
│   └── counter.js              # Vercel serverless: Redis-backed card counter
├── backend/
│   ├── main.py                 # FastAPI server: card generation, GitHub API,
│   │                           #   rate limiting, multi-token rotation, caching
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, fonts, static resources
│   │   ├── components/
│   │   │   ├── Background.jsx        # Animated space background
│   │   │   ├── ContribHeatmap.jsx    # GitHub contribution heatmap grid
│   │   │   ├── HeroSection.jsx       # Landing page hero with tagline
│   │   │   ├── HeroShipGroup.jsx     # Decorative ships on landing page
│   │   │   ├── ExplorerCard.jsx      # Main trading card component
│   │   │   ├── LeftPanel.jsx         # Card left: stats and abilities
│   │   │   ├── RightPanel.jsx        # Card right: top repos
│   │   │   ├── LoadingSection.jsx    # Warp-speed loading animation
│   │   │   ├── ReposGrid.jsx        # Repository showcase grid
│   │   │   ├── ResultSection.jsx     # Card result wrapper
│   │   │   └── SearchForm.jsx        # Username search input
│   │   ├── lib/
│   │   │   ├── computeCardData.js    # XP, level, shield, rank, clearance logic
│   │   │   ├── constants.js          # Star systems, colors, clearance config
│   │   │   ├── githubApi.js          # GitHub REST API data fetching
│   │   │   ├── useCounter.js         # Card generation counter hook
│   │   │   └── utils.js              # Shared utility functions
│   │   ├── App.jsx                   # Root component with router
│   │   ├── App.css                   # Global app styles
│   │   ├── index.css                 # Tailwind directives and base styles
│   │   └── main.jsx                  # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── .gitignore
├── vercel.json                 # Vercel routing: /api/* → backend, /* → frontend
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **Python** 3.9 or higher — [Download](https://python.org)
- **npm** (comes with Node.js)
- A **GitHub Personal Access Token** — [Create one](https://github.com/settings/tokens)
- An **Upstash Redis** database (optional, for caching/rate limiting) — [Sign up](https://upstash.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gitstar-explorer.git
cd gitstar-explorer
```

### 2. Set Up the Frontend

```bash
cd frontend
npm install
```

### 3. Set Up the Backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# GitHub API tokens (add multiple for higher rate limits)
GITHUB_TOKEN_1=ghp_your_token_here
GITHUB_TOKEN_2=ghp_optional_second_token

# Upstash Redis (required for caching and rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

For the Vercel serverless counter (`api/counter.js`), set these in your Vercel project environment:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
# OR
KV_REST_API_URL=https://your-kv-url
KV_REST_API_TOKEN=your_kv_token
```

### 5. Run Locally

**Frontend** (runs on `http://localhost:5173`):

```bash
cd frontend
npm run dev
```

**Backend** (runs on `http://localhost:8000`):

```bash
cd backend
uvicorn main:app --reload
```

### 6. Build for Production

```bash
cd frontend
npm run build     # Outputs to frontend/dist/
npm run preview   # Preview the production build locally
```

---

## Deployment (Vercel)

The project is configured for one-click Vercel deployment.

### Steps

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Set the environment variables in Vercel's project settings:
   - `GITHUB_TOKEN_1`, `GITHUB_TOKEN_2` (etc.)
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy — Vercel uses `vercel.json` to route:
   - `/api/*` → FastAPI backend
   - `/*` → Vite frontend

### Vercel Configuration

```json
{
  "builds": [
    { "src": "backend/**", "use": "@vercel/python" },
    { "src": "frontend/**", "use": "@vercel/static-build" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/$1" },
    { "source": "/(.*)", "destination": "/frontend/$1" }
  ]
}
```

---

## CI/CD Pipeline

GitHub Actions automatically runs on every push and pull request to `main`/`master`:

| Step | Command | Purpose |
|---|---|---|
| Install | `npm ci` | Clean install of dependencies |
| Lint | `npx oxlint` | Static analysis and code quality |
| Build | `npm run build` | Verify production build succeeds |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status and token availability |
| `GET` | `/api/card?user={username}` | Generate or retrieve cached explorer card |
| `GET` | `/api/card?user={username}&refresh=true` | Force refresh bypassing cache |
| `GET` | `/api/counter` | Get total cards generated |
| `POST` | `/api/counter/increment` | Increment generation counter |

### Rate Limiting

- **10 requests per minute** per IP address
- Returns `429 Too Many Requests` with `Retry-After` header when exceeded
- Managed via Upstash Redis

### Caching

- Card data is cached in Redis for **300 seconds** (5 minutes)
- Use `refresh=true` query parameter to bypass cache
- Counter increments on every request (cached or fresh)

### Multi-Token Rotation

The backend supports multiple GitHub API tokens for higher throughput:

- Tokens are registered in environment variables (`GITHUB_TOKEN_1`, `GITHUB_TOKEN_2`, etc.)
- On each request, the token with the **highest remaining rate limit** is selected
- Rate limit quotas are tracked via Redis sorted sets

---

## Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint for code quality checks |

### Backend

| Command | Description |
|---|---|
| `uvicorn main:app --reload` | Start FastAPI with hot reload |
| `pip install -r requirements.txt` | Install Python dependencies |

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "Add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style and component patterns
- Run `npm run lint` before submitting
- Test on mobile and desktop viewports
- Keep the space theme consistent in any new components

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- [GitHub REST API](https://docs.github.com/en/rest) for user data
- [Upstash](https://upstash.com) for serverless Redis
- [Vercel](https://vercel.com) for deployment
- [Radix UI](https://www.radix-ui.com) for accessible components
- Inspired by the trading card genre — reimagined with an original space exploration theme

---

<p align="center">
  <b>Explore the stars. Deploy your code. Collect your card.</b>
</p>
