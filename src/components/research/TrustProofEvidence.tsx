import { useEffect, useId, useRef, useState } from 'react';
import './trust-proof-evidence.css';

type Line = { x: number; y: number; width: number; height: number };
// Coordinates measured line-by-line in the corrected 4994 × 3257 page (content-corrections/page-03.png).
// Text is never redrawn. Descriptions below transcribe source text for accessibility.
const themes: Array<{
  id: string; name: string; cropX: number; cropWidth: number; cardX: number; cardWidth: number;
  lines: Line[]; locators: string; nodes: Array<{ cx: number; cy: number; rx: number; ry: number }>;
  evidence: string;
}> = [
  {
    id: 'trust-proof', name: 'Trust & Proof', cropX: 2110, cropWidth: 667, cardX: 2120, cardWidth: 646,
    lines: [
      { x: 427, y: 1119, width: 275, height: 29 },
      { x: 270, y: 1157, width: 419, height: 29 },
      { x: 265, y: 2343, width: 600, height: 28 },
      { x: 265, y: 2374, width: 599, height: 29 },
      { x: 265, y: 2407, width: 267, height: 28 },
    ],
    locators: 'M 249 1121 V 1185 M 246 2345 V 2434',
    nodes: [{ cx: 4340, cy: 495, rx: 126, ry: 119 }, { cx: 2800, cy: 1113, rx: 116, ry: 117 }],
    evidence: 'Miss Li: “I often see stray-animal rescue posts online, and I do want to help, but before donating, I need to know whether the information is reliable and whether the money really reaches the animal.” Leo: “I rarely know which animal was helped, whether the money was used clearly, or if the support led to any real long-term change.” Related nodes: Trust uncertainty; Need to see impact.',
  },
  {
    id: 'low-barrier', name: 'Low-barrier Participation', cropX: 2795, cropWidth: 686, cardX: 2805, cardWidth: 666,
    lines: [
      // Ava: small first action; adoption/volunteering burden; starting point and flow.
      { x: 1171, y: 1114, width: 663, height: 29 },
      { x: 1171, y: 1151, width: 63, height: 25 },
      { x: 1171, y: 1205, width: 649, height: 29 },
      { x: 1171, y: 1242, width: 198, height: 29 },
      { x: 1172, y: 1337, width: 648, height: 30 },
      // Miss Li: only “low-barrier way to support an animal,” in this line.
      { x: 456, y: 1387, width: 470, height: 28 },
    ],
    locators: 'M 1150 1116 V 1177 M 1150 1207 V 1271 M 1150 1339 V 1367 M 249 1389 V 1415',
    nodes: [{ cx: 4639, cy: 638, rx: 123, ry: 115 }, { cx: 3222, cy: 1112, rx: 137, ry: 129 }],
    evidence: 'Ava: “I follow many stray-animal posts and I do care, but I still do not know which action is small enough to start with.” “Sometimes adoption feels too big, volunteering feels too demanding, and one-time donations feel disconnected from the animals afterward.” “I need a clearer starting point, a simpler action flow,” Miss Li: “If there were a low-barrier way to support an animal,” Related nodes: Unclear entry point; Low-barrier participation.',
  },
  {
    id: 'feedback', name: 'Feedback Continuity', cropX: 3500, cropWidth: 676, cardX: 3511, cardWidth: 654,
    lines: [
      // Leo: interrupted connection, follow-up updates and continued involvement.
      { x: 265, y: 2294, width: 534, height: 29 },
      { x: 543, y: 2485, width: 290, height: 29 },
      { x: 265, y: 2517, width: 538, height: 28 },
      { x: 265, y: 2549, width: 266, height: 28 },
      // Miss Li: “receive updates, and stay connected over time,”
      { x: 270, y: 1425, width: 587, height: 30 },
    ],
    locators: 'M 246 2296 V 2323 M 246 2487 V 2576 M 249 1427 V 1454',
    nodes: [{ cx: 4476, cy: 1095, rx: 113, ry: 112 }, { cx: 3766, cy: 1112, rx: 137, ry: 129 }],
    evidence: 'Leo: “But after I pay, the connection usually stops.” “keep receiving follow-up updates, I would be much more willing to stay involved continuously.” Miss Li: “receive updates, and stay connected over time,” Related nodes: Lack of follow-up; Sustained relationship.',
  },
  {
    id: 'practical', name: 'Practical Limits', cropX: 4194, cropWidth: 661, cardX: 4205, cardWidth: 639,
    lines: [
      // Miss Li: dormitory, tight schedule and inability to adopt/volunteer in person.
      { x: 528, y: 1259, width: 371, height: 29 },
      { x: 270, y: 1296, width: 628, height: 29 },
      { x: 270, y: 1338, width: 96, height: 25 },
      // Yun quote: the specific space/time/responsibility phrases, not the whole paragraph.
      { x: 1592, y: 2227, width: 200, height: 29 },
      { x: 1170, y: 2257, width: 172, height: 29 },
      // Yun's Current Situation (not a quotation): shelter capacity/coordination constraints.
      { x: 1450, y: 2097, width: 282, height: 27 },
      { x: 1450, y: 2128, width: 202, height: 24 },
    ],
    locators: 'M 249 1261 V 1363 M 1150 2229 V 2285 M 1430 2099 V 2152',
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
