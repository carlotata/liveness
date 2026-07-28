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
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            API Access
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Manage cryptographic keys for application integration
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setError("");
            }}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 sm:w-auto cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Issue New Key
          </button>
        )}
      </div>

      {isCreating && (
        <div className="animate-in zoom-in-95 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 duration-200 sm:p-6">
          <h3 className="mb-1 text-base font-bold text-blue-900">
            Create Security Key
          </h3>
          <p className="mb-5 text-xs font-medium text-blue-700/70">
            Give your key a descriptive name to track its usage.
          </p>

          <form onSubmit={handleCreateKey} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. Production Mobile App"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 sm:flex-none cursor-pointer"
                >
                  Generate Key
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
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                <th className="px-6 py-4">Label</th>
                <th className="px-6 py-4">Secret Key</th>
                <th className="px-6 py-4">Issued Date</th>
                <th className="px-6 py-4 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((key) => (
                <tr
                  key={key.id}
                  className="group transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      <span className="text-sm font-bold text-slate-900">
                        {key.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex max-w-xs items-center justify-between gap-3 rounded-lg border border-slate-200/60 bg-slate-50 px-3.5 py-1.5 font-mono text-xs text-slate-600">
                      <code className="truncate font-bold text-slate-600">
                        {key.key}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    {new Date(key.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                      title="Revoke access"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-50">
                        <Key className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No active keys issued
                      </p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
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

      <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="shrink-0 rounded-xl bg-amber-100 p-2.5 text-amber-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">
            Security Recommendation
          </h4>
          <p className="mt-1 text-xs leading-relaxed font-medium text-amber-800/80">
            Never share your API keys in public repositories or client-side
            code. Use environment variables to store them securely. If a key is
            compromised, revoke it immediately and issue a new one.
          </p>
        </div>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl duration-200">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Key className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              API Key Generated
            </h3>
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              Your new key for{" "}
              <strong className="text-slate-800">{showKeyModal.name}</strong>{" "}
              has been issued.
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 font-mono text-xs font-bold text-slate-800">
              <span className="truncate select-all">{showKeyModal.key}</span>
              <button
                onClick={() => copyToClipboard(showKeyModal.key, "modal")}
                className={`flex shrink-0 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  copiedId === "modal"
                    ? "bg-emerald-100 text-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {copiedId === "modal" ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
              <p className="text-xs leading-relaxed font-semibold text-amber-800">
                Make sure to copy your API key now. You won't be able to see it
                again for security reasons.
              </p>
            </div>

            <button
              onClick={() => setShowKeyModal(null)}
              className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white transition-colors hover:bg-slate-800 cursor-pointer shadow-md"
            >
              I have saved this key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


