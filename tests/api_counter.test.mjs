// tests/api_counter.test.mjs - API & Redis Counter Test Suite (TC-BE-01, TC-BE-02, TC-BE-03, TC-BE-04)

export async function runApiCounterTests(base) {
  console.log(`\n🔹 Running API & Counter Suite [TC-BE-01 to TC-BE-04]...`);

  // 1. TC-BE-01: GET /api/counter
  const getRes = await fetch(`${base}/api/counter`).then((r) => r.json());
  if (typeof getRes.count !== "number" || !Array.isArray(getRes.unique_users)) {
    throw new Error(`TC-BE-01 Failed: Invalid response format from GET /api/counter: ${JSON.stringify(getRes)}`);
  }
  console.log(`  ✓ TC-BE-01 Passed: GET /api/counter returned count=${getRes.count}, users=${getRes.unique_users.length}`);

  // 2. TC-BE-02: POST /api/counter (Unique User Addition)
  const testUser = "qa-test-explorer-" + Math.floor(Math.random() * 89999 + 10000);
  const post1 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUser }),
  }).then((r) => r.json());

  if (!post1.success || post1.count !== getRes.count + 1) {
    throw new Error(`TC-BE-02 Failed: Expected count to increment from ${getRes.count} to ${getRes.count + 1}. Got: ${JSON.stringify(post1)}`);
  }
  console.log(`  ✓ TC-BE-02 Passed: POST /api/counter added new user @${testUser} (New Count: ${post1.count})`);

  // 3. TC-BE-03: POST /api/counter (Duplicate Deduplication)
  const post2 = await fetch(`${base}/api/counter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUser }),
  }).then((r) => r.json());

  if (post2.count !== post1.count) {
    throw new Error(`TC-BE-03 Failed: Count changed on duplicate request! Previous: ${post1.count}, New: ${post2.count}`);
  }
  console.log(`  ✓ TC-BE-03 Passed: Duplicate user @${testUser} deduplicated cleanly (Count remained ${post2.count})`);

  // 4. TC-BE-04: StrictMode Double-Mount Handling
  const concurrentCalls = await Promise.all([
    fetch(`${base}/api/counter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: testUser }) }),
    fetch(`${base}/api/counter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: testUser }) }),
  ]);
  const results = await Promise.all(concurrentCalls.map(r => r.json()));
  if (results[0].count !== results[1].count) {
    throw new Error(`TC-BE-04 Failed: Concurrent requests caused double-increment!`);
  }
  console.log(`  ✓ TC-BE-04 Passed: Rapid concurrent calls deduplicated cleanly`);
}
