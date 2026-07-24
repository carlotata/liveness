import { Router } from "express";
import apiKeyRoutes from "./api-key.routes.js";
import authRoutes from "./auth.routes.js";
import billingRoutes from "./billing.routes.js";
import logRoutes from "./log.routes.js";
import statsRoutes from "./stats.routes.js";
import userRoutes from "./user.routes.js";
import webhookRoutes from "./webhook.routes.js";

const router = Router();

router.use(authRoutes);
router.use("/stats", statsRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/billing", billingRoutes);
router.use("/logs", logRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/users", userRoutes);

export default router;