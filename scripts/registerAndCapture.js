// registerAndCapture.js — registers a cert and saves hash cleanly to hash.txt
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function main() {
  const abiPath = path.join(__dirname, "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const contractAddress = "0xFF9b74BF7bb402f100AD2BBa468b3aFA10459996";

  const [deployer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(contractAddress, artifact.abi, deployer);

  const uniqueId = Date.now().toString();
  const certificateId = `CERT-${uniqueId.slice(-6)}`;
  const fileHash = crypto.randomBytes(32).toString("hex");
  const ipfsCID = `Qm${crypto.randomBytes(16).toString("hex")}`;

  process.stdout.write(`CERT_ID=${certificateId}\nFILE_HASH=${fileHash}\n`);

  const tx = await contract.addCertificate(
    certificateId, fileHash, ipfsCID, "Jane Smith", "Master of Science in AI", 2026
  );
  await tx.wait();
  process.stdout.write(`TX_HASH=${tx.hash}\n`);

  // Save to file for easy reading
  fs.writeFileSync(
    path.join(__dirname, "../last_hash.txt"),
    fileHash,
    "utf8"
  );
  process.stdout.write(`DONE\n`);
}

main().catch(e => { process.stderr.write(e.message + "\n"); process.exit(1); });
