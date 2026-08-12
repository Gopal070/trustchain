// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const issuerRoutes = require("./routes/issuerRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ==================== DATABASE ====================
connectDB();

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/issuer", issuerRoutes);

// ==================== HEALTH CHECK ====================
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "TrustChain backend running" });
});

// ==================== ERROR HANDLER ====================
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  next();
});
app.use(errorMiddleware);

// ==================== START ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nTrustChain backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
