import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // ← esto es lo clave: fuerza rutas absolutas desde la raíz del dominio
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true   // para ver errores claros en consola
  }
})