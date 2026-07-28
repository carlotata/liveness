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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
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
            className="flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </button>
        )}
      </div>

      {isCreating && (
        <div className="animate-in zoom-in-95 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 duration-200 sm:p-6">
          <h3 className="mb-1 text-base sm:text-lg font-bold text-blue-900">
            Register Webhook URL
          </h3>
          <p className="mb-5 text-xs sm:text-sm font-medium text-blue-700/70">
            Enter the HTTPS URL where you'd like to receive event payloads.
          </p>

          <form onSubmit={handleCreateWebhook} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="https://your-api.com/webhooks/liveness"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 sm:flex-none cursor-pointer"
                >
                  Save Webhook
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 sm:flex-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-150">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                <th className="px-6 py-4">Endpoint URL</th>
                <th className="px-6 py-4">Signing Secret</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {webhooks.map((webhook) => (
                <tr
                  key={webhook.id}
                  className="group transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 shrink-0 rounded-full ${webhook.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      <span className="text-sm font-bold text-slate-900 truncate max-w-xs">
                        {webhook.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex max-w-xs items-center justify-between gap-3 rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-1.5 transition-colors group-hover:border-slate-300">
                      <code className="truncate font-mono text-xs font-bold text-slate-600">
                        {webhook.secret}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(webhook.secret, webhook.id)
                        }
                        className={`rounded-md p-1 shrink-0 transition-all cursor-pointer ${
                          copiedId === webhook.id
                            ? "bg-emerald-100 text-emerald-700"
                            : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedId === webhook.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        webhook.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {webhook.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                      title="Remove Webhook"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-50 text-slate-400">
                        <Webhook className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No webhooks configured
                      </p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
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
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Delivery Attempts
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time webhook invocation history for your endpoints
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-150">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Endpoint</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Latency</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="group transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">
                      {log.event}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 truncate max-w-xs">
                      {log.url}
                    </td>
                    <td className="px-6 py-4">
                      {log.statusCode ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700"
                          title={log.errorMessage}
                        >
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-400 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold text-xs">
                      No webhook deliveries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">How it works</h4>
          <p className="mt-1 text-xs leading-relaxed font-medium text-blue-800/70">
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


