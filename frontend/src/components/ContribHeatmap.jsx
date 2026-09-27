import React, { useEffect, useRef } from "react";

// Build a pseudo-random heatmap (same algorithm as original)
function buildHeatmapCells() {
  const WEEKS = 52, DAYS = 7;
  const cells = [];
  let streak = 0;
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const week = Math.floor(i / DAYS);
    const day  = i % DAYS;
    const isWeekend = day === 0 || day === 6;
    const r  = Math.sin(i * 127.1 + week * 311.7) * 0.5 + 0.5;
    const r2 = Math.sin(i * 43.7 + 91.3) * 0.5 + 0.5;
    let level = 0;
    if (r > (isWeekend ? 0.72 : 0.55)) {
      level = r2 > 0.80 ? 4 : r2 > 0.60 ? 3 : r2 > 0.35 ? 2 : 1;
      streak++;
    } else {
      streak = 0;
    }
    if (streak >= 3 && level > 0 && level < 4) level = Math.min(4, level + 1);
    cells.push(level);
  }
  // reorder: week-column by week-column (GitHub style)
  const out = [];
  for (let col = 0; col < WEEKS; col++)
    for (let row = 0; row < DAYS; row++)
      out.push(cells[col * DAYS + row]);
  return out;
}

function initLightning(canvas, grid) {
  if (!canvas || !grid) return () => {};

  function syncSize() {
    canvas.width  = grid.offsetWidth;
    canvas.height = grid.offsetHeight;
  }
  syncSize();
  const ctx = canvas.getContext("2d");

  function getHotCells() {
    const cells = grid.querySelectorAll(".pb-cell.pb-4");
    if (!cells.length) return [];
    const gr = grid.getBoundingClientRect();
    return Array.from(cells).map(c => {
      const r = c.getBoundingClientRect();
      return { x: r.left - gr.left + r.width / 2, y: r.top - gr.top + r.height / 2 };
    });
  }

  function bolt(x1, y1, x2, y2, depth, alpha) {
    if (depth === 0) return;
    const mx = (x1+x2)/2 + (Math.random()-0.5)*18*depth;
    const my = (y1+y2)/2 + (Math.random()-0.5)*10*depth;
    ctx.beginPath();
    ctx.moveTo(x1,y1); ctx.lineTo(mx,my); ctx.lineTo(x2,y2);
    ctx.strokeStyle = `rgba(80,180,255,${alpha})`;
    ctx.lineWidth   = depth * 0.8;
    ctx.shadowColor = "rgba(64,192,255,0.9)";
    ctx.shadowBlur  = 8 * depth;
    ctx.stroke();
    if (depth > 1 && Math.random() > 0.5) {
      bolt(mx, my, mx+(Math.random()-0.5)*30, my+(Math.random()-0.5)*20, depth-1, alpha*0.55);
    }
    bolt(x1,y1,mx,my,depth-1,alpha*0.8);
    bolt(mx,my,x2,y2,depth-1,alpha*0.8);
  }

  function strike() {
    const hot = getHotCells();
    if (!hot.length) return;
    const target = hot[Math.floor(Math.random() * hot.length)];
    const ox = target.x + (Math.random()-0.5)*40, oy = -10;
    syncSize();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    bolt(ox, oy, target.x, target.y, 4, 0.9);
    const grad = ctx.createRadialGradient(target.x,target.y,0,target.x,target.y,14);
    grad.addColorStop(0,"rgba(180,230,255,0.85)"); grad.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(target.x,target.y,14,0,Math.PI*2);
    ctx.fillStyle = grad; ctx.shadowBlur=0; ctx.fill();
    let opacity = 1;
    const fade = setInterval(() => {
      opacity -= 0.09;
      if (opacity <= 0) { clearInterval(fade); ctx.clearRect(0,0,canvas.width,canvas.height); return; }
      ctx.globalAlpha = opacity;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      bolt(ox,oy,target.x,target.y,4,0.9);
      ctx.beginPath(); ctx.arc(target.x,target.y,14,0,Math.PI*2);
      ctx.fillStyle=grad; ctx.fill();
      ctx.globalAlpha=1;
    }, 40);
  }

  const t1 = setTimeout(strike, 800);
  const iv = setInterval(() => { if (Math.random() > 0.3) strike(); }, 2200);
  return () => { clearTimeout(t1); clearInterval(iv); };
}

const CELLS = buildHeatmapCells();

export default function ContribHeatmap() {
  const canvasRef = useRef(null);
  const gridRef   = useRef(null);

  useEffect(() => {
    const cleanup = initLightning(canvasRef.current, gridRef.current);
    return cleanup;
  }, []);

  return (
    <div className="contrib-heatmap" aria-hidden="true">
      <div className="heatmap-label-row">
        <span className="heatmap-label">⚡ Push Activity</span>
        <span className="heatmap-subtitle">past 52 weeks</span>
      </div>
      <div className="heatmap-canvas-wrap">
        <canvas className="lightning-canvas" ref={canvasRef} />
        <div className="heatmap-grid" ref={gridRef}>
          {CELLS.map((level, i) => (
            <div key={i} className={`pb-cell pb-${level}`}>
              <div className="pb-btn" />
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="legend-text">Less</span>
        <div className="legend-balls">
          {[0,1,2,3,4].map(l => (
            <div key={l} className={`pb-cell pb-${l}`} style={{width:12,height:12,paddingBottom:0}}>
              <div className="pb-btn" style={{position:"static",width:"100%",height:"100%"}} />
            </div>
          ))}
        </div>
        <span className="legend-text">More</span>
      </div>
    </div>
  );
}
