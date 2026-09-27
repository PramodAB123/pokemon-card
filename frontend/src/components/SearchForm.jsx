import React, { useEffect, useRef, useState } from "react";

const RECENT_KEY = "gh-trainer-recent";
function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}
function addRecent(username) {
  let list = getRecent().filter(u => u.toLowerCase() !== username.toLowerCase());
  list.unshift(username);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
}

// Input lightning effect
function initInputLightning(canvas, input) {
  if (!canvas || !input) return () => {};
  const ctx = canvas.getContext("2d");
  let focused = false;
  let typingTimer = null;

  function syncSize() {
    const wrap = canvas.parentElement;
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
  }

  function seg(x1,y1,x2,y2,depth,alpha,color) {
    if (depth===0) return;
    const mx=(x1+x2)/2+(Math.random()-0.5)*14*depth;
    const my=(y1+y2)/2+(Math.random()-0.5)*8*depth;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(mx,my); ctx.lineTo(x2,y2);
    ctx.strokeStyle = color||`rgba(80,180,255,${alpha})`;
    ctx.lineWidth   = depth*0.7;
    ctx.shadowColor = "rgba(64,192,255,1)";
    ctx.shadowBlur  = 10*depth;
    ctx.stroke();
    if (depth>1&&Math.random()>0.55) seg(mx,my,mx+(Math.random()-0.5)*28,my+(Math.random()-0.5)*16,depth-1,alpha*0.5,color);
    seg(x1,y1,mx,my,depth-1,alpha*0.75,color);
    seg(mx,my,x2,y2,depth-1,alpha*0.75,color);
  }

  function borderPoint(w,h) {
    const side=Math.floor(Math.random()*4);
    if(side===0) return{x:Math.random()*w,y:0};
    if(side===1) return{x:w,y:Math.random()*h};
    if(side===2) return{x:Math.random()*w,y:h};
    return{x:0,y:Math.random()*h};
  }

  function roundRect(cx,x,y,w,h,r) {
    cx.moveTo(x+r,y); cx.lineTo(x+w-r,y); cx.arcTo(x+w,y,x+w,y+r,r);
    cx.lineTo(x+w,y+h-r); cx.arcTo(x+w,y+h,x+w-r,y+h,r);
    cx.lineTo(x+r,y+h); cx.arcTo(x,y+h,x,y+h-r,r);
    cx.lineTo(x,y+r); cx.arcTo(x,y,x+r,y,r); cx.closePath();
  }

  function drawIdleGlow() {
    syncSize();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.strokeStyle="rgba(64,192,255,0.08)"; ctx.lineWidth=1.5;
    ctx.shadowColor="rgba(64,192,255,0.4)"; ctx.shadowBlur=10;
    ctx.beginPath(); roundRect(ctx,0,0,canvas.width,canvas.height,12); ctx.stroke();
    ctx.restore();
  }

  function drawFocusGlow() {
    syncSize();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.strokeStyle="rgba(64,192,255,0.35)"; ctx.lineWidth=1.5;
    ctx.shadowColor="rgba(64,192,255,1)"; ctx.shadowBlur=20;
    ctx.beginPath(); roundRect(ctx,0,0,canvas.width,canvas.height,12); ctx.stroke();
    ctx.restore();
  }

  function strike(intensity) {
    syncSize();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w=canvas.width, h=canvas.height;
    const numBolts=intensity?3:1;
    for(let b=0;b<numBolts;b++){
      const p1=borderPoint(w,h), p2=borderPoint(w,h);
      seg(p1.x,p1.y,p2.x,p2.y,intensity?4:3,0.9);
    }
    if(intensity){
      ctx.save();
      ctx.strokeStyle="rgba(64,192,255,0.18)"; ctx.lineWidth=3;
      ctx.shadowColor="rgba(64,192,255,0.9)"; ctx.shadowBlur=18;
      ctx.beginPath(); roundRect(ctx,0,0,w,h,12); ctx.stroke();
      ctx.restore();
    }
    let opacity=1;
    const fade=setInterval(()=>{
      opacity-=0.10;
      if(opacity<=0){clearInterval(fade);ctx.clearRect(0,0,canvas.width,canvas.height);if(!focused)drawIdleGlow();return;}
      ctx.globalAlpha=opacity;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(let b=0;b<numBolts;b++){const p1=borderPoint(w,h),p2=borderPoint(w,h);seg(p1.x,p1.y,p2.x,p2.y,intensity?4:3,0.9);}
      if(intensity){ctx.save();ctx.strokeStyle="rgba(64,192,255,0.18)";ctx.lineWidth=3;ctx.shadowColor="rgba(64,192,255,0.9)";ctx.shadowBlur=18;ctx.beginPath();roundRect(ctx,0,0,w,h,12);ctx.stroke();ctx.restore();}
      ctx.globalAlpha=1;
    },38);
  }

  const idleIv = setInterval(()=>{ if(!focused) strike(false); },3500);
  let focusIv  = null;

  const onFocus = ()=>{ focused=true; drawFocusGlow(); focusIv=setInterval(()=>strike(false),1800); };
  const onBlur  = ()=>{ focused=false; clearInterval(focusIv); drawIdleGlow(); };
  const onInput = ()=>{
    strike(true);
    clearTimeout(typingTimer);
    typingTimer=setTimeout(()=>{ if(focused) drawFocusGlow(); },500);
  };

  input.addEventListener("focus",onFocus);
  input.addEventListener("blur",onBlur);
  input.addEventListener("input",onInput);
  syncSize(); drawIdleGlow(); setTimeout(()=>strike(false),1200);

  return ()=>{
    clearInterval(idleIv); clearInterval(focusIv);
    input.removeEventListener("focus",onFocus);
    input.removeEventListener("blur",onBlur);
    input.removeEventListener("input",onInput);
  };
}

