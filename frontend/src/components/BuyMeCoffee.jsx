import React from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "../lib/analytics.js";

const BMC_URL = "https://buymeacoffee.com/gitastro";

// Outline mug with animated steam; stroke uses currentColor
function CoffeeCupIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g>
        <path className="bmc-steam" d="M7 2.5v2.5" />
        <path className="bmc-steam" d="M11 2.5v2.5" />
        <path className="bmc-steam" d="M15 2.5v2.5" />
      </g>
      <path d="M17 9h1.5a3 3 0 0 1 0 6H17" />
      <path d="M3.5 9h13.5v7a4 4 0 0 1-4 4H7.5a4 4 0 0 1-4-4z" />
    </svg>
  );
}

export default function BuyMeCoffee() {
  const { pathname } = useLocation();
  const page = pathname === "/" ? "home" : "card";

  return (
    <a
      className="bmc-btn no-capture"
      href={BMC_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("Coffee Clicked", { page })}
      aria-label="Support the developers on Buy Me a Coffee (opens in a new tab)"
    >
      <CoffeeCupIcon className="bmc-icon" />
      <span className="bmc-text">Support the Developers</span>
    </a>
  );
}
