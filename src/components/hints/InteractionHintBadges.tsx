import './interaction-hint-badges.css';

type Page = 'background' | 'research';
// Canvas positions measured in the 1419 × 924 layout references, converted
// to the live 4994 × 3257 pages. Keep the full transparent assets: their
// visible artwork starts inside each canvas (34/66, 18/42 and 72/61).
const badges: Record<Page, Array<{file: string; alt: string; x: number; y: number; width: number}>> = {
  background: [
    {file:'hover-to-explore.png',alt:'Hover to explore the China map markers',x:119.66,y:1621.45,width:344.90},
    {file:'click-to-explore.png',alt:'Click to explore the world map regions',x:1502.78,y:1512.18,width:323.78},
  ],
  research: [
    {file:'hover-to-connect.png',alt:'Hover over a research theme to connect its evidence',x:1967.33,y:1124.44,width:510.31},
  ],
};

export default function InteractionHintBadges({page}: {page: Page}) {
  return <div className="portfolio-hint-badges">
    {badges[page].map(badge => <img key={badge.file} className="portfolio-hint-badges__image"
      src={`/assets/interaction-hints/${badge.file}`} alt={badge.alt} draggable={false}
      style={{left:`${badge.x/4994*100}%`,top:`${badge.y/3257*100}%`,width:`${badge.width/4994*100}%`}} />)}
  </div>;
}
