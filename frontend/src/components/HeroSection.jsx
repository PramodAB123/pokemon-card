import React from "react";
import SearchForm from "./SearchForm.jsx";
import ContribHeatmap from "./ContribHeatmap.jsx";
import HeroSolarSystem from "./HeroSolarSystem.jsx";

export default function HeroSection({ onSearch, initialError }) {
  return (
    <section className="search-section" id="searchSection">
      <div className="hero-layout">
        {/* Left column */}
        <div className="hero-left">

          <div className="hero-badge">
            <span className="badge-gh">GitHub</span>
            <span className="badge-x">×</span>
            <span className="badge-wc">solar system cards</span>
          </div>

          <h1 className="hero-headline">
            <span className="headline-line1">Gitstar Explorer</span>
            <span className="headline-main">Chart your </span>
            <span className="headline-accent" data-text="solar system.">solar system.</span>
          </h1>

          <p className="hero-sub">
            Your profile becomes a quiet little system. Contributions light the star, languages find their orbits, and commits decide how far the worlds reach.
          </p>

          <SearchForm onSearch={onSearch} initialError={initialError} />

          <ContribHeatmap />

        </div>

        {/* Right column: Interactive Real-Time Solar System */}
        <HeroSolarSystem />
      </div>
    </section>
  );
}
