import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))'
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))'
        },
        terracotta: {
          50: 'oklch(0.96 0.02 35)',
          100: 'oklch(0.92 0.04 35)',
          200: 'oklch(0.84 0.07 35)',
          300: 'oklch(0.74 0.10 35)',
          400: 'oklch(0.65 0.12 35)',
          500: 'oklch(0.56 0.14 35)',
          600: 'oklch(0.48 0.13 35)',
          700: 'oklch(0.40 0.11 35)',
          800: 'oklch(0.32 0.09 35)',
          900: 'oklch(0.24 0.06 35)',
        },
        sage: {
          50: 'oklch(0.96 0.02 145)',
          100: 'oklch(0.92 0.04 145)',
          200: 'oklch(0.84 0.06 145)',
          300: 'oklch(0.75 0.08 145)',
          400: 'oklch(0.68 0.09 145)',
          500: 'oklch(0.62 0.09 145)',
          600: 'oklch(0.52 0.08 145)',
          700: 'oklch(0.42 0.07 145)',
          800: 'oklch(0.32 0.05 145)',
          900: 'oklch(0.22 0.04 145)',
        },
        sand: {
          50: 'oklch(0.98 0.01 80)',
          100: 'oklch(0.95 0.02 80)',
          200: 'oklch(0.91 0.03 80)',
          300: 'oklch(0.88 0.055 80)',
          400: 'oklch(0.82 0.07 80)',
          500: 'oklch(0.74 0.09 80)',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 oklch(0.22 0.03 50 / 0.05)',
        sm: '0 1px 3px 0 oklch(0.22 0.03 50 / 0.08), 0 1px 2px -1px oklch(0.22 0.03 50 / 0.06)',
        card: '0 2px 8px 0 oklch(0.22 0.03 50 / 0.08), 0 1px 3px -1px oklch(0.22 0.03 50 / 0.06)',
        'card-hover': '0 8px 24px 0 oklch(0.22 0.03 50 / 0.12), 0 2px 6px -1px oklch(0.22 0.03 50 / 0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      }
    }
  },
  plugins: [typography, containerQueries, animate]
};
