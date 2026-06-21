import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        section: 'var(--color-section)',
        card: 'var(--color-card)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        display: 'var(--font-family-display)',
        body: 'var(--font-family-body)',
        mono: 'var(--font-family-mono)',
      },
      borderRadius: {
        token: 'var(--radius-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
      spacing: {
        page: 'var(--space-page-x)',
      },
    },
  },
  plugins: [],
};

export default config;
