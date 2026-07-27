# @liveness/engine

Core computer vision logic and mathematical utilities for Active Liveness Detection. This package leverages MediaPipe Face Mesh and TensorFlow.js to provide low-level detection capabilities.

## Installation

```bash
npm install @liveness/engine
```

## Features

- **Face Mesh Integration**: Uses MediaPipe for accurate 3D facial landmark detection.
- **Mathematical Utilities**: EAR (Eye Aspect Ratio), Laplacian Variance (Texture Analysis), Depth Variance, and FFT (Moiré Detection).
- **Extensible Pipeline & Challenges**: Built with SOLID design principles (SRP, OCP, DIP) allowing custom challenge strategies and quality validators.
- **Configuration Driven**: Highly customizable detection parameters.

## Usage

This package is intended for use within the `@liveness/sdk` or for custom liveness detection implementations.

```javascript
import { LivenessEngine } from "@liveness/engine";

const callbacks = {
  onReady: () => console.log("Models loaded"),
  onChallengeChanged: (type, distance) => console.log("Next challenge:", type),
  onProgress: (progress, rawValue) => console.log("Progress:", progress),
  onSuccess: (data) => console.log("Liveness verified", data),
  onFailure: (error) => console.error("Verification failed", error),
};

const config = {
  challengeTimeout: 5000,
  targetFPS: 30,
  minBrightness: -0.92,
  maxFFTPeak: 180.0,
};

const engine = new LivenessEngine(callbacks, config);

await engine.load();
engine.start(videoElement, canvasContext);
```

## License

MIT

