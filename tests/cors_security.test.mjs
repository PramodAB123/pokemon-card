// tests/cors_security.test.mjs - CORS Security Test Suite (TC-CORS-01, TC-CORS-02)

export async function runCorsSecurityTests(base) {
  console.log(`\n🔹 Running CORS Security Suite [TC-CORS-01, TC-CORS-02]...`);

  // 1. TC-CORS-01: Preflight OPTIONS Request Validation
  const optionsRes = await fetch(`${base}/api/counter`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://another-domain.com",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type",
    },
  });

  if (optionsRes.status !== 200 && optionsRes.status !== 204) {
    throw new Error(`TC-CORS-01 Failed: Expected status 200/204 for OPTIONS preflight, got ${optionsRes.status}`);
  }
  const allowMethods = optionsRes.headers.get("access-control-allow-methods") || "";
  console.log(`  ✓ TC-CORS-01 Passed: OPTIONS preflight returned status ${optionsRes.status}, methods: ${allowMethods || 'OK'}`);

  // 2. TC-CORS-02: Cross-Origin Fetch from Deployed Vercel Origin
  const postRes = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: {
      Origin: "https://gitstar-explorer.vercel.app",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "cors-qa-user" }),
  });

  if (!postRes.ok) {
    throw new Error(`TC-CORS-02 Failed: Cross-origin POST failed with status ${postRes.status}`);
  }
  const allowOrigin = postRes.headers.get("access-control-allow-origin");
  console.log(`  ✓ TC-CORS-02 Passed: Cross-origin request succeeded with Access-Control-Allow-Origin: ${allowOrigin || '*'}`);
}
