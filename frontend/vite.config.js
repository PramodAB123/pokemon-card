import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

let fallbackDevUsers = new Set()

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
        return {
          url: urlMatch[1].trim().replace(/\/+$/, ''),
          token: tokenMatch[1].trim(),
        }
      }
    }
  }
  return null
}

async function fetchRedisDirect(command, ...args) {
  const creds = getUpstashCredentials()
  if (!creds) return null
  try {
    const res = await fetch(creds.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([command.toUpperCase(), ...args]),
    })
    if (!res.ok) {
      console.error('Vite dev Upstash error:', res.status, await res.text())
      return null
    }
    const json = await res.json()
    return json.result
  } catch (err) {
    console.error('Vite dev Upstash network error:', err)
    return null
  }
}

function devApiMiddleware() {
  return {
    name: 'dev-api-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
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

              let isNew = false
              if (username) {
                const saddRes = await fetchRedisDirect('SADD', 'gtc:unique_users', username)
                if (saddRes !== null && saddRes !== undefined) {
                  isNew = saddRes === 1
                } else {
                  isNew = !fallbackDevUsers.has(username)
                  fallbackDevUsers.add(username)
                }
              }

              // Count is strictly derived from unique_users size
              let count = await fetchRedisDirect('SCARD', 'gtc:unique_users')
              if (count !== null && count !== undefined) {
                await fetchRedisDirect('SET', 'gtc:cards_generated', String(count))
              } else {
                count = fallbackDevUsers.size
              }

              res.end(
                JSON.stringify({
                  count: Number(count || 0),
                  isNew,
                  success: true,
                })
              )
            })
            return
          }

          // GET /api/counter
          ;(async () => {
            let count = await fetchRedisDirect('SCARD', 'gtc:unique_users')
            if (count === null || count === undefined) {
              count = await fetchRedisDirect('GET', 'gtc:cards_generated')
            }
            if (count === null || count === undefined) {
              count = fallbackDevUsers.size
            }
            res.end(JSON.stringify({ count: Number(count || 0) }))
          })()
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
