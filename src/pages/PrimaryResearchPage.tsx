import { useEffect, useState, type CSSProperties } from 'react';

const assetBase = '/assets/page03';
const boardWidth = 1680;
const boardHeight = 1096;
const viewerHorizontalPadding = 32;

export default function PrimaryResearchPage() {
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
    '--page03-scale': boardScale,
    width: `${boardWidth * boardScale}px`,
    height: `${boardHeight * boardScale}px`,
  } as CSSProperties & { '--page03-scale': number };

  return (
    <main className="page03-stage" aria-label="Guardian Space Page 03 Primary Research and User Analysis">
      <div className="page03-board-viewer" style={viewerStyle}>
        <div className="page03-board-scale-frame">
          <article className="page03-board">
            <section className="page03-left" aria-labelledby="page03-primary-title">
              <header className="page03-page-header">
                <h1 id="page03-primary-title">PRIMARY RESEARCH</h1>
                <p className="page03-subtitle">&middot; Interview</p>
                <p className="page03-intro">
                  I interviewed four types of participants involved in stray-animal support to understand barriers in
                  adoption, donation, feedback, and long-term connection.
                </p>
              </header>

              <div className="page03-left-assets">
                <img
                  className="page03-module-image page03-interview-image"
                  src={`${assetBase}/page03-interview-cards.png`}
                  alt="Interview cards for four stray-animal support participant types"
                />
                <img
                  className="page03-module-image page03-signals-image"
                  src={`${assetBase}/page03-shared-interview-signals.png`}
                  alt="Shared interview signals summary"
                />
              </div>
            </section>

            <section className="page03-right" aria-labelledby="page03-analysis-title">
              <header className="page03-page-header page03-page-header--right">
                <h2 id="page03-analysis-title">USER ANALYSIS</h2>
                <p className="page03-subtitle">&middot; Analysis</p>
              </header>

              <img
                className="page03-module-image page03-analysis-image"
                src={`${assetBase}/page03-analysis-map.png`}
                alt="User analysis map"
              />

              <section className="page03-journey-section" aria-labelledby="page03-journey-title">
                <h3 id="page03-journey-title" className="page03-subtitle">
                  &middot; User Journey Map
                </h3>
                <p className="page03-journey-note">
                  This journey map shows how potential supporters move from noticing stray-animal stories to taking
                  action and deciding whether to stay involved. Trust, proof, and continuous feedback are key moments in
                  sustaining participation.
                </p>
                <img
                  className="page03-module-image page03-journey-image"
                  src={`${assetBase}/page03-user-journey-map.png`}
                  alt="User journey map"
                />
              </section>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
