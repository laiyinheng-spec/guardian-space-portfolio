export const themeTokens = {
  colors: {
    bg: 'var(--color-bg)',
    bgSoft: 'var(--color-bg-soft)',
    section: 'var(--color-section)',
    card: 'var(--color-card)',
    cardSolid: 'var(--color-card-solid)',
    glass: 'var(--color-glass)',
    text: 'var(--color-text)',
    muted: 'var(--color-muted)',
    line: 'var(--color-line)',
    accent: 'var(--color-accent)',
    accentSoft: 'var(--color-accent-soft)',
    accentDeep: 'var(--color-accent-deep)',
    important: 'var(--color-important)',
  },
  fonts: {
    display: 'var(--font-family-display)',
    body: 'var(--font-family-body)',
    mono: 'var(--font-family-mono)',
  },
  spacing: {
    pageX: 'var(--space-page-x)',
    chapterY: 'var(--space-chapter-y)',
    sectionY: 'var(--space-section-y)',
    card: 'var(--space-card)',
  },
  radii: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  shadows: {
    card: 'var(--shadow-card)',
    floating: 'var(--shadow-floating)',
    hover: 'var(--shadow-hover)',
  },
} as const;

const easeSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const motionTokens = {
  fast: 0.16,
  normal: 0.26,
  slow: 0.52,
  intro: 0.72,
  chart: 1.2,
  liftY: -8,
  collageLiftY: -6,
  tagLiftY: -2,
  fadeY: 28,
  numberY: 18,
  scaleHover: 1.025,
  tagScaleHover: 1.02,
  viewportAmount: 0.18,
  viewportCardAmount: 0.7,
  viewportChartAmount: 0.5,
  stagger: 0.07,
  easeSoft,
  iconDrawSize: 24,
  iconStrokeWidth: 1.8,
} as const;
