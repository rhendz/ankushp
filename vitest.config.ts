import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    include: [
      'components/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
    ],
  },
})
