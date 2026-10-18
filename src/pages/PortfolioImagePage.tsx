import usePrototypeNavigation from '../hooks/usePrototypeNavigation';
import InteractionHintBadges from '../components/hints/InteractionHintBadges';
import PrototypeSystemHover from '../components/prototype-system/PrototypeSystemHover';
import UserFlowInteractions from '../components/user-flow/UserFlowInteractions';
import MrSelectionHover from '../components/mr-direction/MrSelectionHover';
import ConceptHoverInteractions from '../components/concept/ConceptHoverInteractions';
import TrustProofEvidence from '../components/research/TrustProofEvidence';
import BackgroundWorldMap from '../components/maps/BackgroundWorldMap';
import BackgroundChinaMap from '../components/maps/BackgroundChinaMap';
import BackgroundTrendChart from '../components/charts/BackgroundTrendChart';

type PortfolioImagePageProps = {
  pages: Array<{
    imageSrc: string;
    pageNumber: string;
  }>;
};

export default function PortfolioImagePage({ pages }: PortfolioImagePageProps) {
  const openPrototype = usePrototypeNavigation();
  return (
    <main className="portfolio-image-stage" aria-label="Guardian Space portfolio">
      {pages.map((page) => page.pageNumber === '02' ? (
        <div className="portfolio-background-page" key={page.pageNumber} id="background">
          <img className="portfolio-image-page" src={page.imageSrc}
            alt="Guardian Space portfolio page 02. Background and secondary research; interactive growth chart follows." />
          <BackgroundTrendChart />
          <BackgroundChinaMap imageSrc={page.imageSrc} />
          <BackgroundWorldMap imageSrc={page.imageSrc} />
          <InteractionHintBadges page="background" />
        </div>
      ) : page.pageNumber === '03' ? (
        <div className="portfolio-research-page" key={page.pageNumber}>
          <img className="portfolio-image-page" src={page.imageSrc} alt="Guardian Space portfolio page 03: Primary Research and User Analysis" />
          <TrustProofEvidence imageSrc={page.imageSrc} />
          <InteractionHintBadges page="research" />
        </div>
      ) : page.pageNumber === '04' ? (
        <div className="portfolio-concept-page" key={page.pageNumber}>
          <img className="portfolio-image-page" src={page.imageSrc} alt="Guardian Space portfolio page 04: Concept Development" />
          <ConceptHoverInteractions />
        </div>
      ) : page.pageNumber === '05' ? (
        <div className="portfolio-mr-direction-page" key={page.pageNumber}>
          <img className="portfolio-image-page" src={page.imageSrc} alt="Guardian Space portfolio page 05: Why MR and Project Overview" />
          <MrSelectionHover />
        </div>
      ) : page.pageNumber === '06' ? (
        <div className="portfolio-user-flow-page" key={page.pageNumber}>
          <img className="portfolio-image-page" src={page.imageSrc} alt="Guardian Space portfolio page 06: User Flow and UI Interface" />
          <UserFlowInteractions />
        </div>
      ) : page.pageNumber === '08' ? (
        <div className="portfolio-prototype-system-page" key={page.pageNumber}>
          <img className="portfolio-image-page" src={page.imageSrc} alt="Guardian Space portfolio page 08: Prototype System, Interaction Showcase and Development" />
          <PrototypeSystemHover />
        </div>
      ) : (
        <img
          className="portfolio-image-page"
          key={page.pageNumber}
          src={page.imageSrc}
          alt={`Guardian Space portfolio page ${page.pageNumber}`}
        />
      ))}
      <section className="portfolio-prototype-cta" aria-labelledby="prototype-cta-title">
        <div className="portfolio-prototype-cta__panel">
          <p className="portfolio-prototype-cta__eyebrow">MR Prototype</p>
          <h1 id="prototype-cta-title">Experience Guardian Space</h1>
          <a
            className="portfolio-prototype-cta__button"
            id="mr-prototype-entry"
            href="https://guardian-space-prototype.vercel.app/"
            onClick={openPrototype}
            target="_blank"
            rel="opener"
          >
            <span>Enter MR Prototype</span>
            <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </section>
    </main>
  );
}
