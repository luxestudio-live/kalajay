/**
 * KALAJAY — Core Design Tokens
 * Single source of truth for palette, typography, radii, elevation and motion parameters.
 */

export const TOKENS = {
  palette: {
    // Core Brand Colours
    primary: '#9E5430',             // Heritage Terracotta
    secondary: '#F7F3EC',           // Soft Ivory
    accent: '#372921',              // Dark Cacao
    heritageTerracotta: '#9E5430',
    terracottaHover: '#874427',
    softIvory: '#F7F3EC',
    surface: '#FFFCF7',
    surfaceMuted: '#F0E9DF',
    darkCacao: '#372921',
    cacaoHover: '#503A2E',
    cacaoMuted: '#685B52',
    cacaoLight: '#76695F',

    // Legacy semantic aliases mapped to new brand palette
    pearlIvory: '#F7F3EC',
    blush: '#F0E9DF',
    rosewood: '#9E5430',
    antiqueGold: '#9E5430',
    deepPlumInk: '#372921',

    // Extended tints & supporting shades
    canvasSubtle: '#F0E9DF',
    canvasMuted: '#EAE2D8',
    canvasDark: '#372921',
    canvasDarker: '#231915',

    // UI text hierarchy
    textPrimary: '#372921',
    textSecondary: '#685B52',
    textMuted: '#76695F',
    textLight: '#76695F',
    textFaint: '#A99583',
    textOnDark: '#F7F3EC',
    textBrand: '#9E5430',

    // Borders & Dividers
    borderDefault: '#DED3C5',
    borderSubtle: '#EAE2D8',
    borderMedium: '#DED3C5',
    borderStrong: '#A99583',
    borderBrand: '#9E5430',
    borderSecondaryButton: '#B7A696',
    borderGold: '#DED3C5',
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

