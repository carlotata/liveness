# @liveness/sdk

An event-driven JavaScript SDK for browser-based **Active Liveness Detection** and **Face Identity Verification**.

## Installation

```bash
npm install @liveness/sdk
```

## Quick Start

```javascript
import { LivenessSDK } from "@liveness/sdk";

const sdk = new LivenessSDK({
  basePath: "/models",
  challengeTimeout: 10000,
  minBrightness: 50,
});

sdk.on("ready", () => console.log("SDK is ready"));
sdk.on("challenge", ({ type, instruction, distance }) => updateUI(instruction));
sdk.on("progress", ({ progress }) => updateProgressBar(progress));
sdk.on("success", (result) => {
  console.log("Verified!", result.descriptor);
  console.log("Security Metadata:", result.antiSpoofing);
});
sdk.on("failure", (error) => console.error("Validation failed:", error.code, error.message));
sdk.on("error", (error) => console.error("System error:", error.code, error.message));

await sdk.load();
await sdk.start(videoElement, canvasElement);
```

## API Reference

### Configuration Options (`new LivenessSDK(config)`)

- `basePath` (string, default: `""`): Base URL directory for model asset files.
- `minBrightness` (number, default: `50` or `-0.92` normalized): Minimum required brightness threshold.
- `maxFFTPeak` (number, default: `180.0`): Maximum peak threshold for digital screen Moiré pattern detection.
- `challengeTimeout` (number, default: `5000`): Maximum duration in ms allowed per challenge.
- `targetFPS` (number, default: `30`): Target FPS processing rate.
- `instructions` (object): Custom instruction text overrides.

### Event Reference

- `ready`: Fired when neural network models finish loading.
- `challenge`: Fired when an active challenge step changes or updates. Payload: `{ type, instruction, distance }`.
- `progress`: Fired as the user progresses through an active challenge step. Payload: `{ progress, rawValue }`.
- `success`: Fired upon successful completion of all challenges and anti-spoofing checks. Payload: `{ descriptor, sessionToken, timestamp, challenges, integrity, antiSpoofing }`.
- `failure`: Fired if anti-spoofing or active challenge validation fails. Payload: `{ code, message }`.
- `error`: Fired on hardware, browser, or initialization errors. Payload: `{ code, message }`.

## Features

- **Randomized Active Challenges**: Blink, Turn Left, Turn Right.
- **Advanced Anti-Spoofing**: FFT Moiré Detection, Laplacian Texture Analysis, Depth Variance.
- **Identity Verification**: Face identity feature extraction (1792-d vector) and matching.

## License

MIT

