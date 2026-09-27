# GitHub Pokémon Card Generator

Turn your GitHub profile into a legendary Pokémon trading card! This web application fetches a user's GitHub data—including repositories, pull requests, commits, and recent activity—and generates a beautifully designed, Pokémon-styled profile card.

## 🌟 Features
- **Dynamic Stats**: Calculates stats (like PR counts, total commits, and repo data) directly from the GitHub API.
- **Pokémon Theme**: A nostalgic, beautifully styled Pokémon UI and card design.
- **Interactive Loading**: Engaging animations while your trainer data is being fetched.
- **Routing**: Shareable URLs for specific GitHub usernames (e.g., `github-card.com/username`).
- **Responsive Design**: Works perfectly on both desktop and mobile devices.

## 💻 Tech Stack
- **Framework**: React 19 with Vite for ultra-fast development and building.
- **Routing**: React Router DOM.
- **Styling**: Tailwind CSS combined with custom CSS.
- **UI Components**: Radix UI primitives for accessible and robust components.
- **Linting**: Oxlint for lightning-fast linting.
- **CI/CD**: GitHub Actions integrated for continuous integration (Lint & Build).

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine (v18 or higher is recommended).

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`.

### Build for Production
To build the application for production, run:
```bash
npm run build
```
This will generate optimized static assets in the `dist/` directory.

## 🛠️ CI/CD Pipeline
This project includes a GitHub Actions pipeline (`.github/workflows/ci.yml`). On every `push` and `pull_request` to the `main` or `master` branches, the pipeline automatically:
1. Sets up the Node.js environment.
2. Installs dependencies securely (`npm ci`).
3. Lints the codebase (`npm run lint`).
4. Builds the React app to ensure everything compiles correctly.
