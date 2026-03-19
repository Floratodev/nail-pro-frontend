// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Si necesitas base path diferente en producción (opcional)
  base: '/mi-subruta/',
})