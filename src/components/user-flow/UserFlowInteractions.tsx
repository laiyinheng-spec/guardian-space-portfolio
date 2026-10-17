import { useEffect, useRef, useState } from 'react';
import './user-flow-interactions.css';

type Box = [number, number, number, number];
// Original 4994 × 3257 image coordinates; array order follows the snake,
// including the second and final rows travelling right to left.
const steps: Array<{name: string; point: [number,number]; icon: Box; title: Box; ui?: Box; screen?: string}> = [
  {name:'Select Region',point:[784,808],icon:[699,535,168,200],title:[638,892,311,48],ui:[2568,1303,692,520],screen:'Region Selection Map'},
  {name:'Browse Animal List',point:[1340,808],icon:[1235,548,237,185],title:[1161,894,413,42],ui:[3350,1303,692,520],screen:'Recommended Pets List'},
  {name:'Open Animal Profile',point:[1904,808],icon:[1790,570,225,162],title:[1725,894,440,42],ui:[4139,1303,692,520],screen:'Animal Card Detail'},
  {name:'Choose Support Plan',point:[1892,1512],icon:[1810,1233,170,220],title:[1691,1604,459,45],ui:[4139,562,692,520],screen:'Guardian Plan Selection'},
  {name:'Log In / Bind Account',point:[1298,1512],icon:[1200,1247,180,207],title:[1089,1604,463,45],ui:[3340,555,700,527],screen:'Welcome Back / Sign-in'},
  {name:'Enter Guardian Space',point:[734,1512],icon:[635,1243,215,210],title:[505,1604,464,45],ui:[2568,2180,692,520],screen:'Guardian Activation'},
  {name:'Meet the Companion',point:[908,2148],icon:[782,1915,259,185],title:[671,2223,464,48]},
  {name:'Pet / Feed / Play',point:[1608,2148],icon:[1495,1915,235,185],title:[1440,2228,380,47],ui:[2568,2825,621,309],screen:'Guardian interactive disc'},
  {name:'Track Growth Record',point:[1716,2796],icon:[1604,2545,242,200],title:[1491,2876,458,42]},
  {name:'View Daily Updates',point:[999,2796],icon:[825,2540,220,180],title:[765,2876,424,48],ui:[4139,2180,692,520],screen:'Shelter Note / Daily Update'},
];
// Cubic corners follow the existing orange centreline, never crossing copy.
const route = 'M 505 808 H 2100 C 2238 808 2349 920 2349 1058 V 1262 C 2349 1400 2238 1512 2100 1512 H 499 C 361 1512 249 1624 249 1762 V 1898 C 249 2036 361 2148 499 2148 H 1980 C 2118 2148 2231 2260 2231 2398 V 2546 C 2231 2684 2118 2796 1980 2796 H 553';
const duration = 9200;

