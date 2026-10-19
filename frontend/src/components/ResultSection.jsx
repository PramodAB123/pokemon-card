import React, { useEffect, useRef, useState } from "react";
import ExplorerCard from "./ExplorerCard.jsx";
import LeftPanel from "./LeftPanel.jsx";
import RightPanel from "./RightPanel.jsx";
import ReposGrid from "./ReposGrid.jsx";
import { LinkedInIcon, TwitterIcon, RedditIcon } from "./SocialShareModal.jsx";
import {
  captureDesktopScreenshot,
  downloadImage,
  generatePostContent,
  openPlatformComposer,
} from "../lib/socialShare.js";

// Phones and touch tablets get caption-only sharing (no desktop image download)
const MOBILE_QUERY = "(max-width: 768px), (pointer: coarse)";

export default function ResultSection({ d, onTryAnother }) {
  const cardWrapRef = useRef(null);
  const layoutRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function handleShareCoordinates() {
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

  // Mobile: caption only. Opens the composer synchronously so the tap still
  // counts as a user gesture (no popup blocking, clipboard allowed).
  function handleMobileShare(platform) {
    const shareUrl = `${location.origin}/${encodeURIComponent(d.username)}`;
    const postContent = generatePostContent(platform, d, shareUrl, { withImage: false });
    if (postContent?.text) {
      navigator.clipboard?.writeText(postContent.text).catch(() => {});
    }
    openPlatformComposer(platform, postContent);
    showToast(`✓ Caption copied & ${postContent.platform} opened!`);
  }

  // 1-Tap Action: Downloads Desktop Image + Prepares Formatted Caption + Launches Platform Composer
  async function handleSocialShare(platform) {
    if (isMobile) return handleMobileShare(platform);
    const username = d.username;
    const shareUrl = `${location.origin}/${encodeURIComponent(username)}`;
    setIsCapturing(true);
    setActivePlatform(platform);
    showToast(`⚡ Downloading desktop image & preparing ${platform.toUpperCase()} post...`);

    try {
      const targetElement = layoutRef.current;
      let blob = null;

      // 1. Capture the desktop cockpit view
      if (targetElement) {
        const captureResult = await captureDesktopScreenshot(targetElement, d);
        blob = captureResult.blob;
      }

      // 2. Generate platform-specific caption & site details
      const postContent = generatePostContent(platform, d, shareUrl);

      // 3. AUTOMATICALLY DOWNLOAD the desktop telemetry image
      if (blob) {
        downloadImage(blob, `${username}-galactic-dossier-desktop.png`);
      }

      // 4. Automatically copy formatted post caption to clipboard for immediate pasting
      if (postContent?.text) {
        navigator.clipboard.writeText(postContent.text).catch(() => {});
      }

      // 5. Open the platform composer (Twitter & Reddit auto-fill caption & link)
      openPlatformComposer(platform, postContent);

      showToast(`✓ Image downloaded & ${postContent.platform} opened!`);
    } catch (err) {
      console.error("Social share error:", err);
      const postContent = generatePostContent(platform, d, shareUrl);
      openPlatformComposer(platform, postContent);
      showToast(`Opening ${postContent.platform}...`);
    } finally {
      setIsCapturing(false);
      setActivePlatform(null);
    }
  }

  return (
    <section className="result-section relative z-10 w-full flex flex-col items-center" id="resultSection">
      {/* 3-Column Desktop Cockpit Layout */}
      <div className="result-layout" id="telemetryDesktopLayout" ref={layoutRef}>
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

          {/* Subspace Broadcast Deck: Tapping a button opens the platform (desktop also downloads the image) (Excluded from desktop screenshot) */}
          <div className="social-broadcast-deck no-capture" id="socialBroadcastDeck">
            <div className="social-broadcast-header">
              <span className="pulse-signal" />
              <span className="social-broadcast-title">BROADCAST TO SUBSPACE NETWORKS</span>
            </div>

            <div className="social-buttons-grid">
              <button
                className={`social-share-btn btn-linkedin ${activePlatform === "linkedin" ? "loading" : ""}`}
                id="shareLinkedInBtn"
                onClick={() => handleSocialShare("linkedin")}
                disabled={isCapturing}
                title={isMobile ? "Copy caption & open LinkedIn" : "Download desktop image & open LinkedIn"}
              >
                <LinkedInIcon className="social-btn-icon" />
                <span className="social-btn-text">
                  {activePlatform === "linkedin" ? "Downloading..." : "LinkedIn"}
                </span>
              </button>

              <button
                className={`social-share-btn btn-twitter ${activePlatform === "twitter" ? "loading" : ""}`}
                id="shareTwitterBtn"
                onClick={() => handleSocialShare("twitter")}
                disabled={isCapturing}
                title={isMobile ? "Copy caption & open X" : "Download desktop image & tweet to X"}
              >
                <TwitterIcon className="social-btn-icon" />
                <span className="social-btn-text">
                  {activePlatform === "twitter" ? "Downloading..." : "X / Twitter"}
                </span>
              </button>

              <button
                className={`social-share-btn btn-reddit ${activePlatform === "reddit" ? "loading" : ""}`}
                id="shareRedditBtn"
                onClick={() => handleSocialShare("reddit")}
                disabled={isCapturing}
                title={isMobile ? "Copy caption & open Reddit" : "Download desktop image & post to Reddit"}
              >
                <RedditIcon className="social-btn-icon" />
                <span className="social-btn-text">
                  {activePlatform === "reddit" ? "Downloading..." : "Reddit"}
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
