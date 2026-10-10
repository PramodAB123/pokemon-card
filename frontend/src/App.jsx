import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Background from "./components/Background.jsx";
import HeroSection from "./components/HeroSection.jsx";
import LoadingSection from "./components/LoadingSection.jsx";
import ResultSection from "./components/ResultSection.jsx";
import NotFoundSection from "./components/NotFoundSection.jsx";
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:username" element={<UserCardPage />} />
        <Route path="*" element={<GenericNotFoundPage />} />
      </Routes>
      <div className="toast" id="toast">
        Subspace coordinates copied to clipboard!
      </div>
    </div>
  );
}
