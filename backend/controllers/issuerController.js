// backend/controllers/issuerController.js
const blockchainService = require("../services/blockchainService");
const Issuer = require("../models/Issuer");
const Certificate = require("../models/Certificate");

async function authorizeIssuer(req, res) {
  try {
    const { walletAddress, name } = req.body;

    if (!walletAddress || !name) {
      return res.status(400).json({
        success: false,
        error: "walletAddress and name required",
      });
    }

    const result = await blockchainService.authorizeIssuerOnChain(walletAddress, name);

    await Issuer.create({
      name,
      walletAddress: walletAddress.toLowerCase(),
      isAuthorized: true,
      authorizedBy: req.user._id,
      txHash: result.transactionHash,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getIssuers(req, res) {
  try {
    const issuers = await Issuer.find({ isAuthorized: true });
    return res.status(200).json({ success: true, data: issuers });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function registerCertificate(req, res) {
  try {
    const { certId, studentName, degree, year, fileHash, ipfsCID } = req.body;

    if (!certId || !studentName || !degree || !year || !fileHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required certificate data",
      });
    }

    // 1. Blockchain pe store karo
    const blockchainResult = await blockchainService.addCertificate(
      certId, fileHash, ipfsCID || "", studentName, degree, Number(year)
    );

    // 2. Database mein store karo
    const cert = await Certificate.create({
      certId,
      studentName,
      degree,
      year,
      fileHash,
      ipfsCID: ipfsCID || "",
      issuer: req.user._id,
      txHash: blockchainResult.transactionHash,
    });

    return res.status(201).json({
      success: true,
      data: cert,
      blockchain: blockchainResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getIssuerCertificates(req, res) {
  try {
    const certs = await Certificate.find({ issuer: req.user._id }).sort({ createdAt: -1 });
    
    // Map to the format frontend expects
    const formattedCerts = certs.map(c => ({
      id: c.certId,
      name: c.studentName,
      degree: c.degree,
      status: c.status,
      date: c.createdAt.toISOString().split('T')[0],
      tx: c.txHash
    }));

    return res.status(200).json({ success: true, data: formattedCerts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function checkIssuer(req, res) {
  try {
    const { address } = req.params;
    const result = await blockchainService.getIssuerInfo(address);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { 
  authorizeIssuer, 
  getIssuers, 
  checkIssuer, 
  registerCertificate, 
  getIssuerCertificates 
};
