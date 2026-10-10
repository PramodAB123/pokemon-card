import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

let fallbackDevCounter = 0
const devSeenUsers = new Set()

function getUpstashCredentials() {
  const candidatePaths = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '.env.local'),
    path.resolve(__dirname, '../.env'),
  ]
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8')
      const urlMatch = content.match(/(?:KV_REST_API_URL|UPSTASH_REDIS_REST_URL)=["']?([^"'\r\n]+)/)
      const tokenMatch = content.match(/(?:KV_REST_API_TOKEN|UPSTASH_REDIS_REST_TOKEN)=["']?([^"'\r\n]+)/)
      if (urlMatch && tokenMatch) {
        return { url: urlMatch[1].trim(), token: tokenMatch[1].trim() }
      }
    }
  }
  return null
}

async function fetchRedisDirect(command, ...args) {
  const creds = getUpstashCredentials()
  if (!creds) return null
  try {
    const endpoint = `${creds.url}/${[command, ...args].join('/')}`
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${creds.token}` },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.result
  } catch (err) {
    return null
  }
}

function devApiMiddleware() {
  return {
    name: 'dev-api-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/counter')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')

          if (req.method === 'POST') {
            let bodyStr = ''
            req.on('data', (chunk) => {
              bodyStr += chunk
            })
            req.on('end', async () => {
              let username = ''
              try {
                const parsed = JSON.parse(bodyStr)
                username = parsed.username ? String(parsed.username).trim().toLowerCase() : ''
              } catch {}

              let isNew = 1
              // Attempt Upstash Redis SADD for unique username tracking
              if (username) {
                const redisSadd = await fetchRedisDirect('sadd', 'gtc:unique_users', username)
                if (redisSadd !== null) {
                  isNew = redisSadd === 1 ? 1 : 0
                } else {
                  // Local memory fallback
                  isNew = devSeenUsers.has(username) ? 0 : 1
                  devSeenUsers.add(username)
                }
              }

              let count = null
              if (isNew === 1) {
                count = await fetchRedisDirect('incr', 'gtc:cards_generated')
                if (count === null) {
                  fallbackDevCounter += 1
                  count = fallbackDevCounter
                }
              } else {
                count = await fetchRedisDirect('get', 'gtc:cards_generated')
                if (count === null) {
                  count = fallbackDevCounter
                }
              }

              res.end(
                JSON.stringify({
                  count: Number(count || 0),
                  isNew: isNew === 1,
                  success: true,
                })
              )
            })
            return
          }

          // GET /api/counter
          let count = await fetchRedisDirect('get', 'gtc:cards_generated')
          if (count === null) {
            count = await fetchRedisDirect('scard', 'gtc:unique_users')
          }
          if (count === null) {
            count = fallbackDevCounter
          }

          res.end(JSON.stringify({ count: Number(count || 0) }))
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
