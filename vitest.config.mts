import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '*.config.ts',
        '*.config.js',
        'src/types/**',
        'e2e/**',
      ],
    },
    exclude: ['node_modules', 'e2e', '.next'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
