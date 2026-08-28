import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
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
