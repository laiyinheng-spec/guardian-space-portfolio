import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  HeartHandshake,
  Home,
  MapPin,
  PawPrint,
  Sprout,
  Users,
} from 'lucide-react';

const assetBase = './assets/page02';
const boardWidth = 1680;
const boardHeight = 1096;
const viewerHorizontalPadding = 32;

const channelGroups = [
  {
    title: 'Domestic channels',
    items: ['Shelters', 'Social media', 'Individual rescuers', 'Cloud feeding'],
    note: 'High information noise and inconsistent verification.',
  },
  {
    title: 'International channels',
    items: ['Shelter networks', 'TNR programs', 'Donation platforms', 'Adoption matching'],
    note: 'More searchable and structured, but less emotionally continuous.',
  },
];

const painPoints = [
  'Information Fragmentation',
  'Funding Opacity',
  'High Participation Barrier',
  'Weak Emotional Connection',
];

const findingNodes = [
  { icon: Sprout, label: 'Overpopulation visual' },
  { icon: MapPin, label: 'Abandonment visual' },
  { icon: PawPrint, label: 'Stray life visual' },
  { icon: Home, label: 'Shelter shortage visual' },
  { icon: Users, label: 'Participation Gap' },
];

function ModuleHeader({ children }: { children: string }) {
  return <h3 className="page02-module-title">{children}</h3>;
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="page02-section-title">&middot; {children}</h3>;
}

function ResearchBlock({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`page02-research-block ${className}`}>
      <ModuleHeader>{title}</ModuleHeader>
      {children}
    </section>
  );
}

