import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        results: resolve(__dirname, 'results.html'),
        adminApi: resolve(__dirname, 'admin-api.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html'),
        admin: resolve(__dirname, 'admin.html'),
        frontend: resolve(__dirname, 'frontend.html'),
        data: resolve(__dirname, 'data.html'),
        autoseed: resolve(__dirname, 'autoseed.html')
      }
    }
  },
})