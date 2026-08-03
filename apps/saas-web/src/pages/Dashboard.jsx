import {
  Activity,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Database,
  Globe,
  LineChart,
  Shield,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
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

  const [codeCopied, setCodeCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("curl");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, healthData] = await Promise.all([
          api.stats.getOverview().catch(() => ({
            totalUsers: 0,
            totalChecks: 0,
            passRate: 0,
            spoofAttempts: 0,
          })),
          api.system.getHealth().catch(() => ({ status: "error", database: "disconnected" })),
        ]);

        setStats(statsData);
        setSystemStatus({
          api: healthData.status === "ok" ? "Operational" : "Offline",
          database: healthData.database === "connected" ? "Connected" : "Disconnected",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Live Real-Time Polling every 5 seconds for real-time telemetry
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: "Total Registered Users",
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: Users,
      badge: "Enrolled",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/80",
      iconBg: "bg-blue-50 border-blue-100 text-blue-600",
      description: "Enrolled user biometric identities",
    },
    {
      label: "Verification Checks",
      value: (stats.totalChecks || 0).toLocaleString(),
      icon: Activity,
      badge: "Real-time",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      iconBg: "bg-indigo-50 border-indigo-100 text-indigo-600",
      description: "Total liveness challenge executions",
    },
    {
      label: "Spoof Attacks Blocked",
      value: (stats.spoofAttempts || 0).toLocaleString(),
      icon: ShieldCheck,
      badge: "Active Defense",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
      iconBg: "bg-rose-50 border-rose-100 text-rose-600",
      description: "Photo, screen replay & mask attempts stopped",
    },
    {
      label: "Validation Pass Rate",
      value: `${(stats.passRate || 0).toFixed(1)}%`,
      icon: LineChart,
      badge: "Live Telemetry",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
      description: "Authentic liveness detection ratio",
    },
  ];

  const codeExamples = {
    curl: `curl -X POST https://api.liveness.cloud/v1/verify \\
  -H "Authorization: Bearer pk_live_sample_key" \\
  -H "Content-Type: application/json" \\
  -d '{"session_token": "sess_894f29a0", "frame": "base64_data..."}'`,
    js: `import { LivenessSDK } from '@liveness/sdk';

const sdk = new LivenessSDK({ apiKey: 'pk_live_...' });
const result = await sdk.verify({ videoElement });
console.log('Liveness result:', result.isRealPerson);`,
    python: `import liveness

client = liveness.Client(api_key="pk_live_...")
response = client.verify(payload=payload_data)
print(f"Pass: {response.is_real_person}, Confidence: {response.score}")`,
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Console Overview
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 max-w-2xl">
            Monitor real-time liveness verification metrics, security telemetry, and API status across your platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <span>Docs</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <Skeleton height={14} width={80} />
                  <Skeleton circle height={36} width={36} />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton height={28} width={60} />
                  <Skeleton height={12} width="80%" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="group relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border ${card.iconBg}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                  {card.label}
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </h3>
                <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Split Section: Quick Test Code Snippet & Infrastructure Health */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left 7 Cols: Interactive Quick API Tester Snippet */}
        <div className="lg:col-span-7 flex flex-col min-w-0">
          <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl overflow-hidden flex flex-col h-full">
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2 shrink-0">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400 font-bold flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-blue-400" />
                  Quick API Verification Test
                </span>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                {["curl", "js", "python"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase rounded-sm transition-colors cursor-pointer ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Copy Button */}
              <button
                onClick={copySnippet}
                className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-400 shrink-0 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                {codeCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Viewport */}
            <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed flex-1 bg-slate-950 min-w-0">
              <pre className="whitespace-pre-wrap">
                <code>{codeExamples[activeTab]}</code>
              </pre>
            </div>

            {/* Footer Bar */}
            <div className="border-t border-slate-800/80 bg-slate-900/60 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">API Endpoint Active: 100% Uptime</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">Sub-200ms latency</span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: System Health & Security Standard */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          {/* Infrastructure Box */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                Infrastructure Health
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {import.meta.env.MODE.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      systemStatus.api === "Operational"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">API Gateway</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Global Edge Proxy
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                    systemStatus.api === "Operational"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {systemStatus.api}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      systemStatus.database === "Connected"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Vector Neural Engine
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Facial Mesh Database
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                    systemStatus.database === "Connected"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {systemStatus.database}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Compliance Highlights */}
          <div className="rounded-xl border border-blue-100 bg-linear-to-br from-blue-50/60 to-indigo-50/40 p-5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Security Architecture
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero raw biometric image retention on server</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>In-memory active challenge encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>SOC2 Type II & GDPR compliant pipeline</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}




