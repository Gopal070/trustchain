// backend/utils/hashGenerator.js
const crypto = require("crypto");
const fs = require("fs");

/**
 * File se SHA-256 hash generate karo
 * @param {string} filePath — file ka path
 * @returns {string} — 64-character hex hash (bina 0x ke)
 */
function generateHashFromFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return hash;
}

/**
 * String/Buffer se SHA-256 hash generate karo
 * @param {string|Buffer} data — raw data
 * @returns {string} — 64-character hex hash
 */
function generateHash(data) {
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return hash;
}

/**
 * Badi file ke liye stream-based hashing (memory efficient)
 * @param {string} filePath — file ka path
 * @returns {Promise<string>} — 64-character hex hash
 */
function generateHashFromFileStream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}

/**
 * Hash validate karo — 64 hex characters hona chahiye
 * @param {string} hash — hash string
 * @returns {boolean}
 */
function isValidHash(hash) {
  if (!hash || typeof hash !== "string") return false;
  return /^[a-f0-9]{64}$/.test(hash);
}

// ==================== EXPORTS ====================
module.exports = {
  generateHashFromFile,
  generateHash,
  generateHashFromFileStream,
  isValidHash,
};