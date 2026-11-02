import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = '/louryx/'

// En desarrollo, "localhost:5173/louryx" (sin la barra final) lleva solo a "/louryx/"
const slashRedirect = () => ({
  name: 'louryx-slash-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === base.slice(0, -1) || req.url.startsWith(`${base.slice(0, -1)}?`)) {
        res.statusCode = 302
        res.setHeader('Location', base + req.url.slice(base.length - 1))
        res.end()
      } else next()
    })
  },
})

export default defineConfig({ plugins: [react(), slashRedirect()], base })
