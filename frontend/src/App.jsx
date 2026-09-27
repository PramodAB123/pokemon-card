import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Background from "./components/Background.jsx";
import HeroSection from "./components/HeroSection.jsx";
import LoadingSection from "./components/LoadingSection.jsx";
import ResultSection from "./components/ResultSection.jsx";
import { fetchGithubData } from "./lib/githubApi.js";
import { computeCardData } from "./lib/computeCardData.js";

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
        // Small delay to let loader animate a bit
        await new Promise(r => setTimeout(r, 1200));
        if (active) {
          setCardData(data);
          setView("result");
        }
      } catch (err) {
        if (!active) return;
        
        let errorMsg = "Failed to fetch trainer data. Check your connection and retry.";
        if (err.status === 404) {
          errorMsg = `Trainer "@${username}" not found. Check the username and try again.`;
        } else if (err.status === 403) {
          errorMsg = "GitHub API rate limit reached. Please wait a minute and try again.";
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
      <div className="toast" id="toast">Link copied to clipboard!</div>
    </div>
  );
}
