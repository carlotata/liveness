import { Activity as ActivityIcon, Shield, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChecks: 0,
    passRate: 0,
    spoofAttempts: 0,
  });

  const [systemStatus, setSystemStatus] = useState({
    api: "Checking...",
    database: "Checking...",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.stats.getOverview();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    const fetchHealth = async () => {
      try {
        const health = await api.system.getHealth();
        setSystemStatus({
          api: health.status === "ok" ? "Operational" : "Error",
          database:
            health.database === "connected" ? "Connected" : "Disconnected",
        });
      } catch {
        setSystemStatus({
          api: "Offline",
          database: "Unknown",
        });
      }
    };

    fetchStats();
    fetchHealth();

    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Successfully enrolled identities",
    },
    {
      label: "Verification Checks",
      value: stats.totalChecks.toLocaleString(),
      icon: ActivityIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "Liveness requests processed",
    },
    {
      label: "Spoof Attempts",
      value: stats.spoofAttempts || 0,
      icon: Shield,
      color: "text-red-600",
      bg: "bg-red-50",
      description: "Blocked presentation attacks",
    },
    {
      label: "Pass Rate",
      value: `${stats.passRate.toFixed(1)}%`,
      icon: Zap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Successful validation ratio",
    },
  ];

  return (
    <div className="animate-in fade-in space-y-6 sm:space-y-10 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Console Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Real-time performance and system health
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-xs">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
            System Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="group rounded-3xl sm:rounded-4xl border border-slate-100 bg-white p-5 sm:p-6 md:p-8 shadow-xs transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
          >
            <div className="flex items-start justify-between">
              <div
                className={`rounded-2xl ${card.bg} p-3 sm:p-4 transition-transform group-hover:scale-110`}
              >
                <card.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${card.color}`} />
              </div>
              <Zap className="h-5 w-5 text-slate-100 transition-colors group-hover:text-amber-400" />
            </div>
            <div className="mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase">
                {card.label}
              </p>
              <h3 className="mt-1 sm:mt-2 text-3xl sm:text-4xl font-black text-slate-900 truncate">
                {card.value}
              </h3>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl sm:rounded-4xl border border-slate-100 bg-white shadow-xs">
        <div className="border-b border-slate-50 bg-slate-50/30 px-5 py-4 sm:px-8 sm:py-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Infrastructure Health
          </h3>
        </div>
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`h-3 w-3 shrink-0 rounded-full ${systemStatus.api === "Operational" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    API Gateway
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Global endpoint availability
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full px-4 py-1 text-xs font-black tracking-wider uppercase ${
                  systemStatus.api === "Operational"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {systemStatus.api}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`h-3 w-3 shrink-0 rounded-full ${systemStatus.database === "Connected" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Vector Engine
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Database connectivity & search
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full px-4 py-1 text-xs font-black tracking-wider uppercase ${
                  systemStatus.database === "Connected"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {systemStatus.database}
              </span>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">
            <span>
              Environment:{" "}
              <span className="text-blue-600">{import.meta.env.MODE}</span>
            </span>
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300" />
            <span>
              Region: <span className="text-blue-600">Global-Edge</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
