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
export function generatePostContent(platform, d, shareUrl) {
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
