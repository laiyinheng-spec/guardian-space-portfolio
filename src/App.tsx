import PortfolioImagePage from './pages/PortfolioImagePage';

const portfolioPages = [
  { pageNumber: '01', imageSrc: '/assets/page01/page01-cover.png' },
  { pageNumber: '02', imageSrc: '/assets/content-corrections/page-02.png' },
  { pageNumber: '03', imageSrc: '/assets/content-corrections/page-03.png' },
  { pageNumber: '04', imageSrc: '/assets/page04/page04-concept.png' },
  { pageNumber: '05', imageSrc: '/assets/content-corrections/page-05.png' },
  { pageNumber: '06', imageSrc: '/assets/content-corrections/page-06.png' },
  { pageNumber: '07', imageSrc: '/assets/storyboard-update/storyboard-page.png' },
  { pageNumber: '08', imageSrc: '/assets/content-corrections/page-08.png' },
];

function App() {
  return <PortfolioImagePage pages={portfolioPages} />;
}

export default App;
