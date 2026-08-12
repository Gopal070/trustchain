// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateRegistry to Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

  const CertificateRegistry = await hre.ethers.getContractFactory(
    "CertificateRegistry"
  );
  const registry = await CertificateRegistry.deploy();

  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  require("fs").writeFileSync("deployed_address.txt", contractAddress);

  console.log("========================================");
  console.log("CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("Contract Address:", contractAddress);
  console.log("========================================");
  console.log("\nNext steps:");
  console.log("1. Copy this address to backend/.env as CONTRACT_ADDRESS");
  console.log("2. Copy ABI from artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json to backend/config/abi.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
