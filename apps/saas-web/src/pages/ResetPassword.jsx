import { CheckCircle2, Clock, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../layouts/AuthLayout";
import { api } from "../services/api";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPassword({ modal = false }) {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!tokenFromUrl) {
      // No token in URL — redirect back to forgot-password
      navigate("/forgot-password", { replace: true });
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  const handleClose = () => {
    navigate(location.state?.backgroundLocation?.pathname || "/", {
      replace: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validation = resetPasswordSchema.safeParse({
      token: tokenFromUrl,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      return setError(validation.error.issues[0].message);
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(tokenFromUrl, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Reset Password
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Set a new secure password
            </p>
          </div>
        </div>
        {modal && (
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Expiry notice */}
      <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <Clock className="h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs font-semibold text-amber-700">
          This link expires in <span className="font-black">30 minutes</span>. Please complete the reset promptly.
        </p>
      </div>

      {success ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Password Reset Complete</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
          </div>
          <Link
            to="/login"
            state={modal ? location.state : undefined}
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 cursor-pointer"
          >
            Sign in with New Password
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="animate-shake rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}


          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:outline-none active:translate-y-0 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Updating password..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );

  if (modal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200">
        {formContent}
      </div>
    </AuthLayout>
  );
}
