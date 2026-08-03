import { CheckCircle2, Crown, ShieldCheck, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../services/api";

const Billing = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTier();
  }, []);

  const fetchTier = async () => {
    try {
      const { subscriptionTier } = await api.billing.getTier();
      const currentUser = api.auth.getCurrentUser();
      const updatedUser = { ...currentUser, subscriptionTier };
      localStorage.setItem("liveness_admin", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to fetch tier:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    setMessage("");
    try {
      const { subscriptionTier } = await api.billing.upgrade();
      const updatedUser = { ...user, subscriptionTier };
      localStorage.setItem("liveness_admin", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("Successfully upgraded to PRO!");
    } catch {
      setMessage("Failed to upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleDowngrade = async () => {
    setUpgrading(true);
    setMessage("");
    try {
      const { subscriptionTier } = await api.billing.downgrade();
      const updatedUser = { ...user, subscriptionTier };
      localStorage.setItem("liveness_admin", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("Successfully downgraded to FREE tier.");
    } catch {
      setMessage("Failed to downgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const isPro = user?.subscriptionTier === "PRO";

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="border-b border-slate-200/80 pb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Subscription & Plans
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage your subscription tier, billing status, and usage quotas.
          </p>
        </div>
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton height={24} width={100} />
                  <Skeleton height={20} width={60} borderRadius={12} />
                </div>
                <Skeleton height={32} width={140} />
                <Skeleton height={12} width="100%" />
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <Skeleton height={16} width="85%" />
                  <Skeleton height={16} width="70%" />
                  <Skeleton height={16} width="50%" />
                </div>
                <Skeleton height={40} width="100%" borderRadius={12} />
              </div>
            ))}
          </div>
        </SkeletonTheme>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Subscription & Usage Quotas
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 max-w-xl">
            Manage your API subscription plan, upgrade quotas, and review enterprise billing capabilities.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`animate-in zoom-in-95 flex items-center gap-3.5 rounded-xl border p-4 duration-300 ${message.includes("Successfully") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          <div
            className={`rounded-lg p-1.5 shrink-0 ${message.includes("Successfully") ? "bg-emerald-100" : "bg-rose-100"}`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-extrabold">{message}</span>
        </div>
      )}

      <div className="grid max-w-5xl grid-cols-1 gap-8 text-left lg:grid-cols-2 items-stretch">
        {/* Free Plan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 relative">
          {user?.subscriptionTier === "free" && (
            <span className="absolute top-6 right-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 px-3 py-1 text-xs font-bold shrink-0">
              CURRENT PLAN
            </span>
          )}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">Free</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ideal for prototyping & testing</p>
            </div>
            <p className="mb-6 text-4xl font-black text-slate-900">
              $0
              <span className="text-base font-normal text-slate-400">
                /mo
              </span>
            </p>
            <ul className="mb-8 space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> 1,000 checks / month
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> Standard API rate limits
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> Community Support
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> Basic Analytics Dashboard
              </li>
            </ul>
          </div>
          <button
            disabled
            className="w-full rounded-xl bg-slate-100 py-3 text-center text-sm font-bold text-slate-400 cursor-not-allowed transition-colors"
          >
            {user?.subscriptionTier === "free" ? "Current Active Plan" : "Start for free"}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 sm:p-8 shadow-xl shadow-blue-600/5 relative flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pro</h3>
                <p className="text-xs text-slate-500 mt-0.5">For production & growing teams</p>
              </div>
              <span className="rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 px-3 py-1 text-xs font-bold shrink-0">
                {user?.subscriptionTier === "pro" ? "ACTIVE PLAN" : "POPULAR"}
              </span>
            </div>
            <p className="mb-6 text-4xl font-black text-slate-900">
              $49
              <span className="text-base font-normal text-slate-400">/mo</span>
            </p>
            <ul className="mb-8 space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-center font-medium text-slate-900">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> Unlimited checks
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> High-throughput API access
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> Priority 24/7 Support
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" /> Advanced Analytics & Real-Time Logs
              </li>
            </ul>
          </div>
          {user?.subscriptionTier === "free" ? (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {upgrading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                "Get Pro Access"
              )}
            </button>
          ) : (
            <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-center text-sm font-bold text-emerald-700 uppercase flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Your Active Plan
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="mb-5 text-base font-bold text-slate-900">
          Usage History
        </h3>
        <div className="flex items-center justify-between border-b border-slate-100 py-3">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Billing Cycle
          </span>
          <span className="text-xs font-bold text-slate-900">May 2026</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 py-3">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Next Invoice
          </span>
          <span className="text-xs font-bold text-slate-900">
            June 18, 2026
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Payment Method
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-9 items-center justify-center rounded border border-slate-200 bg-slate-100 text-[8px] font-black text-slate-400">
              VISA
            </div>
            <span className="text-xs font-bold text-slate-900">•••• 4242</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;


