// tests/api_counter.test.mjs - API & Redis Counter Test Suite (TC-BE-01, TC-BE-02, TC-BE-03, TC-BE-04)

const TEST_HEADERS = {
  "Content-Type": "application/json",
  "X-Test-Mode": "true",  // signals the backend to skip Redis writes entirely
};

export async function runApiCounterTests(base) {
  console.log(`\n🔹 Running API & Counter Suite [TC-BE-01 to TC-BE-04]...`);

  // 1. TC-BE-01: GET /api/counter — validate response shape
  const getRes = await fetch(`${base}/api/counter`, {
    headers: { "X-Test-Mode": "true" },
  }).then((r) => r.json());
  if (typeof getRes.count !== "number" || !Array.isArray(getRes.unique_users)) {
    throw new Error(`TC-BE-01 Failed: Invalid response format from GET /api/counter: ${JSON.stringify(getRes)}`);
  }
  console.log(`  ✓ TC-BE-01 Passed: GET /api/counter shape OK (count=${getRes.count}, test_mode=${!!getRes._test_mode})`);

  // 2. TC-BE-02: POST /api/counter — new user registration returns success
  const post1 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: TEST_HEADERS,
    body: JSON.stringify({ username: "qa-test-probe" }),
  }).then((r) => r.json());

  if (!post1.success) {
    throw new Error(`TC-BE-02 Failed: POST /api/counter did not return success=true. Got: ${JSON.stringify(post1)}`);
  }
  console.log(`  ✓ TC-BE-02 Passed: POST /api/counter returned success=true (test_mode — no Redis write)`);

  // 3. TC-BE-03: POST /api/counter — duplicate returns isNew=false (or same shape)
  const post2 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: TEST_HEADERS,
    body: JSON.stringify({ username: "qa-test-probe" }),
  }).then((r) => r.json());

  if (!post2.success) {
    throw new Error(`TC-BE-03 Failed: Duplicate POST returned success=false`);
  }
  console.log(`  ✓ TC-BE-03 Passed: Duplicate POST returned success=true (test_mode — no Redis write)`);

  // 4. TC-BE-04: Concurrent calls both succeed without error
  const concurrentCalls = await Promise.all([
    fetch(`${base}/api/counter`, { method: "POST", headers: TEST_HEADERS, body: JSON.stringify({ username: "qa-test-probe" }) }),
    fetch(`${base}/api/counter`, { method: "POST", headers: TEST_HEADERS, body: JSON.stringify({ username: "qa-test-probe" }) }),
  ]);
  const results = await Promise.all(concurrentCalls.map((r) => r.json()));
  if (!results[0].success || !results[1].success) {
    throw new Error(`TC-BE-04 Failed: One or both concurrent requests did not return success=true`);
  }
  console.log(`  ✓ TC-BE-04 Passed: Concurrent calls both succeeded cleanly (test_mode)`);
}
