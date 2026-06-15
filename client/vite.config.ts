import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    // Inside the dev docker stack, nginx serves the app on :80 and routes /api
    // to the server, so HMR's websocket must point back at the public port.
    hmr: process.env.DOCKER_DEV ? { clientPort: 80 } : undefined,
    proxy: {
      // For a bare `vite` (no docker), forward API calls to the local server
      // (server.ts listens on 3001 and mounts /list and /scan at the root).
      // Strip the /api prefix so the client uses the same `/api/*` paths it
      // uses behind nginx in prod. Behind the docker proxy this is unused —
      // nginx handles /api routing before requests ever reach vite.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    allowedHosts: ['yoavk.app'],
  },
})
