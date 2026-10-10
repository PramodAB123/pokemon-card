// Vercel Serverless Function: /api/counter and /api/counter/increment

async function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return { url: url.replace(/\/+$/, ""), token };
  return null;
}

async function fetchRedis(command, ...args) {
  const cfg = await getRedisConfig();
  if (!cfg) return null;
  try {
    // Official Upstash REST POST format: robust against special chars, slashes, and casing
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([command.toUpperCase(), ...args]),
    });
    if (!res.ok) {
      console.error("Upstash HTTP error:", res.status, await res.text());
      return null;
    }
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

    if (rawUsername && typeof rawUsername === "string") {
      const cleanUser = rawUsername.trim().toLowerCase();
      // SADD returns 1 if newly added, 0 if already existed in the set
      const saddResult = await fetchRedis("SADD", "gtc:unique_users", cleanUser);
      isNew = saddResult === 1 ? 1 : 0;
    }

    let count = null;
    if (isNew === 1) {
      count = await fetchRedis("INCR", "gtc:cards_generated");
    } else {
      count = await fetchRedis("GET", "gtc:cards_generated");
    }

    // Fallback if counter was not initialized: use cardinality of unique users set
    if (count === null || count === undefined) {
      count = await fetchRedis("SCARD", "gtc:unique_users") || 0;
    }

    return res.status(200).json({
      count: Number(count || 0),
      isNew: isNew === 1,
      success: true,
    });
  }

  // GET request
  let count = await fetchRedis("GET", "gtc:cards_generated");
  if (count === null || count === undefined) {
    count = await fetchRedis("SCARD", "gtc:unique_users") || 0;
  }
  return res.status(200).json({ count: Number(count || 0) });
}
