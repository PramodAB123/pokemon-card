import React, { useEffect, useRef } from "react";

function drawBall(ballCtx, ballFlashRef) {
  const S = 140;
  ballCtx.clearRect(0, 0, S, S);
  const cx = S/2, cy = S/2, r = S/2-4;
  const ballFlash = ballFlashRef.current;

  ballCtx.save();
  ballCtx.translate(cx, cy);

  const flashBlue = Math.min(ballFlash, 0.55);

  // Top hemisphere
  ballCtx.beginPath();
  ballCtx.arc(0,0,r,Math.PI,0); ballCtx.lineTo(r,0); ballCtx.lineTo(-r,0); ballCtx.closePath();
  const topGrad = ballCtx.createRadialGradient(-r*0.3,-r*0.35,r*0.05,0,0,r);
  topGrad.addColorStop(0,   `rgba(255,${80+Math.round(flashBlue*100)},${80+Math.round(flashBlue*160)},1)`);
  topGrad.addColorStop(0.6, `rgba(${200-Math.round(flashBlue*80)},30,${30+Math.round(flashBlue*180)},1)`);
  topGrad.addColorStop(1,   `rgba(${100-Math.round(flashBlue*40)},10,${10+Math.round(flashBlue*100)},1)`);
  ballCtx.fillStyle = topGrad; ballCtx.fill();

  // Bottom hemisphere
  ballCtx.beginPath();
  ballCtx.arc(0,0,r,0,Math.PI); ballCtx.lineTo(-r,0); ballCtx.closePath();
  const botGrad = ballCtx.createRadialGradient(r*0.2,r*0.4,r*0.05,0,0,r);
  botGrad.addColorStop(0,   `rgba(${220+Math.round(flashBlue*35)},${220+Math.round(flashBlue*35)},${220+Math.round(flashBlue*35)},1)`);
  botGrad.addColorStop(0.5, `rgba(${140+Math.round(flashBlue*80)},${140+Math.round(flashBlue*80)},${180+Math.round(flashBlue*75)},1)`);
  botGrad.addColorStop(1,   `rgba(${50+Math.round(flashBlue*30)},${50+Math.round(flashBlue*30)},${70+Math.round(flashBlue*60)},1)`);
  ballCtx.fillStyle = botGrad; ballCtx.fill();

  // Center band
  ballCtx.beginPath(); ballCtx.rect(-r,-7,r*2,14);
  ballCtx.fillStyle=`rgba(${10+Math.round(flashBlue*40)},${10+Math.round(flashBlue*40)},${20+Math.round(flashBlue*80)},1)`;
  ballCtx.fill();

  ballCtx.strokeStyle=`rgba(${30+Math.round(flashBlue*100)},${30+Math.round(flashBlue*80)},${30+Math.round(flashBlue*180)},0.6)`;
  ballCtx.lineWidth=1;
  ballCtx.beginPath(); ballCtx.moveTo(-r,-7); ballCtx.lineTo(r,-7);
  ballCtx.moveTo(-r,7);  ballCtx.lineTo(r,7); ballCtx.stroke();

  // Center button
  const btnR=13;
  ballCtx.beginPath(); ballCtx.arc(0,0,btnR,0,Math.PI*2);
  ballCtx.fillStyle=`rgba(${15+Math.round(flashBlue*40)},${15+Math.round(flashBlue*40)},${30+Math.round(flashBlue*100)},1)`;
  ballCtx.fill();
  ballCtx.strokeStyle=`rgba(${80+Math.round(flashBlue*100)},${80+Math.round(flashBlue*80)},${100+Math.round(flashBlue*155)},0.9)`;
  ballCtx.lineWidth=2.5; ballCtx.stroke();
  const dotGrad=ballCtx.createRadialGradient(-3,-3,1,0,0,btnR);
  dotGrad.addColorStop(0,`rgba(${180+Math.round(flashBlue*75)},${180+Math.round(flashBlue*75)},255,${0.7+ballFlash*0.3})`);
  dotGrad.addColorStop(1,"rgba(0,0,0,0)");
  ballCtx.beginPath(); ballCtx.arc(0,0,btnR,0,Math.PI*2); ballCtx.fillStyle=dotGrad; ballCtx.fill();

  // Shine
  ballCtx.beginPath(); ballCtx.ellipse(-r*0.25,-r*0.4,r*0.32,r*0.18,-0.3,0,Math.PI*2);
  ballCtx.fillStyle="rgba(255,255,255,0.18)"; ballCtx.fill();

  // Outer ring
  ballCtx.beginPath(); ballCtx.arc(0,0,r,0,Math.PI*2);
  ballCtx.strokeStyle=`rgba(${20+Math.round(flashBlue*60)},${20+Math.round(flashBlue*40)},${40+Math.round(flashBlue*180)},0.85)`;
  ballCtx.lineWidth=3; ballCtx.stroke();

  if(ballFlash>0){
    const fg=ballCtx.createRadialGradient(0,0,0,0,0,r);
    fg.addColorStop(0,`rgba(64,192,255,${ballFlash*0.55})`); fg.addColorStop(1,"transparent");
    ballCtx.beginPath(); ballCtx.arc(0,0,r,0,Math.PI*2); ballCtx.fillStyle=fg; ballCtx.fill();
    ballFlashRef.current=Math.max(0,ballFlash-0.04);
  }
  ballCtx.restore();
}

