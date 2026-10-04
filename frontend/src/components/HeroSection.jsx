import React from "react";
import SearchForm from "./SearchForm.jsx";
import ContribHeatmap from "./ContribHeatmap.jsx";
import HeroShipGroup from "./HeroShipGroup.jsx";

export default function HeroSection({ onSearch, initialError }) {
  return (
    <section className="search-section" id="searchSection">
      <div className="hero-layout">
        {/* Left column */}
        <div className="hero-left">

          <div className="hero-badge">
            <span className="badge-rocket">🚀</span>
            <span className="badge-gh">GITHUB</span>
            <span className="badge-x">×</span>
            <span className="badge-wc">INTERSTELLAR <strong>EXPLORER FLEET</strong></span>
          </div>

          <h1 className="hero-headline">
            <span className="headline-line1">GITSTAR EXPLORER</span>
            <span className="headline-main">FORGE YOUR </span>
            <span className="headline-accent" data-text="STAR CARD.">STAR CARD.</span>
          </h1>

          <p className="hero-sub">
            Turn your GitHub profile into an <span className="sub-highlight">interstellar explorer</span> trading card! Your contributions become missions, your languages map to star systems, and your code earns you fleet rank.
          </p>

          <SearchForm onSearch={onSearch} initialError={initialError} />

          <ContribHeatmap />

        </div>

        {/* Right column */}
        <HeroShipGroup />
      </div>
    </section>
  );
}
