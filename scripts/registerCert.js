// scripts/registerCert.js
const hre = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config();

// ========== EDIT THIS DATA ==========
const CERT_DATA = {
  certId: "IIT-2023-CS-001",
  filePath: "./sample-certificates/degree.pdf",
  studentName: "Rahul Sharma",
  degree: "B.Tech Computer Science",
  year: 2023,
  ipfsCID: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
};
// =====================================

async function main() {
  // File read karke SHA-256 hash generate karo
  const fileBuffer = fs.readFileSync(CERT_DATA.filePath);
  const hash = crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");

  console.log("File:", CERT_DATA.filePath);
  console.log("SHA-256 Hash:", hash);
  console.log("Cert ID:", CERT_DATA.certId);
  console.log("");

  // Deployed contract se connect karo
  const [signer] = await hre.ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS .env mein set nahi hai!");
  }

  const CertificateRegistry = await hre.ethers.getContractFactory(
    "CertificateRegistry"
  );
  const registry = CertificateRegistry.attach(contractAddress);

  // Certificate register karo
  console.log("Sending transaction...");
  const tx = await registry.addCertificate(
    CERT_DATA.certId,
    hash,
    CERT_DATA.ipfsCID,
    CERT_DATA.studentName,
    CERT_DATA.degree,
    CERT_DATA.year
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait(1);
  console.log("Confirmed in block:", receipt.blockNumber);
  console.log("\nCertificate registered successfully!");
  console.log("Ab koi bhi is hash se verify kar sakta hai:");
  console.log(hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
