export function readToken(name: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function readNumberToken(name: string) {
  const value = readToken(name);
  return Number.parseFloat(value);
}

export function readChartTokens() {
  return {
    text: readToken('--color-text'),
    muted: readToken('--color-muted'),
    line: readToken('--color-line'),
    accent: readToken('--color-accent'),
    accentSoft: readToken('--color-accent-soft'),
    accentDeep: readToken('--color-accent-deep'),
    important: readToken('--color-important'),
    surface: readToken('--color-surface-solid'),
    mapLand: readToken('--color-map-land'),
    mapLandStrong: readToken('--color-map-land-strong'),
    mapStroke: readToken('--color-map-stroke'),
    mapFill: readToken('--map-fill'),
    mapDot: readToken('--map-dot'),
    mapDotSoft: readToken('--map-dot-soft'),
    mapHighlight: readToken('--map-highlight'),
    mapTooltipBg: readToken('--map-tooltip-bg'),
    mapTooltipText: readToken('--map-tooltip-text'),
    chartFillStart: readToken('--color-chart-fill-start'),
    chartFillEnd: readToken('--color-chart-fill-end'),
    fontBody: readToken('--font-family-body'),
    fontMono: readToken('--font-family-mono'),
    labelSize: readNumberToken('--chart-label-size'),
    lineWidth: readNumberToken('--chart-line-width'),
    symbolSize: readNumberToken('--chart-symbol-size'),
    barWidth: readNumberToken('--chart-bar-width'),
    mapZoom: readNumberToken('--chart-map-zoom'),
    chinaMapZoom: readNumberToken('--chart-china-map-zoom'),
    worldMapZoom: readNumberToken('--chart-world-map-zoom'),
    mapRoam: readNumberToken('--chart-map-roam'),
    mapBorderWidth: readNumberToken('--chart-map-border-width'),
    mapHighlightOpacity: readNumberToken('--chart-map-highlight-opacity'),
    mapSymbolBase: readNumberToken('--chart-map-symbol-base'),
    mapSymbolDivisor: readNumberToken('--chart-map-symbol-divisor'),
    animationDuration: readNumberToken('--motion-chart-ms'),
    gridLeft: readToken('--chart-grid-left'),
    gridRight: readToken('--chart-grid-right'),
    gridTop: readToken('--chart-grid-top'),
    gridBottom: readToken('--chart-grid-bottom'),
    tooltipPaddingY: readNumberToken('--chart-tooltip-padding-y'),
    tooltipPaddingX: readNumberToken('--chart-tooltip-padding-x'),
    tooltipBorderWidth: readNumberToken('--chart-tooltip-border-width'),
  };
}
