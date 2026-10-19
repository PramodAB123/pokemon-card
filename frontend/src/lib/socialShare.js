import { toBlob } from "html-to-image";
import { fmt } from "./utils.js";

/**
 * Format language list for post copy
 */
function getTopLanguagesText(langPercents = []) {
  if (!langPercents || langPercents.length === 0) return "Polyglot Systems";
  return langPercents
    .slice(0, 3)
    .map((l) => `${l.lang} (${l.pct}%)`)
    .join(", ");
}

/**
 * Generate platform-tailored post descriptions
 */
export function generatePostContent(platform, d, shareUrl, { withImage = true } = {}) {
  const username = d.username || "explorer";
  const displayName = d.displayName && d.displayName !== username ? d.displayName : username;
  const rankTitle = d.fleetRank?.title || "Fleet Explorer";
  const rankBadge = d.fleetRank?.badge || "★";
  const systemName = d.starSystem?.name || "Solaris";
  const level = d.level || 1;
  const shield = d.shield || 500;
  const commits = fmt(d.totalCommits || 0);
  const repos = fmt(d.publicRepos || 0);
  const stars = fmt(d.totalStars || 0);
  const clearance = d.clearance?.label || "STANDARD";
  const topLangs = getTopLanguagesText(d.langPercents);
  const bio = d.bio ? d.bio.trim() : "";

  // Production public URL for social scrapers
  const basePublicUrl = "https://gitastro.vercel.app";
  const publicShareUrl = shareUrl.includes("localhost")
    ? `${basePublicUrl}/${encodeURIComponent(username)}`
    : shareUrl;

  // Dedicated OpenGraph scraper endpoint returning rich og:image and og:title tags
  const ogShareUrl = `${basePublicUrl}/api/share/${encodeURIComponent(username)}`;

  switch (platform) {
    case "linkedin":
      return {
        platform: "LinkedIn",
        title: `Galactic Telemetry Report: ${username} (${rankTitle})`,
        text: `🚀 Interstellar Developer Telemetry Report | GitHub Galactic Dossier

Excited to transmit my subspace telemetry dossier! Scanned via GitStar Explorer:

👤 Pilot: ${username} (${displayName})
🎖️ Fleet Rank: ${rankTitle} ${rankBadge}
🌌 Star System: ${systemName} (LVL ${level})
🛡️ Shield Energy: ${shield} / 999
⚡ Warp Commits: ${commits} commits
🛰️ Orbital Starbases: ${repos} public repositories
⭐ Starlight Stars: ${stars} stellar beacons
📡 Signal Broadcast: ${topLangs}
🔒 Security Clearance: ${clearance}
${bio ? `\n📝 Mission Log: "${bio}"\n` : ""}
Inspect my interactive developer dossier & scan your telemetry coordinates:
🔗 ${publicShareUrl}

#SoftwareEngineering #GitHub #OpenSource #DeveloperProfile #WebDevelopment #TechCommunity #CodingLife #InterstellarDev`,
        shareUrl: ogShareUrl,
        canonicalUrl: publicShareUrl,
      };

    case "twitter":
      return {
        platform: "X / Twitter",
        title: `Transmit to X: @${username}`,
        text: `🛸 Transmitting GitHub Subspace Telemetry for @${username}!

🎖️ Rank: ${rankTitle} ${rankBadge}
🌌 System: ${systemName} (LVL ${level})
⚡ ${commits} Commits | ${repos} Repos | ${stars} Stars
🛡️ Shield: ${shield}

Inspect pilot dossier & scan your telemetry coordinates:
${publicShareUrl}

#GitHub #DevCommunity #OpenSource #100DaysOfCode #WebDev`,
        shareUrl: publicShareUrl,
      };

    case "reddit":
      return {
        platform: "Reddit",
        title: `Transmitted my GitHub Fleet Telemetry Dossier — Ranked as ${rankTitle} (Level ${level})!`,
        text: `Just ran a subspace telemetry scan on my GitHub profile using GitStar Explorer!

Here is my developer fleet telemetry report:

* **Pilot:** ${username} (${displayName})
* **Fleet Rank:** ${rankTitle} ${rankBadge}
* **Star System:** ${systemName} System (LVL ${level})
* **Clearance Level:** ${clearance}
* **Warp Commits:** ${commits}
* **Orbital Starbases:** ${repos} public repositories
* **Starlight Stars:** ${stars}
* **Shield Energy:** ${shield} / 999
* **Primary Tech Stack:** ${topLangs}

${withImage ? "*(Desktop telemetry snapshot attached!)*" : ""}

Check out your own GitHub galactic card & telemetry coordinates:
${publicShareUrl}`,
        shareUrl: publicShareUrl,
      };

    default:
      return {
        platform: "Social",
        title: `Subspace Telemetry: ${username}`,
        text: `Check out my GitHub telemetry card: ${publicShareUrl}`,
        shareUrl: publicShareUrl,
      };
  }
}

/**
 * Capture high-resolution studio-grade desktop cockpit telemetry image
 */
