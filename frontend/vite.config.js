import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 1. ADD THIS LINE: This ensures assets are loaded via relative paths (./) 
  // rather than absolute paths (/), which fixes the ERR_FILE_NOT_FOUND
  base: './', 

  server: {
    proxy: {
      '/api': {
        // Ensure this matches your Node.js backend port (default was 5000 in previous steps)
        target: 'http://localhost:5000', 
        changeOrigin: true,
      }
    }
  },
  
  // 2. OPTIONAL: If you encounter issues with ES modules in Electron, 
  // you can force the build to target a specific environment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})