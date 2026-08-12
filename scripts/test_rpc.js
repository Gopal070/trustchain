const { ethers } = require("hardhat");
async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const block = await provider.getBlockNumber();
  console.log("Current block number:", block);
}
main().catch(console.error);
