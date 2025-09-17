import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ remplace REPO_NAME par le nom EXACT de ta repo GitHub
export default defineConfig({
  plugins: [react()],
  base: '/travail-matija/', 
})
