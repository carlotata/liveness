import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepositories from "../repositories/auth.repository.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-fallback-secret-for-dev-only";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

export async function signup(username, password, firstName, lastName, email) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = await authRepositories.createAdmin(
    username,
    passwordHash,
    firstName,
    lastName,
    email,
  );
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
  return { ...admin, token };
}

export async function login(username, password) {
  const admin = await authRepositories.findAdminByUsername(username);

  if (!admin) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: "24h" },
  );

  return {
    id: admin.id,
    username: admin.username,
    firstName: admin.first_name,
    lastName: admin.last_name,
    email: admin.email,
    subscriptionTier: admin.subscription_tier,
    token: token,
  };
}

export async function forgotPassword(email) {
  const admin = await authRepositories.findAdminByEmail(email);
  if (!admin) {
    return;
  }
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await authRepositories.addToken(admin.id, expiresAt, tokenHash);
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  await sendResetPasswordEmail(admin.email, resetLink);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendResetPasswordEmail(to, resetLink) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "Password reset request",
    html: `<p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}

export async function resetPassword(token, newPassword) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await authRepositories.findValidResetToken(tokenHash);

  const isInvalid =
    !resetToken ||
    resetToken.used_at ||
    new Date(resetToken.expires_at) < new Date();

  if (isInvalid) {
    const error = new Error("Invalid or expired reset token");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await authRepositories.updateAdminPassword(resetToken.admin_id, passwordHash);
  await authRepositories.markTokenUsed(resetToken.id);
}

export async function changePassword(adminId, currentPassword, newPassword) {
  const existingUser = await authRepositories.findAdminById(adminId);
  if (!existingUser) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }
  const isMatch = await bcrypt.compare(
    currentPassword,
    existingUser.password_hash,
  );
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.status = 401;
    throw error;
  }
  const isSameAsCurrent = currentPassword === newPassword;
  if (isSameAsCurrent) {
    const error = new Error(
      "New password must not be the same with current password.",
    );
    error.status = 400;
    throw error;
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  const updatePassword = await authRepositories.changePassword(
    adminId,
    newPasswordHash,
  );
  if (updatePassword === 0) {
    const error = new Error("Failed to update password.");
    error.status = 500;
    throw error;
  }
  return updatePassword;
}