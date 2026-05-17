import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Mufi/',
  plugins: [react()],
  server: {
    hmr: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion'
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'vendor-react'
          if (id.includes('node_modules/lucide')) return 'vendor-icons'
        },
      },
    },
  },
})
