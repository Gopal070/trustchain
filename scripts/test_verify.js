// test_verify.js — reads last_hash.txt and calls the backend verify endpoint
const fs = require("fs");
const path = require("path");

async function main() {
  const hash = fs.readFileSync(path.join(__dirname, "../last_hash.txt"), "utf8").trim();
  console.log("Testing hash:", hash);
  console.log("Hash length:", hash.length);

  // 1. Test health endpoint
  const healthRes = await fetch("http://localhost:5000/api/health");
  const healthData = await healthRes.json();
  console.log("\n=== HEALTH CHECK ===");
  console.log(JSON.stringify(healthData, null, 2));

  // 2. Test verify/hash endpoint
  const verifyRes = await fetch(`http://localhost:5000/api/verify/hash/${hash}`);
  const verifyData = await verifyRes.json();
  console.log("\n=== VERIFY BY HASH ===");
  console.log(JSON.stringify(verifyData, null, 2));
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
