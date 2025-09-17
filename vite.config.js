import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = nom EXACT de ta repo
export default defineConfig({
  plugins: [react()],
  base: '/travail-matija/',
})
