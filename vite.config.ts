import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

const ALLOWED_GUARDIAN_FEEDS: Record<string, string> = {
  '/api/guardian/australia-news/series/guardian-australia-s-morning-mail/rss':
    'https://www.theguardian.com/australia-news/series/guardian-australia-s-morning-mail/rss',
  '/api/guardian/world/rss': 'https://www.theguardian.com/world/rss',
  '/api/guardian/technology/rss': 'https://www.theguardian.com/technology/rss',
}

function guardianRssPlugin(): Plugin {
  const attachMiddleware = (middlewares: {
    use: (
      handler: (
        req: { url?: string },
        res: {
          statusCode: number
          setHeader: (k: string, v: string) => void
          end: (body: string) => void
        },
        next: () => void
      ) => void
    ) => void
  }) => {
    middlewares.use(async (req, res, next) => {
      const pathOnly = (req.url || '').split('?')[0]
      const targetUrl = ALLOWED_GUARDIAN_FEEDS[pathOnly]
      if (!targetUrl) return next()

      try {
        const upstream = await fetch(targetUrl, {
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
            'User-Agent': 'MinhaCentral-RSS-Reader/1.0',
          },
        })
        const xml = await upstream.text()
        res.statusCode = upstream.status
        res.setHeader('Content-Type', 'application/xml; charset=utf-8')
        res.setHeader('Cache-Control', 'max-age=300')
        res.end(xml)
      } catch {
        res.statusCode = 502
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('Erro ao conectar ao feed do The Guardian.')
      }
    })
  }

  return {
    name: 'guardian-rss-middleware',
    configureServer(server) {
      attachMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), guardianRssPlugin()],
})
