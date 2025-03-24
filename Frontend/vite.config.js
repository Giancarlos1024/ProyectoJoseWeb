import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  base: '/', // Mantiene rutas relativas a la raíz
  plugins: [react()],
  build: {
    outDir: 'dist', // Asegura que el build se genere en 'dist'
  },
  server: {
    historyApiFallback: true, // 👈 Agrega esto para manejar rutas en desarrollo
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
  },
});
