import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../services/api";

const BANNED_WORDS = ["fuck", "shit", "ass", "bitch", "bastard", "damn", "cunt", "dick", "cock", "piss", "slut", "whore", "nigger", "faggot"];
const containsBannedWord = (val) => BANNED_WORDS.some((w) => val.toLowerCase().includes(w));
const nameRule = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be 50 characters or fewer")
  .regex(/^[a-zA-Z\s\-']+$/, "Only letters, spaces, hyphens, and apostrophes allowed")
  .refine((val) => !containsBannedWord(val), { message: "Name contains inappropriate language" });

const profileSchema = z.object({
  firstName: nameRule,
  lastName: nameRule,
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export default function Settings() {
  const user = api.auth.getCurrentUser();
  const [activeTab, setActiveTab] = useState("general");

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const isProfileDirty =
    firstName.trim() !== (user?.firstName || "").trim() ||
    lastName.trim() !== (user?.lastName || "").trim();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    const validation = profileSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    if (!validation.success) {
      return setProfileError(validation.error.issues[0].message);
    }

    setProfileLoading(true);
    try {
      await api.auth.updateProfile(firstName.trim(), lastName.trim());
      setProfileSuccess("Profile details updated successfully!");
      setTimeout(() => setProfileSuccess(""), 2000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

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
      await api.auth.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully! Logging you out...");
      
      setTimeout(async () => {
        await api.auth.logout();
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Account & Security Settings
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage your administrator profile, access credentials, and authentication security.
          </p>
        </div>
      </div>

      {/* Sub-navigation Tabs — Segmented Control */}
      <div className="inline-flex items-center rounded-xl bg-slate-100/80 border border-slate-200/60 p-1 gap-0.5">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-extrabold transition-colors duration-150 cursor-pointer ${
            activeTab === "general"
              ? "bg-white text-slate-900 shadow-sm border-slate-200/80"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className={`h-4 w-4 shrink-0 ${activeTab === "general" ? "text-blue-600" : "text-slate-400"}`} />
          <span>General Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-extrabold transition-colors duration-150 cursor-pointer ${
            activeTab === "security"
              ? "bg-white text-slate-900 shadow-sm border-slate-200/80"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Lock className={`h-4 w-4 shrink-0 ${activeTab === "security" ? "text-blue-600" : "text-slate-400"}`} />
          <span>Security & Credentials</span>
        </button>
      </div>

      {/* Tab 1: General Profile */}
      {activeTab === "general" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* User Profile Card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 font-black text-white text-lg shadow-md shadow-blue-500/20 shrink-0">
                  {`${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "AD"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-base truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "Administrator"}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-500 truncate">
                    @{user?.username || "admin"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-6 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 font-bold text-slate-500">
                    <User className="h-4 w-4 text-slate-400" />
                    Email Address
                  </span>
                  <span className="font-mono font-bold text-slate-900 truncate max-w-37.5">{user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 font-bold text-slate-500">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Access Role
                  </span>
                  <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Personal Profile Details
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Update your display name and contact email address.
                  </p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                      placeholder="Admin"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                      placeholder="User"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="email"
                      className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider"
                    >
                      Email Address (Primary Identity)
                    </label>
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase">
                      <Lock className="h-3 w-3" /> Managed by Auth Provider
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-xs font-bold text-slate-500 shadow-2xs cursor-not-allowed select-none"
                  />
                  <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                    Your email address serves as your primary identity and SSO authentication account identifier.
                  </p>
                </div>

                {profileError && (
                  <p className="text-xs font-semibold text-rose-600">{profileError}</p>
                )}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading || !isProfileDirty}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {profileLoading ? "Saving Profile..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Credentials */}
      {activeTab === "security" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Security Status Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Security Overview
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">Active Session</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                    HTTPS Verified
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-slate-800">API Scope</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                    Full Read/Write
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Authentication Credentials
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Update your administrative password to maintain platform security.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider"
                  >
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider"
                  >
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-2 text-[11px] font-bold">
                      {newPassword.length < 6 ? (
                        <span className="text-red-800">Too short (min 6 chars)</span>
                      ) : (
                        <span className="text-emerald-600">Good length</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider"
                  >
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Updating Credentials..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
