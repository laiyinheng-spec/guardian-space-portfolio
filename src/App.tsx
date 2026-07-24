import BackgroundResearchPage from './pages/BackgroundResearchPage';
import ConceptDevelopmentPage from './pages/ConceptDevelopmentPage';
import PrimaryResearchPage from './pages/PrimaryResearchPage';

function App() {
  const path = window.location.pathname;

  if (path === '/page02') {
    return <BackgroundResearchPage />;
  }

  if (path === '/page03') {
    return <PrimaryResearchPage />;
  }

  if (path === '/page04') {
    return <ConceptDevelopmentPage />;
  }

  return (
    <main className="portfolio-home">
      <nav aria-label="Portfolio pages">
        <a href="/page02">Page 02</a>
        <a href="/page03">Page 03</a>
        <a href="/page04">Page 04</a>
      </nav>
    </main>
  );
}

export default App;
