// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './node_modules/pliny/**/*.js',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './layouts/**/*.{js,ts,tsx}',
    './data/**/*.mdx',
  ],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        gray: colors.gray,
      },
      container: {
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
          '4xl': '8rem',
          '6xl': '10rem',
          '8xl': '12rem',
        },
        center: true,
      },
      screens: {
        sm: '640px',
        // => @media (min-width: 640px) { ... }

        md: '768px',
        // => @media (min-width: 768px) { ... }

        lg: '1024px',
        // => @media (min-width: 1024px) { ... }

        xl: '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }

        '4xl': '1920px',
        // => @media (min-width: 1920px) { ... }

        '6xl': '2560px',
        // => @media (min-width: 2560px) { ... }

        '8xl': '3840px',
        // => @media (min-width: 3840px) { ... }
      },
      maxWidth: {
        '9xl': '96rem',
        '11xl': '108rem',
        '13xl': '116rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.secondary / 0.75'),
            '--tw-prose-headings': theme('colors.secondary / 1.0'),
            '--tw-prose-lead': theme('colors.pink[700]'),
            '--tw-prose-links': theme('colors.accent / 0.75'),
            '--tw-prose-bold': theme('colors.secondary / 0.9'),
            '--tw-prose-counters': theme('colors.secondary / 0.75'),
            '--tw-prose-bullets': theme('colors.secondary / 0.75'),
            '--tw-prose-hr': theme('colors.secondary / 0.3'),
            '--tw-prose-quotes': theme('colors.secondary / 0.75'),
            '--tw-prose-quote-borders': theme('colors.accent / 0.5'),
            '--tw-prose-captions': theme('colors.secondary / 1.0'),
            '--tw-prose-code': theme('colors.indigo[500]'),
            '--tw-prose-pre-code': theme('colors.indigo[500]'),
            '--tw-prose-pre-bg': theme('colors.slate[800]'),
            '--tw-prose-th-borders': theme('colors.accent / 0.75'),
            '--tw-prose-td-borders': theme('colors.accent / 0.5'),
            'blockquote p:first-of-type::before': false,
            'blockquote p:first-of-type::after': false,
          },
        },
      }),
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
