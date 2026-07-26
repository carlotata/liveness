export interface ChallengeFaceDataRecord {
  challengeType: string;
  descriptor: number[];
  landmarks?: any[] | null;
  timestamp: number;
}

export interface LivenessCallbacks {
  onReady: () => void;
  onSuccess: (result: {
    descriptor: number[];
    challengeFaceData?: ChallengeFaceDataRecord[];
    sessionToken: string;
    timestamp: number;
    challenges: string[];
    integrity: string;
    antiSpoofing: {
      depthVariance: number;
      laplacianVariance: number;
      brightness: number;
      occlusionDetected: boolean;
      fftPeak: number;
    };
    identityContinuity?: {
      passed: boolean;
      minSimilarity: number;
    };
  }) => void;
  onFailure: (error: { code: string; message: string }) => void;
  onChallengeChanged: (
    challengeType: string,
    distanceHint?: "CLOSER" | "FURTHER" | null,
  ) => void;
  onProgress?: (progress: number, rawValue: any) => void;
}

export interface LivenessConfig {
  blinkEARThreshold?: number;
  headTurnThreshold?: number;
  challengeTimeout?: number;
  targetFPS?: number;
  minFaceSize?: number;
  maxFaceSize?: number;
  basePath?: string;
  minBrightness?: number;
  maxBrightness?: number;
  maxFFTPeak?: number;
  sessionToken?: string;
  minDepthVariance?: number;
  minLaplacianVariance?: number;
  minIdentitySimilarity?: number;
  challenges?: string[];
}

export class LivenessEngine {
  constructor(callbacks: LivenessCallbacks, config?: LivenessConfig);
  load(): Promise<void>;
  updateConfig(config?: Partial<LivenessConfig>): void;
  start(videoElement: HTMLVideoElement, canvasCtx: CanvasRenderingContext2D): void;
  stop(): void;
}
