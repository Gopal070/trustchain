// test_upload.js — Uploads test-cert.txt to the backend for trust score verification
const fs = require("fs");
const path = require("path");

async function main() {
  const filePath = path.join(__dirname, "../test-cert.png");
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: "image/png" });
  const file = new File([blob], "test-cert.png", { type: "image/png" });

  const formData = new FormData();
  formData.append("certificate", file);
  formData.append("issuerName", "IIT Delhi");

  console.log("Uploading test-cert.txt to http://localhost:5000/api/verify...");

  const res = await fetch("http://localhost:5000/api/verify", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("\n=== TRUST SCORE RESULT ===");
  console.log(JSON.stringify(data, null, 2));
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
