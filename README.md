# Liveness SDK

An event-driven JavaScript SDK for browser-based **Active Liveness Detection** and **Face Identity Verification**. This library leverages MediaPipe Face Mesh and TensorFlow.js (MobileNet V2) to provide a complete eKYC-ready frontend solution.

> **Note**: For the full interactive documentation, integration guides, and real-time API reference, please visit our **Documentation Portal** at http://localhost:5173/docs.

## Key Features

- **Randomized Active Challenges**: Prevents replay attacks by requiring users to perform random actions (Blink, Turn Left, Turn Right) generated at runtime.
- **Identity Enrollment & Verification**: Full biometric flow including face feature extraction and Cosine Similarity matching (0.65 threshold with adaptive confidence rating).
- **Advanced Anti-Spoofing**:
  - **FFT Moire Detection**: Detects digital screen sub-pixel patterns.
  - **Laplacian Texture Analysis**: Identifies low-quality print or digital screen textures.
  - **Depth Variance**: Uses 3D landmarks to differentiate between flat photos and real human faces.
- **Secure SaaS Cloud**: Complete management dashboard with JWT Authentication, API key management, and real-time webhook notifications.

## Project Structure

This project is organized as a monorepo:

- `apps/demo`: The primary React-based demonstration and playground.
- `apps/saas-web`: The SaaS platform frontend dashboard and documentation portal.
- `apps/saas-api`: The SaaS orchestration and verification backend.
- `packages/engine`: Core computer vision logic and mathematical utilities.
- `packages/sdk`: The public-facing SDK wrapper for easy integration.

## Installation

```bash
npm install @liveness/sdk
```

## Quick Start

```javascript
import { LivenessSDK } from "@liveness/sdk";

const sdk = new LivenessSDK({
  challengeTimeout: 10000,
  minBrightness: 50,
});

sdk.on("challenge", ({ type, instruction }) => updateUI(instruction));
sdk.on("progress", ({ progress }) => updateProgressBar(progress));
sdk.on("success", (result) => {
  console.log("Verified!", result.descriptor);
  console.log("Security Metadata:", result.antiSpoofing);
});
sdk.on("failure", (error) => console.error("Validation failed:", error.message));
sdk.on("error", (error) => console.error("System error:", error.code, error.message));

await sdk.load();
await sdk.start(videoElement, canvasElement);
```

## Local Development

### Prerequisites

- **Node.js**: v18 or higher.
- **PostgreSQL**: With the `pgvector` extension installed.

### Initial Setup

1. Install dependencies from the root directory:
   ```bash
   npm install
   ```
2. Initialize the database:
   ```bash
   cd apps/saas-api
   npm run init-db
   ```

### Running the Project

Use the following commands from the root directory to start the services:

- **Start Demo App**: `npm run dev`
- **Start SaaS API**: `npm run dev:api`
- **Start SaaS Dashboard**: `npm run dev:saas`

## Testing and Building

- **Run Tests**: `npm test`
- **Build SDK**: `npm run build:sdk`

## API Reference

### `new LivenessSDK(config)`

Configuration options:
- `basePath` (string, default: `""`): Base URL path for loading MediaPipe and TF.js model assets.
- `minBrightness` (number, default: `-0.92` or `50` on 0-255 scale): Minimum acceptable frame brightness.
- `maxBrightness` (number, default: `0.95`): Maximum threshold before glare is flagged.
- `maxFFTPeak` (number, default: `180.0`): Threshold peak for digital screen Moiré pattern detection.
- `challengeTimeout` (number, default: `5000`): Maximum time in milliseconds permitted per active challenge step.
- `targetFPS` (number, default: `30`): Frame rate processing limit.
- `instructions` (object): Custom instruction text strings per challenge type (`WAITING`, `BLINK`, `TURN_LEFT`, `TURN_RIGHT`, `PROCESSING`).

### Instance Methods

- `await sdk.load()`: Pre-loads face mesh and feature extraction models. Checks WebAssembly and WebGL browser support.
- `await sdk.start(videoElement, canvasElement, options?)`: Starts camera stream and begins liveness detection loop.
- `sdk.stop(videoElement)`: Stops liveness loop, camera video tracks, and clears canvas overlays.
- `sdk.updateConfig(newConfig)`: Dynamically updates SDK and underlying engine runtime configurations.
- `sdk.on(event, callback)`: Registers event listener callback.
- `sdk.off(event, callback)`: Removes event listener callback.

### Events Reference

- `ready`: Models and environment checks have completed successfully.
- `challenge`: Emitted when a new challenge begins or distance updates. Payload: `{ type, instruction, distance }`.
- `progress`: Emitted during challenge execution. Payload: `{ progress, rawValue }`.
- `success`: All active challenges and anti-spoofing checks passed. Payload: `{ descriptor, sessionToken, timestamp, challenges, integrity, antiSpoofing }`.
- `failure`: Anti-spoofing validation or active challenge check failed. Payload: `{ code, message }`.
- `error`: System or hardware level failure encountered. Payload: `{ code, message }`.

## Webhook Security

All webhook payloads are signed with **HMAC-SHA256**. To prevent formatting or key-ordering issues, verify the `x-liveness-signature` header using the raw request body buffer:

```javascript
const expected = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(req.rawBody) // Use raw request body buffer
  .digest("hex");
```

To capture `req.rawBody` in an Express application:

```javascript
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
```

## Error Codes

### Quality & Anti-Spoofing Failures (`failure` event)
- `POOR_LIGHTING`: Environment is too dark or excessive glare detected.
- `SPOOF_DETECTED`: Digital screen Moiré patterns or flat 2D surfaces detected.
- `OCCLUSION_DETECTED`: Face is partially covered or obscured.
- `FACE_NOT_FOUND`: Face not detected within allowed challenge timeout.
- `CHALLENGE_TIMEOUT`: User failed to complete required action within time limit.
- `RECOGNITION_FAILED`: Biometric feature extraction or normalization failed.

### Hardware & Environment Errors (`error` event)
- `WASM_NOT_SUPPORTED`: WebAssembly is disabled or unsupported in browser.
- `WEBGL_NOT_SUPPORTED`: WebGL hardware acceleration unavailable.
- `CAMERA_ACCESS_DENIED`: Camera permissions denied by user or system policy.
- `CAMERA_NOT_FOUND`: No video input device found.
- `BROWSER_NOT_SUPPORTED`: Browser does not support `navigator.mediaDevices`.
- `MODEL_LOAD_FAILED`: Failed to fetch or initialize neural network models.

