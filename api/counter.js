// Vercel Serverless Function: /api/counter and /api/counter/increment

async function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.STORAGE_REST_API_URL_REDIS_REST_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_URL_REDIS_REST_TOKEN;
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
    let count = await fetchRedis("incr", "gtc:cards_generated");
    if (count === null) {
      count = 1;
    }
    return res.status(200).json({ count: Number(count), success: true });
  }

  // GET request
  let count = await fetchRedis("get", "gtc:cards_generated");
  if (count === null) {
    count = 0;
  }
  return res.status(200).json({ count: Number(count) });
}
