// smart-contract/scripts/batchRegister.js
const hre = require("hardhat");
const crypto = require("crypto");
require("dotenv").config();

async function main() {
  console.log("\n============================================");
  console.log("   TrustChain — Batch Certificate Registration");
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
  console.log(`Wallet: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // ==================== ISSUER CHECK ====================
  const issuerInfo = await contract.getIssuerInfo(deployer.address);
  if (!issuerInfo[0]) {
    console.log("Authorizing as issuer first...");
    const authTx = await contract.authorizeIssuer(
      deployer.address,
      "TrustChain Admin"
    );
    await authTx.wait();
    console.log("✅ Issuer authorized!\n");
  }

  // ==================== BATCH DATA ====================
  // Yeh array apne certificates ke data se replace karo
  const certificates = [
    {
      certId: "CERT-2025-001",
      fileHash: crypto.createHash("sha256").update("certificate-1-content").digest("hex"),
      issuerName: "IIT Delhi",
    },
    {
      certId: "CERT-2025-002",
      fileHash: crypto.createHash("sha256").update("certificate-2-content").digest("hex"),
      issuerName: "IIT Bombay",
    },
    {
      certId: "CERT-2025-003",
      fileHash: crypto.createHash("sha256").update("certificate-3-content").digest("hex"),
      issuerName: "Delhi University",
    },
    {
      certId: "CERT-2025-004",
      fileHash: crypto.createHash("sha256").update("certificate-4-content").digest("hex"),
      issuerName: "BITS Pilani",
    },
    {
      certId: "CERT-2025-005",
      fileHash: crypto.createHash("sha256").update("certificate-5-content").digest("hex"),
      issuerName: "NIT Trichy",
    },
  ];

  console.log(`Total certificates to register: ${certificates.length}\n`);

  // ==================== BATCH REGISTRATION ====================
  const results = {
    success: [],
    skipped: [],
    failed: [],
  };

  for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const progress = `[${i + 1}/${certificates.length}]`;

    try {
      // Duplicate check
      const existing = await contract.verifyCertificate(cert.fileHash);
      if (existing[0]) {
        console.log(`${progress} ⏭️  SKIPPED — ${cert.certId} (already exists)`);
        results.skipped.push(cert.certId);
        continue;
      }

      // Register
      console.log(`${progress} 📝 Registering ${cert.certId}...`);
      const tx = await contract.addCertificate(
        cert.certId,
        cert.fileHash,
        cert.issuerName
      );
      const receipt = await tx.wait();

      console.log(
        `${progress} ✅ ${cert.certId} — Block: ${receipt.blockNumber} | Gas: ${receipt.gasUsed.toString()}`
      );
      results.success.push({
        certId: cert.certId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });

      // Rate limiting — 2 second delay between transactions
      if (i < certificates.length - 1) {
        console.log(`   ⏳ Waiting 2 seconds before next transaction...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`${progress} ❌ FAILED — ${cert.certId}: ${error.message}`);
      results.failed.push({
        certId: cert.certId,
        error: error.message,
      });
    }
  }

  // ==================== SUMMARY ====================
  console.log("\n============================================");
  console.log("   BATCH REGISTRATION SUMMARY");
  console.log("============================================");
  console.log(`✅ Success:  ${results.success.length}`);
  console.log(`⏭️  Skipped:  ${results.skipped.length}`);
  console.log(`❌ Failed:   ${results.failed.length}`);
  console.log(`📊 Total:    ${certificates.length}`);

  if (results.success.length > 0) {
    console.log("\n--- Successful Registrations ---");
    results.success.forEach((r) => {
      console.log(`  ${r.certId} — TX: ${r.txHash}`);
    });
  }

  if (results.failed.length > 0) {
    console.log("\n--- Failed Registrations ---");
    results.failed.forEach((r) => {
      console.log(`  ${r.certId} — Error: ${r.error}`);
    });
  }

  // ==================== FINAL BALANCE ====================
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const spent = balance - finalBalance;
  console.log(`\n💰 ETH spent: ${hre.ethers.formatEther(spent)} ETH`);
  console.log(`💰 Remaining: ${hre.ethers.formatEther(finalBalance)} ETH\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Batch registration failed:", error.message);
    process.exit(1);
  });