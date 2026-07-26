/**
 * ScoreCalibrator performs adaptive thresholding, score normalization,
 * and confidence rating for face verification matches.
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Dedicated solely to score calibration & adaptive thresholding.
 * - Open/Closed Principle (OCP): Configurable base threshold and quality penalty scaling.
 */
export class ScoreCalibrator {
  #baseThreshold;

  constructor(baseThreshold = 0.65) {
    this.#baseThreshold = baseThreshold;
  }

  /**
   * Computes dynamic adaptive threshold based on environmental/session quality factors.
   * @param {Object} [sessionData] - Payload metadata containing antiSpoofing or identityContinuity info.
   * @returns {number} Calibrated threshold value.
   */
  calculateAdaptiveThreshold(sessionData = {}) {
    let threshold = this.#baseThreshold;

    const antiSpoofing = sessionData.antiSpoofing;
    const identityContinuity = sessionData.identityContinuity;

    // Apply strictness adjustment if anti-spoofing indicators show low contrast/lighting
    if (antiSpoofing) {
      if (antiSpoofing.laplacianVariance < 0.001) {
        threshold += 0.03; // Require higher match confidence for low-contrast frames
      }
      if (antiSpoofing.occlusionDetected) {
        threshold += 0.05; // Require higher threshold if slight occlusion occurred
      }
    }

    // Apply adjustment if identity continuity across challenges had high stability
    if (identityContinuity && identityContinuity.minSimilarity > 0.85) {
      threshold -= 0.02; // Reward high intra-session identity stability
    }

    return Math.max(0.5, Math.min(0.95, threshold));
  }

  /**
   * Evaluates match confidence rating based on similarity score and calibrated threshold.
   * @param {number} rawSimilarity - Cosine similarity score [0, 1].
   * @param {number} effectiveThreshold - Active similarity threshold.
   * @returns {{ verified: boolean, confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE", score: number }}
   */
  evaluateConfidence(rawSimilarity, effectiveThreshold = this.#baseThreshold) {
    const verified = rawSimilarity >= effectiveThreshold;
    let confidence = "NONE";

    if (verified) {
      if (rawSimilarity >= effectiveThreshold + 0.15) {
        confidence = "HIGH";
      } else if (rawSimilarity >= effectiveThreshold + 0.05) {
        confidence = "MEDIUM";
      } else {
        confidence = "LOW";
      }
    }

    return {
      verified,
      confidence,
      score: rawSimilarity,
    };
  }
}
