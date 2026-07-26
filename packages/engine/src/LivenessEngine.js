// src/engine/LivenessEngine.js
import * as tf from "@tensorflow/tfjs";
import { generateIntegrityHash } from "./utils";
import { ChallengeRegistry } from "./challenges/ChallengeRegistry";
import { LivenessPipeline } from "./validators/LivenessPipeline";
import { DebugOverlayRenderer } from "./rendering/DebugOverlayRenderer";
import { MediaPipeFaceDetector } from "./providers/MediaPipeFaceDetector";
import { MobileNetFeatureExtractor } from "./providers/MobileNetFeatureExtractor";
import { FaceDataCollector } from "./services/FaceDataCollector";
import { FaceAligner } from "./services/FaceAligner";

const DEFAULT_CONFIG = {
  blinkEARThreshold: 0.25,
  headTurnThreshold: 0.4,
  challengeTimeout: 5000,
  targetFPS: 30,
  minFaceSize: 0.3,
  maxFaceSize: 0.6,
  basePath: "",
  sessionToken: null,
  minDepthVariance: 0.0015,
  minLaplacianVariance: 0.0005,
  minBrightness: -0.92,
  maxBrightness: 0.95,
  maxFFTPeak: 180.0,
  challenges: null,
  minIdentitySimilarity: 0.70,
};

/**
 * LivenessEngine orchestrates face detection, challenge validation, anti-spoofing, feature extraction, and face alignment.
 * Refactored using SOLID principles:
 * - SRP: Delegates rendering, model execution, validation, challenge strategies, face data collection, and geometric alignment to dedicated modules.
 * - OCP: Open to custom challenges (via ChallengeRegistry) and custom validators (via LivenessPipeline).
 * - DIP: Depends on abstractions (faceDetector, featureExtractor, pipeline, faceDataCollector, faceAligner) which can be injected.
 */
export class LivenessEngine {
  #faceDetector;
  #featureExtractor;
  #challengeRegistry;
  #pipeline;
  #overlayRenderer;
  #faceDataCollector;
  #faceAligner;

  #callbacks;
  #config;
  #videoElement;
  #canvasCtx;
  #isReady = false;
  #detectionLoopId = null;
  #isStopped = true;
  #activeChallenges = [];
  #currentChallengeIndex = 0;
  #lastChallengeTime = 0;
  #isChallengeProcessing = false;
  #lastFrameTime = 0;
  #lastLandmarks = null;

  constructor(callbacks, config = {}) {
    if (
      !callbacks ||
      typeof callbacks.onReady !== "function" ||
      typeof callbacks.onSuccess !== "function" ||
      typeof callbacks.onFailure !== "function" ||
      typeof callbacks.onChallengeChanged !== "function"
    ) {
      throw new Error(
        "LivenessEngine requires a valid callbacks object with onReady, onSuccess, onFailure, and onChallengeChanged.",
      );
    }
    this.#callbacks = callbacks;
    this.#config = { ...DEFAULT_CONFIG, ...config };

    // Dependency Injection with sensible defaults (DIP & OCP)
    this.#faceDetector =
      config.faceDetector || new MediaPipeFaceDetector();
    this.#featureExtractor =
      config.featureExtractor || new MobileNetFeatureExtractor();
    this.#challengeRegistry =
      config.challengeRegistry || new ChallengeRegistry();
    this.#pipeline = config.pipeline || new LivenessPipeline();
    this.#overlayRenderer =
      config.overlayRenderer || new DebugOverlayRenderer();
    this.#faceDataCollector =
      config.faceDataCollector ||
      new FaceDataCollector({
        minSimilarityThreshold: this.#config.minIdentitySimilarity,
      });
    this.#faceAligner = config.faceAligner || new FaceAligner();
  }

