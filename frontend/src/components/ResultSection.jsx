import React, { useRef } from "react";
import TrainerCard from "./TrainerCard.jsx";
import LeftPanel from "./LeftPanel.jsx";
import RightPanel from "./RightPanel.jsx";
import ReposGrid from "./ReposGrid.jsx";

export default function ResultSection({ d, onTryAnother }) {
  const cardWrapRef = useRef(null);

  function handleShare() {
    const username = d.username;
    const url = `${location.origin}/${encodeURIComponent(username)}`;
    navigator.clipboard.writeText(url).then(
      () => showToast("Link copied to clipboard! ✓"),
      () => showToast("Share: " + url)
    );
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }

  return (
    <section className="result-section relative z-10 w-full flex flex-col items-center" id="resultSection">

      <div className="result-layout">
        {/* Left panel */}
        <div className="side-panel left-panel" id="leftPanel">
          <LeftPanel d={d} />
        </div>

        {/* Center: card + actions */}
        <div className="card-column">
          <div
            className="card-wrap"
            ref={cardWrapRef}
            onMouseEnter={e => e.currentTarget.querySelector(".github-card")?.classList.add("card-hovered")}
            onMouseLeave={e => e.currentTarget.querySelector(".github-card")?.classList.remove("card-hovered")}
          >
            <TrainerCard d={d} />
          </div>
          <div className="card-actions">
            <button className="action-btn secondary" id="tryAnotherBtn" onClick={onTryAnother}>← Try Another</button>
            <button className="action-btn primary" id="shareBtn" onClick={handleShare}>Share ✦</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="side-panel right-panel" id="rightPanel">
          <RightPanel d={d} />
        </div>
      </div>

      {/* Repos below */}
      <div className="repos-section">
        <div className="repos-section-title">Top Repositories</div>
        <ReposGrid d={d} />
      </div>

    </section>
  );
}
