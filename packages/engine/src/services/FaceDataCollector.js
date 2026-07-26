import { calculateCosineSimilarity } from "../utils";

/**
 * FaceDataCollector records face data (feature descriptors, landmarks, metadata)
 * captured at each liveness challenge and validates identity continuity across challenges.
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Dedicated solely to challenge face data accumulation,
 *   identity continuity evaluation, and vector aggregation.
 * - Open/Closed Principle (OCP): Configurable similarity threshold and extensible vector processing.
 */
export class FaceDataCollector {
  #records = [];
  #minSimilarityThreshold;

  constructor(options = {}) {
    this.#minSimilarityThreshold = options.minSimilarityThreshold ?? 0.7;
  }

  /**
   * Record face data for a specific challenge.
   * @param {Object} data - { challengeType, descriptor, landmarks, timestamp }
   */
  recordChallengeData(data) {
    if (!data || !data.descriptor || !Array.isArray(data.descriptor)) {
      throw new Error(
        "Invalid challenge face data: descriptor array is required.",
      );
    }
    this.#records.push({
      challengeType: data.challengeType || "UNKNOWN",
      descriptor: [...data.descriptor],
      landmarks: data.landmarks ? [...data.landmarks] : null,
      timestamp: data.timestamp || Date.now(),
    });
  }

  /**
   * Returns all recorded challenge face data items.
   * @returns {Array} List of challenge face records.
   */
  getRecords() {
    return this.#records.map((rec) => ({
      ...rec,
      descriptor: [...rec.descriptor],
    }));
  }

  /**
   * Verifies identity continuity across recorded challenges.
   * Checks similarity between baseline (first recorded descriptor) and subsequent descriptors,
   * as well as consecutive challenge descriptors.
   * @param {number} [threshold] - Custom similarity threshold
   * @returns {{ passed: boolean, minSimilarity: number, error?: { code: string, message: string } }}
   */
  verifyIdentityContinuity(threshold = this.#minSimilarityThreshold) {
    if (this.#records.length <= 1) {
      return { passed: true, minSimilarity: 1.0 };
    }

    const baseline = this.#records[0].descriptor;
    let minSimilarity = 1.0;

    for (let i = 1; i < this.#records.length; i++) {
      const current = this.#records[i].descriptor;
      const simWithBaseline = calculateCosineSimilarity(baseline, current);
      const prev = this.#records[i - 1].descriptor;
      const simWithPrev = calculateCosineSimilarity(prev, current);

      const lowestPairSim = Math.min(simWithBaseline, simWithPrev);
      if (lowestPairSim < minSimilarity) {
        minSimilarity = lowestPairSim;
      }

      if (lowestPairSim < threshold) {
        return {
          passed: false,
          minSimilarity,
          error: {
            code: "IDENTITY_MISMATCH",
            message: `Face identity continuity check failed between challenges (${this.#records[i - 1].challengeType} -> ${this.#records[i].challengeType}). Similarity: ${lowestPairSim.toFixed(3)} < threshold ${threshold}.`,
          },
        };
      }
    }

    return { passed: true, minSimilarity };
  }

  /**
   * Computes normalized centroid (mean) feature descriptor across all recorded challenges.
   * @returns {Array<number>|null} Aggregated feature vector normalized to unit length.
   */
  getAggregateDescriptor() {
    if (this.#records.length === 0) return null;
    const dimension = this.#records[0].descriptor.length;
    const meanVector = new Array(dimension).fill(0);

    for (const record of this.#records) {
      for (let i = 0; i < dimension; i++) {
        meanVector[i] += record.descriptor[i];
      }
    }

    let norm = 0;
    for (let i = 0; i < dimension; i++) {
      meanVector[i] /= this.#records.length;
      norm += meanVector[i] * meanVector[i];
    }

    norm = Math.sqrt(norm);
    if (norm > 1e-6) {
      for (let i = 0; i < dimension; i++) {
        meanVector[i] /= norm;
      }
    }

    return meanVector;
  }

  /**
   * Resets collected records.
   */
  clear() {
    this.#records = [];
  }
}
