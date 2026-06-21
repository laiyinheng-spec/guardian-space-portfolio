import type { CSSProperties } from 'react';
import { chinaMapPoints, chinaScaleSummary } from '../../data/page2Data';

function MapFallback() {
  return <div className="map-fallback">Map data placeholder</div>;
}

export function ChinaScaleMap() {
  const hasMap = Boolean(chinaScaleSummary.mapSrc);
  const hasPoints = chinaMapPoints.length > 0;

  if (!hasMap || !hasPoints) {
    return <MapFallback />;
  }

  return (
    <div className="image-map image-map--china" aria-label={chinaScaleSummary.title}>
      <div className="image-map__stage">
        <img className="image-map__base" src={chinaScaleSummary.mapSrc} alt="" />
        {chinaMapPoints.map((point, index) => (
          <button
            className="image-map__point"
            key={point.name}
            style={
              {
                '--map-point-x': `${point.position.x}%`,
                '--map-point-y': `${point.position.y}%`,
                '--map-point-delay': `${index * 90}ms`,
                '--map-point-scale': String(Math.max(1, point.value / 7)),
              } as CSSProperties
            }
            type="button"
            aria-label={`${point.name}: placeholder signal ${point.value}`}
          >
            <span className="image-map__tooltip">
              {point.name}
              <small>Placeholder signal: {point.value}</small>
              <em>{chinaScaleSummary.source}</em>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
