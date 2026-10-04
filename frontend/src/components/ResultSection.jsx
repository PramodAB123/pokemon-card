import React, { useRef } from "react";
import ExplorerCard from "./ExplorerCard.jsx";
import LeftPanel from "./LeftPanel.jsx";
import RightPanel from "./RightPanel.jsx";
import ReposGrid from "./ReposGrid.jsx";

export default function ResultSection({ d, onTryAnother }) {
  const cardWrapRef = useRef(null);

  function handleShare() {
    const username = d.username;
    const url = `${location.origin}/${encodeURIComponent(username)}`;
    navigator.clipboard.writeText(url).then(
      () => showToast("Subspace coordinates copied to clipboard! ✓"),
      () => showToast("Coordinates: " + url)
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
        {/* Left Telemetry Panel */}
        <div className="side-panel left-panel" id="leftPanel">
          <LeftPanel d={d} />
        </div>

        {/* Center: Trading Card + Warp Actions */}
        <div className="card-column">
          <div
            className="card-wrap"
            ref={cardWrapRef}
            onMouseEnter={(e) => e.currentTarget.querySelector(".explorer-card")?.classList.add("card-hovered")}
            onMouseLeave={(e) => e.currentTarget.querySelector(".explorer-card")?.classList.remove("card-hovered")}
          >
            <ExplorerCard d={d} />
          </div>
          <div className="card-actions">
            <button className="action-btn secondary" id="tryAnotherBtn" onClick={onTryAnother}>
              ← Scout Another
            </button>
            <button className="action-btn primary" id="shareBtn" onClick={handleShare}>
              Transmit Coordinates ✦
            </button>
          </div>
        </div>

        {/* Right Dossier Panel */}
        <div className="side-panel right-panel" id="rightPanel">
          <RightPanel d={d} />
        </div>
      </div>

      {/* Orbital Starbases Repos Grid */}
      <div className="repos-section">
        <div className="repos-section-title">Orbital Starbases & Repositories</div>
        <ReposGrid d={d} />
      </div>

    </section>
  );
}
