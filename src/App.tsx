import PortfolioImagePage from './pages/PortfolioImagePage';

const portfolioPages = [
  { pageNumber: '01', imageSrc: '/assets/page01/page01-cover.png' },
  { pageNumber: '02', imageSrc: '/assets/page02/page02-background.png' },
  { pageNumber: '03', imageSrc: '/assets/page03/page03-opportunity.png' },
  { pageNumber: '04', imageSrc: '/assets/page04/page04-concept.png' },
  { pageNumber: '05', imageSrc: '/assets/page05/page05-mr-system.png' },
  { pageNumber: '06', imageSrc: '/assets/page06/page06-ui-interface.png' },
  { pageNumber: '07', imageSrc: '/assets/page07/page07-interaction.png' },
  { pageNumber: '08', imageSrc: '/assets/page08/8.png' },
];

function App() {
  return <PortfolioImagePage pages={portfolioPages} />;
}

export default App;
