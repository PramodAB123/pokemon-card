import React from "react";
import SearchForm from "./SearchForm.jsx";
import ContribHeatmap from "./ContribHeatmap.jsx";
import HeroPokemonGroup from "./HeroPokemonGroup.jsx";

export default function HeroSection({ onSearch, initialError }) {
  return (
    <section className="search-section" id="searchSection">
      <div className="hero-layout">
        {/* Left column */}
        <div className="hero-left">

          <div className="hero-badge">
            <span className="badge-ball">◉</span>
            <span className="badge-gh">GITHUB</span>
            <span className="badge-x">×</span>
            <span className="badge-wc">POKÉMON <strong>TRAINER CARDS</strong></span>
          </div>

          <h1 className="hero-headline">
            <span className="headline-line1">GITHUB × POKÉMON</span>
            CATCH YOUR<br />
            <span className="headline-accent" data-text="CARD.">CARD.</span>
          </h1>

          <p className="hero-sub">
            Your GitHub stats, transformed into a <span className="sub-highlight">holographic</span><br />
            Pokémon trainer card. Gotta code &apos;em all.
          </p>

          <SearchForm onSearch={onSearch} initialError={initialError} />

          <ContribHeatmap />

        </div>

        {/* Right column */}
        <HeroPokemonGroup />
      </div>
    </section>
  );
}
