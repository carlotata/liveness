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
    from: `"Liveness Cloud" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your Liveness Cloud password",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;border-radius:14px;padding:10px 14px;vertical-align:middle;">
                    <span style="font-size:20px;color:#ffffff;font-weight:800;letter-spacing:-0.5px;">&#x2713; Liveness Cloud</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.06);padding:40px 36px;">

              <!-- Icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#eff6ff;border-radius:16px;padding:16px;">
                      <span style="font-size:32px;">&#128274;</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:0 0 8px;text-align:center;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Password Reset Request</h1>
              <p style="margin:0 0 28px;text-align:center;font-size:14px;color:#64748b;line-height:1.6;">
                We received a request to reset the password for your Liveness Cloud administrator account. Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="${resetLink}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                      Reset My Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#92400e;">
                      &#9200;&nbsp; This link expires in <strong>30 minutes</strong>. If you didn't request a reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Raw Link Fallback -->
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-align:center;">If the button doesn't work, copy and paste this URL:</p>
              <p style="margin:0;font-size:11px;color:#2563eb;word-break:break-all;text-align:center;">
                <a href="${resetLink}" style="color:#2563eb;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} Liveness Cloud &bull; This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
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

export async function getCurrentUser(adminId) {
  const admin = await authRepositories.findAdminById(adminId);
  if (!admin) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return {
    id: admin.id,
    username: admin.username,
    firstName: admin.first_name,
    lastName: admin.last_name,
    email: admin.email,
    subscriptionTier: admin.subscription_tier,
  };
}
