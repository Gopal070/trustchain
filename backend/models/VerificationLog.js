// backend/models/VerificationLog.js
const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      length: 64,
    },
    verdict: {
      type: String,
      enum: ["REAL", "FAKE"],
      required: true,
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    breakdown: {
      blockchain: {
        score: Number,
        weightedScore: Number,
        status: String,
      },
      ai: {
        score: Number,
        weightedScore: Number,
        status: String,
      },
      issuer: {
        score: Number,
        weightedScore: Number,
        status: String,
      },
    },
    blockchainResult: { type: mongoose.Schema.Types.Mixed },
    aiResult: { type: mongoose.Schema.Types.Mixed },
    issuerName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
