import { describe, expect, it } from "vitest";
import { FaceDataCollector } from "./FaceDataCollector";

describe("FaceDataCollector", () => {
  it("should record face data for each challenge", () => {
    const collector = new FaceDataCollector();
    collector.recordChallengeData({
      challengeType: "WAITING",
      descriptor: [1, 0, 0],
      landmarks: [{ x: 0.5, y: 0.5 }],
    });
    collector.recordChallengeData({
      challengeType: "BLINK",
      descriptor: [0.9, 0.1, 0],
      landmarks: [{ x: 0.5, y: 0.5 }],
    });

    const records = collector.getRecords();
    expect(records).toHaveLength(2);
    expect(records[0].challengeType).toBe("WAITING");
    expect(records[1].challengeType).toBe("BLINK");
  });

  it("should throw an error if descriptor is missing or invalid", () => {
    const collector = new FaceDataCollector();
    expect(() => {
      collector.recordChallengeData({ challengeType: "WAITING" });
    }).toThrow("Invalid challenge face data");
  });

  it("should verify identity continuity when descriptors are similar", () => {
    const collector = new FaceDataCollector({ minSimilarityThreshold: 0.7 });
    collector.recordChallengeData({
      challengeType: "WAITING",
      descriptor: [1, 0, 0],
    });
    collector.recordChallengeData({
      challengeType: "BLINK",
      descriptor: [0.95, 0.05, 0],
    });
    collector.recordChallengeData({
      challengeType: "TURN_LEFT",
      descriptor: [0.92, 0.08, 0],
    });

    const result = collector.verifyIdentityContinuity();
    expect(result.passed).toBe(true);
    expect(result.minSimilarity).toBeGreaterThan(0.7);
  });

  it("should detect identity mismatch when descriptors differ significantly", () => {
    const collector = new FaceDataCollector({ minSimilarityThreshold: 0.7 });
    collector.recordChallengeData({
      challengeType: "WAITING",
      descriptor: [1, 0, 0],
    });
    // Distinct descriptor (simulated swapped face)
    collector.recordChallengeData({
      challengeType: "TURN_RIGHT",
      descriptor: [0, 1, 0],
    });

    const result = collector.verifyIdentityContinuity();
    expect(result.passed).toBe(false);
    expect(result.error?.code).toBe("IDENTITY_MISMATCH");
  });

  it("should compute aggregate descriptor (normalized centroid)", () => {
    const collector = new FaceDataCollector();
    collector.recordChallengeData({
      challengeType: "WAITING",
      descriptor: [1, 0, 0],
      qualityScore: 1.0,
    });
    collector.recordChallengeData({
      challengeType: "SMILE",
      descriptor: [0, 1, 0],
      qualityScore: 1.0,
    });

    const aggregate = collector.getAggregateDescriptor();
    expect(aggregate).not.toBeNull();
    // Equal weights [1, 1, 0] normalized is [1/sqrt(2), 1/sqrt(2), 0]
    expect(aggregate[0]).toBeCloseTo(Math.SQRT1_2);
    expect(aggregate[1]).toBeCloseTo(Math.SQRT1_2);
    expect(aggregate[2]).toBe(0);
  });

  it("should weight high-quality frontal descriptors more heavily than low-quality off-angle descriptors", () => {
    const collector = new FaceDataCollector();
    // High-quality frontal frame (weight = 1.0)
    collector.recordChallengeData({
      challengeType: "WAITING",
      descriptor: [1, 0, 0],
      qualityScore: 1.0,
    });
    // Low-quality turn frame (weight = 0.2)
    collector.recordChallengeData({
      challengeType: "TURN_LEFT",
      descriptor: [0, 1, 0],
      qualityScore: 0.2,
    });

    const aggregate = collector.getAggregateDescriptor();
    expect(aggregate).not.toBeNull();
    // Weighted vector: [1.0, 0.2, 0]. Component 0 should be significantly larger than component 1
    expect(aggregate[0]).toBeGreaterThan(aggregate[1] * 4);
  });

  it("should clear recorded data", () => {
    const collector = new FaceDataCollector();
    collector.recordChallengeData({
      challengeType: "WAITING",
      descriptor: [1, 0, 0],
    });
    collector.clear();
    expect(collector.getRecords()).toHaveLength(0);
    expect(collector.getAggregateDescriptor()).toBeNull();
  });
});
