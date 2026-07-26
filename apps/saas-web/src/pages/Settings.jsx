import { AlertCircle, CheckCircle2, Lock, Shield, User } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { api } from "../services/api";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export default function Settings() {
  const user = api.auth.getCurrentUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      return setError(validation.error.issues[0].message);
    }

    setLoading(true);
    try {
      const response = await api.auth.changePassword(currentPassword, newPassword);
      setSuccess(response?.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Manage your administrator profile and security credentials.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-lg shadow-lg shadow-blue-200">
                {`${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "AD"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {user ? `${user.firstName} ${user.lastName}` : "Administrator"}
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  @{user?.username || "admin"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-slate-400" />
                  Email
                </span>
                <span className="font-semibold text-slate-900">{user?.email || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Role
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Change Password
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Ensure your account is using a long, random password to stay secure.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-xl">
              {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:outline-none active:translate-y-0 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
