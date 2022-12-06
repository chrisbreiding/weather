import { defineConfig } from 'vite'
import rewriteAll from 'vite-plugin-rewrite-all'

export default defineConfig({
  // fixes vite not handling periods in the URL
  plugins: [rewriteAll()],
  server: {
    port: 8088,
  },
})
