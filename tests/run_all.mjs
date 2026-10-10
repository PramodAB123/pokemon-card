// tests/run_all.mjs - Master Test Runner for GitStar Explorer
// Usage: node tests/run_all.mjs [target_url]
// Example: node tests/run_all.mjs http://localhost:5173
// Example: node tests/run_all.mjs https://pokitrainer.vercel.app

import { runApiCounterTests } from "./api_counter.test.mjs";
import { runCorsSecurityTests } from "./cors_security.test.mjs";
import { runUiSanitizationTests } from "./ui_sanitization.test.mjs";
import { runRateLimitTests } from "./rate_limit.test.mjs";

const targetArg = process.argv[2];
const base = (targetArg || "http://localhost:5173").replace(/\/+$/, "");

async function runMasterSuite() {
  const startTime = Date.now();
  console.log(`\n==================================================================`);
  console.log(` 🚀 GITSTAR EXPLORER — FULL TEST SUITE RUNNER (README2 SPEC)`);
  console.log(` 🎯 Target Environment: ${base}`);
  console.log(` 📅 Execution Time: ${new Date().toISOString()}`);
  console.log(`==================================================================`);

  let suitesPassed = 0;
  let suitesFailed = 0;

  // 1. API & Redis Counter Suite
  try {
    await runApiCounterTests(base);
    suitesPassed++;
  } catch (err) {
    console.error(`  ❌ API Counter Suite Failed: ${err.message}`);
    suitesFailed++;
  }

  // 2. CORS Security Suite
  try {
    await runCorsSecurityTests(base);
    suitesPassed++;
  } catch (err) {
    console.error(`  ❌ CORS Security Suite Failed: ${err.message}`);
    suitesFailed++;
  }

  // 3. UI Sanitization & 404 Suite
  try {
    await runUiSanitizationTests(base);
    suitesPassed++;
  } catch (err) {
    console.error(`  ❌ UI Sanitization Suite Failed: ${err.message}`);
    suitesFailed++;
  }

  // 4. Rate Limit & Resilience Suite
  try {
    await runRateLimitTests(base);
    suitesPassed++;
  } catch (err) {
    console.error(`  ❌ Rate Limit Suite Failed: ${err.message}`);
    suitesFailed++;
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n==================================================================`);
  console.log(` 📊 SUMMARY REPORT`);
  console.log(` ├─ Test Suites Executed : ${suitesPassed + suitesFailed}`);
  console.log(` ├─ Suites Passed        : ${suitesPassed} ✅`);
  console.log(` ├─ Suites Failed        : ${suitesFailed} ${suitesFailed > 0 ? '❌' : ''}`);
  console.log(` └─ Total Duration       : ${durationSec}s`);
  console.log(`==================================================================`);

  if (suitesFailed > 0) {
    console.error(`\n❌ Full test suite completed with ${suitesFailed} failure(s).`);
    process.exit(1);
  } else {
    console.log(`\n✦ ALL TEST SUITES PASSED! Subspace Telemetry Fully Verified ✦\n`);
  }
}

runMasterSuite();
