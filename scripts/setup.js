const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function main() {
  // Load ABI
  const abiPath = path.join(__dirname, "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const abi = artifact.abi;
  const contractAddress = "0xFF9b74BF7bb402f100AD2BBa468b3aFA10459996";

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Create contract instance
  const contract = new hre.ethers.Contract(contractAddress, abi, deployer);

  // 1. Check if deployer is authorized
  try {
    const issuerInfo = await contract.getIssuerInfo(deployer.address);
    const isActive = issuerInfo[1];
    if (isActive) {
      console.log("✅ Deployer is already authorized as issuer.");
    } else {
      console.log("Authorizing deployer...");
      const tx = await contract.authorizeIssuer(deployer.address, "TrustChain Admin");
      await tx.wait();
      console.log("✅ Authorized!");
    }
  } catch (e) {
    console.log("Error checking issuer, authorizing anyway...");
    const tx = await contract.authorizeIssuer(deployer.address, "TrustChain Admin");
    await tx.wait();
    console.log("✅ Authorized!");
  }

  // 2. Generate unique certificate ID and SHA-256 hash
  const uniqueId = Date.now().toString();
  const certificateId = `CERT-${uniqueId.slice(-6)}`;
  const fileHash = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const ipfsCID = `Qm${crypto.randomBytes(16).toString('hex')}`;
  const studentName = "John Doe";
  const degree = "Bachelor of Technology in Computer Science";
  const issuedYear = 2026;

  console.log("Using certificate ID:", certificateId);
  console.log("Using file hash:", fileHash);

  console.log("Adding certificate...");
  try {
    const tx = await contract.addCertificate(
      certificateId,
      fileHash,
      ipfsCID,
      studentName,
      degree,
      issuedYear 
    );
    await tx.wait();
    console.log("✅ Certificate added!");
  } catch (e) {
    console.log("Failed to add certificate:", e.message);
    return;
  }

  // 3. Verify using the file hash
  console.log("Verifying certificate...");
  try {
    const result = await contract.verifyCertificate(fileHash);
    console.log("Verification result:");
    console.log("  Found:", result[0]);
    console.log("  Valid:", result[1]);
    console.log("  Cert ID:", result[2]);
    console.log("  Issuer:", result[3]);
    console.log("  Student:", result[4]);
    console.log("  Degree:", result[5]);
    console.log("  Year:", result[6].toString());
    console.log("  IPFS CID:", result[7]);
  } catch (e) {
    console.log("Verification failed:", e.message);
  }
}

main().catch(console.error);