export default function UserFlowInteractions() {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const tails = useRef<Array<SVGPathElement | null>>([]);
  const finished = useRef(false);
  const [active, setActive] = useState<number | null>(null);
  const [autoStep, setAutoStep] = useState<number | null>(null);
  const [ending, setEnding] = useState(false);
  const stopGuide = () => {
    finished.current = true;
    root.current?.setAttribute('data-running', 'false');
    root.current?.setAttribute('data-phase', 'interrupted');
    setAutoStep(null); setEnding(false);
  };

  useEffect(() => {
    const el=root.current, line=path.current;
    if (!el || !line) return;
    let disposed=false, visible=false, elapsed=0, previous:number|null=null, raf=0, pulseUntil=0, lastStep=-1;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchOnly=window.matchMedia('(hover: none) and (pointer: coarse)');
    const length=line.getTotalLength();
    // Measure each node's distance on the real curve rather than assuming
    // equal time per row. This also preserves the reversed row directions.
    const distances=steps.map(step=>{
      let nearest=0, best=Infinity;
      for(let d=0;d<=length;d+=3){const p=line.getPointAtLength(d), error=Math.hypot(p.x-step.point[0],p.y-step.point[1]);if(error<best){best=error;nearest=d;}}
      return nearest;
    });
    const tick=(time:number)=>{
      raf=0;
      if(disposed || finished.current || !visible || document.hidden) {previous=null;return;}
      if(previous!==null) elapsed+=Math.min(time-previous,80);
      previous=time;
      el.dataset.elapsed=String(Math.round(elapsed));
      el.dataset.running='true'; el.dataset.phase='playing';
      const distance=Math.min(elapsed/duration,1)*length;
      const p=line.getPointAtLength(distance);head.current?.setAttribute('transform',`translate(${p.x} ${p.y})`);
      tails.current.forEach((tail,index)=>{
        const end=Math.max(0,distance-index*13), start=Math.max(0,end-15);
        const a=line.getPointAtLength(start),b=line.getPointAtLength(end);
        tail?.setAttribute('d',`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
      });
      const next=lastStep+1;
      if(next<distances.length && distance>=distances[next]) {lastStep=next;pulseUntil=elapsed+410;setAutoStep(next);}
      if(elapsed>pulseUntil) setAutoStep(current=>current===null?current:null);
      if(elapsed>=duration){
        el.dataset.running='false';setAutoStep(null);setEnding(true);el.dataset.phase='endpoint';
        // Endpoint emphasis uses the same visible-time clock, so leaving the
        // viewport/background pauses it too, rather than expiring offscreen.
        if(elapsed>=duration+420){finished.current=true;setEnding(false);el.dataset.phase='complete';return;}
      }
      raf=requestAnimationFrame(tick);
    };
    const resume=()=>{
      previous=null;
      if(raf)cancelAnimationFrame(raf);raf=0;
      if(!disposed && visible && !document.hidden && !finished.current) raf=requestAnimationFrame(tick);
      else if(!finished.current){el.dataset.running='false';el.dataset.phase='paused';}
    };
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting && entries[0].intersectionRatio>=.3;resume();},{threshold:[0,.3]});
    const motionChange=()=>{if(reduced.matches || touchOnly.matches){finished.current=true;el.dataset.running='false';el.dataset.phase='static';setAutoStep(null);setEnding(false);if(raf)cancelAnimationFrame(raf);}};
    document.addEventListener('visibilitychange',resume);
    reduced.addEventListener('change',motionChange);touchOnly.addEventListener('change',motionChange);
    motionChange();
    // Wait for preceding full-page images as well; late image decoding must
    // not make this page briefly appear near the top and consume its one run.
    Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>('.portfolio-image-page')).map(img=>img.decode().catch(()=>{}))).then(()=>{
      if(!disposed) {el.dataset.ready='true';observer.observe(el.querySelector('.user-flow__viewport')!);}
    });
    return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',motionChange);touchOnly.removeEventListener('change',motionChange);};
  },[]);

  const enter=(index:number)=>{stopGuide();setActive(index);};
  const leave=(index:number)=>setActive(current=>current===index?null:current);
  return <div className="user-flow" ref={root} data-running="false" data-phase="waiting">
    <div className="user-flow__viewport" aria-hidden="true" />
    <svg className="user-flow__highlights" viewBox="0 0 4994 3257" aria-hidden="true">
      {steps.map((step,index)=><g key={step.name} data-active={active===index || autoStep===index} data-auto={autoStep===index}>
        <rect className="user-flow__icon-ring" x={step.icon[0]-17} y={step.icon[1]-17} width={step.icon[2]+34} height={step.icon[3]+34} rx={index===4?95:32} />
        <rect className="user-flow__title-marker" x={step.title[0]-7} y={step.title[1]+8} width={step.title[2]+14} height="33" rx="4" />
      </g>)}
      {steps.map((step,index)=>step.ui && <rect key={step.name} className="user-flow__ui-ring" data-active={active===index} x={step.ui[0]} y={step.ui[1]} width={step.ui[2]} height={step.ui[3]} rx="28" />)}
      <ellipse className="user-flow__endpoint" data-active={ending} cx="403" cy="2796" rx="168" ry="158" />
    </svg>
    <svg className="user-flow__guide" viewBox="0 0 4994 3257" aria-hidden="true">
      <path ref={path} d={route} fill="none" stroke="none" />
      <g className="user-flow__traveller">
        {Array.from({length:10},(_,index)=><path key={index} ref={node=>{tails.current[index]=node;}} className="user-flow__tail" opacity={(1-index/10)*.9} />)}
        <g ref={head} className="user-flow__head"><circle r="20" /><circle className="user-flow__core" r="9" /></g>
      </g>
    </svg>
    {steps.map((step,index)=>{
      const left=Math.min(step.icon[0]-25,step.title[0]-14),top=step.icon[1]-25;
      const right=Math.max(step.icon[0]+step.icon[2]+25,step.title[0]+step.title[2]+14),bottom=step.title[1]+step.title[3]+12;
      return <button type="button" key={step.name} className="user-flow__trigger" aria-label={`${step.name}${step.screen?`: highlight ${step.screen}`:''}`} data-step={index}
        style={{left:`${left/4994*100}%`,top:`${top/3257*100}%`,width:`${(right-left)/4994*100}%`,height:`${(bottom-top)/3257*100}%`}}
        onMouseEnter={event=>{const native=event.nativeEvent as MouseEvent & {sourceCapabilities?:{firesTouchEvents?:boolean}};if(!native.sourceCapabilities?.firesTouchEvents && window.matchMedia('(any-hover: hover)').matches)enter(index);}}
        onMouseLeave={()=>leave(index)} onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))enter(index);}} onBlur={()=>leave(index)} />;
    })}
  </div>;
}
