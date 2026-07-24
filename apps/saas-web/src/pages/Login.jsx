import { Lock as LockIcon, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../services/api";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-linear-to-br from-slate-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-blue-600 p-3 shadow-xl shadow-blue-200">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Welcome Back
        </h2>
        <p className="mt-3 text-sm sm:text-base font-medium text-slate-500">
          Sign in to manage your liveness services
        </p>
      </div>

      <div className="mt-8 sm:mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl sm:rounded-[2.5rem] border border-slate-100 bg-white px-5 py-8 sm:px-8 sm:py-10 shadow-2xl shadow-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="animate-shake rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="mb-2 ml-1 block text-sm font-bold text-slate-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-11 font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none sm:text-sm"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 ml-1 block text-sm font-bold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-11 font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-2xl bg-blue-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:outline-none active:translate-y-0 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in to Dashboard"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-medium text-slate-500">
                  New to Liveness Cloud?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                Create your account today &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
