import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './interactive-journey.css';

// Verbatim labels from user-journey-map-reference.png, read left to right.
// The last Verify action is incomplete in the source and is not silently expanded.
const stages = [
  { name: 'Awareness', left: 2355, right: 2828,
    actions: ['Sees stray-animal posts', 'Notices rescue stories', 'Clicks into a case'],
    feelings: ['Curious', 'Concerned', 'Sympathetic'],
    pains: ['Information is fragmented', 'No clear first step', 'Too many scattered channels'] },
  { name: 'Explore', left: 2828, right: 3321,
    actions: ['Browses animals and shelters', 'Compares support options', 'Looks for a suitable way to help'],
    feelings: ['Interested', 'Hopeful', 'Unsure'],
    pains: ['Hard to compare support choices', 'Unclear which action fits personal capacity', 'Rescue profiles are inconsistent'] },
  { name: 'Verify', left: 3321, right: 3820,
    actions: ['Checks credibility', 'Looks for proof and progress', 'Confirms where the money'],
    feelings: ['Cautious', 'Doubtful', 'Hesitant'],
    pains: ['Credibility is hard to judge', 'Proof and progress are scattered', 'Donation destination is unclear'] },
  { name: 'Support', left: 3820, right: 4317,
    actions: ['Donates or cloud-feeds', 'Chooses a support method', 'Starts helping'],
    feelings: ['Relieved', 'Willing', 'Involved'],
    pains: ['Support feels one-time', 'Payment and result feel disconnected', 'Long-term participation is not easy'] },
  { name: 'Follow-up', left: 4317, right: 4838,
    actions: ['Waits for updates', 'Revisits the case', 'Decides whether to continue'],
    feelings: ['Waiting', 'Disconnected', 'Re-engaged'],
    pains: ['Updates fade out quickly', 'Hard to stay emotionally connected', 'Motivation drops without feedback'] },
];
const overview = 'This journey map shows how potential supporters move from noticing stray-animal stories to taking action and deciding whether to stay involved. Trust, proof, and continuous feedback are key moments in sustaining participation.';

export default function InteractiveJourneyPage({ imageSrc }: { imageSrc: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const id = useId();
  const descriptionId = `${id}-description`;
  return (
    <section className="journey-page" id="primary-research" aria-label="Guardian Space primary research and user analysis">
      <div className="journey-page__image-frame">
        <img className="portfolio-image-page" src={imageSrc} alt="Guardian Space portfolio page 03: primary research, user analysis and five-stage user journey map." />
        {/* Transparent overlays only: the original image, including the full feeling
            curve and all three content rows, remains in its original position. */}
        <div className="journey-columns" role="group" aria-label="Select a stage in the original user journey map">
          {stages.map((stage, index) => <button type="button" key={stage.name}
            className="journey-column" data-dimmed={selected !== null && selected !== index}
            style={{ left: `${(stage.left - 2355) / 2483 * 100}%`, width: `${(stage.right - stage.left) / 2483 * 100}%` }}
            aria-label={`Select ${stage.name} stage in journey map`} aria-pressed={selected === index}
            aria-controls={descriptionId} onClick={() => setSelected(index)}>
            <span className="journey-column__arrow" aria-hidden="true" />
          </button>)}
        </div>
      </div>
      <div className="journey-reader">
        <header className="journey-reader__header">
          <div><p className="journey-reader__eyebrow">User Journey Map</p>
            <h2>Select a stage to explore the journey.</h2></div>
        </header>
        <nav className="journey-controls" aria-label="User journey stages">
          <button type="button" aria-pressed={selected === null} aria-controls={descriptionId} onClick={() => setSelected(null)}>Overview</button>
          {stages.map((stage, index) => <button type="button" key={stage.name} aria-pressed={selected === index}
            aria-controls={descriptionId} onClick={() => setSelected(index)}>{stage.name}</button>)}
        </nav>
        {/* All states participate in grid sizing. Only the selected state's text is
            visible and accessible, so switching never changes the reader's height. */}
        <div className="journey-description" id={descriptionId} role="region" aria-label="Journey stage interpretation" aria-live="polite" aria-atomic="true">
          <motion.div className="journey-description__state" data-active={selected === null} aria-hidden={selected !== null}
            initial={false} animate={{ opacity: selected === null ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <h3>Journey overview</h3><p>{overview}</p>
          </motion.div>
          {stages.map((stage, index) => <motion.div key={stage.name} className="journey-description__state"
            data-active={selected === index} aria-hidden={selected !== index}
            initial={false} animate={{ opacity: selected === index ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <dl>
              <dt>Stage</dt><dd><h3>{stage.name}</h3></dd>
              <dt>User action</dt><dd><ol>{stage.actions.map((action) => <li key={action}>{action}</li>)}</ol></dd>
              <dt>Feeling</dt><dd className="journey-feelings">{stage.feelings.map((feeling, i) => <span key={feeling}>
                {i > 0 && <span className="journey-feelings__arrow" aria-label="then">→</span>}{feeling}
              </span>)}</dd>
              <dt>Key pain point</dt><dd><ul>{stage.pains.map((pain) => <li key={pain}>{pain}</li>)}</ul></dd>
            </dl>
          </motion.div>)}
        </div>
      </div>
    </section>
  );
}
