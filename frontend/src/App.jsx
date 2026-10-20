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
import { trackEvent } from "./lib/analytics.js";
import { setCanonical, setIndexable, resetSeo } from "./lib/seo.js";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMsg = location.state?.error || "";

  function handleSearch(username) {
    // Do NOT increment here — only count after card is verified (UserCardPage)
    navigate(`/${username}`, { state: { fromSearch: true } });
  }

  return <HeroSection onSearch={handleSearch} initialError={errorMsg} />;
}

function UserCardPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Searched on this site vs. opened a shared/direct link
  const source = location.state?.fromSearch ? "search" : "direct_link";
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
        trackEvent("Card Created", { source, rank: data.fleetRank?.title || "Cadet" });
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
  }, [username, navigate, source]);

  useEffect(() => {
    if (cardData) {
      const hasName = cardData.displayName && cardData.displayName !== cardData.username;
      const displayName = hasName ? `${cardData.displayName} (@${cardData.username})` : cardData.username;
      const rank = cardData.fleetRank?.title || "Cadet";
      const coreLang = cardData.topLang && cardData.topLang !== "default" ? cardData.topLang : "Polyglot";
      document.title = `${displayName} | Fleet Rank: ${rank} — GitStar Explorer`;
      setCanonical(`/${encodeURIComponent(cardData.username)}`);
      setIndexable(true);
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          `Inspect ${cardData.username}'s interstellar GitHub trading card. Fleet Rank: ${rank} (LVL ${cardData.level}), Core System: ${coreLang}, Explorer Telemetry & Missions.`
        );
      }
    } else if (username) {
      document.title = `Scanning ${username}... | GitStar Explorer`;
      setCanonical(`/${encodeURIComponent(username)}`);
    }

    return () => {
      resetSeo();
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
    setIndexable(false); // missing GitHub user: keep out of search results
    document.title = `Explorer not found | GitStar Explorer`;
    return <NotFoundSection username={username} onTryAnother={handleTryAnother} />;
  }

  if (view === "result" && cardData) {
    return <ResultSection d={cardData} onTryAnother={handleTryAnother} />;
  }

  return null;
}

function GenericNotFoundPage() {
  const navigate = useNavigate();
  useEffect(() => {
    setIndexable(false);
    return resetSeo;
  }, []);
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