  async load() {
    try {
      const { basePath } = this.#config;

      this.#faceDetector.onResults(this.#onFaceMeshResults.bind(this));
      await this.#faceDetector.load(basePath);
      await this.#featureExtractor.load(basePath);

      this.#isReady = true;
      this.#callbacks.onReady();
    } catch (error) {
      console.error("Fatal error during model loading:", error);
      this.#callbacks.onFailure({
        code: "MODEL_LOAD_FAILED",
        message: `Failed to load models. Check console for details. Error: ${error.message}`,
      });
    }
  }

  updateConfig(newConfig = {}) {
    this.#config = { ...this.#config, ...newConfig };
  }

  start(videoElement, canvasCtx) {
    if (!this.#isReady)
      throw new Error("Engine not loaded. Call load() first.");
    this.#videoElement = videoElement;
    this.#canvasCtx = canvasCtx;
    this.#isStopped = false;
    this.#isChallengeProcessing = false;
    this.#currentChallengeIndex = 0;
    this.#lastChallengeTime = Date.now();
    this.#lastFrameTime = 0;
    this.#faceDataCollector.clear();

    this.#activeChallenges = this.#challengeRegistry.resolveSequence(
      this.#config.challenges,
    );

    if (this.#activeChallenges.length > 0) {
      this.#callbacks.onChallengeChanged(
        this.#activeChallenges[this.#currentChallengeIndex].type,
      );
    }

    if (this.#detectionLoopId) cancelAnimationFrame(this.#detectionLoopId);
    this.#detectionLoop();
  }

  stop() {
    this.#isStopped = true;
    if (this.#detectionLoopId) {
      cancelAnimationFrame(this.#detectionLoopId);
      this.#detectionLoopId = null;
    }
    this.#overlayRenderer.clear(this.#canvasCtx);
  }

  #detectionLoop = async () => {
    if (
      this.#isStopped ||
      !this.#videoElement ||
      this.#videoElement.readyState < 2
    ) {
      if (!this.#isStopped)
        this.#detectionLoopId = requestAnimationFrame(this.#detectionLoop);
      return;
    }

    const now = Date.now();
    const elapsed = now - this.#lastFrameTime;
    const fpsInterval = 1000 / this.#config.targetFPS;

    if (elapsed > fpsInterval) {
      this.#lastFrameTime = now - (elapsed % fpsInterval);
      await this.#faceDetector.send(this.#videoElement);
    }

    this.#detectionLoopId = requestAnimationFrame(this.#detectionLoop);
  };

  #onFaceMeshResults = (results) => {
    if (this.#isStopped) return;
    this.#overlayRenderer.draw(this.#canvasCtx, results.multiFaceLandmarks);
    const faces = results.multiFaceLandmarks;
    if (!faces || faces.length === 0) {
      if (
        Date.now() - this.#lastChallengeTime >
        this.#config.challengeTimeout
      ) {
        this.#failChallenge({
          code: "FACE_NOT_FOUND",
          message: "Could not detect a face.",
        });
      }
      return;
    }
    const landmarks = faces[0];
    this.#lastLandmarks = landmarks;
    this.#processChallenge(landmarks);
  };

  #processChallenge(landmarks) {
    if (this.#isChallengeProcessing) return;

    const currentStrategy = this.#activeChallenges[this.#currentChallengeIndex];
    if (!currentStrategy) return;

    const evaluation = currentStrategy.evaluate(landmarks, this.#config);

    if (currentStrategy.type === "WAITING") {
      this.#callbacks.onChallengeChanged(
        currentStrategy.type,
        evaluation.distance,
      );
    }

    const clampedProgress = Math.max(
      0,
      Math.min(evaluation.progress ?? 0, 1),
    );
    this.#callbacks.onProgress?.(clampedProgress, evaluation.rawValue);

    if (evaluation.passed) {
      this.#isChallengeProcessing = true;
      (async () => {
        await this.#recordChallengeFaceData(landmarks, currentStrategy.type);
        setTimeout(() => this.#moveToNextChallenge(), 300);
      })();
    } else if (
      Date.now() - this.#lastChallengeTime >
      this.#config.challengeTimeout
    ) {
      this.#failChallenge({
        code: "CHALLENGE_TIMEOUT",
        message: `Challenge timed out: ${currentStrategy.type}`,
      });
    }
  }

  async #recordChallengeFaceData(landmarks, challengeType) {
    try {
      const descriptor = await this.#extractDescriptorFromLandmarks(landmarks);
      this.#faceDataCollector.recordChallengeData({
        challengeType,
        descriptor,
        landmarks,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn(`Failed to capture face data for challenge ${challengeType}:`, err);
    }
  }

  async #extractDescriptorFromLandmarks(landmarks) {
    const inputSize = this.#featureExtractor.getInputSize();
    const faceTensor = this.#getFaceTensor(inputSize, landmarks);
    return await this.#extractDescriptorFromTensor(faceTensor);
  }

  async #extractDescriptorFromTensor(faceTensor) {
    const standardizedTensor = tf.tidy(() => {
      const mean = faceTensor.mean();
      const std = faceTensor
        .sub(mean)
        .square()
        .mean()
        .sqrt()
        .add(tf.scalar(1e-5));
      return faceTensor.sub(mean).div(std);
    });

    const descriptorArray =
      await this.#featureExtractor.extractDescriptor(standardizedTensor);
    tf.dispose([faceTensor, standardizedTensor]);
    return descriptorArray;
  }

  #failChallenge(error) {
    this.stop();
    this.#callbacks.onFailure(error);
  }

  #moveToNextChallenge() {
    this.#currentChallengeIndex++;
    if (this.#currentChallengeIndex >= this.#activeChallenges.length) {
      this.#completeLiveness();
    } else {
      this.#lastChallengeTime = Date.now();
      const nextStrategy = this.#activeChallenges[this.#currentChallengeIndex];
      nextStrategy.reset();
      this.#callbacks.onChallengeChanged(nextStrategy.type, null);
      this.#isChallengeProcessing = false;
    }
  }

  async #completeLiveness() {
    this.stop();
    this.#callbacks.onChallengeChanged("PROCESSING");
    try {
      const inputSize = this.#featureExtractor.getInputSize();
      const faceTensor = this.#getFaceTensor(inputSize, this.#lastLandmarks);

      const validationResult = await this.#pipeline.execute(
        faceTensor,
        this.#lastLandmarks,
        this.#config,
      );

      if (!validationResult.passed) {
        tf.dispose(faceTensor);
        return this.#failChallenge(validationResult.error);
      }

      const finalDescriptor = await this.#extractDescriptorFromTensor(faceTensor);

      if (this.#faceDataCollector.getRecords().length === 0) {
        this.#faceDataCollector.recordChallengeData({
          challengeType: "WAITING",
          descriptor: finalDescriptor,
          landmarks: this.#lastLandmarks,
          timestamp: Date.now(),
        });
      }

      const continuityResult = this.#faceDataCollector.verifyIdentityContinuity(
        this.#config.minIdentitySimilarity,
      );

      if (!continuityResult.passed) {
        return this.#failChallenge(continuityResult.error);
      }

      const aggregateDescriptor =
        this.#faceDataCollector.getAggregateDescriptor() || finalDescriptor;

      const timestamp = Date.now();
      const sessionToken = this.#config.sessionToken || "local-session";
      const integrity = generateIntegrityHash(
        aggregateDescriptor,
        sessionToken,
        timestamp,
      );

      this.#callbacks.onSuccess({
        descriptor: aggregateDescriptor,
        challengeFaceData: this.#faceDataCollector.getRecords(),
        sessionToken,
        timestamp,
        challenges: this.#activeChallenges.map((c) => c.type),
        integrity,
        antiSpoofing: validationResult.antiSpoofing,
        identityContinuity: {
          passed: continuityResult.passed,
          minSimilarity: continuityResult.minSimilarity,
        },
      });
    } catch (error) {
      console.error("Face recognition failed:", error);
      this.#failChallenge({
        code: "RECOGNITION_FAILED",
        message: error.message,
      });
    }
  }

  #getFaceTensor(inputSize, landmarks) {
    return tf.tidy(() => {
      const image = tf.browser.fromPixels(this.#videoElement);
      const [targetH, targetW] = inputSize;

      if (!landmarks) {
        return tf.image
          .resizeBilinear(image, [targetH, targetW])
          .toFloat()
          .div(tf.scalar(127.5))
          .sub(tf.scalar(1.0))
          .expandDims(0);
      }

      let box = this.#faceAligner?.getAlignedCropBox(landmarks);

      if (!box) {
        const xs = landmarks.map((l) => l.x);
        const ys = landmarks.map((l) => l.y);
        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);

        const w = xMax - xMin;
        const h = yMax - yMin;
        const padX = w * 0.2;
        const padY = h * 0.2;

        const y1 = Math.max(0, yMin - padY);
        const x1 = Math.max(0, xMin - padX);
        const y2 = Math.min(1, yMax + padY);
        const x2 = Math.min(1, xMax + padX);

        box = [[y1, x1, y2, x2]];
      }

      const boxInd = [0];

      const batchImage = image.expandDims(0).toFloat();
      const cropped = tf.image.cropAndResize(
        batchImage,
        tf.tensor2d(box),
        tf.tensor1d(boxInd, "int32"),
        [targetH, targetW],
      );

      return cropped.div(tf.scalar(127.5)).sub(tf.scalar(1.0));
    });
  }
}
