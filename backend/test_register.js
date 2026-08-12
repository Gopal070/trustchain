// backend/test_register.js
const blockchainService = require("./services/blockchainService");
require("dotenv").config();

async function test() {
  try {
    const certId = "TEST-" + Date.now();
    const hash = "0000000000000000000000000000000000000000000000000000000000009999";
    console.log("Testing registration for ID:", certId);
    const result = await blockchainService.addCertificate(certId, hash, "", "Test Student", "B.Tech", 2026);
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
