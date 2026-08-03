import { AlertCircle, Eye, EyeOff, Lock as LockIcon, ShieldCheck, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthLayout from "../layouts/AuthLayout";
import { api } from "../services/api";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login({ modal = false }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Close modal on Escape key
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

    const validation = loginSchema.safeParse({ username, password });
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0]] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setLoading(true);
    try {
      await api.auth.login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
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
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Sign in to your console
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Top Error Banner */}
        {!hasFieldErrors && error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 shadow-2xs">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 mb-0.5">Authentication Error</p>
              <p className="font-medium text-red-600 leading-normal">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="username"
            className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <User
                className={`h-4 w-4 ${
                  fieldErrors.username ? "text-red-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username)
                  setFieldErrors((prev) => ({ ...prev, username: null }));
              }}
              className={`block w-full rounded-lg border py-2.5 pr-9 pl-9 text-sm font-medium transition-all ${
                fieldErrors.username
                  ? "border-red-500 bg-red-50/20 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                  : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
              }`}
              placeholder="johndoe"
            />
            {fieldErrors.username && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          {fieldErrors.username && (
            <p className="mt-1 ml-1 text-xs font-medium text-red-600">
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <LockIcon
                className={`h-4 w-4 ${
                  fieldErrors.password ? "text-red-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password)
                  setFieldErrors((prev) => ({ ...prev, password: null }));
              }}
              className={`block w-full rounded-lg border py-2.5 pr-9 pl-9 text-sm font-medium transition-all ${
                fieldErrors.password
                  ? "border-red-500 bg-red-50/20 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none"
                  : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 ml-1 text-xs font-medium text-red-600">
              {fieldErrors.password}
            </p>
          )}
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              state={modal ? location.state : undefined}
              className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:outline-none active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign in to Dashboard"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center justify-center">
          <div className="flex-1 border-t border-slate-100" />
          <span className="mx-4 text-xs font-medium text-slate-400">
            New to Liveness Cloud?
          </span>
          <div className="flex-1 border-t border-slate-100" />
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/signup"
            state={modal ? location.state : undefined}
            className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            Create your account today &rarr;
          </Link>
        </div>
      </div>
    </div>
  );

  if (modal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={handleClose}
        />
        {/* Modal Card */}
        <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  // Standalone full-page fallback (direct URL access)
  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl shadow-slate-200">
        {formContent}
      </div>
    </AuthLayout>
  );
}
