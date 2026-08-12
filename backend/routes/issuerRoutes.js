// backend/routes/issuerRoutes.js
const express = require("express");
const router = express.Router();
const {
  authorizeIssuer,
  getIssuers,
  checkIssuer,
  registerCertificate,
  getIssuerCertificates,
} = require("../controllers/issuerController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/authorize", protect, adminOnly, authorizeIssuer);
router.get("/", protect, getIssuers);
router.get("/check/:address", checkIssuer);

// Certificate Registration & Retrieval
router.post("/register", protect, registerCertificate);
router.get("/certificates", protect, getIssuerCertificates);

module.exports = router;
