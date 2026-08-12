// backend/services/blockchainService.js
const { ethers } = require("ethers");
require("dotenv").config();

// ==================== ABI IMPORT ====================
const contractABI = require("../config/abi.json").abi;

// ==================== PROVIDER & SIGNER SETUP ====================
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Write operations
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  signer
);

// Read-only operations (zero gas)
const readContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
);

// ==================== ADD CERTIFICATE ====================

/**
 * Certificate ka hash blockchain pe store karo
 * @param {string} certId — unique certificate ID
 * @param {string} fileHash — 64-char SHA-256 hash
 * @param {string} ipfsCID — IPFS CID (optional)
 * @param {string} studentName — student ka naam
 * @param {string} degree — degree name
 * @param {number} year — year of issue
 */
async function addCertificate(certId, fileHash, ipfsCID, studentName, degree, year) {
  try {
    console.log(`\n--- Adding Certificate to Blockchain ---`);
    console.log(`Cert ID: ${certId}`);
    console.log(`Hash: ${fileHash}`);

    const tx = await contract.addCertificate(
      certId, fileHash, ipfsCID || "", studentName, degree, year
    );
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`Confirmed in block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error(`addCertificate failed:`, error.message);

    if (error.message.includes("Certificate hash already exists")) {
      throw new Error("This certificate hash is already registered on blockchain");
    }
    if (error.message.includes("CertId already registered")) {
      throw new Error("This certificate ID is already registered on blockchain");
    }
    if (error.message.includes("Not an authorized issuer")) {
      throw new Error("Your wallet is not authorized as an issuer. Contact admin.");
    }
    throw error;
  }
}

// ==================== VERIFY CERTIFICATE ====================

/**
 * Certificate verify karo — hash se blockchain pe check karo
 * @param {string} fileHash — 64-char SHA-256 hash
 */
async function verifyCertificateOnChain(fileHash) {
  try {
    console.log(`\n--- Verifying Certificate on Blockchain ---`);
    console.log(`Hash: ${fileHash}`);

    const result = await readContract.verifyCertificate(fileHash);
    const [found, isValid, certId, issuer, student, degree, year, ipfsCID, timestamp] = result;

    console.log(`Found: ${found}`);
    if (found) {
      console.log(`Cert ID: ${certId}`);
      console.log(`Issuer: ${issuer}`);
      console.log(`Valid: ${isValid}`);
      console.log(`Timestamp: ${timestamp}`);
    }

    return {
      verified: found,
      found,
      isValid: found ? isValid : null,
      certId: found ? certId : null,
      issuer: found ? issuer : null,
      student: found ? student : null,
      degree: found ? degree : null,
      year: found ? year.toString() : null,
      ipfsCID: found ? ipfsCID : null,
      timestamp: found ? Number(timestamp) : null,
      blockchainScore: found && isValid ? 100 : found && !isValid ? 10 : 0,
      message: !found
        ? "Certificate not found on blockchain"
        : isValid
        ? "Certificate verified on blockchain"
        : "Certificate found but has been REVOKED",
    };
  } catch (error) {
    console.error(`verifyCertificateOnChain failed:`, error.message);
    return {
      verified: false,
      found: false,
      blockchainScore: 0,
      message: "Blockchain query failed: " + error.message,
    };
  }
}

// ==================== GET BY CERT ID ====================

/**
 * Certificate ID se search karo
 * @param {string} certId — unique certificate ID
 */
async function getCertificateById(certId) {
  try {
    console.log(`\n--- Looking up Certificate by ID ---`);
    console.log(`Cert ID: ${certId}`);

    const result = await readContract.getCertificateById(certId);
    const [found, isValid, hashSHA256, issuer, student, degree, year, ipfsCID, timestamp] = result;

    return {
      found,
      isValid: found ? isValid : null,
      hashSHA256: found ? hashSHA256 : null,
      issuer: found ? issuer : null,
      student: found ? student : null,
      degree: found ? degree : null,
      year: found ? year.toString() : null,
      ipfsCID: found ? ipfsCID : null,
      timestamp: found ? Number(timestamp) : null,
    };
  } catch (error) {
    console.error(`getCertificateById failed:`, error.message);
    throw error;
  }
}

// ==================== REVOKE CERTIFICATE ====================

/**
 * Certificate revoke karo
 * @param {string} certId — certificate ID
 * @param {string} reason — revocation reason
 */
async function revokeCertificateOnChain(certId, reason) {
  try {
    console.log(`\n--- Revoking Certificate ---`);
    console.log(`Cert ID: ${certId}`);

    const tx = await contract.revokeCertificate(certId, reason || "Revoked by issuer");
    console.log(`Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Certificate revoked in block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error(`revokeCertificateOnChain failed:`, error.message);
    throw error;
  }
}

// ==================== AUTHORIZE ISSUER ====================

/**
 * Issuer authorize karo — sirf owner call kar sakta hai
 * @param {string} issuerAddress — wallet address
 * @param {string} name — issuer ka naam
 */
async function authorizeIssuerOnChain(issuerAddress, name) {
  try {
    console.log(`\n--- Authorizing Issuer ---`);
    console.log(`Address: ${issuerAddress}`);
    console.log(`Name: ${name}`);

    const tx = await contract.authorizeIssuer(issuerAddress, name);
    const receipt = await tx.wait();
    console.log(`Issuer authorized in block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: `${name} authorized successfully`,
    };
  } catch (error) {
    console.error(`authorizeIssuerOnChain failed:`, error.message);
    if (error.message.includes("Only owner")) {
      throw new Error("Only contract owner can authorize issuers");
    }
    throw error;
  }
}

// ==================== GET ISSUER INFO ====================

/**
 * Issuer ki info check karo
 * @param {string} issuerAddress — wallet address
 */
async function getIssuerInfo(issuerAddress) {
  try {
    const result = await readContract.getIssuerInfo(issuerAddress);
    const [name, isAuthorized] = result;

    return {
      isAuthorized,
      name: isAuthorized ? name : null,
    };
  } catch (error) {
    console.error(`getIssuerInfo failed:`, error.message);
    throw error;
  }
}

// ==================== TEST CONNECTION ====================

/**
 * Blockchain se connected hai ya nahi check karo
 */
async function testConnection() {
  try {
    const network = await provider.getNetwork();
    const signerAddress = await signer.getAddress();
    const balance = await provider.getBalance(signerAddress);

    return {
      connected: true,
      network: {
        name: network.name,
        chainId: Number(network.chainId),
      },
      contractAddress: process.env.CONTRACT_ADDRESS,
      signerAddress,
      balance: ethers.formatEther(balance) + " ETH",
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

// ==================== EXPORTS ====================
module.exports = {
  addCertificate,
  verifyCertificateOnChain,
  getCertificateById,
  revokeCertificateOnChain,
  authorizeIssuerOnChain,
  getIssuerInfo,
  testConnection,
};