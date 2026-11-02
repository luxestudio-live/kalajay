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
        // Sartorial Pure Ivory & Noir Luxury Haute Atelier Palette
        canvas: {
          DEFAULT: '#FAF9F6', // Luminous Crisp Porcelain Ivory
          subtle: '#F3EFEA',  // Warm Bone Alabaster
          card: '#FFFFFF',    // Pure Gallery White
          muted: '#EAE4DC',   // Tactile Linen
          dark: '#141312',    // Architectural Deep Noir
          darker: '#0C0B0A',  // Gallery Obsidian
        },
        ink: {
          DEFAULT: '#141312', // Architectural Noir Ink
          muted: '#44403C',   // Warm Deep Charcoal (8.2:1 contrast)
          light: '#68625C',   // Refined Mineral (5.1:1 contrast)
          faint: '#999187',   // Hairline Stone
        },
        plum: {
          DEFAULT: '#141312', // Architectural Noir Ink (Wordmarks & Headings)
          dark: '#0C0B0A',    // Gallery Obsidian
          light: '#262422',   // Muted Charcoal
          surface: '#1C1A18', // Deep Atelier Surface
        },
        blush: {
          DEFAULT: '#F0EBE1', // Warm Bone Wash
          subtle: '#FAF7F2',  // Soft Silk Glow
          rich: '#E4DDD2',    // Warm Sand
        },
        rosewood: {
          DEFAULT: '#1F1E1D', // Architectural Noir Accent
          dark: '#121211',    // Pitch Noir
          light: '#383533',   // Soft Charcoal
        },
        gold: {
          DEFAULT: '#C5A880', // Restrained Champagne Gold
          hairline: 'rgba(197, 168, 128, 0.32)',
          light: '#E0CBAB',
          dark: '#9A7D55',
        },
        champagne: {
          DEFAULT: '#EADCC8', // Warm Pearl Silk
          light: '#F7F1E7',
          dark: '#C5A880',
        },
        lilac: {
          DEFAULT: '#C9B4DB',
          subtle: '#EAE1F3',
          deep: '#A78FBD',
        },
        warm: {
          ink: '#141312',
          terracotta: '#A85A48',
          gold: '#C5A880',
        },
        border: {
          subtle: '#EBE6DE',
          medium: '#DDD6CA',
          strong: '#C5BDB0',
          gold: 'rgba(197, 168, 128, 0.32)',
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
