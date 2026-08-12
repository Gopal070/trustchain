// register_test_hash.js — Registers a fixed hash for verification testing
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const hash = fs.readFileSync(path.join(__dirname, "../test-cert-hash.txt"), "utf8").trim();
  const abiPath = path.join(__dirname, "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const contractAddress = "0xFF9b74BF7bb402f100AD2BBa468b3aFA10459996";

  const [deployer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(contractAddress, artifact.abi, deployer);

  const certId = `TEST-${Date.now().toString().slice(-6)}`;
  console.log(`Registering Hash: ${hash}`);
  console.log(`Cert ID: ${certId}`);

  const tx = await contract.addCertificate(
    certId, hash, "QmTestCert", "John Doe", "Verification Test Degree", 2026
  );
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log("✅ Registered!");
}

main().catch(e => { console.error(e.message); process.exit(1); });
