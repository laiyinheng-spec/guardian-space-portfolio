import { useState, type CSSProperties, type MouseEvent } from 'react';
import './mr-selection-hover.css';

type Line = [x: number, y: number, width: number];
// Coordinates measured against the unchanged 4994 × 3257 page image.
// These are highlights of existing pixels, never replacement text or symbols.
const options: Array<{ name: string; x: number; right: number; image: [number, number, number, number]; symbol: [number, number]; lines: Line[] }> = [
  { name: 'Companion Presence', x: 293, right: 860, image: [300, 1915, 250, 360], symbol: [426, 2363],
    lines: [[636,2022,162],[617,2059,204],[610,2207,217],[658,2244,116],[643,2282,147]] },
  { name: 'Proof & Update Card', x: 882, right: 1385, image: [894,1915,206,360], symbol: [1004,2363],
    lines: [[1157,2059,197],[1179,2096,151],[1188,2133,134],[1163,2170,184],[1151,2207,206],[1193,2244,133]] },
  { name: 'Full Virtual Shelter Scene', x: 1395, right: 1920, image: [1405,1915,231,360], symbol: [1522,2363],
    lines: [[1684,2133,204],[1700,2170,169],[1723,2207,122],[1713,2250,139]] },
  { name: 'Text-only Overlay', x: 1935, right: 2410, image: [1945,1915,209,360], symbol: [2051,2363],
    lines: [[2208,2096,150],[2193,2169,186],[2228,2213,118]] },
  { name: 'Proximity Trigger', x: 293, right: 850, image: [300,2705,243,335], symbol: [426,3107],
    lines: [[628,2827,154],[612,2863,189],[608,2899,198],[626,2972,164],[603,3008,210]] },
  { name: 'Feed / Play Gestures', x: 870, right: 1380, image: [878,2705,221,335], symbol: [989,3107],
    lines: [[1132,2827,219],[1162,2862,156],[1151,2899,177]] },
  { name: 'Complex Multi-step Controls', x: 1395, right: 1920, image: [1412,2705,222,335], symbol: [1522,3107],
    lines: [[1702,2884,154],[1710,2920,140],[1700,2956,159],[1673,2991,210],[1705,3028,146]] },
  { name: 'Passive Viewing Only', x: 1935, right: 2410, image: [1945,2705,209,335], symbol: [2051,3107],
    lines: [[2214,2928,139],[2208,2964,152],[2236,3001,96],[2203,3040,159]] },
];

export default function MrSelectionHover() {
  const [active, setActive] = useState<number | null>(null);
  const hover = (event: MouseEvent<HTMLButtonElement>) => {
    const native = event.nativeEvent as globalThis.MouseEvent & { sourceCapabilities?: { firesTouchEvents?: boolean } };
    return !native.sourceCapabilities?.firesTouchEvents && window.matchMedia('(any-hover: hover)').matches;
  };
  return <div className="mr-selection-hover">
    <svg className="mr-selection-hover__drawing" viewBox="0 0 4994 3257" aria-hidden="true">
      {options.map((option, index) => <g key={option.name} data-active={active === index}>
        <rect className="mr-selection-hover__image-ring" x={option.image[0]-4} y={option.image[1]-4} width={option.image[2]+8} height={option.image[3]+8} rx="3" />
        <circle className="mr-selection-hover__symbol-ring" cx={option.symbol[0]} cy={option.symbol[1]} r="43" />
        {option.lines.map(([x,y,width]) => <rect key={`${x}-${y}`} className="mr-selection-hover__marker" x={x-5} y={y+4} width={width+10} height="23" rx="3" />)}
      </g>)}
    </svg>
    {options.map((option,index) => {
      const y = index < 4 ? 1840 : 2654;
      return <button key={option.name} type="button" className="mr-selection-hover__trigger"
        aria-label={`Emphasize ${option.name} selection rationale`} data-active={active === index}
        style={{ left: `${option.x/4994*100}%`, top: `${y/3257*100}%`, width: `${(option.right-option.x)/4994*100}%`, height: `${(index<4?560:495)/3257*100}%` } as CSSProperties}
        onMouseEnter={event => { if (hover(event)) setActive(index); }}
        onMouseLeave={event => { if (hover(event)) setActive(current => current === index ? null : current); }}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setActive(index); }}
        onBlur={() => setActive(current => current === index ? null : current)}
        onPointerDown={event => { if (event.pointerType !== 'mouse') setActive(null); }} />;
    })}
  </div>;
}
