import type { CSSProperties } from 'react';
import { globalScaleSummary, worldMapPoints } from '../../data/page2Data';

function MapFallback() {
  return <div className="map-fallback">Map data placeholder</div>;
}

export function GlobalScaleMap() {
  const hasMap = Boolean(globalScaleSummary.mapSrc);
  const hasPoints = worldMapPoints.length > 0;

  if (!hasMap || !hasPoints) {
    return <MapFallback />;
  }

  return (
    <div className="image-map image-map--world" aria-label={globalScaleSummary.title}>
      <div className="image-map__stage">
        <img className="image-map__base" src={globalScaleSummary.mapSrc} alt="" />
        {worldMapPoints.map((point, index) => (
          <button
            className="image-map__point"
            key={point.name}
            style={
              {
                '--map-point-x': `${point.position.x}%`,
                '--map-point-y': `${point.position.y}%`,
                '--map-point-delay': `${index * 90}ms`,
                '--map-point-scale': String(Math.max(1, point.value / 55)),
              } as CSSProperties
            }
            type="button"
            aria-label={`${point.name}: placeholder signal ${point.value}`}
          >
            <span className="image-map__tooltip">
              {point.name}
              <small>Placeholder signal: {point.value}</small>
              <em>{globalScaleSummary.source}</em>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
