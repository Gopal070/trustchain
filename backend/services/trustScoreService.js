// backend/services/trustScoreService.js

// ==================== WEIGHT CONFIGURATION ====================
const WEIGHTS = {
  blockchain: 0.5,   // 50% — on-chain hash match
  ai: 0.35,          // 35% — AI fraud detection
  issuer: 0.15,      // 15% — issuer database match
};

const THRESHOLD = 70; // Score >= 70 = REAL, < 70 = FAKE

// ==================== SCORE CALCULATORS ====================

function getBlockchainScore(blockchainResult) {
  if (!blockchainResult || !blockchainResult.verified) return 0;
  if (!blockchainResult.isValid) return 10; // revoked
  return 100;
}

function getAIScore(aiResult) {
  if (!aiResult) return 0;
  if (!aiResult.isAuthentic) {
    return Math.min(aiResult.confidenceScore || 0, 30);
  }
  return aiResult.confidenceScore || 0;
}

function getIssuerScore(issuerResult) {
  if (!issuerResult) return 0;
  return issuerResult.confidenceScore || 0;
}

// ==================== MAIN TRUST SCORE FUNCTION ====================

/**
 * Calculate final trust score
 * @param {Object} blockchainResult — from blockchainService.verifyCertificateOnChain()
 * @param {Object} aiResult — from AI fraud detection
 * @param {Object} issuerResult — from issuer database check
 * @returns {Object} { totalScore, verdict, breakdown, recommendation }
 */
function calculateTrustScore(blockchainResult, aiResult, issuerResult) {
  const bScore = getBlockchainScore(blockchainResult);
  const aScore = getAIScore(aiResult);
  const iScore = getIssuerScore(issuerResult);

  const weightedBlockchain = Math.round(bScore * WEIGHTS.blockchain);
  const weightedAI = Math.round(aScore * WEIGHTS.ai);
  const weightedIssuer = Math.round(iScore * WEIGHTS.issuer);

  const totalScore = weightedBlockchain + weightedAI + weightedIssuer;
  const verdict = totalScore >= THRESHOLD ? "REAL" : "FAKE";

  let recommendation = "";
  if (totalScore >= 90) {
    recommendation = "Certificate is highly trustworthy. Verified on blockchain and passed all checks.";
  } else if (totalScore >= 70) {
    recommendation = "Certificate appears legitimate but manual review recommended for high-stakes use.";
  } else if (totalScore >= 40) {
    recommendation = "Certificate has significant trust issues. Manual verification strongly recommended.";
  } else {
    recommendation = "Certificate is likely fraudulent. Do not accept without thorough manual verification.";
  }

  return {
    totalScore,
    verdict,
    threshold: THRESHOLD,
    recommendation,
    breakdown: {
      blockchain: {
        rawScore: bScore,
        weight: `${WEIGHTS.blockchain * 100}%`,
        weightedScore: weightedBlockchain,
        status: bScore === 100 ? "VERIFIED" : bScore === 10 ? "REVOKED" : "NOT_FOUND",
      },
      ai: {
        rawScore: aScore,
        weight: `${WEIGHTS.ai * 100}%`,
        weightedScore: weightedAI,
        status: aScore >= 70 ? "AUTHENTIC" : aScore >= 40 ? "SUSPICIOUS" : "LIKELY_FAKE",
      },
      issuer: {
        rawScore: iScore,
        weight: `${WEIGHTS.issuer * 100}%`,
        weightedScore: weightedIssuer,
        status: iScore >= 80 ? "REGISTERED" : "UNKNOWN",
      },
    },
  };
}

// ==================== BATCH SCORING ====================
function batchCalculate(certificates) {
  return certificates.map((cert, index) => ({
    index,
    ...calculateTrustScore(
      cert.blockchainResult,
      cert.aiResult,
      cert.issuerResult
    ),
  }));
}

// ==================== EXPORTS ====================
module.exports = {
  calculateTrustScore,
  batchCalculate,
  WEIGHTS,
  THRESHOLD,
};
