import { useEffect, useId, useRef, useState } from 'react';
import './trust-proof-evidence.css';

// Measured line-by-line against the unchanged 4994 × 3257 research page.
// Miss Li: “information is reliable”; “money really reaches the animal.”
// Leo: “I rarely know which animal was helped, whether the / money was used
// clearly, or if the support led to any / real long-term change.”
const quoteLines = [
  { x: 425, y: 1122, width: 272, height: 30 },
  { x: 272, y: 1160, width: 405, height: 30 },
  { x: 266, y: 2332, width: 593, height: 28 },
  { x: 266, y: 2363, width: 592, height: 29 },
  { x: 266, y: 2396, width: 263, height: 28 },
];

export default function TrustProofEvidence({ imageSrc }: { imageSrc: string }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const pointerType = useRef('');
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tapped, setTapped] = useState(false);
  const active = hovered || focused || tapped;
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node)) {
        setTapped(false);
        setFocused(false);
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  return (
    <div className="trust-evidence" data-active={active}>
      <svg className="trust-evidence__quotes" viewBox="0 0 4994 3257" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffae50" stopOpacity="0.16" />
            <stop offset="0.65" stopColor="#ffae50" stopOpacity="0.34" />
            <stop offset="1" stopColor="#ffae50" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        {quoteLines.map((line) => <rect key={`${line.x}-${line.y}`} {...line} rx="5" fill={`url(#${id}-ink)`} />)}
      </svg>
      <svg className="trust-evidence__nodes" viewBox="0 0 4994 3257" aria-hidden="true">
        <ellipse cx="4340" cy="495" rx="126" ry="119" />
        <ellipse cx="2800" cy="1113" rx="116" ry="117" />
      </svg>
      {/* A stationary mask clears only the padded theme-card crop. Its image
          moves 2px without exposing a second copy of the original card below. */}
      <div className="trust-evidence__card-slot">
        <button ref={trigger} type="button" className="trust-evidence__trigger"
          aria-label="Trace Trust & Proof evidence" aria-pressed={active} aria-describedby={`${id}-evidence`}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse') setHovered(false); }}
          onPointerDown={(event) => { pointerType.current = event.pointerType; }}
          onFocus={(event) => setFocused(event.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
          onKeyDown={() => { pointerType.current = 'keyboard'; }}
          onClick={(event) => {
            if (pointerType.current === 'touch' || pointerType.current === 'pen') {
              setFocused(false);
              setTapped((value) => !value);
            } else if (event.detail === 0) setFocused(true);
          }}>
          <svg className="trust-evidence__card-image" viewBox="2110 1255 667 373" aria-hidden="true">
            <image href={imageSrc} width="4994" height="3257" />
            <rect className="trust-evidence__card-edge" x="2120" y="1267" width="646" height="347" rx="35" />
            <path className="trust-evidence__card-hint" d="M 2160 1613 H 2726" />
          </svg>
        </button>
      </div>
      <span className="trust-evidence__accessible-copy" id={`${id}-evidence`}>
        Miss Li: “I often see stray-animal rescue posts online, and I do want to help, but before donating, I need to know whether the information is reliable and whether the money really reaches the animal.”
        Leo: “I rarely know which animal was helped, whether the money was used clearly, or if the support led to any real long-term change.”
        Related nodes: Trust uncertainty; Need to see impact.
      </span>
    </div>
  );
}
