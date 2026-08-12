// smart-contract/scripts/verifyExisting.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n============================================");
  console.log("   TrustChain — Certificate Verification");
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

  // ==================== VERIFY BY HASH ====================
  const hashToVerify =
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";

  console.log("--- Verify by Hash ---");
  console.log(`Hash: ${hashToVerify}\n`);

  const hashResult = await contract.verifyCertificate(hashToVerify);

  if (hashResult[0]) {
    console.log("✅ CERTIFICATE FOUND ON BLOCKCHAIN!");
    console.log(`   Cert ID:     ${hashResult[1]}`);
    console.log(`   Issuer Addr: ${hashResult[2]}`);
    console.log(`   Issuer Name: ${hashResult[3]}`);
    console.log(
      `   Registered:  ${new Date(Number(hashResult[4]) * 1000).toISOString()}`
    );
    console.log(`   Revoked:     ${hashResult[5]}`);

    if (hashResult[5]) {
      console.log("\n⚠️  WARNING: This certificate has been REVOKED!");
    }
  } else {
    console.log("❌ CERTIFICATE NOT FOUND ON BLOCKCHAIN!");
    console.log("   This certificate may be fake or not yet registered.");
  }

  // ==================== VERIFY BY CERT ID ====================
  const certIdToVerify = "CERT-2025-001";

  console.log(`\n--- Verify by Cert ID ---`);
  console.log(`Cert ID: ${certIdToVerify}\n`);

  const idResult = await contract.getCertificateById(certIdToVerify);

  if (idResult[0]) {
    console.log("✅ CERTIFICATE FOUND!");
    console.log(`   File Hash:   ${idResult[1]}`);
    console.log(`   Issuer Addr: ${idResult[2]}`);
    console.log(`   Issuer Name: ${idResult[3]}`);
    console.log(
      `   Registered:  ${new Date(Number(idResult[4]) * 1000).toISOString()}`
    );
    console.log(`   Revoked:     ${idResult[5]}`);
  } else {
    console.log("❌ CERTIFICATE NOT FOUND!");
  }

  // ==================== CHECK ISSUER ====================
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\n--- Issuer Info ---`);
  console.log(`Address: ${deployer.address}\n`);

  const issuerResult = await contract.getIssuerInfo(deployer.address);

  if (issuerResult[0]) {
    console.log("✅ AUTHORIZED ISSUER");
    console.log(`   Name: ${issuerResult[1]}`);
    console.log(
      `   Authorized: ${new Date(
        Number(issuerResult[2]) * 1000
      ).toISOString()}`
    );
  } else {
    console.log("❌ NOT AN AUTHORIZED ISSUER");
  }

  console.log("\nDone! ✅\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  });