import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Required for GitHub Pages project site: https://<user>.github.io/impact/
  base: '/impact/',
  plugins: [react()],
  optimizeDeps: {
    include: [
      'impact-ui',
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
      'ag-grid-community',
      'ag-grid-enterprise',
      'ag-grid-react',
    ],
  },
})
