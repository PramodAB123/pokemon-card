import React, { useState } from "react";
import { downloadImage } from "../lib/socialShare.js";

// Dedicated Brand Icons
export function LinkedInIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.66-.74 1.66-1.66 0-.92-.74-1.66-1.66-1.66-.92 0-1.66.74-1.66 1.66 0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

export function TwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function RedditIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-4.466 3.99a.327.327 0 0 0-.231.096.35.35 0 0 0 0 .486c.725.725 1.838.725 2.563 0a.344.344 0 0 0 0-.486.344.344 0 0 0-.486 0c-.456.456-1.135.456-1.59 0a.332.332 0 0 0-.256-.096z" />
    </svg>
  );
}

export default function SocialShareModal({
  isOpen,
  onClose,
  platform,
  postContent,
  imageDataUrl,
  imageBlob,
  username,
  copiedToClipboard,
  onReopenComposer,
}) {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (postContent?.text) {
      navigator.clipboard.writeText(postContent.text).then(() => {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2400);
      });
    }
  };

  const handleDownload = () => {
    if (imageBlob) {
      downloadImage(imageBlob, `${username}-galactic-dossier-desktop.png`);
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case "linkedin":
        return <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />;
      case "twitter":
        return <TwitterIcon className="w-5 h-5 text-[#38BDF8]" />;
      case "reddit":
        return <RedditIcon className="w-5 h-5 text-[#FF4500]" />;
      default:
        return <span>✦</span>;
    }
  };

  const getPlatformThemeClass = () => {
    switch (platform) {
      case "linkedin":
        return "theme-linkedin";
      case "twitter":
        return "theme-twitter";
      case "reddit":
        return "theme-reddit";
      default:
        return "";
    }
  };

  return (
    <div className="subspace-modal-overlay" onClick={onClose}>
      <div
        className={`subspace-modal-container ${getPlatformThemeClass()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="subspace-modal-header">
          <div className="subspace-modal-title-wrap">
            <div className="subspace-icon-badge">{getPlatformIcon()}</div>
            <div>
              <div className="subspace-modal-title">
                TRANSMISSION TO {postContent?.platform?.toUpperCase() || "NETWORK"}
              </div>
              <div className="subspace-modal-subtitle">
                Desktop Telemetry Snapshot & Platform Post Composer
              </div>
            </div>
          </div>
          <button className="subspace-close-btn" onClick={onClose} title="Close HUD">
            ✕
          </button>
        </div>

        {/* Status Indicators */}
        <div className="subspace-status-grid">
          <div className={`status-pill ${copiedToClipboard ? "success" : "neutral"}`}>
            <span className="status-dot"></span>
            <span>{copiedToClipboard ? "Image Copied to Clipboard ✓" : "Desktop View Captured"}</span>
          </div>
          <div className="status-pill success">
            <span className="status-dot"></span>
            <span>2x Retina HD Snapshot Generated</span>
          </div>
        </div>

        {/* Quick Instructions Banner */}
        <div className="subspace-paste-hint">
          <span className="hint-icon">💡</span>
          <span>
            <strong>Next Step:</strong> When the {postContent?.platform} composer opens, simply press{" "}
            <kbd>Ctrl</kbd> + <kbd>V</kbd> (or <kbd>Cmd</kbd> + <kbd>V</kbd>) to paste your desktop screenshot directly into your post!
          </span>
        </div>

        {/* Image Preview & Description Grid */}
        <div className="subspace-modal-body">
          {/* Left: Desktop Image Preview */}
          <div className="subspace-preview-col">
            <div className="preview-label">
              <span>DESKTOP TELEMETRY CAPTURE</span>
              <button className="btn-tiny-download" onClick={handleDownload} title="Download PNG">
                💾 Save PNG
              </button>
            </div>
            <div className="preview-image-frame">
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt="Desktop Telemetry Dossier"
                  className="preview-img"
                />
              ) : (
                <div className="preview-placeholder">Rendering Subspace Telemetry...</div>
              )}
            </div>
          </div>

          {/* Right: Platform Post Description */}
          <div className="subspace-content-col">
            <div className="preview-label">
              <span>PLATFORM POST DESCRIPTION</span>
              <button
                className={`btn-tiny-copy ${copiedText ? "copied" : ""}`}
                onClick={handleCopyText}
              >
                {copiedText ? "✓ Copied!" : "📋 Copy Text"}
              </button>
            </div>
            <textarea
              className="subspace-post-textarea"
              readOnly
              value={postContent?.text || ""}
              rows={8}
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="subspace-modal-footer">
          <button className="subspace-btn secondary" onClick={handleDownload}>
            💾 Download Image File
          </button>
          <button className="subspace-btn primary" onClick={onReopenComposer}>
            🚀 Open {postContent?.platform} Composer ↗
          </button>
        </div>
      </div>
    </div>
  );
}
