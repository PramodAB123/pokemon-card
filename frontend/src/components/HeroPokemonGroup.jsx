import React from "react";

export default function HeroPokemonGroup() {
  return (
    <div className="hero-right" aria-hidden="true">
      <div className="hpg-wrap">
        <div className="hpg-pokeball-ring" />

        {/* Main: Charizard */}
        <div className="hpg-pokemon hpg-main hpg-fire">
          <div className="hpg-glow" />
          <img
            className="hpg-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
            alt="Charizard"
            loading="lazy"
          />
        </div>

        {/* Pikachu */}
        <div className="hpg-pokemon hpg-s1 hpg-electric">
          <div className="hpg-glow" />
          <img
            className="hpg-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
            alt="Pikachu"
            loading="lazy"
          />
        </div>

        {/* Mewtwo */}
        <div className="hpg-pokemon hpg-s2 hpg-psychic">
          <div className="hpg-glow" />
          <img
            className="hpg-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
            alt="Mewtwo"
            loading="lazy"
          />
        </div>

        {/* Blastoise */}
        <div className="hpg-pokemon hpg-s3 hpg-water">
          <div className="hpg-glow" />
          <img
            className="hpg-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
            alt="Blastoise"
            loading="lazy"
          />
        </div>

        {/* Gengar */}
        <div className="hpg-pokemon hpg-s4 hpg-ghost">
          <div className="hpg-glow" />
          <img
            className="hpg-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt="Gengar"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
