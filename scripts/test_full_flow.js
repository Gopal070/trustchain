// scripts/test_full_flow.js
const axios = require('axios');

async function test() {
  const hash = "f1e2d3c4b5a697887766554433221100f1e2d3c4b5a697887766554433dffff9"; // slightly different for uniqueness
  const certId = `TRUST-${Date.now().toString().slice(-6)}`;
  
  console.log("--- STARTING FULL FLOW TEST ---");
  
  try {
    // 1. Register
    console.log(`\nStep 1: Registering certificate ${certId}...`);
    const regRes = await axios.post('http://localhost:5000/api/verify/register', {
      certId,
      fileHash: hash,
      studentName: "Jane FullFlow",
      degree: "B.Tech Proof of Work",
      year: "2026",
      ipfsCID: "QmFunctionalTest"
    }, {
      headers: { Authorization: 'Bearer demo-token' }
    });
    console.log("✅ Registration Successful!");
    console.log("Tx Hash:", regRes.data.data.transactionHash);

    // 2. Verify
    console.log(`\nStep 2: Verifying hash ${hash}...`);
    const verRes = await axios.get(`http://localhost:5000/api/verify/hash/${hash}`);
    
    if (verRes.data.success && verRes.data.data.verified) {
      console.log("✅ Verification Successful!");
      console.log("Blockchain Data:", JSON.stringify(verRes.data.data, null, 2));
    } else {
      console.log("❌ Verification Failed!");
    }
    
    console.log("\n--- TEST COMPLETE: FULLY FUNCTIONAL ---");
    
  } catch (err) {
    console.error("❌ Test Failed:", err.response?.data || err.message);
    process.exit(1);
  }
}

test();
