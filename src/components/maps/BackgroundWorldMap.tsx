import { useId, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import './background-world-map.css';

// Centres of the three existing callout dots, measured in the 4994 × 3257 page.
// Preserve the illustration's labels rather than infer new geographical points.
const regions = [
  { id: 'latin-america', name: 'Latin America', x: 1913, y: 2159,
    description: 'Latin America is highlighted in the original map. This is a qualitative illustration of public visibility around stray-animal issues, not a measured regional total.' },
  { id: 'south-southeast-asia', name: 'South & Southeast Asia', x: 2592, y: 1920,
    description: 'South & Southeast Asia is highlighted in the original map. The emphasis illustrates public visibility around stray-animal issues; it does not establish regional counts or a ranking.' },
  { id: 'africa-emerging-urban-regions', name: 'Africa / Emerging Urban Regions', x: 2233, y: 2248,
    description: 'Africa / Emerging Urban Regions is a callout in the original map. It indicates qualitative visibility emphasis, without establishing a regional total or explaining its causes.' },
];
const overview = {
  name: 'Global stray-animal visibility is uneven and concentrated in dense urban regions.',
  description: 'Hotspots reflect not only animal population density, but also public reporting visibility, rescue infrastructure, sterilization coverage, and local management capacity.',
};

export default function BackgroundWorldMap({ imageSrc }: { imageSrc: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const inView = useInView(root, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();
  const ready = inView || !!reduced;
  const id = useId();
  const content = selected === null ? overview : regions[selected];

  return (
    <div ref={root} className="world-map" role="group" aria-label="World map: stray-animal visibility regions" aria-describedby={`${id}-hint`}>
      <div className="world-map__stage">
        {/* Reuse the exact original page crop: an opaque stationary mask prevents
            duplicate imagery while the map enters. The source note below stays untouched. */}
        <motion.div className="world-map__content" initial={false}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }}
          transition={{ duration: reduced ? 0 : 0.6 }}>
          <svg className="world-map__image" viewBox="1525 1515 1330 1003" aria-hidden="true">
            <image href={imageSrc} width="4994" height="3257" />
          </svg>
          <p id={`${id}-hint`} className="world-map__hint">Select a region to explore.</p>
          <button type="button" className="world-map__overview" aria-pressed={selected === null}
            aria-controls={`${id}-explanation`} onClick={() => setSelected(null)}>Overview</button>
          {hovered !== null && <span className="world-map__name" id={`${id}-name`} role="tooltip">{regions[hovered].name}</span>}
          {regions.map((region, index) => <button key={region.id} type="button" className="world-map__marker"
            style={{ left: `${(region.x - 1525) / 1330 * 100}%`, top: `${(region.y - 1515) / 1003 * 100}%` }}
            aria-label={`Select ${region.name}`} aria-pressed={selected === index}
            aria-controls={`${id}-explanation`} aria-describedby={hovered === index ? `${id}-name` : undefined}
            data-muted={selected !== null && selected !== index}
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(index); }}
            onPointerLeave={(event) => { if (event.pointerType === 'mouse') setHovered(null); }}
            onFocus={() => setHovered(index)} onBlur={() => setHovered(null)}
            onClick={() => setSelected(index)}>
            <motion.span className="world-map__ring" initial={false}
              animate={selected === index ? { scale: 1.3, opacity: 1 }
                : ready && !reduced ? { scale: [1, 1.3, 1], opacity: selected === null ? [0.3, 0.6, 0.3] : [0.15, 0.3, 0.15] }
                  : { scale: 1, opacity: 0.35 }}
              transition={selected === index || reduced || !ready ? { duration: reduced ? 0 : 0.2 }
                : { duration: 3.8, repeat: Infinity, delay: 0.6 + index * 0.2, ease: 'easeInOut' }} />
            <span className="world-map__dot" />
          </button>)}
        </motion.div>
      </div>
      <section className="world-map__explanation" id={`${id}-explanation`} aria-live="polite" aria-atomic="true" aria-label="Selected world map interpretation">
        <motion.div key={selected ?? 'overview'} className="world-map__explanation-copy"
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.25 }}>
          <h3>{content.name}</h3>
          <p>{content.description}</p>
          <small>Shading illustrates visibility emphasis, not measured stray-animal counts or a statistical ranking.</small>
        </motion.div>
      </section>
    </div>
  );
}
