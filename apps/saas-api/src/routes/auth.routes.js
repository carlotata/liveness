import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";
const router = Router();

const signupLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many signup attempts, please try again later.",
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, please try again later.",
});

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests, please try again later.",
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many attempts, please try again later.",
});

router.post("/signup", signupLimiter, authController.signup);
router.post("/login", loginLimiter, authController.login);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, authController.resetPassword);
router.post("/change-password", authenticateToken, authController.changePassword);

export default router;
