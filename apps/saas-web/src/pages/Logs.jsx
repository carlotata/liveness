import {
  Activity,
  Clock,
  Fingerprint,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.logs.list();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Audit Logs
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Detailed history of liveness verification requests
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
          <option value="ENROLLED">Enrolled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Analysis</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="group transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
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
                  <td className="px-6 py-4 font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/60 bg-slate-50 text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="truncate">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-20 sm:w-28 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${log.status === "SUCCESS" || log.status === "ENROLLED" ? "bg-emerald-500" : "bg-rose-500"}`}
                          style={{ width: `${log.score * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {(log.score * 100).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.antiSpoofing ? (
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            Depth
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${log.antiSpoofing.depthVariance < 0.0015 ? "text-rose-600" : "text-emerald-600"}`}
                          >
                            {log.antiSpoofing.depthVariance.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex flex-col border-l border-slate-100 pl-3 sm:pl-4">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            Texture
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${log.antiSpoofing.laplacianVariance < 0.003 ? "text-rose-600" : "text-emerald-600"}`}
                          >
                            {log.antiSpoofing.laplacianVariance.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 italic">
                        No metadata
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-500">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Activity className="mb-4 h-10 w-10 text-slate-300" />
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No activity logs found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Activity className="mb-4 h-10 w-10 text-slate-300" />
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No matching logs found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


