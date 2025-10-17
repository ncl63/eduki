import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path:
// - Local dev: '/'
// - GitHub Pages (project pages): '/<repo>/'  -> injected via BASE_PATH env in the CI
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
})
