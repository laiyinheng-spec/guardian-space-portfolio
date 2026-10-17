import BackgroundTrendChart from '../components/charts/BackgroundTrendChart';

type PortfolioImagePageProps = {
  pages: Array<{
    imageSrc: string;
    pageNumber: string;
  }>;
};

export default function PortfolioImagePage({ pages }: PortfolioImagePageProps) {
  return (
    <main className="portfolio-image-stage" aria-label="Guardian Space portfolio">
      {pages.map((page) => page.pageNumber === '02' ? (
        <div className="portfolio-background-page" key={page.pageNumber} id="background">
          <img className="portfolio-image-page" src={page.imageSrc}
            alt="Guardian Space portfolio page 02. Background and secondary research; interactive growth chart follows." />
          <BackgroundTrendChart />
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
            href="https://guardian-space-prototype.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            <span>Enter MR Prototype</span>
            <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </section>
    </main>
  );
}
