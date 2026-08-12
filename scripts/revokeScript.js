// smart-contract/scripts/revokeScript.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n============================================");
  console.log("   TrustChain — Certificate Revocation");
  console.log("============================================\n");

  // ==================== CONTRACT CONNECT ====================
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not found in .env file!");
  }

  const CertificateRegistry = await hre.ethers.getContractFactory(
    "CertificateRegistry"
  );
  const contract = CertificateRegistry.attach(contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Wallet: ${deployer.address}\n`);

  // ==================== HASH TO REVOKE ====================
  // Yeh hash change karo jis certificate ko revoke karna hai
  const hashToRevoke =
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";

  // ==================== PRE-CHECK ====================
  console.log("--- Pre-Revocation Check ---");
  const before = await contract.verifyCertificate(hashToRevoke);

  if (!before[0]) {
    console.log("❌ Certificate not found on blockchain. Cannot revoke.");
    return;
  }

  if (before[5]) {
    console.log("⚠️  Certificate is already revoked!");
    console.log(`   Cert ID: ${before[1]}`);
    return;
  }

  console.log(`Certificate found: ${before[1]}`);
  console.log(`Issuer: ${before[3]}`);
  console.log(`Revoked: ${before[5]}`);
  console.log("");

  // ==================== REVOKE ====================
  console.log("Sending revocation transaction...");
  const tx = await contract.revokeCertificate(hashToRevoke);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...\n");

  const receipt = await tx.wait();

  console.log("============================================");
  console.log("   ✅ CERTIFICATE REVOKED SUCCESSFULLY!");
  console.log("============================================");
  console.log(`Transaction: ${receipt.hash}`);
  console.log(`Block:       ${receipt.blockNumber}`);
  console.log(`Gas Used:    ${receipt.gasUsed.toString()}`);

  // ==================== POST-CHECK ====================
  console.log("\n--- Post-Revocation Check ---");
  const after = await contract.verifyCertificate(hashToRevoke);
  console.log(`Found:    ${after[0]}`);
  console.log(`Cert ID:  ${after[1]}`);
  console.log(`Revoked:  ${after[5]} ← Should be TRUE now`);
  console.log("\nDone! ✅\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Revocation failed:", error.message);
    process.exit(1);
  });