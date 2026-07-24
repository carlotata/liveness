import { CheckCircle2, Crown, ShieldCheck, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";
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

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 sm:space-y-10 duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Subscription & Usage
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
          Manage your plan and billing preferences
        </p>
      </div>

      {message && (
        <div
          className={`animate-in zoom-in-95 flex items-center gap-4 rounded-3xl sm:rounded-4xl border p-4 sm:p-6 duration-300 ${message.includes("Successfully") ? "border-emerald-100 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100/50" : "border-red-100 bg-red-50 text-red-700"}`}
        >
          <div
            className={`rounded-xl p-2 shrink-0 ${message.includes("Successfully") ? "bg-emerald-100" : "bg-red-100"}`}
          >
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold">{message}</span>
        </div>
      )}

      <div className="grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Free Plan */}
        <div
          className={`relative rounded-3xl sm:rounded-[2.5rem] border bg-white p-6 sm:p-8 lg:p-10 transition-all ${user?.subscriptionTier === "free" ? "border-blue-200 shadow-2xl ring-4 shadow-blue-100 ring-blue-50" : "border-slate-100 opacity-80 shadow-xs"}`}
        >
          {user?.subscriptionTier === "free" && (
            <div className="absolute -top-4 left-6 sm:left-10 rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-lg shadow-blue-200">
              Current Plan
            </div>
          )}

          <div className="mb-6 sm:mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Starter</h2>
              <p className="mt-1 text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase italic">
                Free Forever
              </p>
            </div>
            <Zap
              className={`h-7 w-7 sm:h-8 sm:w-8 ${user?.subscriptionTier === "free" ? "text-blue-600" : "text-slate-200"}`}
            />
          </div>

          <div className="mb-8 sm:mb-10">
            <span className="text-4xl sm:text-5xl font-black text-slate-900">$0</span>
            <span className="ml-2 text-sm font-bold text-slate-400">/ month</span>
          </div>

          <ul className="mb-8 sm:mb-12 space-y-4 sm:space-y-5">
            {[
              "Up to 1,000 checks / mo",
              "Basic Analytics Console",
              "Community Support Access",
              "Single API Key issuance",
            ].map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-600"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full cursor-not-allowed rounded-2xl border border-slate-100 bg-slate-50 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-widest text-slate-400 uppercase transition-all"
          >
            {user?.subscriptionTier === "free" ? "Active Plan" : "Free Plan"}
          </button>
        </div>

        {/* Pro Plan */}
        <div
          className={`relative rounded-3xl sm:rounded-[2.5rem] border bg-white p-6 sm:p-8 lg:p-10 transition-all ${user?.subscriptionTier === "pro" ? "border-indigo-200 shadow-2xl ring-4 shadow-indigo-100 ring-indigo-50" : "border-slate-100 shadow-xl hover:-translate-y-1 hover:shadow-2xl"}`}
        >
          {user?.subscriptionTier === "pro" && (
            <div className="absolute -top-4 left-6 sm:left-10 rounded-full bg-indigo-600 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-lg shadow-indigo-200">
              Active Pro
            </div>
          )}

          <div className="mb-6 sm:mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Professional
                </h2>
                <Crown className="h-5 w-5 fill-amber-400 text-amber-400 shrink-0" />
              </div>
              <p className="mt-1 text-xs sm:text-sm font-bold tracking-widest text-indigo-600 uppercase">
                Scale without limits
              </p>
            </div>
            <Star
              className={`h-7 w-7 sm:h-8 sm:w-8 ${user?.subscriptionTier === "pro" ? "text-indigo-600" : "text-slate-200"}`}
            />
          </div>

          <div className="mb-8 sm:mb-10">
            <span className="text-4xl sm:text-5xl font-black text-slate-900">$49</span>
            <span className="ml-2 text-sm font-bold text-slate-400">/ month</span>
          </div>

          <ul className="mb-8 sm:mb-12 space-y-4 sm:space-y-5">
            {[
              "Unlimited verification checks",
              "Advanced Neural Analytics",
              "Priority 24/7 Support",
              "Unlimited API Keys",
              "Custom Webhook Integration",
            ].map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-600"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-500" />
                {feature}
              </li>
            ))}
          </ul>

          {user?.subscriptionTier === "free" ? (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-widest text-white uppercase shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] hover:shadow-blue-300 active:scale-100 disabled:opacity-50"
            >
              {upgrading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white" />
                  Upgrade Now
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-widest text-emerald-700 uppercase">
              <ShieldCheck className="h-5 w-5" />
              Your Current Plan
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl rounded-3xl sm:rounded-4xl border border-slate-100 bg-white p-5 sm:p-8 shadow-xs">
        <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-black text-slate-900">
          Usage History
        </h3>
        <div className="flex items-center justify-between border-b border-slate-50 py-3 sm:py-4">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase">
            Billing Cycle
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900">May 2026</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-50 py-3 sm:py-4">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase">
            Next Invoice
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900">
            June 18, 2026
          </span>
        </div>
        <div className="flex items-center justify-between py-3 sm:py-4">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase">
            Payment Method
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-9 sm:h-6 sm:w-10 items-center justify-center rounded border border-slate-200 bg-slate-100 text-[8px] font-black text-slate-400">
              VISA
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900">•••• 4242</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
