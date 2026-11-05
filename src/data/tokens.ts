/**
 * KALAJAY — Core Design Tokens
 * Single source of truth for palette, typography, radii, elevation and motion parameters.
 */

export const TOKENS = {
  palette: {
    // Primary brand colours
    pearlIvory: '#FBF7F2', // Base canvas
    blush: '#F3D9D6',      // Warm romantic secondary
    rosewood: '#8C3B4A',   // Emotional luxury accent
    antiqueGold: '#B8924A',// Hairlines, wax seals, and jewel accents
    deepPlumInk: '#2B1A22',// High-contrast primary typographic ink

    // Extended tints & supporting shades
    canvasSubtle: '#F5EFE6', // Soft secondary card background
    canvasMuted: '#EDE4D8',  // Border & divider soft fill
    canvasDark: '#1C1620',   // Deep night craft house background
    canvasDarker: '#140F18', // Deepest charcoal plum

    // UI text hierarchy
    textPrimary: '#2B1A22',
    textMuted: '#524357',
    textLight: '#5E4D63', // Checked: >6.6:1 WCAG AA contrast against #FBF7F2
    textFaint: '#736378',

    // Borders
    borderSubtle: '#E8DFD3',
    borderMedium: '#D8CCBD',
    borderGold: 'rgba(184, 146, 74, 0.35)',
  },

  typography: {
    fonts: {
      display: 'var(--font-serif)', // Cormorant Garamond / Fraunces
      sans: 'var(--font-sans)',       // Plus Jakarta Sans / Inter
      script: 'var(--font-script)',   // Caveat
    },
    tracking: {
      monumental: '0.22em',
      editorial: '0.10em',
      refined: '0.04em',
    },
  },

  radii: {
    badge: '9999px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    image: '28px', // Generous radii on images (24–32px per spec)
    imageLarge: '32px',
  },

  motion: {
    durations: {
      fast: 0.3,
      base: 0.7,
      slow: 1.1,
      pageCurtain: 0.65,
    },
    easings: {
      reveal: 'power3.out',
      page: 'expo.inOut',
      smooth: 'power2.out',
    },
  },
} as const;

