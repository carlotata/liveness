import { Lock as LockIcon, ShieldCheck, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../services/api";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login({ modal = false }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

    const validation = loginSchema.safeParse({ username, password });
    if (!validation.success) {
      return setError(validation.error.issues[0].message);
    }

    setLoading(true);
    try {
      await api.auth.login(username, password);
      navigate(from, { replace: true });
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
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
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
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="animate-shake rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
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
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
              placeholder="johndoe"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <LockIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        {/* Modal Card */}
        <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  // Standalone full-page fallback (direct URL access)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200">
        {formContent}
      </div>
    </div>
  );
}
