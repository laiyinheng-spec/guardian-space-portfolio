import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import './background-china-map.css';

// Measured marker centres in the original 4994 × 3257 portfolio image.
// These are image coordinates, not locations inferred from administrative outlines.
const cities = [
  { id: 'beijing', name: 'Beijing', x: 744, y: 1953, outline: 'beijing-outline.png',
    description: 'Highlighted as a visibility hotspot in this map. The darker shading draws attention to reported stray-animal issues; it does not establish the largest stray population.' },
  { id: 'shanghai', name: 'Shanghai', x: 839, y: 2139, outline: 'shanghai-outline.png',
    description: 'Highlighted within the map’s coastal urban context. Visibility in public reports should be distinguished from the actual number of stray animals.' },
  { id: 'chengdu', name: 'Chengdu · Sichuan', x: 518, y: 2155, outline: 'sichuan-outline.png',
    description: 'An inland hotspot highlighted in this overview, extending the map’s focus beyond coastal cities. Its lighter shading does not establish a smaller stray population.' },
  { id: 'guangzhou', name: 'Guangzhou · Guangdong', x: 705, y: 2282, outline: 'guangdong-outline.png',
    description: 'Highlighted within southern China’s coastal urban context. The emphasis concerns the visibility of stray-animal issues, rather than a measured provincial total.' },
];

export default function BackgroundChinaMap({ imageSrc }: { imageSrc: string }) {
  const map = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  const inView = useInView(map, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();
  const ready = inView || !!reduced;
  const id = useId();
  const clearTimer = () => clearTimeout(timer.current);
  const close = () => { clearTimer(); setActive(null); setPinned(false); };
  const open = (index: number, focus = false) => {
    clearTimer();
    if (pinned && !focus) return;
    if (focus && index !== active) setPinned(false);
    setActive(index);
  };
  const leave = () => {
    clearTimer();
    if (pinned) return;
    timer.current = setTimeout(() => {
      if (!map.current?.contains(document.activeElement) && !card.current?.contains(document.activeElement)) setActive(null);
    }, 250);
  };

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!map.current?.contains(event.target as Node) && !card.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      clearTimer();
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  useLayoutEffect(() => {
    if (active === null) return;
    const update = () => {
      const anchor = map.current?.querySelectorAll<HTMLButtonElement>('.china-map__marker')[active].getBoundingClientRect();
      const panel = card.current?.getBoundingClientRect();
      if (!anchor || !panel) return;
      const left = Math.max(8, Math.min(anchor.x + anchor.width / 2 - panel.width / 2, window.innerWidth - panel.width - 8));
      const below = anchor.bottom + 12;
      const top = below + panel.height <= window.innerHeight - 8 ? below
        : Math.max(8, Math.min(anchor.top - panel.height - 12, window.innerHeight - panel.height - 8));
      setPosition({ left, top });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [active, pinned]);

  const city = active === null ? null : cities[active];
  return (
    <div ref={map} className="china-map" role="group" aria-label="China map: illustrative stray-animal visibility"
      onClick={(event) => { if (!(event.target as Element).closest('button')) close(); }}>
      {/* Crop the existing map image, rather than introduce a second, differently scaled map.
          The fixed opaque mask prevents the old map appearing during entry animation. */}
      <motion.div className="china-map__content" initial={false}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }}
        transition={{ duration: reduced ? 0 : 0.6 }}>
        <svg className="china-map__image" viewBox="148 1680 950 760" aria-hidden="true">
          <image href={imageSrc} width="4994" height="3257" />
        </svg>
        <p className="china-map__hint">Hover or tap the markers to explore.</p>
        {cities.map((item, index) => <button key={item.id} type="button" className="china-map__marker"
          style={{ left: `${(item.x - 148) / 950 * 100}%`, top: `${(item.y - 1680) / 760 * 100}%` }}
          aria-label={`Explore ${item.name}`} aria-expanded={active === index}
          aria-controls={active === index ? id : undefined} aria-describedby={active === index ? `${id}-description` : undefined}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') open(index); }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse') leave(); }}
          onFocus={() => open(index, true)} onBlur={leave}
          onClick={() => { clearTimer(); setActive(index); setPinned(true); }}>
          <motion.span className="china-map__halo" initial={false}
            animate={ready && !reduced ? { scale: [1, 3.2], opacity: [0.45, 0] } : { scale: 1, opacity: 0 }}
            transition={ready && !reduced ? { duration: 2.8, repeat: Infinity, delay: 0.65 + index * 0.18, ease: 'easeOut' } : { duration: 0 }} />
          <span className="china-map__dot" />
        </button>)}
        <p className="china-map__reading-note">Shading indicates illustrative visibility emphasis, not measured stray-animal counts or a statistical ranking.</p>
      </motion.div>
      {city && createPortal(<div ref={card} id={id} role="region" aria-label={`${city.name} map information`}
        className="china-map-card" style={position} onPointerEnter={clearTimer} onPointerLeave={leave}
        onFocus={clearTimer} onBlur={leave}>
        <img src={`/assets/background-interaction/${city.outline}`} alt={`${city.name.split(' · ').pop()} administrative outline, illustrative only`} />
        <div className="china-map-card__copy">
          <h3>{city.name}</h3>
          <p id={`${id}-description`}>{city.description}</p>
          <span className="china-map-card__status">{pinned ? 'Pinned · tap outside or press Escape to close.' : 'Click the marker to keep this card open.'}</span>
        </div>
        <button type="button" className="china-map-card__close" onClick={() => {
          const button = active === null ? null : map.current?.querySelectorAll<HTMLButtonElement>('.china-map__marker')[active];
          button?.focus(); close();
        }} aria-label="Close city information">×</button>
      </div>, document.body)}
    </div>
  );
}
