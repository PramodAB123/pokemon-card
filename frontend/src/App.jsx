import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Background from "./components/Background.jsx";
import HeroSection from "./components/HeroSection.jsx";
import LoadingSection from "./components/LoadingSection.jsx";
import ResultSection from "./components/ResultSection.jsx";
import NotFoundSection from "./components/NotFoundSection.jsx";
import BuyMeCoffee from "./components/BuyMeCoffee.jsx";
import { fetchGithubData } from "./lib/githubApi.js";
import { computeCardData } from "./lib/computeCardData.js";
import { incrementCounter } from "./lib/useCounter.js";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMsg = location.state?.error || "";

  function handleSearch(username) {
    // Do NOT increment here — only count after card is verified (UserCardPage)
    navigate(`/${username}`);
  }

  return <HeroSection onSearch={handleSearch} initialError={errorMsg} />;
}

function UserCardPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState("loading");
  const [cardData, setCardData] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!username) return;
      setView("loading");

      try {
        const { profile, repos, events, prCount, totalCommits } = await fetchGithubData(username);
        const data = computeCardData({ profile, repos, events, prCount, totalCommits });
        // Increment card counter for verified unique username
        const canonicalUser = profile?.login || username;
        incrementCounter(canonicalUser).catch(() => {});
        // Warp animation delay
        await new Promise((r) => setTimeout(r, 1400));
        if (active) {
          setCardData(data);
          setView("result");
        }
      } catch (err) {
        if (!active) return;

        // Custom 404 handler for missing GitHub explorers
        if (err.status === 404) {
          setView("not-found");
          return;
        }

        let errorMsg = "Subspace connection lost. Unable to retrieve explorer telemetry.";
        if (err.status === 403) {
          errorMsg = "GitHub API rate limit reached. Subspace sensors cooling down — retry shortly.";
        }

        navigate("/", { state: { error: errorMsg }, replace: true });
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [username, navigate]);

  useEffect(() => {
    if (cardData) {
      const displayName = cardData.name ? `${cardData.name} (@${cardData.username})` : cardData.username;
      document.title = `${displayName} | Fleet Rank: ${cardData.cardRank} — GitStar Explorer`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          `Inspect ${cardData.username}'s interstellar GitHub trading card. Fleet Rank: ${cardData.cardRank}, Core System: ${cardData.topLanguage || "Polyglot"}, Explorer Telemetry & Missions.`
        );
      }
    } else if (username) {
      document.title = `Scanning ${username}... | GitStar Explorer`;
    }

    return () => {
      document.title = "GitStar Explorer | Interstellar GitHub Trading Cards";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "Turn your GitHub profile into an interstellar explorer trading card! Missions, star systems, and fleet ranks."
        );
      }
    };
  }, [cardData, username]);

  function handleTryAnother() {
    navigate("/");
  }

  if (view === "loading") {
    return <LoadingSection active={true} />;
  }

  if (view === "not-found") {
    return <NotFoundSection username={username} onTryAnother={handleTryAnother} />;
  }

  if (view === "result" && cardData) {
    return <ResultSection d={cardData} onTryAnother={handleTryAnother} />;
  }

  return null;
}

function GenericNotFoundPage() {
  const navigate = useNavigate();
  return <NotFoundSection onTryAnother={() => navigate("/")} />;
}

export default function App() {
  return (
    <div className="scene">
      <Background />
      <BuyMeCoffee />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview-loader" element={<LoadingSection active={true} previewMode={true} />} />
        <Route path="/:username" element={<UserCardPage />} />
        <Route path="*" element={<GenericNotFoundPage />} />
      </Routes>
      <div className="toast" id="toast">
        Subspace coordinates copied to clipboard!
      </div>
      {import.meta.env.PROD && <Analytics debug={false} />}
    </div>
  );
}
