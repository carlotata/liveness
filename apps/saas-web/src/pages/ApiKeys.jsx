import { AlertCircle, AlertTriangle, Check, CheckCircle2, Copy, Key, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { z } from "zod";
import { api } from "../services/api";

const apiKeySchema = z.object({
  name: z.string().min(1, "Key name is required"),
});

export default function ApiKeys() {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await api.apiKeys.list();
      setKeys(data);
    } catch (error) {
      console.error("Failed to fetch keys", error);
    } finally {
      setLoading(false);
    }
  };

  const closeCreateModal = () => {
    setIsCreating(false);
    setNewKeyName("");
    setError("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setConfirmInput("");
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
      closeCreateModal();
      setShowKeyModal(createdKey);
      fetchKeys();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteKey = async (e) => {
    e.preventDefault();
    if (!deleteTarget || confirmInput !== deleteTarget.name) return;
    try {
      await api.apiKeys.delete(deleteTarget.id);
      closeDeleteModal();
      fetchKeys();
    } catch (err) {
      console.error("Failed to delete key", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            API Access Keys
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 max-w-xl">
            Generate and manage API credentials required for integrating Liveness Cloud SDK into client applications.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              closeCreateModal();
              setIsCreating(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Issue New Key
          </button>
        )}
      </div>

      {/* Create Key Pop-Up Modal (React Portal) */}
      {isCreating &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={closeCreateModal}
            />
            <div className="relative animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl z-10 duration-200 overflow-hidden">
              {/* Modal Header & Close Button */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Issue New API Key
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      Generate secret credentials for your application
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateKey} className="flex flex-col gap-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Key Label Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Production iOS Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    autoFocus
                  />
                  <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                    Use a recognizable name to audit usage in logs.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
                  >
                    Generate Secret Key
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Keys Table */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2.5 w-1/3">
                    <Skeleton circle height={10} width={10} />
                    <Skeleton height={14} width="70%" />
                  </div>
                  <Skeleton height={24} width={180} borderRadius={6} />
                  <Skeleton height={14} width={100} />
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="px-6 py-3.5">Key Identifier</th>
                  <th className="px-6 py-3.5">Cryptographic Key</th>
                  <th className="px-6 py-3.5">Issued Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((key) => (
                  <tr
                    key={key.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {key.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex w-fit max-w-xs items-center gap-2 rounded-md border border-slate-200/60 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600">
                        <code className="truncate font-bold text-slate-600">
                          {key.key}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {new Date(key.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setDeleteTarget(key);
                          setConfirmInput("");
                        }}
                        className="rounded-md p-1.5 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-50">
                          <Key className="h-5 w-5 text-slate-300" />
                        </div>
                        <p className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                          No active API keys issued
                        </p>
                        <button
                          onClick={() => {
                            closeCreateModal();
                            setIsCreating(true);
                          }}
                          className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Issue your first API key &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Warning Box */}
      <div className="flex flex-col sm:flex-row items-start gap-3.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <div className="shrink-0 rounded-lg bg-amber-100 p-2 text-amber-700">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-amber-900">
            Security Best Practices
          </h4>
          <p className="mt-0.5 text-xs leading-relaxed font-medium text-amber-800/80">
            Do not commit secret keys to public repositories or expose client secret headers in public codebases. Store keys in secure environment variables (`.env`).
          </p>
        </div>
      </div>

      {/* Key Modal (React Portal) */}
      {showKeyModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={() => setShowKeyModal(null)}
            />
            <div className="relative animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl z-10 duration-200 overflow-hidden">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Key className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                API Key Generated Successfully
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Your key for <strong className="text-slate-800">{showKeyModal.name}</strong> is ready.
              </p>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-slate-50 p-3 font-mono text-xs font-bold text-slate-800">
                <span className="truncate select-all">{showKeyModal.key}</span>
                <button
                  onClick={() => copyToClipboard(showKeyModal.key, "modal")}
                  className={`flex shrink-0 items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
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

              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-xs leading-relaxed font-semibold text-amber-800">
                  Save this key now. It will not be shown again.
                </p>
              </div>

              <button
                onClick={() => setShowKeyModal(null)}
                className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                I have saved this key
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* GitHub-Style Revoke Key Confirmation Modal (React Portal) */}
      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={closeDeleteModal}
            />
            <div className="relative animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl z-10 duration-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-2xs">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Revoke API Key
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      This action requires typed verification
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={confirmDeleteKey} className="flex flex-col gap-4">
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-xs">
                  <p className="font-medium text-slate-700 leading-relaxed">
                    This will permanently revoke API access key{" "}
                    <strong className="text-slate-900 font-extrabold">{deleteTarget.name}</strong> (<code className="font-mono text-slate-700 font-bold">{deleteTarget.key}</code>).
                  </p>
                  <p className="mt-2 font-bold text-rose-600">
                    Applications utilizing this key will lose access immediately.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    To confirm, type <strong className="font-mono text-slate-900 font-bold select-all">{deleteTarget.name}</strong> below:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      placeholder={deleteTarget.name}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-300 shadow-2xs transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:outline-none"
                      autoFocus
                    />
                    {confirmInput === deleteTarget.name && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={confirmInput !== deleteTarget.name}
                    className={`rounded-xl px-5 py-2 text-xs font-black text-white transition-all ${
                      confirmInput === deleteTarget.name
                        ? "bg-rose-600 shadow-md shadow-rose-500/20 hover:bg-rose-700 active:scale-95 cursor-pointer"
                        : "bg-slate-300 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    Revoke Key
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}



