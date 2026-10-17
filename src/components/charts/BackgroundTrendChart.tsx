import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import './background-trend.css';

// Reference anchors, in million. Intermediate years are calculated, not survey data.
export const backgroundTrend = Array.from({ length: 6 }, (_, index) => {
  const year = 2021 + index;
  const before2024 = year <= 2024;
  const fraction = before2024 ? index / 3 : (year - 2024) / 2;
  return {
    year,
    china: before2024 ? 93 + (200 - 93) * fraction : 200 + (229 - 200) * fraction,
    global: before2024 ? 224 + (362 - 224) * fraction : 362 + (402 - 362) * fraction,
    nature: year === 2021 || year === 2024 ? 'cited estimate' : year < 2024 ? 'interpolated' : 'visual projection',
  };
});
const x = (index: number) => 143 + index * (1082 / 5);
const y = (value: number) => 648 - value / 450 * 490;
const line = (key: 'china' | 'global', start = 0, end = 6) => backgroundTrend.slice(start, end)
  .map((point, index) => `${index ? 'L' : 'M'} ${x(start + index)} ${y(point[key])}`).join(' ');
const format = (value: number) => Number(value.toFixed(1)).toString();

export default function BackgroundTrendChart() {
  const root = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState<number | null>(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  const visible = useInView(root, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const tipId = `${id}-tooltip`;
  const clearDismiss = () => clearTimeout(dismissTimer.current);
  const select = (index: number) => { clearDismiss(); setActive(index); };
  const dismiss = () => {
    clearDismiss();
    dismissTimer.current = setTimeout(() => {
      if (!root.current?.contains(document.activeElement)) setActive(null);
    }, 140);
  };

  useLayoutEffect(() => {
    if (active === null) return;
    const update = () => {
      const rect = root.current?.getBoundingClientRect();
      const tip = tooltip.current?.getBoundingClientRect();
      if (!rect || !tip) return;
      const anchor = rect.left + x(active) / 1300 * rect.width;
      const left = Math.max(8, Math.min(anchor - tip.width / 2, window.innerWidth - tip.width - 8));
      const top = rect.bottom + 8 + tip.height <= window.innerHeight - 8
        ? rect.bottom + 8 : Math.max(8, rect.top - tip.height - 8);
      setPosition({ left, top });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node) && !tooltip.current?.contains(event.target as Node)) setActive(null);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      clearDismiss();
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const point = active === null ? null : backgroundTrend[active];
  const ready = visible || !!reduced;
  return (
    <div ref={root} className="background-trend" role="group" aria-label="Global Stray Animal Growth Trend. Focus or tap a year for values in million.">
      <motion.svg viewBox="0 0 1300 760" className="background-trend__svg" aria-hidden="true"
        initial={false} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }}
        transition={{ duration: reduced ? 0 : 0.55 }}>
        <defs>
          {(['china', 'global'] as const).map((series) => (
            <linearGradient key={series} id={`${id}-${series}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series === 'china' ? '#ed652b' : '#ffb96d'} stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffcf96" stopOpacity="0.035" />
            </linearGradient>
          ))}
          <clipPath id={`${id}-draw`}>
            <motion.rect x="80" y="0" height="760" initial={false}
              animate={{ width: ready ? 1220 : 0 }} transition={{ duration: reduced ? 0 : 1.9, delay: reduced ? 0 : 0.2, ease: 'easeInOut' }} />
          </clipPath>
        </defs>
        <g fill="#69513e" fontFamily="Arial, sans-serif" fontSize="20">
          {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450].map((value) => (
            <g key={value}>
              <path d={`M 92 ${y(value)} H 1265`} stroke="#e8d9c8" strokeDasharray="3 4" strokeWidth="1.5" />
              <text x="72" y={y(value) + 7} textAnchor="end">{value}</text>
            </g>
          ))}
          <path d="M 92 158 V 648 H 1265" fill="none" stroke="#7e6551" strokeWidth="2.5" />
          {backgroundTrend.map((p, index) => <text key={p.year} x={x(index)} y="679" textAnchor="middle">{p.year}</text>)}
          <text x="1272" y="78" textAnchor="end" fontSize="19">Population (millions)</text>
          {(['china', 'global'] as const).map((series, index) => (
            <g key={series} transform={`translate(92 ${70 + index * 37})`}>
              <path d="M 0 0 H 52" stroke={series === 'china' ? '#ed652b' : '#ffa465'} strokeWidth="3" />
              <circle cx="26" r="5" fill={series === 'china' ? '#ed652b' : '#ffa465'} />
              <text x="68" y="6">{series === 'china' ? 'China' : 'Global benchmark'}</text>
            </g>
          ))}
        </g>
        <motion.g initial={false} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 2.1 }}>
          {(['global', 'china'] as const).map((series) => <path key={series} d={`${line(series)} L ${x(5)} 648 L ${x(0)} 648 Z`} fill={`url(#${id}-${series})`} />)}
        </motion.g>
        <g clipPath={`url(#${id}-draw)`}>
          {(['global', 'china'] as const).map((series) => (
            <g key={series} fill={series === 'china' ? '#ed652b' : '#ffa465'} stroke={series === 'china' ? '#ed652b' : '#ffa465'}>
              <path d={line(series, 0, 4)} fill="none" strokeWidth="3" />
              <path d={line(series, 3)} fill="none" strokeWidth="3" strokeDasharray="12 8" />
              {backgroundTrend.map((p, index) => <circle key={p.year} cx={x(index)} cy={y(p[series])} r={index === 0 || index === 3 || index === 5 ? 10 : 6} stroke="#fffdf8" strokeWidth="2" />)}
              {[0, 3, 5].map((index) => <g key={index} stroke="none" fontFamily="Arial, sans-serif" textAnchor="middle">
                {index === 5 && <text x={x(index)} y={y(backgroundTrend[index][series]) - 48} fontSize="18">2026 est.</text>}
                <text x={x(index)} y={y(backgroundTrend[index][series]) - 21} fontSize="24">{backgroundTrend[index][series]}</text>
              </g>)}
            </g>
          ))}
        </g>
        {active !== null && <g>
          <path d={`M ${x(active)} 158 V 648`} stroke="#7c3f2d" strokeDasharray="5 6" opacity="0.4" />
          {(['china', 'global'] as const).map((series) => <circle key={series} cx={x(active)} cy={y(backgroundTrend[active][series])} r="13" fill={series === 'china' ? '#ed652b' : '#ffa465'} stroke="#7c3f2d" strokeWidth="3" />)}
        </g>}
      </motion.svg>
      <div className="background-trend__years">
        {backgroundTrend.map((p, index) => <button key={p.year} type="button"
          className="background-trend__year" aria-label={`${p.year}: China ${format(p.china)} million; Global benchmark ${format(p.global)} million; ${p.nature}`}
          aria-describedby={active === index ? tipId : undefined}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') select(index); }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse') dismiss(); }}
          onFocus={() => select(index)} onBlur={dismiss} onClick={() => select(index)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              const next = (index + (event.key === 'ArrowRight' ? 1 : 5)) % 6;
              root.current?.querySelectorAll<HTMLButtonElement>('button')[next].focus();
            }
          }} />)}
      </div>
      {point && createPortal(<div ref={tooltip} id={tipId} role="tooltip" className="background-trend-tooltip"
        style={position} onPointerEnter={clearDismiss} onPointerLeave={dismiss}>
        <strong>{point.year} <span>· {point.nature}</span></strong>
        <div><i className="background-trend-tooltip__china" />China <b>{format(point.china)} million</b></div>
        <div><i className="background-trend-tooltip__global" />Global benchmark <b>{format(point.global)} million</b></div>
        <small>{point.nature === 'interpolated' ? 'Linear interpolation between 2021 and 2024.' : point.nature === 'visual projection' ? 'Visual projection, not official statistical data.' : 'Cited public estimate, as labelled in the portfolio.'}</small>
      </div>, document.body)}
    </div>
  );
}
