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
        gray: colors.green,
      },
      container: {
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        center: true,
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          // css: {
          //   a: {
          //     color: theme('colors.accent/60'),
          //     '&:hover': {
          //       color: `${theme('colors.accent/70')}`,
          //     },
          //   },
          //   'h1,h2': {
          //     fontWeight: '700',
          //     letterSpacing: theme('letterSpacing.tight'),
          //     color: theme('colors.secondary/80')
          //   },
          //   'p > *': {
          //     color: `${theme('colors.secondary/50')}`
          //   },
          //   code: {
          //     color: theme('colors.indigo.500'),
          //   },
          // },
          css: {
            '--tw-prose-body': theme('colors.secondary/0.75'),
            '--tw-prose-headings': theme('colors.secondary/1.0'),
            '--tw-prose-lead': theme('colors.pink[700]'),
            '--tw-prose-links': theme('colors.accent/0.75'),
            '--tw-prose-bold': theme('colors.secondary/0.9'),
            '--tw-prose-counters': theme('colors.secondary/0.75'),
            '--tw-prose-bullets': theme('colors.secondary/0.75'),
            '--tw-prose-hr': theme('colors.secondary/0.3'),
            '--tw-prose-quotes': theme('colors.secondary/0.75'),
            '--tw-prose-quote-borders': theme('colors.accent/0.5'),
            '--tw-prose-captions': theme('colors.pink[700]'),
            '--tw-prose-code': theme('colors.indigo[500]'),
            '--tw-prose-pre-code': theme('colors.indigo[500]'),
            '--tw-prose-pre-bg': theme('colors.slate[800]'),
            '--tw-prose-th-borders': theme('colors.pink[300]'),
            '--tw-prose-td-borders': theme('colors.pink[200]'),
            code: {
              fontFamily: theme('fontFamily.mono'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