export default function SearchForm({ onSearch, initialError = "" }) {
  const [value, setValue]   = useState("");
  const [hint,  setHint]    = useState(initialError);
  const [recent, setRecent] = useState([]);
  const canvasRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    setRecent(getRecent());
    const cleanup = initInputLightning(canvasRef.current, inputRef.current);
    return cleanup;
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const username = value.trim().replace(/^@/, "");
    if (!username) { setHint("Please enter a GitHub username."); return; }
    setHint("");
    addRecent(username);
    setRecent(getRecent());
    onSearch(username);
  }

  function triggerChip(username) {
    setValue(username);
    setHint("");
    addRecent(username);
    setRecent(getRecent());
    onSearch(username);
  }

  return (
    <>
      <form className="scout-form" onSubmit={handleSubmit} autoComplete="off" id="searchForm">
        <div className="input-lightning-wrap">
          <canvas className="input-lightning-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="scout-input-wrap">
            <span className="input-pokeball">⊙</span>
            <input
              ref={inputRef}
              className="scout-input"
              id="githubInput"
              type="text"
              placeholder="enter your github username…"
              spellCheck="false"
              maxLength={39}
              aria-label="GitHub username"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
            <button className="scout-btn" type="submit" id="generateBtn">
              CATCH&nbsp;→
            </button>
          </div>
        </div>
        {hint && <p className="input-hint">{hint}</p>}
      </form>

      {/* Quick examples */}
      <div className="quick-examples">
        <span className="qe-label">Try:</span>
        {["torvalds", "sindresorhus"].map(u => (
          <button key={u} className="example-chip qe-chip" onClick={() => triggerChip(u)}>{u}</button>
        ))}
      </div>

      {/* Counter bar */}
      <div className="counter-bar">
        <span className="counter-dot" />
        <span className="counter-num">498,945</span>
        <span className="counter-label">cards generated</span>
        <span className="counter-sep">|</span>
        <a className="how-link" href="#how">how it works ↗</a>
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="recent-wrap visible">
          <span className="recent-label">Recent:</span>
          <div className="flex gap-2 flex-wrap">
            {recent.map(u => (
              <button key={u} className="recent-chip" onClick={() => triggerChip(u)}>{u}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
