import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../layouts/AuthLayout";
import { api } from "../services/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword({ modal = false }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    setFieldErrors({});
    setSuccessMessage("");

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldErrors({ email: validation.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.forgotPassword(email);
      setSuccessMessage(
        response?.message || "Password reset link sent to your email address."
      );
    } catch (err) {
      setError(err.message || "Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasFieldErrors = Object.keys(fieldErrors).some((key) => fieldErrors[key]);

  const formContent = (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Forgot Password
            </h2>
            <p className="text-xs font-medium text-slate-400">
              We'll send you a recovery link
            </p>
          </div>
        </div>
        {modal && (
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {successMessage ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              {successMessage}
            </p>
          </div>
          <Link
            to="/login"
            state={modal ? location.state : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Top Error Banner */}
          {!hasFieldErrors && error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 shadow-2xs">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 mb-0.5">Error</p>
                <p className="font-medium text-red-600 leading-normal">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail
                  className={`h-4 w-4 ${
                    fieldErrors.email ? "text-red-500" : "text-slate-400"
                  }`}
                />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({});
                }}
                className={`block w-full rounded-lg border py-2.5 pr-9 pl-9 text-sm font-medium transition-all ${
                  fieldErrors.email
                    ? "border-red-500 bg-red-50/20 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                    : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                }`}
                placeholder="admin@example.com"
              />
              {fieldErrors.email && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {fieldErrors.email && (
              <p className="mt-1 ml-1 text-xs font-medium text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:outline-none active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              state={modal ? location.state : undefined}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );

  if (modal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={handleClose}
        />
        <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl shadow-slate-200">
        {formContent}
      </div>
    </AuthLayout>
  );
}
