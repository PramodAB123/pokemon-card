import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

let fallbackDevUsers = new Set()

const currentDir = typeof import.meta.dirname !== 'undefined'
  ? import.meta.dirname
  : path.dirname(new URL(import.meta.url).pathname);

function getUpstashCredentials() {
  const candidatePaths = [
    path.resolve(currentDir, '../.env.local'),
    path.resolve(currentDir, '.env.local'),
    path.resolve(currentDir, '../.env'),
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
        if (req.url && req.url.startsWith('/api/health')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ status: 'ok', upstash: getUpstashCredentials() ? 'ok' : 'unconfigured', version: '1.0.0' }))
          return
        }

        if (req.url && req.url.startsWith('/api/counter')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Test-Mode')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          const isTestMode = req.headers['x-test-mode'] === 'true'

          if (req.method === 'POST') {
            let bodyStr = ''
            req.on('data', (chunk) => {
              bodyStr += chunk
            })
            req.on('end', async () => {
              if (isTestMode) {
                res.end(
                  JSON.stringify({
                    count: 1,
                    cards_generated: 1,
                    unique_users: [],
                    isNew: true,
                    success: true,
                    _test_mode: true,
                  })
                )
                return
              }

              let username = ''
              try {
                const parsed = JSON.parse(bodyStr)
                username = parsed.username ? String(parsed.username).trim().toLowerCase().replace(/^@/, '') : ''
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
              let uniqueUsers = await fetchRedisDirect('SMEMBERS', 'gtc:unique_users')

              if (count !== null && count !== undefined) {
                await fetchRedisDirect('SET', 'gtc:cards_generated', String(count))
              } else {
                count = fallbackDevUsers.size
                uniqueUsers = Array.from(fallbackDevUsers)
              }

              res.end(
                JSON.stringify({
                  count: Number(count || 0),
                  cards_generated: Number(count || 0),
                  unique_users: Array.isArray(uniqueUsers) ? uniqueUsers : [],
                  isNew,
                  success: true,
                })
              )
            })
            return
          }

          // GET /api/counter
          if (isTestMode) {
            res.end(
              JSON.stringify({
                count: 0,
                cards_generated: 0,
                unique_users: [],
                _test_mode: true,
              })
            )
            return
          }

          ;(async () => {
            let count = await fetchRedisDirect('SCARD', 'gtc:unique_users')
            let uniqueUsers = await fetchRedisDirect('SMEMBERS', 'gtc:unique_users')

            if (count === null || count === undefined) {
              count = await fetchRedisDirect('GET', 'gtc:cards_generated')
            }
            if (count === null || count === undefined) {
              count = fallbackDevUsers.size
            }
            if (!uniqueUsers) {
              uniqueUsers = Array.from(fallbackDevUsers)
            }

            res.end(
              JSON.stringify({
                count: Number(count || 0),
                cards_generated: Number(count || 0),
                unique_users: Array.isArray(uniqueUsers) ? uniqueUsers : [],
              })
            )
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