export default function BackgroundResearchPage() {
  const [boardScale, setBoardScale] = useState(1);

  useEffect(() => {
    const updateBoardScale = () => {
      const availableWidth = Math.max(1, window.innerWidth - viewerHorizontalPadding);
      const nextScale = availableWidth / boardWidth;

      setBoardScale(Number(nextScale.toFixed(4)));
    };

    updateBoardScale();
    window.addEventListener('resize', updateBoardScale);

    return () => window.removeEventListener('resize', updateBoardScale);
  }, []);

  const viewerStyle = {
    '--page02-scale': boardScale,
    width: `${boardWidth * boardScale}px`,
    height: `${boardHeight * boardScale}px`,
  } as CSSProperties & { '--page02-scale': number };

  return (
    <main className="page02-stage" aria-label="Guardian Space Page 02 Background and Secondary Research">
      <div className="page02-board-viewer" style={viewerStyle}>
        <div className="page02-board-scale-frame">
          <article className="page02-board">
        <section className="page02-left" aria-labelledby="page02-background-title">
          <header className="page02-header page02-header--left">
            <h1 id="page02-background-title">BACKGROUND</h1>
            <p className="page02-subtitle">&middot; Phenomenon</p>
            <p className="page02-intro">
              Stray animals are not only an animal welfare issue, but also an urban participation and trust issue.
            </p>
          </header>

          <div className="page02-evidence-grid">
            <section className="page02-visual-block page02-visual-block--trend">
              <ModuleHeader>Global Stray Animal Growth Trend</ModuleHeader>
              <img
                className="page02-chart-image"
                src={`${assetBase}/trend-chart.png`}
                alt="Line chart comparing China stray animal estimates with a global benchmark from 2021 to 2026"
              />
              <p className="page02-source-note">
                2021 and 2024 are cited public estimates. 2022-2023 are interpolated for visual continuity.
                2025-2026 are visual projections, not official data.
              </p>
            </section>

            <section className="page02-visual-block page02-visual-block--sources">
              <ModuleHeader>Sources Behind Stray Animals</ModuleHeader>
              <img
                className="page02-chart-image"
                src={`${assetBase}/risk-factor-capsule-chart.png`}
                alt="Capsule bar chart showing approximate stray animal source factors"
              />
              <p className="page02-source-note">
                Adapted from Mars State of Pet Homelessness Project 2024 public insights. Values are approximate
                visualization references, not the user's own survey data.
              </p>
            </section>

            <section className="page02-visual-block page02-visual-block--china">
              <ModuleHeader>China Stray Animal Scale</ModuleHeader>
              <div className="page02-china-map-stage">
                <div className="page02-china-fact-box">
                  <span>2021 national estimate</span>
                  <strong>53M stray cats + 40M stray dogs &asymp; 93M total</strong>
                </div>
                <div className="page02-china-map-frame">
                  <img
                    className="page02-map-image"
                    src={`${assetBase}/china-stray-map.png`}
                    alt="China map showing reported stray animal hotspot examples"
                  />
                </div>
                <div className="page02-china-analysis-panel" aria-label="China stray animal visibility patterns">
                  <span className="page02-china-overview-label">National visibility / distribution overview</span>
                  <div className="page02-china-pattern-list">
                    <p>Coastal urban clusters</p>
                    <p>High-density municipalities</p>
                    <p>Stronger rescue/report exposure</p>
                    <p>Uneven inland distribution</p>
                  </div>
                </div>
                <div className="page02-china-map-summary">
                  <strong>Stray animal visibility is stronger in major urban and coastal regions.</strong>
                  <p>
                    Large cities usually show higher public visibility, stronger rescue exposure, and denser reporting
                    activity, while inland regions may still face pressure but appear less visible in public data. This
                    pattern reflects visibility and reporting concentration rather than an exact geographic census.
                    Long-term support therefore needs to consider both visible urban hotspots and less-documented
                    regional pressure. The pattern also suggests that future support systems should combine public
                    reporting, rescue coordination, and sustained follow-up beyond the most visible coastal cities.
                  </p>
                </div>
              </div>
              <p className="page02-source-note page02-source-note--china">
                2021 national estimate: 53M stray cats + 40M stray dogs, about 93M total. Reported hotspots are
                examples, not a complete province-by-province census.
              </p>
            </section>

            <section className="page02-visual-block page02-visual-block--global">
              <ModuleHeader>Global Stray Animal Visibility</ModuleHeader>
              <div className="page02-global-map-stage">
                <div className="page02-global-map-canvas">
                  <img
                    className="page02-map-image"
                    src={`${assetBase}/global-stray-distribution.png`}
                    alt="World map showing relative public visibility of homeless cats and dogs"
                  />
                  <div className="page02-global-callout page02-global-callout--asia">
                    <h4>South &amp; Southeast Asia</h4>
                  </div>
                  <div className="page02-global-callout page02-global-callout--latin">
                    <h4>Latin America</h4>
                  </div>
                  <div className="page02-global-callout page02-global-callout--africa">
                    <h4>Africa / Emerging Urban Regions</h4>
                  </div>
                </div>
                <div className="page02-global-insight">
                  <strong>Global stray-animal visibility is uneven and concentrated in dense urban regions.</strong>
                  <p>
                    Hotspots reflect not only animal population density, but also public reporting visibility, rescue
                    infrastructure, sterilization coverage, and local management capacity.
                  </p>
                </div>
              </div>
              <p className="page02-source-note page02-source-note--global">
                2024 global benchmark: 362M homeless cats and dogs across 20 countries studied. The map indicates
                relative visibility from public data and reports, not a census.
              </p>
            </section>
          </div>

          <section className="page02-key-finding">
            <ModuleHeader>KEY Finding</ModuleHeader>
            <div className="page02-finding-flow" aria-label="Key finding issue flow">
              {findingNodes.map(({ icon: Icon, label }) => (
                <div className="page02-finding-node" key={label}>
                  <span aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <p className="page02-finding-sentence">
              Large-scale stray animals and fragmented rescue systems create a gap between people who want to help and
              animals that need long-term support.
            </p>
          </section>
        </section>

        <aside className="page02-right" aria-labelledby="page02-secondary-title">
          <header className="page02-header page02-header--right">
            <h2 id="page02-secondary-title">Secondary Research</h2>
            <p className="page02-subtitle">&middot; Survey</p>
          </header>

          <section className="page02-reference-block page02-reference-block--impact">
            <ModuleHeader>Impact of Unmanaged Stray Animals</ModuleHeader>
            <img
              className="page02-reference-image"
              src={`${assetBase}/impact-reference.png`}
              alt="Impact of unmanaged stray animals hub-and-spoke diagram"
            />
          </section>

          <section className="page02-reference-block page02-reference-block--response">
            <ModuleHeader>Existing Response Systems</ModuleHeader>
            <img
              className="page02-reference-image"
              src={`${assetBase}/existing-response-reference.png`}
              alt="Existing response systems two-lane process diagram"
            />
          </section>

          <section className="page02-channel-block" aria-labelledby="page02-channel-title">
            <SectionTitle>Channel Landscape</SectionTitle>
            <div className="page02-channel-groups">
              {channelGroups.map((group) => (
                <section className="page02-channel-group" key={group.title}>
                  <h4>{group.title}</h4>
                  <p className="page02-channel-list">{group.items.join(' / ')}</p>
                  <p className="page02-channel-note">{group.note}</p>
                </section>
              ))}
            </div>
          </section>

          <ResearchBlock title="PAIN POINTS" className="page02-pain-block">
            <div className="page02-pain-copy">
              <p>
                Stray-animal support is fragmented across shelters, social media, individual rescuers, and cloud-feeding
                platforms. Users often struggle to verify information, track support use, and maintain continuous contact
                with the animals they care about.
              </p>
              <p>
                Real adoption requires space, time, approval, and long-term responsibility, which excludes many people
                who still want to help. This creates a participation gap between public willingness and existing support
                channels.
              </p>
            </div>
            <div className="page02-pain-tags" aria-label="Pain point keywords">
              {painPoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
          </ResearchBlock>

          <section className="page02-opportunity">
            <div className="page02-opportunity-mark" aria-hidden="true">
              <HeartHandshake size={23} strokeWidth={1.8} />
            </div>
            <div>
              <h3>DESIGN OPPORTUNITY</h3>
              <p>A low-barrier, transparent, and emotionally responsive MR guardian system is needed.</p>
            </div>
          </section>
        </aside>
          </article>
        </div>
      </div>
    </main>
  );
}
