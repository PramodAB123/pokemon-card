import React, { useEffect, useRef, useState } from "react";
import ExplorerCard from "./ExplorerCard.jsx";
import LeftPanel from "./LeftPanel.jsx";
import RightPanel from "./RightPanel.jsx";
import ReposGrid from "./ReposGrid.jsx";
import { LinkedInIcon, TwitterIcon, RedditIcon } from "./SocialShareModal.jsx";
import { generatePostContent, openPlatformComposer } from "../lib/socialShare.js";
import { trackEvent } from "../lib/analytics.js";

// Only used to tag analytics events with the device type
const MOBILE_QUERY = "(max-width: 768px), (pointer: coarse)";

export default function ResultSection({ d, onTryAnother }) {
  const cardWrapRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function handleShareCoordinates() {
    trackEvent("Share Clicked", { platform: "copy_link", device: isMobile ? "mobile" : "desktop" });
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
    setTimeout(() => toast.classList.remove("show"), 3500);
  }

  // Copies the caption and opens the platform composer. Runs synchronously so
  // the click still counts as a user gesture (no popup blocking, clipboard allowed).
  function handleSocialShare(platform) {
    trackEvent("Share Clicked", { platform, device: isMobile ? "mobile" : "desktop" });
    const shareUrl = `${location.origin}/${encodeURIComponent(d.username)}`;
    const postContent = generatePostContent(platform, d, shareUrl);
    if (postContent?.text) {
      navigator.clipboard?.writeText(postContent.text).catch(() => {});
    }
    openPlatformComposer(platform, postContent);
    showToast(`✓ Caption copied & ${postContent.platform} opened!`);
  }

  return (
    <section className="result-section relative z-10 w-full flex flex-col items-center" id="resultSection">
      {/* 3-Column Desktop Cockpit Layout */}
      <div className="result-layout" id="telemetryDesktopLayout">
        {/* Left Telemetry Panel */}
        <div className="side-panel left-panel" id="leftPanel">
          <LeftPanel d={d} />
        </div>

        {/* Center: Trading Card + Actions */}
        <div className="card-column">
          <div
            className="card-wrap"
            ref={cardWrapRef}
            onMouseEnter={(e) => e.currentTarget.querySelector(".explorer-card")?.classList.add("card-hovered")}
            onMouseLeave={(e) => e.currentTarget.querySelector(".explorer-card")?.classList.remove("card-hovered")}
          >
            <ExplorerCard d={d} />
          </div>

          {/* Primary Action Buttons (Excluded from desktop screenshot) */}
          <div className="card-actions no-capture">
            <button className="action-btn secondary" id="tryAnotherBtn" onClick={onTryAnother}>
              ← Scout Another
            </button>
            <button className="action-btn primary" id="shareBtn" onClick={handleShareCoordinates}>
              Transmit Coordinates ✦
            </button>
          </div>

          {/* Subspace Broadcast Deck: copies the caption and opens the platform composer */}
          <div className="social-broadcast-deck no-capture" id="socialBroadcastDeck">
            <div className="social-broadcast-header">
              <span className="pulse-signal" />
              <span className="social-broadcast-title">BROADCAST TO SUBSPACE NETWORKS</span>
            </div>

            <div className="social-buttons-grid">
              <button
                className="social-share-btn btn-linkedin"
                id="shareLinkedInBtn"
                onClick={() => handleSocialShare("linkedin")}
                title="Copy caption & open LinkedIn"
              >
                <LinkedInIcon className="social-btn-icon" />
                <span className="social-btn-text">
                  LinkedIn
                </span>
              </button>

              <button
                className="social-share-btn btn-twitter"
                id="shareTwitterBtn"
                onClick={() => handleSocialShare("twitter")}
                title="Copy caption & open X"
              >
                <TwitterIcon className="social-btn-icon" />
                <span className="social-btn-text">
                  X / Twitter
                </span>
              </button>

              <button
                className="social-share-btn btn-reddit"
                id="shareRedditBtn"
                onClick={() => handleSocialShare("reddit")}
                title="Copy caption & open Reddit"
              >
                <RedditIcon className="social-btn-icon" />
                <span className="social-btn-text">
                  Reddit
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Dossier Panel */}
        <div className="side-panel right-panel" id="rightPanel">
          <RightPanel d={d} />
        </div>
      </div>

      {/* Orbital Starbases Repos Flowchart */}
      <div className="repos-section" id="reposFlowchartSection">
        <ReposGrid d={d} />
      </div>
    </section>
  );
}
