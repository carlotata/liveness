export interface ChallengeFaceDataRecord {
  challengeType: string;
  descriptor: number[];
  landmarks?: any[] | null;
  timestamp: number;
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
  instructions?: {
    WAITING?: string;
    BLINK?: string;
    TURN_LEFT?: string;
    TURN_RIGHT?: string;
    PROCESSING?: string;
  };
}

export interface LivenessResult {
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
}

export interface LivenessError {
  code: string;
  message: string;
}

export type LivenessEvent =
  | "ready"
  | "challenge"
  | "progress"
  | "success"
  | "failure"
  | "error";

export class LivenessSDK {
  constructor(config?: LivenessConfig);
  on(event: "ready", callback: () => void): this;
  on(
    event: "challenge",
    callback: (payload: {
      type: string;
      instruction: string;
      distance: "CLOSER" | "FURTHER" | null;
    }) => void,
  ): this;
  on(
    event: "progress",
    callback: (payload: { progress: number; rawValue: any }) => void,
  ): this;
  on(event: "success", callback: (result: LivenessResult) => void): this;
  on(event: "failure" | "error", callback: (error: LivenessError) => void): this;
  on(event: string, callback: Function): this;
  off(event: string, callback: Function): this;
  load(): Promise<void>;
  updateConfig(config?: Partial<LivenessConfig>): this;
  start(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    options?: Partial<LivenessConfig>,
  ): Promise<void>;
  stop(videoElement?: HTMLVideoElement): void;
}
