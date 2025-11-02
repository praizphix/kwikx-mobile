import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['react-native'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react-native'],
    },
  },
})
