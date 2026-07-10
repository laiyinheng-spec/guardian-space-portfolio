import BackgroundResearchPage from './pages/BackgroundResearchPage';
import PrimaryResearchPage from './pages/PrimaryResearchPage';

function App() {
  const path = window.location.pathname;

  if (path === '/page02') {
    return <BackgroundResearchPage />;
  }

  if (path === '/page03') {
    return <PrimaryResearchPage />;
  }

  return (
    <main className="portfolio-home">
      <nav aria-label="Portfolio pages">
        <a href="/page02">Page 02</a>
        <a href="/page03">Page 03</a>
      </nav>
    </main>
  );
}

export default App;
