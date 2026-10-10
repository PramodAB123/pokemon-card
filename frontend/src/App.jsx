import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Background from "./components/Background.jsx";
import HeroSection from "./components/HeroSection.jsx";
import LoadingSection from "./components/LoadingSection.jsx";
import ResultSection from "./components/ResultSection.jsx";
import { fetchGithubData } from "./lib/githubApi.js";
import { computeCardData } from "./lib/computeCardData.js";
import { incrementCounter } from "./lib/useCounter.js";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMsg = location.state?.error || "";

  function handleSearch(username) {
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
        // Increment card counter for unique username
        incrementCounter(username).catch(() => {});
        // Warp animation delay
        await new Promise((r) => setTimeout(r, 1400));
        if (active) {
          setCardData(data);
          setView("result");
        }
      } catch (err) {
        if (!active) return;

        let errorMsg = "Subspace connection lost. Unable to retrieve explorer telemetry.";
        if (err.status === 404) {
          errorMsg = `Explorer callsign "@${username}" not located in stellar registry.`;
        } else if (err.status === 403) {
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

  function handleTryAnother() {
    navigate("/");
  }

  if (view === "loading") {
    return <LoadingSection active={true} />;
  }

  if (view === "result" && cardData) {
    return <ResultSection d={cardData} onTryAnother={handleTryAnother} />;
  }

  return null;
}

export default function App() {
  return (
    <div className="scene">
      <Background />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:username" element={<UserCardPage />} />
      </Routes>
      <div className="toast" id="toast">
        Subspace coordinates copied to clipboard!
      </div>
    </div>
  );
}
