/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kalajay Premium Brand Colour System
        // Primary: Heritage Terracotta (#9E5430) | Secondary: Soft Ivory (#F7F3EC) | Accent: Dark Cacao (#372921)
        canvas: {
          DEFAULT: '#F7F3EC', // Soft Ivory — Main website background
          subtle: '#F0E9DF',  // Layered Ivory surface muted
          card: '#FFFCF7',    // Light Ivory surface card
          muted: '#EAE2D8',   // Tactile warm neutral
          dark: '#372921',    // Dark Cacao
          darker: '#231915',  // Deep Dark Cacao
        },
        ink: {
          DEFAULT: '#372921', // Dark Cacao primary text (11.4:1 contrast on Soft Ivory)
          muted: '#685B52',   // Secondary text (5.4:1 contrast)
          light: '#76695F',   // Muted text (4.5:1 contrast)
          faint: '#A99583',   // Strong outline & subtle indicators
        },
        plum: {
          DEFAULT: '#372921', // Dark Cacao (Wordmarks & Headings)
          dark: '#231915',    // Deep Dark Cacao
          light: '#503A2E',   // Primary CTA Hover Dark Cacao
          surface: '#2A1F19', // Deep dark surface
        },
        blush: {
          DEFAULT: '#F0E9DF', // Warm Bone Wash
          subtle: '#F7F3EC',  // Soft Silk Glow
          rich: '#EAE2D8',    // Warm Sand
        },
        rosewood: {
          DEFAULT: '#9E5430', // Heritage Terracotta primary brand identity
          dark: '#874427',    // Terracotta Hover
          light: '#B86B45',   // Terracotta Light Tint
        },
        gold: {
          DEFAULT: '#9E5430', // Heritage Terracotta brand accent
          hairline: '#DED3C5',
          light: '#F0E9DF',
          dark: '#874427',
        },
        champagne: {
          DEFAULT: '#F0E9DF', // Warm Pearl Silk
          light: '#FFFCF7',
          dark: '#DED3C5',
        },
        lilac: {
          DEFAULT: '#C9B4DB',
          subtle: '#EAE1F3',
          deep: '#A78FBD',
        },
        warm: {
          ink: '#372921',
          terracotta: '#9E5430',
          gold: '#9E5430',
        },
        border: {
          DEFAULT: '#DED3C5',
          subtle: '#EAE2D8',
          medium: '#DED3C5',
          strong: '#A99583',
          brand: '#9E5430',
          secondary: '#B7A696',
          gold: '#DED3C5',
        },
        terracotta: {
          DEFAULT: '#9E5430',
          hover: '#874427',
          light: '#F6ECE6',
        },
        cacao: {
          DEFAULT: '#372921',
          hover: '#503A2E',
          light: '#685B52',
          muted: '#76695F',
          dark: '#231915',
        },
        ivory: {
          DEFAULT: '#F7F3EC',
          surface: '#FFFCF7',
          muted: '#F0E9DF',
        }
      },
      borderRadius: {
        'image': '28px',
        'image-lg': '32px',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Prata', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Manrope', 'Jost', 'sans-serif'],
        script: ['var(--font-script)', 'Caveat', 'cursive'],
      },
      letterSpacing: {
        monumental: '0.22em',
        editorial: '0.10em',
        refined: '0.04em',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
