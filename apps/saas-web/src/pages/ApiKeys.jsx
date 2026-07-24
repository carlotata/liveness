import { AlertCircle, Check, Copy, Key, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../services/api";

const apiKeySchema = z.object({
  name: z.string().min(1, "Key name is required"),
});

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const data = await api.apiKeys.list();
      setKeys(data);
    } catch (error) {
      console.error("Failed to fetch keys", error);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    setError("");

    const validation = apiKeySchema.safeParse({ name: newKeyName });
    if (!validation.success) {
      return setError(validation.error.issues[0].message);
    }

    try {
      const createdKey = await api.apiKeys.create(newKeyName);
      setNewKeyName("");
      setIsCreating(false);
      setShowKeyModal(createdKey);
      fetchKeys();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to revoke this API key? Applications using this key will lose access immediately.",
      )
    ) {
      await api.apiKeys.delete(id);
      fetchKeys();
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
            API Access
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Manage cryptographic keys for application integration
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
            Issue New Key
          </button>
        )}
      </div>

      {isCreating && (
        <div className="animate-in zoom-in-95 rounded-3xl sm:rounded-4xl border-2 border-blue-100 bg-blue-50/50 p-5 sm:p-8 shadow-xl shadow-blue-100/20 duration-200">
          <h3 className="mb-2 text-base sm:text-lg font-black text-blue-900">
            Create Security Key
          </h3>
          <p className="mb-6 text-xs sm:text-sm font-medium text-blue-700/70">
            Give your key a descriptive name to track its usage.
          </p>

          <form onSubmit={handleCreateKey} className="flex flex-col gap-4">
            {error && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. Production Mobile App"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 px-6 sm:px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 sm:flex-none"
                >
                  Generate Key
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
                <th className="px-4 sm:px-8 py-4 sm:py-6">Label</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6">Secret Key</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6">Issued Date</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {keys.map((key) => (
                <tr
                  key={key.id}
                  className="group transition-colors hover:bg-slate-50/30"
                >
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {key.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex max-w-[150px] sm:max-w-xs items-center justify-between gap-2 sm:gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 transition-colors group-hover:bg-white">
                      <code className="truncate font-mono text-xs font-bold text-slate-500">
                        {key.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className={`rounded-lg p-1.5 transition-all shrink-0 active:scale-90 ${
                          copiedId === key.id
                            ? "bg-emerald-100 text-emerald-600"
                            : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedId === key.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-xs sm:text-sm text-slate-500">
                    {new Date(key.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="rounded-2xl p-2.5 sm:p-3 text-slate-300 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                      title="Revoke access"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 sm:px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl sm:rounded-4xl bg-slate-50">
                        <Key className="h-7 w-7 sm:h-8 sm:w-8 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No active keys issued
                      </p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="mt-4 text-xs sm:text-sm font-bold text-blue-600 hover:underline"
                      >
                        Create your first key &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 rounded-3xl sm:rounded-4xl border-2 border-amber-100 bg-amber-50 p-5 sm:p-8">
        <div className="rounded-2xl bg-amber-100 p-3 shrink-0">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h4 className="text-base sm:text-lg font-black text-amber-900">
            Security Recommendation
          </h4>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed font-medium text-amber-800/70">
            Never share your API keys in public repositories or client-side
            code. Use environment variables to store them securely. If a key is
            compromised, revoke it immediately and issue a new one.
          </p>
        </div>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 bg-white p-6 sm:p-10 shadow-2xl duration-200">
            <div className="mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
              <Key className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              API Key Generated
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
              Your new key for <strong className="text-slate-700">{showKeyModal.name}</strong> has been issued.
            </p>

            <div className="mt-6 flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm font-bold text-slate-800">
              <span className="truncate select-all">{showKeyModal.key}</span>
              <button
                onClick={() => copyToClipboard(showKeyModal.key, "modal")}
                className={`flex shrink-0 items-center justify-center rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                  copiedId === "modal"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {copiedId === "modal" ? (
                  <>
                    <Check className="mr-1.5 sm:mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 sm:mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 flex items-start gap-3 sm:gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 sm:p-5">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs font-semibold leading-relaxed text-amber-800/80">
                Make sure to copy your API key now. You won't be able to see it again for security reasons.
              </p>
            </div>

            <button
              onClick={() => setShowKeyModal(null)}
              className="mt-6 sm:mt-8 w-full rounded-2xl bg-slate-900 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-white hover:bg-slate-800 transition-colors"
            >
              I have saved this key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
