import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import http from 'node:http'

let devCounter = 128

function devApiMiddleware() {
  return {
    name: 'dev-api-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/counter')) {
          const backendReq = http.request(
            {
              hostname: '127.0.0.1',
              port: 8000,
              path: req.url,
              method: req.method,
              headers: { ...req.headers, host: '127.0.0.1:8000' },
              timeout: 300,
            },
            (backendRes) => {
              res.writeHead(backendRes.statusCode || 200, backendRes.headers)
              backendRes.pipe(res)
            }
          )

          backendReq.on('error', () => {
            // Backend offline: serve local fallback count without proxy error spam
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            if (req.method === 'POST') {
              devCounter += 1
            }
            res.end(JSON.stringify({ count: devCounter, offline: true }))
          })

          backendReq.on('timeout', () => {
            backendReq.destroy()
          })

          if (req.method === 'POST') {
            req.pipe(backendReq)
          } else {
            backendReq.end()
          }
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiMiddleware()],
})
