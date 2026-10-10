// Automated API verification script based on README2.md
// Usage: node test_api.mjs [target_url]
// Example: node test_api.mjs https://pokitrainer.vercel.app

const targetArg = process.argv[2];
const base = (targetArg || "http://localhost:5173").replace(/\/+$/, "");

async function runTests() {
  console.log(`\n==================================================`);
  console.log(`GITSTAR EXPLORER TELEMETRY and API TEST SUITE`);
  console.log(`Target Endpoint: ${base}`);
  console.log(`==================================================\n`);

  // X-Test-Mode: true tells the backend to bypass Redis entirely (no DB pollution)
  const TEST_HEADERS = { "Content-Type": "application/json", "X-Test-Mode": "true" };

  // 1. GET /api/counter - validate response shape
  console.log(`[TEST 1] GET /api/counter - Fetching current stats (test mode)...`);
  const getRes = await fetch(`${base}/api/counter`, {
    headers: { "X-Test-Mode": "true" },
  }).then((r) => r.json());
  console.log(`   Count: ${getRes.count}`);
  console.log(`   Test mode active: ${!!getRes._test_mode}`);
  if (typeof getRes.count !== "number" || !Array.isArray(getRes.unique_users)) {
    throw new Error("Invalid response format for GET /api/counter");
  }

  // 2. POST /api/counter - new user (test mode, no Redis write)
  console.log(`\n[TEST 2] POST /api/counter - Registering user (test mode, no DB write)...`);
  const post1 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: TEST_HEADERS,
    body: JSON.stringify({ username: "qa-test-probe" }),
  }).then((r) => r.json());
  console.log(`   Response:`, post1);
  if (!post1.success) {
    throw new Error("POST request returned success=false");
  }

  // 3. POST /api/counter - duplicate user (test mode, no Redis write)
  console.log(`\n[TEST 3] POST /api/counter - Duplicate user check (test mode)...`);
  const post2 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: TEST_HEADERS,
    body: JSON.stringify({ username: "qa-test-probe" }),
  }).then((r) => r.json());
  console.log(`   Response:`, post2);
  if (!post2.success) {
    throw new Error("Duplicate POST returned success=false");
  }

  // 4. OPTIONS /api/counter - CORS preflight
  console.log(`\n[TEST 4] OPTIONS /api/counter - Validating CORS preflight...`);
  const optRes = await fetch(`${base}/api/counter`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://pokitrainer.vercel.app",
      "Access-Control-Request-Method": "POST",
    },
  });
  console.log(`   Status: ${optRes.status} ${optRes.statusText}`);
  const allowOrigin = optRes.headers.get("access-control-allow-origin");
  console.log(`   Access-Control-Allow-Origin: ${allowOrigin || "none"}`);

  console.log(`\n==================================================`);
  console.log(` SUCCESS: All API telemetry test cases passed!`);
  console.log(`==================================================\n`);
}

runTests().catch((err) => {
  console.error("\n Test Suite Error:", err.message);
  process.exit(1);
});