export default function LoadingSection({ active }) {
  const ltCanvasRef   = useRef(null);
  const ballCanvasRef = useRef(null);
  const rafRef        = useRef(null);
  const intervalRef   = useRef(null);
  const ballFlash     = useRef(0);
  const activeBolts   = useRef([]);
  const strikeOpacity = useRef(0);
  const arcAngle      = useRef(0);

  const steps = [
    "Fetching trainer profile…",
    "Calculating base stats…",
    "Assigning Pokémon type…",
    "Printing your card…",
  ];
  const [activeStep, setActiveStep] = React.useState(0);
  const [doneSteps,  setDoneSteps]  = React.useState([]);

  useEffect(() => {
    if (!active) { stop(); return; }
    setActiveStep(0); setDoneSteps([]);
    start();
    const timers = [
      setTimeout(() => { setDoneSteps([0]); setActiveStep(1); }, 1200),
      setTimeout(() => { setDoneSteps([0,1]); setActiveStep(2); }, 2400),
      setTimeout(() => { setDoneSteps([0,1,2]); setActiveStep(3); }, 3600),
    ];
    return () => { timers.forEach(clearTimeout); stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function boltL(ltCtx,x1,y1,x2,y2,depth,alpha){
    if(depth===0) return;
    const mx=(x1+x2)/2+(Math.random()-0.5)*30*depth;
    const my=(y1+y2)/2+(Math.random()-0.5)*18*depth;
    ltCtx.beginPath(); ltCtx.moveTo(x1,y1); ltCtx.lineTo(mx,my); ltCtx.lineTo(x2,y2);
    ltCtx.strokeStyle=`rgba(80,180,255,${alpha})`; ltCtx.lineWidth=depth*1.2;
    ltCtx.shadowColor="rgba(64,192,255,1)"; ltCtx.shadowBlur=14*depth; ltCtx.stroke();
    if(depth>1&&Math.random()>0.4) boltL(ltCtx,mx,my,mx+(Math.random()-0.5)*55,my+(Math.random()-0.5)*38,depth-1,alpha*0.42);
    boltL(ltCtx,x1,y1,mx,my,depth-1,alpha*0.75);
    boltL(ltCtx,mx,my,x2,y2,depth-1,alpha*0.75);
  }

  function edgePoint(w,h){
    const side=Math.floor(Math.random()*4);
    if(side===0) return{x:Math.random()*w,y:0};
    if(side===1) return{x:w,y:Math.random()*h};
    if(side===2) return{x:Math.random()*w,y:h};
    return{x:0,y:Math.random()*h};
  }

  function strike(){
    ballFlash.current=1.0;
  }

  function renderLoop(){
    const ballCanvas=ballCanvasRef.current, ltCanvas=ltCanvasRef.current;
    if(!ballCanvas||!ltCanvas) return;

    drawBall(ballCanvas.getContext("2d"), ballFlash);

    const w=ltCanvas.offsetWidth||360, h=ltCanvas.offsetHeight||280;
    ltCanvas.width=w; ltCanvas.height=h;
    const ltCtx=ltCanvas.getContext("2d");
    ltCtx.clearRect(0,0,w,h);

    // Thunder effect removed
    rafRef.current=requestAnimationFrame(renderLoop);
  }

  function start(){
    if(!rafRef.current) renderLoop();
    if(!intervalRef.current){ strike(); intervalRef.current=setInterval(strike,900); }
  }
  function stop(){
    clearInterval(intervalRef.current); intervalRef.current=null;
    if(rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current=null; }
    const ltCanvas=ltCanvasRef.current, ballCanvas=ballCanvasRef.current;
    if(ltCanvas){ const c=ltCanvas.getContext("2d"); c.clearRect(0,0,ltCanvas.width,ltCanvas.height); }
    if(ballCanvas){ const c=ballCanvas.getContext("2d"); c.clearRect(0,0,140,140); }
  }

  return (
    <section
      className="loading-section relative z-10 w-full flex flex-col items-center justify-center min-h-screen"
      style={{ display: active ? 'flex' : 'none' }}
      id="loadingSection"
    >
      <div className="loader-stage">
        <canvas className="loader-lightning-canvas" ref={ltCanvasRef} aria-hidden="true" />
        <div className="loader-ball-wrap">
          <canvas className="loader-ball-canvas" ref={ballCanvasRef} width={140} height={140} />
          <div className="loader-ball-ring" />
          <div className="loader-ball-ring-inner" />
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
