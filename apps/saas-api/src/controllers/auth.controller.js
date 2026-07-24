import { z } from "zod";
import * as authServices from "../services/auth.service.js";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must have at least 1 upper case.")
    .regex(/[a-z]/, "Password must have at least 1 lower case.")
    .regex(/[0-9]/, "Password must have at least 1 number.")
    .max(72, "Password must not exceed 72 characters"),
});

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password must not exceed 72 characters"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must have at least 1 upper case.")
    .regex(/[a-z]/, "Password must have at least 1 lower case.")
    .regex(/[0-9]/, "Password must have at least 1 number.")
    .max(72, "Password must not exceed 72 characters"),
});

export async function signup(req, res) {
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { username, password, firstName, lastName, email } = validation.data;

  try {
    const result = await authServices.signup(
      username,
      password,
      firstName,
      lastName,
      email,
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.code === "23505") {
      if (error.detail.includes("username")) {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (error.detail.includes("email")) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create administrator account" });
  }
}

export async function login(req, res) {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { username, password } = validation.data;

  try {
    const result = await authServices.login(username, password);

    res.json({
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.status === 401) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred during login" });
  }
}

export async function forgotPassword(req, res) {
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { email } = validation.data;
  try {
    await authServices.forgotPassword(email);
    res.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

export async function resetPassword(req, res) {
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { token, newPassword } = validation.data;
  try {
    await authServices.resetPassword(token, newPassword);
    res.status(204).send();
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to reset password." });
  }
}

export async function changePassword(req, res) {
  const adminId = req.user.id;
  const validation = changePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }
  const { currentPassword, newPassword } = validation.data;
  try {
    await authServices.changePassword(adminId, currentPassword, newPassword);
    res.status(204).send();
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to change password." });
  }
}