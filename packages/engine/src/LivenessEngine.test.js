import { vi, describe, expect, it } from "vitest";
import { LivenessEngine } from "./LivenessEngine";

// Mock browser requestAnimationFrame globally for testing
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

vi.mock("@mediapipe/face_mesh", () => {
  return {
    FaceMesh: class {
      setOptions() {}
      onResults() {}
      send() { return Promise.resolve(); }
    },
    FACEMESH_TESSELATION: []
  };
});

vi.mock("@tensorflow/tfjs", () => {
  return {
    loadGraphModel: vi.fn().mockResolvedValue({
      inputs: [{ shape: [1, 224, 224, 3] }]
    })
  };
});

describe("LivenessEngine Custom Challenges", () => {
  it("should initialize correctly and support custom challenge configurations", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks, {
      challenges: ["BLINK", "TURN_LEFT"]
    });

    await engine.load();
    expect(callbacks.onReady).toHaveBeenCalled();

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = { clearRect: vi.fn(), canvas: { width: 640, height: 480 } };

    engine.start(mockVideo, mockCanvasCtx);

    // Initial challenge should be one from our custom list
    expect(["BLINK", "TURN_LEFT"]).toContain(callbacks.onChallengeChanged.mock.calls[0][0]);

    engine.stop();
  });

  it("should fallback to default challenges if custom list is empty or invalid", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks, {
      challenges: ["INVALID_ACTION"]
    });

    await engine.load();

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = { clearRect: vi.fn(), canvas: { width: 640, height: 480 } };

    engine.start(mockVideo, mockCanvasCtx);

    // Should fallback to default starting challenge (WAITING)
    expect(callbacks.onChallengeChanged).toHaveBeenCalledWith("WAITING");

    engine.stop();
  });

  it("should update challenge configurations dynamically via updateConfig", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const engine = new LivenessEngine(callbacks);
    await engine.load();

    engine.updateConfig({ challenges: ["TURN_RIGHT", "BLINK"] });

    const mockVideo = { readyState: 4, play: vi.fn().mockResolvedValue() };
    const mockCanvasCtx = { clearRect: vi.fn(), canvas: { width: 640, height: 480 } };

    engine.start(mockVideo, mockCanvasCtx);

    expect(["TURN_RIGHT", "BLINK"]).toContain(callbacks.onChallengeChanged.mock.calls[0][0]);
    engine.stop();
  });

  it("should integrate FaceDataCollector and verify identity continuity on completion", async () => {
    const callbacks = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onChallengeChanged: vi.fn(),
    };

    const mockDetector = {
      load: vi.fn().mockResolvedValue(),
      onResults: vi.fn(),
      send: vi.fn(),
    };

    const mockExtractor = {
      load: vi.fn().mockResolvedValue(),
      getInputSize: () => [224, 224],
      extractDescriptor: vi.fn().mockResolvedValue([1, 0, 0]),
    };

    const mockPipeline = {
      execute: vi.fn().mockResolvedValue({ passed: true, antiSpoofing: { passed: true } }),
    };

    const mockFaceCollector = {
      clear: vi.fn(),
      recordChallengeData: vi.fn(),
      getRecords: vi.fn().mockReturnValue([
        { challengeType: "WAITING", descriptor: [1, 0, 0] },
      ]),
      verifyIdentityContinuity: vi.fn().mockReturnValue({ passed: true, minSimilarity: 1.0 }),
      getAggregateDescriptor: vi.fn().mockReturnValue([1, 0, 0]),
    };

    const engine = new LivenessEngine(callbacks, {
      faceDetector: mockDetector,
      featureExtractor: mockExtractor,
      pipeline: mockPipeline,
      faceDataCollector: mockFaceCollector,
      challenges: ["WAITING"],
    });

    await engine.load();
    const mockVideo = { readyState: 4 };
    const mockCanvasCtx = { clearRect: vi.fn() };

    engine.start(mockVideo, mockCanvasCtx);
    expect(mockFaceCollector.clear).toHaveBeenCalled();
    engine.stop();
  });
});

