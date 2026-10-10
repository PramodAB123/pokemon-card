// Vercel Serverless Function: /api/counter and /api/counter/increment

async function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return { url, token };
  return null;
}

async function fetchRedis(command, ...args) {
  const cfg = await getRedisConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/${[command, ...args].join("/")}`, {
      headers: { Authorization: `Bearer ${cfg.token}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch (e) {
    console.error("Upstash Redis error:", e);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    let body = {};
    if (typeof req.body === "string") {
      try { body = JSON.parse(req.body); } catch {}
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }

    const rawUsername = body.username;
    let isNew = 1;

    // If username is supplied, track uniqueness with Redis Set
    if (rawUsername && typeof rawUsername === "string") {
      const cleanUser = rawUsername.trim().toLowerCase();
      // SADD returns 1 if new member added to set, 0 if already present
      const added = await fetchRedis("sadd", "gtc:unique_users", cleanUser);
      isNew = added === 1 ? 1 : 0;
    }

    let count;
    if (isNew === 1) {
      count = await fetchRedis("incr", "gtc:cards_generated");
      if (count === null) {
        // Fallback to set cardinality
        count = await fetchRedis("scard", "gtc:unique_users") || 1;
      }
    } else {
      // Username already generated previously -> do not increment
      count = await fetchRedis("get", "gtc:cards_generated");
      if (count === null) {
        count = await fetchRedis("scard", "gtc:unique_users") || 0;
      }
    }

    return res.status(200).json({
      count: Number(count || 0),
      isNew: isNew === 1,
      success: true,
    });
  }

  // GET request: retrieve current count
  let count = await fetchRedis("get", "gtc:cards_generated");
  if (count === null) {
    count = await fetchRedis("scard", "gtc:unique_users") || 0;
  }
  return res.status(200).json({ count: Number(count || 0) });
}
