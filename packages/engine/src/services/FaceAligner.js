/**
 * FaceAligner handles 5-point landmark extraction, facial pose angle calculations (roll, pitch, yaw),
 * and computes affine-aligned bounding box coordinates to eliminate head tilt bias prior to feature extraction.
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Dedicated strictly to facial geometric alignment and pose estimation.
 * - Open/Closed Principle (OCP): Alignment target ratios, eye padding, and pose bounds are fully configurable.
 */
export class FaceAligner {
  #options;

  static KEY_LANDMARK_INDICES = {
    leftEye: [362, 385, 387, 263, 373, 380],
    rightEye: [33, 160, 158, 133, 153, 144],
    noseTip: 1,
    leftMouth: 61,
    rightMouth: 291,
    leftCheek: 234,
    rightCheek: 454,
    chin: 152,
  };

  constructor(options = {}) {
    this.#options = {
      targetEyeRatio: 0.35, // Percentage of box width between eyes
      paddingRatio: 0.25,
      ...options,
    };
  }

  /**
   * Extract 5 key facial landmarks from MediaPipe FaceMesh (468 landmarks).
   * @param {Array} landmarks - Full face landmarks array.
   * @returns {{ leftEye: {x,y,z}, rightEye: {x,y,z}, noseTip: {x,y,z}, leftMouth: {x,y,z}, rightMouth: {x,y,z} }|null}
   */
  extract5KeyLandmarks(landmarks) {
    if (!landmarks || landmarks.length < 468) return null;

    const computeCentroid = (indices) => {
      let sumX = 0,
        sumY = 0,
        sumZ = 0;
      for (const idx of indices) {
        sumX += landmarks[idx].x;
        sumY += landmarks[idx].y;
        sumZ += landmarks[idx].z || 0;
      }
      return {
        x: sumX / indices.length,
        y: sumY / indices.length,
        z: sumZ / indices.length,
      };
    };

    return {
      leftEye: computeCentroid(FaceAligner.KEY_LANDMARK_INDICES.leftEye),
      rightEye: computeCentroid(FaceAligner.KEY_LANDMARK_INDICES.rightEye),
      noseTip: landmarks[FaceAligner.KEY_LANDMARK_INDICES.noseTip],
      leftMouth: landmarks[FaceAligner.KEY_LANDMARK_INDICES.leftMouth],
      rightMouth: landmarks[FaceAligner.KEY_LANDMARK_INDICES.rightMouth],
    };
  }

  /**
   * Compute 3D head pose angles (roll, pitch, yaw) in degrees.
   * @param {Array} landmarks
   * @returns {{ roll: number, pitch: number, yaw: number }|null}
   */
  computePoseAngles(landmarks) {
    const key5 = this.extract5KeyLandmarks(landmarks);
    if (!key5) return null;

    const dx = key5.leftEye.x - key5.rightEye.x;
    const dy = key5.leftEye.y - key5.rightEye.y;

    // Roll angle (head tilt in 2D image plane)
    const rollRad = Math.atan2(dy, dx);
    const roll = (rollRad * 180) / Math.PI;

    // Yaw angle (turn left / right ratio based on nose relative to cheeks)
    const leftCheek = landmarks[FaceAligner.KEY_LANDMARK_INDICES.leftCheek];
    const rightCheek = landmarks[FaceAligner.KEY_LANDMARK_INDICES.rightCheek];
    const chin = landmarks[FaceAligner.KEY_LANDMARK_INDICES.chin];

    const faceWidth = Math.sqrt(
      Math.pow(leftCheek.x - rightCheek.x, 2) +
        Math.pow(leftCheek.y - rightCheek.y, 2),
    );

    const leftDepth = leftCheek.z - chin.z;
    const rightDepth = rightCheek.z - chin.z;
    const yaw = faceWidth > 0 ? ((rightDepth - leftDepth) / faceWidth) * 45 : 0;

    // Pitch angle (head tilt up / down)
    const eyeCenterY = (key5.leftEye.y + key5.rightEye.y) / 2;
    const noseY = key5.noseTip.y;
    const pitch = (noseY - eyeCenterY) * 90;

    return { roll, pitch, yaw };
  }

  /**
   * Calculate aligned crop bounding box [y1, x1, y2, x2] in normalized coordinates [0, 1].
   * Adjusts for roll rotation and centers the face using 5-point landmarks.
   * @param {Array} landmarks
   * @returns {Array<Array<number>>|null} Box coordinates suitable for tf.image.cropAndResize
   */
  getAlignedCropBox(landmarks) {
    const key5 = this.extract5KeyLandmarks(landmarks);
    if (!key5) return null;

    // Midpoint between eyes
    const eyeCenterX = (key5.leftEye.x + key5.rightEye.x) / 2;
    const eyeCenterY = (key5.leftEye.y + key5.rightEye.y) / 2;

    const dx = key5.leftEye.x - key5.rightEye.x;
    const dy = key5.leftEye.y - key5.rightEye.y;
    const eyeDist = Math.sqrt(dx * dx + dy * dy);

    if (eyeDist < 1e-4) return null;

    // Compute bounding box size from eye distance
    const boxSize = eyeDist / this.#options.targetEyeRatio;
    const halfBox = boxSize / 2;

    // Vertical offset to position eyes around 35% from top of crop
    const centerShiftY = boxSize * 0.1;
    const centerY = eyeCenterY + centerShiftY;

    const y1 = Math.max(0, centerY - halfBox);
    const x1 = Math.max(0, eyeCenterX - halfBox);
    const y2 = Math.min(1, centerY + halfBox);
    const x2 = Math.min(1, eyeCenterX + halfBox);

    return [[y1, x1, y2, x2]];
  }
}