export async function captureDesktopScreenshot(element, d = {}) {
  // 1. Ensure fonts are fully loaded to avoid fallback metrics
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  const username = d?.username || "EXPLORER";
  const displayName = d?.displayName || username;
  const rankTitle = d?.fleetRank?.title || "FLEET ADMIRAL";
  const rankBadge = d?.fleetRank?.badge || "★★";
  const system = d?.starSystem?.name || "SOLARIS";
  const level = d?.level || 99;

  // 2. Build the Studio Desktop Stage for balanced, wallpaper-quality composition
  const stage = document.createElement("div");
  stage.className = "telemetry-capture-stage";

  stage.innerHTML = `
    <div class="capture-hud-header">
      <div class="capture-hud-title">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#38bdf8; box-shadow:0 0 10px #38bdf8;"></span>
        FLEET COMMAND // SUBSPACE TELEMETRY DOSSIER
      </div>
      <div class="capture-hud-meta">
        STAR SYSTEM: ${system.toUpperCase()} (LVL ${level}) · CLEARANCE: VERIFIED
      </div>
    </div>
    <div class="capture-grid-row">
      <div class="capture-col left"></div>
      <div class="capture-col center"></div>
      <div class="capture-col right"></div>
    </div>
    <div class="capture-hud-footer">
      <span>PILOT: ${username.toUpperCase()} (${displayName}) · ${rankTitle.toUpperCase()} ${rankBadge}</span>
      <span>GITSTAR EXPLORER · SECTOR ALPHA · TELEMETRY VERIFIED ✦</span>
    </div>
  `;

  stage.style.position = "fixed";
  stage.style.left = "0px";
  stage.style.top = "0px";
  stage.style.width = "1220px";
  stage.style.zIndex = "99999";
  stage.style.pointerEvents = "none";

  const leftCol = stage.querySelector(".capture-col.left");
  const centerCol = stage.querySelector(".capture-col.center");
  const rightCol = stage.querySelector(".capture-col.right");

  const leftPanel = (document.getElementById("leftPanel") || element?.querySelector("#leftPanel"))?.cloneNode(true);
  const cardNode = (document.getElementById("generatedCard") || element?.querySelector(".explorer-card"))?.cloneNode(true);
  const rightPanel = (document.getElementById("rightPanel") || element?.querySelector("#rightPanel"))?.cloneNode(true);

  if (leftPanel && cardNode && rightPanel) {
    // Reset any interactive 3D rotation on card for perfectly flat rendering
    cardNode.style.transform = "none";
    cardNode.style.setProperty("--mouse-x", "50%");
    cardNode.style.setProperty("--mouse-y", "50%");

    leftCol.appendChild(leftPanel);
    centerCol.appendChild(cardNode);
    rightCol.appendChild(rightPanel);

    document.body.appendChild(stage);

    try {
      // Allow browser to perform full layout & paint before capturing
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const blob = await toBlob(stage, {
        width: 1220,
        height: stage.offsetHeight || 740,
        quality: 0.98,
        pixelRatio: 2, // 2x Retina resolution for razor-sharp clarity
        backgroundColor: "#060814",
        cacheBust: false,
      });

      if (document.body.contains(stage)) {
        document.body.removeChild(stage);
      }

      if (blob && blob.size > 25000) {
        return { blob };
      }
      console.warn("Stage blob was empty or too small, falling back to direct capture");
    } catch (err) {
      console.warn("Studio stage capture failed, falling back to direct element capture:", err);
      if (document.body.contains(stage)) {
        document.body.removeChild(stage);
      }
    }
  }

  // Fallback: Direct element capture with typography fixes
  const filter = (node) => {
    if (node.classList && (
      node.classList.contains("no-capture") ||
      node.classList.contains("card-actions") ||
      node.classList.contains("social-broadcast-deck") ||
      node.classList.contains("toast")
    )) {
      return false;
    }
    return true;
  };

  const blob = await toBlob(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#060814",
    filter,
    cacheBust: false,
  });
  return { blob };
}

/**
 * Trigger instantaneous file download for generated snapshot
 */
export function downloadImage(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Attempt Native Web Share API with image file if supported
 */
export async function tryNativeShare(blob, filename, postContent) {
  try {
    if (navigator.share && blob) {
      const file = new File([blob], filename, { type: blob.type || "image/png" });
      const shareData = {
        title: postContent.title,
        text: postContent.text,
        url: postContent.shareUrl,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
        return true;
      }
    }
  } catch (err) {
    // If user cancelled native share, that's fine
    if (err.name !== "AbortError") {
      console.warn("Native share not supported or failed:", err);
    }
  }
  return false;
}

/**
 * Open platform composer in a new tab smoothly
 */
export function openPlatformComposer(platform, postContent) {
  const { text, title, shareUrl } = postContent;
  let targetUrl = "";

  switch (platform) {
    case "twitter":
      targetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      break;

    case "reddit":
      // Pre-fills title, markdown body text, and url
      targetUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      break;

    case "linkedin":
      // Pre-fills the entire formatted caption, pilot stats, and site link in LinkedIn's post composer
      targetUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
      break;

    default:
      targetUrl = shareUrl;
  }

  if (targetUrl) {
    const win = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      // In case of aggressive popup blocker, navigate or notify
      console.warn("Popup blocked by browser");
    }
    return win;
  }
  return null;
}
