import { useEffect, useId, useRef, useState } from 'react';
import './trust-proof-evidence.css';

type Line = { x: number; y: number; width: number; height: number };
// Coordinates measured line-by-line in the original 4994 × 3257 reference.
// Text is never redrawn. Descriptions below transcribe source text for accessibility.
const themes: Array<{
  id: string; name: string; cropX: number; cropWidth: number; cardX: number; cardWidth: number;
  lines: Line[]; locators: string; nodes: Array<{ cx: number; cy: number; rx: number; ry: number }>;
  evidence: string;
}> = [
  {
    id: 'trust-proof', name: 'Trust & Proof', cropX: 2110, cropWidth: 667, cardX: 2120, cardWidth: 646,
    lines: [
      { x: 425, y: 1122, width: 272, height: 30 },
      { x: 272, y: 1160, width: 405, height: 30 },
      { x: 266, y: 2332, width: 593, height: 28 },
      { x: 266, y: 2363, width: 592, height: 29 },
      { x: 266, y: 2396, width: 263, height: 28 },
    ],
    locators: 'M 248 1124 V 1187 M 244 2334 V 2421',
    nodes: [{ cx: 4340, cy: 495, rx: 126, ry: 119 }, { cx: 2800, cy: 1113, rx: 116, ry: 117 }],
    evidence: 'Miss Li: “I often see stray-animal rescue posts online, and I do want to help, but before donating, I need to know whether the information is reliable and whether the money really reaches the animal.” Leo: “I rarely know which animal was helped, whether the money was used clearly, or if the support led to any real long-term change.” Related nodes: Trust uncertainty; Need to see impact.',
  },
  {
    id: 'low-barrier', name: 'Low-barrier Participation', cropX: 2795, cropWidth: 686, cardX: 2805, cardWidth: 666,
    lines: [
      // Ava: small first action; adoption/volunteering burden; starting point and flow.
      { x: 1157, y: 1118, width: 663, height: 28 },
      { x: 1160, y: 1157, width: 64, height: 24 },
      { x: 1160, y: 1208, width: 645, height: 29 },
      { x: 1160, y: 1244, width: 187, height: 27 },
      { x: 1160, y: 1337, width: 642, height: 30 },
      // Miss Li: only “low-barrier way to support an animal,” in this line.
      { x: 456, y: 1389, width: 463, height: 27 },
    ],
    locators: 'M 1139 1119 V 1182 M 1139 1209 V 1270 M 1139 1338 V 1367 M 248 1390 V 1416',
    nodes: [{ cx: 4639, cy: 638, rx: 123, ry: 115 }, { cx: 3222, cy: 1112, rx: 137, ry: 129 }],
    evidence: 'Ava: “I follow many stray-animal posts and I do care, but I still do not know which action is small enough to start with.” “Sometimes adoption feels too big, volunteering feels too demanding, and one-time donations feel disconnected from the animals afterward.” “I need a clearer starting point, a simpler action flow,” Miss Li: “If there were a low-barrier way to support an animal,” Related nodes: Unclear entry point; Low-barrier participation.',
  },
  {
    id: 'feedback', name: 'Feedback Continuity', cropX: 3500, cropWidth: 676, cardX: 3511, cardWidth: 654,
    lines: [
      // Leo: interrupted connection, follow-up updates and continued involvement.
      { x: 264, y: 2283, width: 530, height: 29 },
      { x: 542, y: 2471, width: 287, height: 29 },
      { x: 263, y: 2504, width: 538, height: 28 },
      { x: 263, y: 2536, width: 271, height: 25 },
      // Miss Li: “receive updates, and stay connected over time,”
      { x: 268, y: 1424, width: 579, height: 30 },
    ],
    locators: 'M 244 2284 V 2312 M 244 2472 V 2560 M 248 1425 V 1453',
    nodes: [{ cx: 4476, cy: 1095, rx: 113, ry: 112 }, { cx: 3766, cy: 1112, rx: 137, ry: 129 }],
    evidence: 'Leo: “But after I pay, the connection usually stops.” “keep receiving follow-up updates, I would be much more willing to stay involved continuously.” Miss Li: “receive updates, and stay connected over time,” Related nodes: Lack of follow-up; Sustained relationship.',
  },
  {
    id: 'practical', name: 'Practical Limits', cropX: 4194, cropWidth: 661, cardX: 4205, cardWidth: 639,
    lines: [
      // Miss Li: dormitory, tight schedule and inability to adopt/volunteer in person.
      { x: 528, y: 1260, width: 368, height: 29 },
      { x: 268, y: 1296, width: 627, height: 29 },
      { x: 271, y: 1337, width: 96, height: 24 },
      // Yun quote: the specific space/time/responsibility phrases, not the whole paragraph.
      { x: 1577, y: 2217, width: 199, height: 27 },
      { x: 1159, y: 2250, width: 170, height: 25 },
      // Yun's Current Situation (not a quotation): shelter capacity/coordination constraints.
      { x: 1431, y: 2092, width: 288, height: 23 },
      { x: 1431, y: 2119, width: 208, height: 24 },
    ],
    locators: 'M 248 1261 V 1360 M 1139 2218 V 2274 M 1411 2093 V 2142',
    nodes: [{ cx: 4668, cy: 891, rx: 119, ry: 115 }, { cx: 4163, cy: 1114, rx: 118, ry: 116 }],
    evidence: 'Miss Li: “Since I live in a dormitory and my schedule is tight, I cannot adopt or volunteer in person.” Yun: “adoption is hard because it requires space, time, and responsibility.” Yun, Current Situation: “faces space, turnover, and coordination limits.” Related nodes: Time / space limits; Responsibility burden.',
  },
];

