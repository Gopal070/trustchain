// scripts/authorizeMe.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const [owner] = await hre.ethers.getSigners();
  
  const contractABI = require("../backend/config/abi.json").abi;
  const contract = new hre.ethers.Contract(contractAddress, contractABI, owner);

  console.log("Authorizing issuer address:", owner.address);
  
  try {
    const tx = await contract.authorizeIssuer(owner.address, "TrustChain Demo Issuer");
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Address authorized successfully!");
  } catch (error) {
    if (error.message.includes("Issuer already authorized")) {
      console.log("Address is already authorized.");
    } else {
      console.error("Authorization failed:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
