import crypto from "crypto";
import express from "express";
import { z } from "zod";
import pool from "../db.js";

import { ScoreCalibrator } from "../services/ScoreCalibrator.js";

const router = express.Router();

const formatVector = (vector) => `[${vector.join(",")}]`;

const generateIntegrityHash = (descriptor, sessionToken, timestamp) => {
  const data = JSON.stringify(descriptor) + sessionToken + timestamp;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
};

const triggerWebhooks = async (adminId, event, data) => {
  try {
    const webhooks = await pool.query(
      "SELECT id, url, secret FROM webhooks WHERE admin_id = $1 AND is_active = TRUE",
      [adminId],
    );

    const payload = JSON.stringify({
      event,
      timestamp: Date.now(),
      data,
    });

    for (const webhook of webhooks.rows) {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(payload)
        .digest("hex");

      const startTime = Date.now();

      fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-liveness-signature": signature,
        },
        body: payload,
      })
        .then(async (res) => {
          const latency = Date.now() - startTime;
          let bodyText = "";
          try {
            bodyText = await res.text();
            if (bodyText.length > 2000) {
              bodyText = bodyText.substring(0, 2000) + "... (truncated)";
            }
          } catch (err) {
            void err;
          }

          await pool.query(
            "INSERT INTO webhook_logs (webhook_id, admin_id, event, url, status_code, response_body, latency_ms) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
              webhook.id,
              adminId,
              event,
              webhook.url,
              res.status,
              bodyText,
              latency,
            ],
          );
        })
        .catch(async (err) => {
          const latency = Date.now() - startTime;
          await pool.query(
            "INSERT INTO webhook_logs (webhook_id, admin_id, event, url, error_message, latency_ms) VALUES ($1, $2, $3, $4, $5, $6)",
            [webhook.id, adminId, event, webhook.url, err.message, latency],
          );
          console.error(
            `Webhook delivery failed to ${webhook.url}:`,
            err.message,
          );
        });
    }
  } catch (err) {
    console.error("Failed to trigger webhooks:", err);
  }
};

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res
      .status(401)
      .json({ error: "API key is required in x-api-key header" });
  }

  try {
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const result = await pool.query(
      `SELECT k.admin_id as "adminId", a.subscription_tier as "subscriptionTier"
       FROM api_keys k
       JOIN admins a ON k.admin_id = a.id
       WHERE k.key_hash = $1`,
      [hash],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const { adminId, subscriptionTier } = result.rows[0];
    req.adminId = adminId;

    if (subscriptionTier === "free") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const countResult = await pool.query(
        "SELECT COUNT(*) FROM verification_logs WHERE admin_id = $1 AND timestamp >= $2",
        [adminId, startOfMonth],
      );
      const count = parseInt(countResult.rows[0].count);
      if (count >= 1000) {
        return res.status(402).json({
          error:
            "Verification monthly quota exceeded. Starter plan is limited to 1,000 checks per month. Please upgrade to Pro.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("API Key Auth Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
};

const commonPayload = {
  descriptor: z
    .array(z.number())
    .length(1792, "Descriptor must be exactly 1792 dimensions"),
  sessionToken: z.string().min(1, "Session token is required"),
  timestamp: z.number(),
  challenges: z.array(z.string()).min(1, "Challenges are required"),
  integrity: z.string().min(1, "Integrity hash is required"),
  antiSpoofing: z.any().optional(),
};

const enrollSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ...commonPayload,
});

const verifySchema = z.object({
  ...commonPayload,
  threshold: z.number().min(0).max(1).optional(),
});

const validateIntegrity = (req, res, next) => {
  const { descriptor, sessionToken, timestamp, integrity } = req.body;

  if (!descriptor || !sessionToken || !timestamp || !integrity) {
    return res.status(400).json({ error: "Missing security metadata" });
  }

  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  if (timestamp < tenMinutesAgo) {
    return res.status(400).json({ error: "Session expired or clock desync" });
  }

  const expectedHash = generateIntegrityHash(
    descriptor,
    sessionToken,
    timestamp,
  );
  if (integrity !== expectedHash) {
    return res.status(400).json({ error: "Payload integrity check failed" });
  }

  next();
};

router.post(
  "/enroll",
  authenticateApiKey,
  validateIntegrity,
  async (req, res) => {
    const validation = enrollSchema.safeParse(req.body);

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.issues[0].message });
    }

    const { name, descriptor } = validation.data;

    try {
      const result = await pool.query(
        "INSERT INTO users (admin_id, name, descriptor) VALUES ($1, $2, $3) RETURNING id, name, enrolled_at",
        [req.adminId, name, formatVector(descriptor)],
      );

      const enrolledUser = result.rows[0];

      await pool.query(
        "INSERT INTO verification_logs (admin_id, user_id, user_name, score, status, anti_spoofing) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          req.adminId,
          enrolledUser.id,
          enrolledUser.name,
          1.0,
          "ENROLLED",
          req.body.antiSpoofing ? JSON.stringify(req.body.antiSpoofing) : null,
        ],
      );

      triggerWebhooks(req.adminId, "user.enrolled", enrolledUser);

      res.status(201).json(enrolledUser);
    } catch (error) {
      console.error("Enrollment error:", error);
      res.status(500).json({ error: "Failed to enroll user." });
    }
  },
);

router.post(
  "/verify",
  authenticateApiKey,
  validateIntegrity,
  async (req, res) => {
    const validation = verifySchema.safeParse(req.body);

    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.issues[0].message });
    }

    const { descriptor, threshold } = validation.data;
    const calibrator = new ScoreCalibrator(
      threshold !== undefined ? threshold : 0.65,
    );
    const effectiveThreshold = calibrator.calculateAdaptiveThreshold({
      antiSpoofing: req.body.antiSpoofing,
      identityContinuity: req.body.identityContinuity,
    });

    try {
      const queryText = `
      SELECT id, name, 1 - (descriptor <=> $1) AS similarity
      FROM users
      WHERE admin_id = $2
      ORDER BY descriptor <=> $1
      LIMIT 1
    `;
      const result = await pool.query(queryText, [
        formatVector(descriptor),
        req.adminId,
      ]);

      let status = "FAILURE";
      let match = null;
      let confidence = "NONE";

      if (result.rows.length > 0) {
        match = result.rows[0];
        const evalResult = calibrator.evaluateConfidence(
          match.similarity,
          effectiveThreshold,
        );
        if (evalResult.verified) {
          status = "SUCCESS";
          confidence = evalResult.confidence;
        }
      }

      await pool.query(
        "INSERT INTO verification_logs (admin_id, user_id, user_name, score, status, anti_spoofing) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          req.adminId,
          match?.id || null,
          match?.name || "Unknown",
          match?.similarity || 0,
          status,
          req.body.antiSpoofing ? JSON.stringify(req.body.antiSpoofing) : null,
        ],
      );

      const responsePayload = {
        verified: status === "SUCCESS",
        confidence,
        effectiveThreshold,
        match: match
          ? { name: match.name, similarity: match.similarity }
          : null,
        status,
      };

      triggerWebhooks(req.adminId, "liveness.verified", responsePayload);

      res.json(responsePayload);
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify identity." });
    }
  },
);

export default router;
