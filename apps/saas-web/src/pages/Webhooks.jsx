import { AlertCircle, Check, Copy, Plus, Trash2, Webhook } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../services/api";

const webhookSchema = z.object({
  url: z.string().url("Invalid webhook URL"),
});

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const data = await api.webhooks.list();
      setWebhooks(data);
    } catch (error) {
      console.error("Failed to fetch webhooks", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await api.webhooks.logs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch webhook logs", error);
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    setError("");

    const validation = webhookSchema.safeParse({ url: newUrl });
    if (!validation.success) {
      return setError(validation.error.issues[0].message);
    }

    try {
      await api.webhooks.create(newUrl);
      setNewUrl("");
      setIsCreating(false);
      fetchWebhooks();
      fetchLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to remove this webhook? You will stop receiving event notifications at this URL.",
      )
    ) {
      try {
        await api.webhooks.delete(id);
        fetchWebhooks();
        fetchLogs();
      } catch (err) {
        console.error("Failed to delete webhook", err);
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 sm:space-y-8 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Webhooks
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Receive real-time event notifications on your server
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setError("");
            }}
            className="flex w-full sm:w-auto items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Webhook
          </button>
        )}
      </div>

      {isCreating && (
        <div className="animate-in zoom-in-95 rounded-3xl sm:rounded-4xl border-2 border-blue-100 bg-blue-50/50 p-5 sm:p-8 shadow-xl shadow-blue-100/20 duration-200">
          <h3 className="mb-2 text-base sm:text-lg font-black text-blue-900">
            Register Webhook URL
          </h3>
          <p className="mb-6 text-xs sm:text-sm font-medium text-blue-700/70">
            Enter the HTTPS URL where you'd like to receive event payloads.
          </p>

          <form onSubmit={handleCreateWebhook} className="flex flex-col gap-4">
            {error && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                placeholder="https://your-api.com/webhooks/liveness"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 px-6 sm:px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 sm:flex-none"
                >
                  Save Webhook
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 sm:px-8 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
                <th className="px-4 sm:px-8 py-4 sm:py-6">Endpoint URL</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6">Signing Secret</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6">Status</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {webhooks.map((webhook) => (
                <tr
                  key={webhook.id}
                  className="group transition-colors hover:bg-slate-50/30"
                >
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 shrink-0 rounded-full ${webhook.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"}`}
                      />
                      <span className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                        {webhook.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex max-w-[140px] sm:max-w-xs items-center justify-between gap-2 sm:gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 transition-colors group-hover:bg-white">
                      <code className="truncate font-mono text-xs font-bold text-slate-500">
                        {webhook.secret}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(webhook.secret, webhook.id)
                        }
                        className={`rounded-lg p-1.5 shrink-0 transition-all active:scale-90 ${
                          copiedId === webhook.id
                            ? "bg-emerald-100 text-emerald-600"
                            : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedId === webhook.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase ${
                        webhook.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {webhook.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="rounded-2xl p-2.5 sm:p-3 text-slate-300 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                      title="Remove Webhook"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 sm:px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl sm:rounded-4xl bg-slate-50">
                        <Webhook className="h-7 w-7 sm:h-8 sm:w-8 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No webhooks configured
                      </p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="mt-4 text-xs sm:text-sm font-bold text-blue-600 hover:underline"
                      >
                        Register your first webhook URL &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            Delivery Attempts
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time webhook invocation history for your endpoints
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
                  <th className="px-4 sm:px-8 py-4 sm:py-6">Event</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6">Endpoint</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6">Status</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6">Latency</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="group transition-colors hover:bg-slate-50/30"
                  >
                    <td className="px-4 sm:px-8 py-4 sm:py-6 font-mono text-xs font-bold text-slate-700">
                      {log.event}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 font-medium text-slate-500 truncate max-w-[150px] sm:max-w-xs">
                      {log.url}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                      {log.statusCode ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700"
                          title={log.errorMessage}
                        >
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-slate-500">
                      {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 font-medium text-slate-400 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-8 py-12 text-center text-slate-400 font-bold text-xs">
                      No webhook deliveries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 rounded-3xl sm:rounded-4xl border-2 border-blue-100 bg-blue-50 p-5 sm:p-8">
        <div className="rounded-2xl bg-blue-100 p-3 shrink-0">
          <AlertCircle className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h4 className="text-base sm:text-lg font-black text-blue-900">How it works</h4>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed font-medium text-blue-800/70">
            Whenever a liveness session is completed or a new user is enrolled,
            we will send a POST request to your URL with a signed payload. Use
            your signing secret to verify that the event originated from
            Liveness Cloud.
          </p>
        </div>
      </div>
    </div>
  );
}
