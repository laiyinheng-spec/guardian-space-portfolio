type PortfolioImagePageProps = {
  pages: Array<{
    imageSrc: string;
    pageNumber: string;
  }>;
};

export default function PortfolioImagePage({ pages }: PortfolioImagePageProps) {
  return (
    <main className="portfolio-image-stage" aria-label="Guardian Space portfolio">
      {pages.map((page) => (
        <img
          className="portfolio-image-page"
          key={page.pageNumber}
          src={page.imageSrc}
          alt={`Guardian Space portfolio page ${page.pageNumber}`}
        />
      ))}
    </main>
  );
}
