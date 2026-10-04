import React, { useEffect, useRef, useState } from "react";

export default function LoadingSection({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const steps = [
    "Initializing subspace sensors…",
    "Scanning GitHub orbital telemetry…",
    "Aligning star system coordinates…",
    "Forging Explorer trading card…",
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState([]);

  useEffect(() => {
    if (!active) return;
    setActiveStep(0);
    setDoneSteps([]);

    const timers = [
      setTimeout(() => {
        setDoneSteps([0]);
        setActiveStep(1);
      }, 700),
      setTimeout(() => {
        setDoneSteps([0, 1]);
        setActiveStep(2);
      }, 1400),
      setTimeout(() => {
        setDoneSteps([0, 1, 2]);
        setActiveStep(3);
      }, 2100),
    ];

    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.offsetWidth || 380);
    let height = (canvas.height = canvas.offsetHeight || 300);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 380;
      height = canvas.height = canvas.offsetHeight || 300;
    };
    window.addEventListener("resize", onResize);

    // Initialize 120 warp stars
    const NUM_STARS = 130;
    const stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: 0,
        color: Math.random() > 0.3 ? "#38BDF8" : Math.random() > 0.5 ? "#818CF8" : "#F472B6",
      });
      stars[i].pz = stars[i].z;
    }

    let ringPulse = 0;

    function render() {
      ctx.fillStyle = "rgba(7, 8, 15, 0.28)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Warp Tunnel Rings
      ringPulse = (ringPulse + 0.04) % (Math.PI * 2);
      for (let r = 1; r <= 3; r++) {
        const radius = ((ringPulse * 28 * r) % 130) + 15;
        const alpha = Math.max(0, 1 - radius / 140) * 0.45;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Warp Speed Star Streaks
      for (let i = 0; i < NUM_STARS; i++) {
        const star = stars[i];
        star.pz = star.z;
        star.z -= 14; // Warp acceleration speed

        if (star.z <= 0) {
          star.z = width;
          star.pz = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 180 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const pk = 180 / star.pz;
        const prevX = star.x * pk + cx;
        const prevY = star.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, Math.max(0.1, 1 - star.z / width));
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = depthAlpha;
          ctx.lineWidth = Math.min(3, Math.max(1, (1 - star.z / width) * 3));
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Center Warp Singularity / Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
      coreGrad.addColorStop(0, "rgba(224, 242, 254, 0.95)");
      coreGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.8)");
      coreGrad.addColorStop(0.8, "rgba(99, 102, 241, 0.3)");
      coreGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Crosshair Target Reticle
      ctx.strokeStyle = "rgba(125, 211, 252, 0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 36, cy);
      ctx.moveTo(cx, cy - 36);
      ctx.lineTo(cx, cy - 10);
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy + 36);
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  return (
    <section
      className="loading-section relative z-10 w-full flex flex-col items-center justify-center min-h-screen"
      style={{ display: active ? "flex" : "none" }}
      id="loadingSection"
    >
      <div className="loader-stage warp-loader-stage">
        <canvas className="warp-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="warp-hud-overlay">
          <div className="warp-reticle-ring" />
          <div className="warp-status-text">ENGAGING WARP</div>
        </div>
      </div>

      <div className="loading-steps mt-6">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`loading-step${activeStep === i ? " active" : ""}${doneSteps.includes(i) ? " done" : ""}`}
          >
            <span className="step-dot" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
