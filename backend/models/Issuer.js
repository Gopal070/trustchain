// backend/models/Issuer.js
const mongoose = require("mongoose");

const issuerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isAuthorized: {
      type: Boolean,
      default: true,
    },
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    txHash: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issuer", issuerSchema);