type Interaction = { theme: number; mode: 'idle' | 'hover' | 'focus' | 'touch' };
export default function TrustProofEvidence({ imageSrc }: { imageSrc: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pointerType = useRef('');
  // One shared state keeps exactly one theme active. The last theme remains only
  // to fade out on departure; switching replaces its SVG immediately, without overlap.
  const [interaction, setInteraction] = useState<Interaction>({ theme: 0, mode: 'idle' });
  const active = interaction.mode !== 'idle';
  const theme = themes[interaction.theme];
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      const button = (event.target as Element).closest?.('.trust-evidence__trigger');
      if (!button || !root.current?.contains(button)) setInteraction((value) => ({ ...value, mode: 'idle' }));
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  const leave = (index: number, mode: 'hover' | 'focus') => setInteraction((value) =>
    value.theme === index && value.mode === mode ? { ...value, mode: 'idle' } : value);

  return (
    <div ref={root} className="trust-evidence" data-active={active} data-theme={theme.id}>
      <svg key={`${theme.id}-quotes`} className="trust-evidence__quotes" viewBox="0 0 4994 3257" aria-hidden="true">
        <defs>
          {theme.lines.map((line, index) => <clipPath key={index} id={`${id}-${theme.id}-line-${index}`}>
            <rect className="trust-evidence__reveal" {...line} />
          </clipPath>)}
        </defs>
        {theme.lines.map((line, index) => <rect className="trust-evidence__ink" key={`${line.x}-${line.y}`}
          {...line} rx="4" clipPath={`url(#${id}-${theme.id}-line-${index})`} />)}
        <path className="trust-evidence__locator" d={theme.locators} />
      </svg>
      <svg key={`${theme.id}-nodes`} className="trust-evidence__nodes" viewBox="0 0 4994 3257" aria-hidden="true">
        {theme.nodes.map((node) => <g className="trust-evidence__node" key={`${node.cx}-${node.cy}`}>
          <ellipse className="trust-evidence__node-soft" {...node} rx={node.rx + 12} ry={node.ry + 12} />
          <ellipse className="trust-evidence__node-main" {...node} />
        </g>)}
      </svg>
      {themes.map((item, index) => <div key={item.id} className="trust-evidence__card-slot" data-active={active && interaction.theme === index}
        style={{ left: `${item.cropX / 4994 * 100}%`, width: `${item.cropWidth / 4994 * 100}%` }}>
        <button type="button" className="trust-evidence__trigger"
          aria-label={`Trace ${item.name} evidence`} aria-pressed={active && interaction.theme === index} aria-describedby={`${id}-${item.id}-evidence`}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') setInteraction({ theme: index, mode: 'hover' }); }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse') leave(index, 'hover'); }}
          onPointerDown={(event) => { pointerType.current = event.pointerType; }}
          onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) setInteraction({ theme: index, mode: 'focus' }); }}
          onBlur={() => leave(index, 'focus')}
          onKeyDown={() => { pointerType.current = 'keyboard'; }}
          onClick={(event) => {
            if (pointerType.current === 'touch' || pointerType.current === 'pen') {
              setInteraction((value) => ({ theme: index, mode: value.theme === index && value.mode === 'touch' ? 'idle' : 'touch' }));
            } else if (event.detail === 0) setInteraction({ theme: index, mode: 'focus' });
          }}>
          {/* Stationary mask + exact padded crop avoid duplicate imagery during lift. */}
          <svg className="trust-evidence__card-image" viewBox={`${item.cropX} 1255 ${item.cropWidth} 373`} aria-hidden="true">
            <image href={imageSrc} width="4994" height="3257" />
            <rect className="trust-evidence__card-edge" x={item.cardX} y="1267" width={item.cardWidth} height="347" rx="35" />
            <path className="trust-evidence__card-hint" d={`M ${item.cardX + 40} 1613 H ${item.cardX + item.cardWidth - 40}`} />
          </svg>
        </button>
        <span className="trust-evidence__accessible-copy" id={`${id}-${item.id}-evidence`}>{item.evidence}</span>
      </div>)}
    </div>
  );
}
