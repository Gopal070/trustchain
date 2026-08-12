// backend/routes/verificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  verifyCertificate,
  verifyByHash,
  verifyById,
  verifyBulk,
  registerCertificate,
} = require("../controllers/verificationController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// File upload karke verify karo
router.post("/", upload.single("certificate"), verifyCertificate);

// Sirf hash se verify karo
router.get("/hash/:hash", verifyByHash);

// Certificate ID se verify karo
router.get("/id/:certId", verifyById);

// Bulk verification
router.post("/bulk", verifyBulk);

// Certificate blockchain pe register karo (admin only)
router.post("/register", protect, upload.single("certificate"), registerCertificate);

module.exports = router;
