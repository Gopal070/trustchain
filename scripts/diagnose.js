const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load the ABI from the compiled artifact
  const abiPath = path.join(__dirname, "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const abi = artifact.abi;
  const contractAddress = "0xFF9b74BF7bb402f100AD2BBa468b3aFA10459996";

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Create contract instance with explicit ABI
  const contract = new hre.ethers.Contract(contractAddress, abi, deployer);

  // Print all function names from the ABI
  const functions = abi.filter(item => item.type === "function").map(f => f.name);
  console.log("Available functions in ABI:", functions);

  // Try to get issuer via known possible names
  const possibleIssuerNames = ["getIssuer", "issuers"];
  for (const name of possibleIssuerNames) {
    try {
      const result = await contract[name](deployer.address);
      console.log(`Call to ${name} succeeded:`, result);
    } catch (e) {
      console.log(`Call to ${name} failed:`, e.message);
    }
  }

  // Try to register a certificate using the likely correct function name
  const hash = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";
  const registerNames = ["registerCertificate", "addCertificate", "issueCertificate"];
  for (const name of registerNames) {
    try {
      const tx = await contract[name]("CERT-001", hash, "IIT Delhi");
      await tx.wait();
      console.log(`✅ Certificate registered using ${name}`);
      break;
    } catch (e) {
      console.log(`Call to ${name} failed:`, e.message);
    }
  }

  // Try to verify
  const verifyNames = ["getCertificateByHash", "getCertificate", "verifyCertificate"];
  for (const name of verifyNames) {
    try {
      const result = await contract[name](hash);
      console.log(`Verification using ${name}:`, result);
      break;
    } catch (e) {
      console.log(`Call to ${name} failed:`, e.message);
    }
  }
}

main().catch(console.error);