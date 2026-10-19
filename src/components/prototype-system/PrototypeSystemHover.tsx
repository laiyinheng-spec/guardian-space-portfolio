import { useState, type MouseEvent } from 'react';
import './prototype-system-hover.css';

// Measured on the corrected 4994 × 3257 content-corrections/page-08.png.
// Top images moved; the code and behavior strip keep their original positions. Only existing image edges, labels and arrows are emphasized.
const groups = [
  { name: 'Hand Tracking', image: [714,456,477,424], trigger: [702,446,505,520] },
  { name: 'Interaction', image: [1357,458,547,424], trigger: [1345,446,575,520] },
  { name: 'Pet Response', image: [2084,462,298,422], trigger: [2072,449,325,517] },
];
const behaviors = [
  { label: [1537,1485,53,26], frame: [1349,1042,248,412] },
  { label: [1785,1484,68,33], frame: [1687,1037,249,411] },
  { label: [2125,1484,79,26], frame: [2029,1037,249,411] },
];

export default function PrototypeSystemHover() {
  const [active, setActive] = useState<number | null>(null);
  const mouseHover = (event: MouseEvent<HTMLButtonElement>) => {
    const native = event.nativeEvent as globalThis.MouseEvent & { sourceCapabilities?: { firesTouchEvents?: boolean } };
    return !native.sourceCapabilities?.firesTouchEvents && window.matchMedia('(any-hover: hover)').matches;
  };
  const leave = (index: number) => setActive(current => current === index ? null : current);
  return <div className="prototype-system-hover">
    <svg className="prototype-system-hover__drawing" viewBox="0 0 4994 3257" aria-hidden="true">
      {groups.map((group,index) => <g key={group.name} data-active={active === index}>
        <rect className="prototype-system-hover__image-edge" x={group.image[0]-3} y={group.image[1]-3} width={group.image[2]+6} height={group.image[3]+6} rx="13" />
        {index === 0 && <>
          <rect className="prototype-system-hover__image-edge" x="291" y="1024" width="828" height="454" rx="2" />
          <path className="prototype-system-hover__arrow" d="M 622 1022 L 800 932" />
          <path className="prototype-system-hover__arrowhead" d="M 778 923 L 800 932 L 792 954" />
        </>}
        {index === 1 && behaviors.map(({label:[x,y,width,height]}) => <rect key={x} className="prototype-system-hover__marker" x={x-7} y={y+4} width={width+14} height={height*.82} rx="4" />)}
        {index === 2 && <>
          {behaviors.map(({frame:[x,y,width,height]}) => <rect key={x} className="prototype-system-hover__behavior-frame" x={x} y={y} width={width} height={height} />)}
          <path className="prototype-system-hover__arrow" d="M 1849 1036 L 2121 928" />
          <path className="prototype-system-hover__arrowhead" d="M 2099 918 L 2121 928 L 2112 950" />
        </>}
      </g>)}
    </svg>
    {groups.map((group,index) => <button key={group.name} type="button" className="prototype-system-hover__trigger"
      aria-label={`Highlight ${group.name} technical links`} data-group={index} data-active={active === index}
      style={{left:`${group.trigger[0]/4994*100}%`,top:`${group.trigger[1]/3257*100}%`,width:`${group.trigger[2]/4994*100}%`,height:`${group.trigger[3]/3257*100}%`}}
      onMouseEnter={event => { if(mouseHover(event)) setActive(index); }} onMouseLeave={() => leave(index)}
      onFocus={event => { if(event.currentTarget.matches(':focus-visible')) setActive(index); }} onBlur={() => leave(index)}
      onPointerDown={event => { if(event.pointerType !== 'mouse') setActive(null); }} />)}
  </div>;
}
