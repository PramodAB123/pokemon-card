import React from "react";

export default function HeroShipGroup() {
  return (
    <div className="hero-right" aria-hidden="true">
      <div className="hsg-wrap">
        {/* Orbital Navigation Rings */}
        <div className="hsg-orbit-ring ring-outer" />
        <div className="hsg-orbit-ring ring-mid" />
        <div className="hsg-orbit-ring ring-inner" />

        {/* Ambient Starlight / Nebula Flairs */}
        <div className="hsg-nebula-core" />

        {/* ── Main Flagship: The Hyperion Dreadnought ── */}
        <div className="hsg-ship hsg-flagship">
          <div className="ship-glow glow-flagship" />
          <svg
            className="ship-svg flagship-svg"
            viewBox="0 0 320 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="hullGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#1E293B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="plasmaGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Thruster Plumes */}
            <path
              d="M40 95 L10 100 L40 105 Z"
              fill="url(#plasmaGrad)"
              filter="url(#glowFilter)"
              className="thruster-fire"
            />
            <path
              d="M40 115 L5 120 L40 125 Z"
              fill="url(#plasmaGrad)"
              filter="url(#glowFilter)"
              className="thruster-fire delayed"
            />

            {/* Main Hull */}
            <polygon
              points="40,80 120,60 220,90 290,110 220,130 120,160 40,140 70,110"
              fill="url(#hullGrad)"
              stroke="#38BDF8"
              strokeWidth="2"
            />

            {/* Upper Wing Armor Plating */}
            <polygon
              points="80,70 160,50 200,85 110,95"
              fill="#1E293B"
              stroke="#67E8F9"
              strokeWidth="1.2"
              opacity="0.8"
            />
            {/* Lower Wing Armor Plating */}
            <polygon
              points="80,150 160,170 200,135 110,125"
              fill="#1E293B"
              stroke="#67E8F9"
              strokeWidth="1.2"
              opacity="0.8"
            />

            {/* Command Bridge Tower */}
            <polygon
              points="140,95 210,105 230,110 210,115 140,125 150,110"
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />
            {/* Cockpit Canopy Glow */}
            <ellipse cx="195" cy="110" rx="14" ry="4" fill="#38BDF8" filter="url(#glowFilter)" />

            {/* Energy Conduits / Hull Lines */}
            <line x1="90" y1="110" x2="260" y2="110" stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="110" cy="110" r="3" fill="#38BDF8" />
            <circle cx="160" cy="110" r="3" fill="#38BDF8" />
            <circle cx="210" cy="110" r="3" fill="#38BDF8" />

            {/* Sensor Array Needle */}
            <line x1="290" y1="110" x2="315" y2="110" stroke="#38BDF8" strokeWidth="2" />
            <circle cx="315" cy="110" r="2.5" fill="#E0F2FE" filter="url(#glowFilter)" />
          </svg>
        </div>

        {/* ── Sub-Vessel 1: Solaris Interceptor (Top-Left) ── */}
        <div className="hsg-ship hsg-escort hsg-ship-1">
          <div className="ship-glow glow-amber" />
          <svg className="ship-svg" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="20,45 60,20 120,45 60,70" fill="#1C1917" stroke="#F59E0B" strokeWidth="1.5" />
            <polygon points="40,45 75,30 100,45 75,60" fill="#78350F" stroke="#FCD34D" strokeWidth="1" />
            <circle cx="85" cy="45" r="4" fill="#FDE68A" />
            <line x1="10" y1="45" x2="20" y2="45" stroke="#F59E0B" strokeWidth="2" />
          </svg>
        </div>

        {/* ── Sub-Vessel 2: Nebula Scout (Top-Right) ── */}
        <div className="hsg-ship hsg-escort hsg-ship-2">
          <div className="ship-glow glow-purple" />
          <svg className="ship-svg" viewBox="0 0 130 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="15,45 55,22 115,45 55,68" fill="#1E1B4B" stroke="#8B5CF6" strokeWidth="1.5" />
            <polygon points="45,45 75,32 95,45 75,58" fill="#4C1D95" stroke="#C4B5FD" strokeWidth="1" />
            <circle cx="80" cy="45" r="4" fill="#DDD6FE" />
          </svg>
        </div>

        {/* ── Sub-Vessel 3: Quantum Probe (Bottom-Left) ── */}
        <div className="hsg-ship hsg-escort hsg-ship-3">
          <div className="ship-glow glow-cyan" />
          <svg className="ship-svg" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="15,40 50,15 105,40 50,65" fill="#0C4A6E" stroke="#06B6D4" strokeWidth="1.5" />
            <circle cx="65" cy="40" r="5" fill="#67E8F9" />
          </svg>
        </div>

        {/* ── Sub-Vessel 4: Crimson Vanguard (Bottom-Right) ── */}
        <div className="hsg-ship hsg-escort hsg-ship-4">
          <div className="ship-glow glow-red" />
          <svg className="ship-svg" viewBox="0 0 130 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="15,40 55,18 115,40 55,62" fill="#450A0A" stroke="#EF4444" strokeWidth="1.5" />
            <circle cx="75" cy="40" r="4" fill="#FCA5A5" />
          </svg>
        </div>

      </div>
    </div>
  );
}
