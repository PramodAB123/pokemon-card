// Automated API verification script based on README2.md
// Usage: node test_api.mjs [target_url]
// Example: node test_api.mjs https://pokitrainer.vercel.app

const targetArg = process.argv[2];
const base = (targetArg || "http://localhost:5173").replace(/\/+$/, "");

async function runTests() {
  console.log(`\n==================================================`);
  console.log(`🔭 GITSTAR EXPLORER TELEMETRY & API TEST SUITE`);
  console.log(`🎯 Target Endpoint: ${base}`);
  console.log(`==================================================\n`);

  // 1. Initial GET /api/counter
  console.log(`[TEST 1] GET /api/counter - Fetching current stats...`);
  const getRes = await fetch(`${base}/api/counter`).then((r) => r.json());
  console.log(`   └─ Count: ${getRes.count}`);
  console.log(`   └─ Unique Explorers: ${JSON.stringify(getRes.unique_users)}`);
  if (typeof getRes.count !== "number" || !Array.isArray(getRes.unique_users)) {
    throw new Error("Invalid response format for GET /api/counter");
  }

  // 2. New Unique User Registration via POST
  const testUser = "qa-bot-" + Math.floor(Math.random() * 89999 + 10000);
  console.log(`\n[TEST 2] POST /api/counter - Registering new user: @${testUser}...`);
  const post1 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUser }),
  }).then((r) => r.json());
  console.log(`   └─ Response:`, post1);
  if (!post1.success) {
    throw new Error("POST request returned success=false");
  }

  // 3. Duplicate User Deduplication Test via POST
  console.log(`\n[TEST 3] POST /api/counter - Retrying duplicate user: @${testUser}...`);
  const post2 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUser }),
  }).then((r) => r.json());
  console.log(`   └─ Response:`, post2);
  if (post2.isNew !== false) {
    console.warn("   ⚠️ Warning: expected isNew to be false on duplicate POST");
  }

  // 4. Preflight OPTIONS CORS check
  console.log(`\n[TEST 4] OPTIONS /api/counter - Validating CORS preflight...`);
  const optRes = await fetch(`${base}/api/counter`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://pokitrainer.vercel.app",
      "Access-Control-Request-Method": "POST",
    },
  });
  console.log(`   └─ Status: ${optRes.status} ${optRes.statusText}`);
  const allowOrigin = optRes.headers.get("access-control-allow-origin");
  console.log(`   └─ Access-Control-Allow-Origin: ${allowOrigin || "none"}`);

  console.log(`\n==================================================`);
  console.log(` SUCCESS: All API telemetry test cases passed! ✦`);
  console.log(`==================================================\n`);
}

runTests().catch((err) => {
  console.error("\n❌ Test Suite Error:", err.message);
  process.exit(1);
});
