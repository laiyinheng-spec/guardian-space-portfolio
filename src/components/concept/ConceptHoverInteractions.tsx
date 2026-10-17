import { useId, useState, type CSSProperties } from 'react';
import './concept-hover.css';

// Measured in the original 4994 × 3257 concept page. Radii follow the
// existing comparison symbols; only additional outer strokes are drawn.
const columns = [740, 1157, 1570, 1965];
const rows = [
  { name: 'Information clarity', y: 2255, radii: [34, 42, 41, 55] },
  { name: 'Trust / proof', y: 2390, radii: [27, 56, 36, 42] },
  { name: 'Low participation barrier', y: 2528, radii: [55, 34, 71, 30] },
  { name: 'Emotional continuity', y: 2663, radii: [43, 22, 40, 32] },
  { name: 'Follow-up continuity', y: 2795, radii: [27, 44, 37, 35] },
];
const callouts = [
  { name: 'verified proof layer', x: 3930, y: 1976, width: 250, height: 84,
    leader: 'M 3618 2064 H 3717 Q 3746 2064 3750 2035 L 3759 2013 Q 3768 1995 3800 1995 H 3913' },
  { name: 'MR animal room', x: 3930, y: 2236, width: 220, height: 94,
    leader: 'M 3774 2314 L 3790 2277 Q 3800 2259 3830 2259 H 3913' },
  { name: 'update loop', x: 3930, y: 2580, width: 245, height: 55,
    leader: 'M 3806 2566 Q 3820 2599 3852 2599 H 3913' },
];
type State = { kind: 'row' | 'callout'; index: number; mode: 'idle' | 'hover' | 'focus' };

function comparisonLine(index: number) {
  const row = rows[index];
  let start = 549;
  const paths = columns.map((x, col) => {
    const edge = row.radii[col] + 5;
    const segment = `M ${start} ${row.y} H ${x - edge}`;
    start = x + edge;
    return segment;
  });
  return `${paths.join(' ')} M ${start} ${row.y} H 2155`;
}

export default function ConceptHoverInteractions() {
  const [state, setState] = useState<State>({ kind: 'row', index: 0, mode: 'idle' });
  const id = useId().replace(/:/g, '');
  const active = state.mode !== 'idle';
  const leave = (kind: State['kind'], index: number, mode: 'hover' | 'focus') => setState((value) =>
    value.kind === kind && value.index === index && value.mode === mode ? { ...value, mode: 'idle' } : value);
  const events = (kind: State['kind'], index: number) => ({
    onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') setState({ kind, index, mode: 'hover' });
    },
    onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') leave(kind, index, 'hover');
    },
    onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
      if (event.currentTarget.matches(':focus-visible')) setState({ kind, index, mode: 'focus' });
    },
    onBlur: () => leave(kind, index, 'focus'),
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') setState((value) => ({ ...value, mode: 'idle' }));
    },
  });
  return (
    <div className="concept-hover" data-active={active} data-kind={state.kind} data-index={state.index}>
      <svg key={`${state.kind}-${state.index}`} className="concept-hover__drawing" viewBox="0 0 4994 3257" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-companion`}>
            <stop offset="0" stopColor="#ffb14f" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="#ffc46b" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffc46b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {state.kind === 'row' ? <g className="concept-hover__comparison">
          <path className="concept-hover__row-line" d={comparisonLine(state.index)} />
          {columns.map((cx, index) => <circle key={cx} className="concept-hover__dot-ring"
            cx={cx} cy={rows[state.index].y} r={rows[state.index].radii[index] + 6}
            style={{ '--outer-radius-narrow': `${rows[state.index].radii[index] + 22}px` } as CSSProperties} />)}
        </g> : <g className="concept-hover__sketch">
          <path className="concept-hover__leader" d={callouts[state.index].leader} />
          {state.index === 0 && <path className="concept-hover__target-outline"
            d="M 3184 2025 Q 3380 2010 3596 2019 Q 3618 2020 3618 2042 L 3616 2220 Q 3615 2241 3594 2242 L 3190 2247 Q 3177 2246 3178 2227 Z" />}
          {state.index === 1 && <g>
            <ellipse className="concept-hover__companion-glow" cx="3345" cy="2315" rx="190" ry="135" fill={`url(#${id}-companion)`} />
            <ellipse className="concept-hover__companion-outline" cx="3345" cy="2372" rx="198" ry="54" />
          </g>}
          {/* The source update-loop leader points at Choose Your Plan. Preserve
              it, but emphasize the actual update record in Continuous Update Cards. */}
          {state.index === 2 && <path className="concept-hover__target-outline"
            d="M 4586 2817 L 4727 2809 Q 4744 2808 4743 2824 L 4730 2968 Q 4729 2980 4714 2978 L 4567 2964 Z" />}
        </g>}
      </svg>
      {rows.map((row, index) => <button key={row.name} type="button" className="concept-hover__row-trigger"
        aria-label={`Highlight ${row.name} comparison row`} data-active={active && state.kind === 'row' && state.index === index}
        style={{ left: `${183 / 4994 * 100}%`, top: `${(row.y - 49) / 3257 * 100}%`, width: `${334 / 4994 * 100}%`, height: `${98 / 3257 * 100}%` }}
        {...events('row', index)} />)}
      {callouts.map((callout, index) => <button key={callout.name} type="button" className="concept-hover__callout-trigger"
        aria-label={`Highlight ${callout.name} sketch region`} data-active={active && state.kind === 'callout' && state.index === index}
        style={{ left: `${callout.x / 4994 * 100}%`, top: `${callout.y / 3257 * 100}%`, width: `${callout.width / 4994 * 100}%`, height: `${callout.height / 3257 * 100}%` }}
        {...events('callout', index)} />)}
    </div>
  );
}
