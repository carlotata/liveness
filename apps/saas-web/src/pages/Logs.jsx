import {
  Activity,
  AlertTriangle,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Code2,
  Cpu,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
  Clock,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../services/api";

export default function Logs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const filterOptions = [
    { id: "ALL", label: "All Statuses", color: "bg-slate-400" },
    { id: "SUCCESS", label: "Passed Verification", color: "bg-emerald-500" },
    { id: "ENROLLED", label: "Enrolled Identities", color: "bg-purple-500" },
    { id: "FAILURE", label: "Spoof Attacks / Failed", color: "bg-rose-500" },
  ];

  const selectedOption = filterOptions.find((o) => o.id === statusFilter) || filterOptions[0];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.logs.list();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = (log.userName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = logs.length;
  const successCount = logs.filter((l) => l.status === "SUCCESS" || l.status === "ENROLLED").length;
  const passRate = totalCount ? ((successCount / totalCount) * 100).toFixed(1) : 0;
  const avgScore = totalCount ? ((logs.reduce((acc, l) => acc + (l.score || 0), 0) / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Audit & Telemetry Logs
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Real-time inspection of biometric score confidence, facial mesh depth, and presentation attack telemetry.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Custom Modern Status Dropdown */}
          <div className="relative w-full sm:w-52">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`h-2 w-2 rounded-full ${selectedOption.color} shrink-0`} />
                <span className="truncate">{selectedOption.label}</span>
              </div>
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>

            {statusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setStatusDropdownOpen(false)}
                />
                <div className="absolute right-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in zoom-in-95 duration-150">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setStatusDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === opt.id
                          ? "bg-blue-50 text-blue-700 font-extrabold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
                <Skeleton circle height={44} width={44} />
                <div className="w-full space-y-1">
                  <Skeleton height={10} width="60%" />
                  <Skeleton height={24} width="40%" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                Total Logged Sessions
              </p>
              <p className="text-xl font-black text-slate-900">{totalCount}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                Verification Pass Rate
              </p>
              <p className="text-xl font-black text-slate-900">{passRate}%</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                Avg Liveness Confidence
              </p>
              <p className="text-xl font-black text-slate-900">{avgScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <Skeleton height={20} width={80} borderRadius={6} />
                  <div className="flex items-center gap-2.5 w-1/4">
                    <Skeleton circle height={28} width={28} />
                    <Skeleton height={14} width="70%" />
                  </div>
                  <Skeleton height={14} width={80} />
                  <Skeleton height={14} width={120} />
                  <Skeleton height={14} width={60} />
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="px-6 py-3.5">Result</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Score / Confidence</th>
                  <th className="px-6 py-3.5">Anti-Spoofing Telemetry</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="group transition-colors hover:bg-slate-50/80 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                          log.status === "SUCCESS"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : log.status === "ENROLLED"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : log.status === "ENROLLED" ? (
                          <Fingerprint className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200/60 bg-slate-50 text-slate-500">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate text-xs sm:text-sm">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 sm:w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              log.status === "SUCCESS" || log.status === "ENROLLED"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${(log.score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {((log.score || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.antiSpoofing ? (
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                              Depth
                            </span>
                            <span
                              className={`text-xs font-mono font-bold ${
                                log.antiSpoofing.depthVariance < 0.0015
                                  ? "text-rose-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {log.antiSpoofing.depthVariance.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex flex-col border-l border-slate-100 pl-3 sm:pl-4">
                            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                              Texture
                            </span>
                            <span
                              className={`text-xs font-mono font-bold ${
                                log.antiSpoofing.laplacianVariance < 100
                                  ? "text-rose-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {log.antiSpoofing.laplacianVariance.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="mb-3 h-8 w-8 text-slate-300" />
                        <p className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                          No audit telemetry logs found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Telemetry Detail Inspector Modal (React Portal) */}
      {selectedLog &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={() => setSelectedLog(null)}
            />
            <div className="relative animate-in zoom-in-95 w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl z-10 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Telemetry Session Detail
                    </h3>
                    <p className="text-xs font-mono font-medium text-slate-400">
                      ID: {selectedLog.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Status & Subject Header Card */}
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Subject Name
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedLog.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Session Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                        selectedLog.status === "SUCCESS"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : selectedLog.status === "ENROLLED"
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                </div>

                {/* Score & Telemetry Breakdown */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Liveness Match Score</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {((selectedLog.score || 0) * 100).toFixed(4)}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedLog.status === "SUCCESS" || selectedLog.status === "ENROLLED"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${(selectedLog.score || 0) * 100}%` }}
                    />
                  </div>

                  {selectedLog.antiSpoofing && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Depth Mesh Variance
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {selectedLog.antiSpoofing.depthVariance}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Laplacian Texture Variance
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {selectedLog.antiSpoofing.laplacianVariance}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Raw JSON Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5" />
                      Raw Telemetry Payload JSON
                    </span>
                  </div>
                  <pre className="rounded-xl border border-slate-200/80 bg-slate-900 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-4 shrink-0">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}



