import { describe, expect, it } from "vitest";
import { FaceAligner } from "./FaceAligner";

const p = (x, y, z = 0) => ({ x, y, z });

describe("FaceAligner", () => {
  it("should return null if landmarks are missing or incomplete", () => {
    const aligner = new FaceAligner();
    expect(aligner.extract5KeyLandmarks([])).toBeNull();
    expect(aligner.computePoseAngles([])).toBeNull();
    expect(aligner.getAlignedCropBox([])).toBeNull();
  });

  it("should extract 5 key facial landmarks accurately", () => {
    const aligner = new FaceAligner();
    const landmarks = Array(500).fill(p(0, 0, 0));

    // Left eye indices [362, 385, 387, 263, 373, 380]
    [362, 385, 387, 263, 373, 380].forEach((idx) => {
      landmarks[idx] = p(0.65, 0.4, 0);
    });
    // Right eye indices [33, 160, 158, 133, 153, 144]
    [33, 160, 158, 133, 153, 144].forEach((idx) => {
      landmarks[idx] = p(0.35, 0.4, 0);
    });

    landmarks[1] = p(0.5, 0.5, 0); // nose tip
    landmarks[61] = p(0.4, 0.6, 0); // left mouth
    landmarks[291] = p(0.6, 0.6, 0); // right mouth

    const key5 = aligner.extract5KeyLandmarks(landmarks);
    expect(key5).not.toBeNull();
    expect(key5.noseTip).toEqual(p(0.5, 0.5, 0));
    expect(key5.leftEye.y).toBeCloseTo(0.4);
    expect(key5.rightEye.y).toBeCloseTo(0.4);
  });

  it("should compute roll angle as zero for horizontal eyes", () => {
    const aligner = new FaceAligner();
    const landmarks = Array(500).fill(p(0, 0, 0));

    [362, 385, 387, 263, 373, 380].forEach((idx) => {
      landmarks[idx] = p(0.6, 0.4, 0);
    });
    [33, 160, 158, 133, 153, 144].forEach((idx) => {
      landmarks[idx] = p(0.4, 0.4, 0);
    });

    landmarks[234] = p(0.2, 0.5, 0);
    landmarks[454] = p(0.8, 0.5, 0);
    landmarks[152] = p(0.5, 0.8, 0);
    landmarks[1] = p(0.5, 0.5, 0);

    const pose = aligner.computePoseAngles(landmarks);
    expect(pose).not.toBeNull();
    expect(pose.roll).toBeCloseTo(0);
  });

  it("should calculate aligned crop box centered around eyes", () => {
    const aligner = new FaceAligner();
    const landmarks = Array(500).fill(p(0, 0, 0));

    [362, 385, 387, 263, 373, 380].forEach((idx) => {
      landmarks[idx] = p(0.6, 0.4, 0);
    });
    [33, 160, 158, 133, 153, 144].forEach((idx) => {
      landmarks[idx] = p(0.4, 0.4, 0);
    });
    landmarks[1] = p(0.5, 0.5);

    const cropBox = aligner.getAlignedCropBox(landmarks);
    expect(cropBox).not.toBeNull();
    expect(cropBox).toHaveLength(1);
    expect(cropBox[0]).toHaveLength(4);
    // x1 < x2, y1 < y2
    expect(cropBox[0][0]).toBeLessThan(cropBox[0][2]);
    expect(cropBox[0][1]).toBeLessThan(cropBox[0][3]);
  });
});
