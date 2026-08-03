import { AlertTriangle, Calendar, CheckCircle2, Fingerprint, Search, ShieldCheck, Trash2, User, Users as UsersIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../services/api";

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setConfirmInput("");
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    if (!deleteTarget || confirmInput !== deleteTarget.name) return;
    try {
      await api.users.delete(deleteTarget.id);
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm),
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            User Directory
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage, verify, and audit biometric enrolled user identities.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search identity or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3 w-1/3">
                    <Skeleton circle height={36} width={36} />
                    <div className="w-full space-y-1">
                      <Skeleton height={14} width="70%" />
                      <Skeleton height={10} width="40%" />
                    </div>
                  </div>
                  <Skeleton height={16} width={120} />
                  <Skeleton height={16} width={100} />
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="px-6 py-3.5">Enrolled Subject</th>
                  <th className="px-6 py-3.5">Identity ID</th>
                  <th className="px-6 py-3.5">Enrolled Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white shadow-xs transition-transform group-hover:scale-105">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-3.5">
                          <span className="block font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex w-fit items-center gap-2 rounded-md border border-slate-200/60 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">
                        <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                        {user.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(user.enrolledAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setDeleteTarget(user);
                          setConfirmInput("");
                        }}
                        className="rounded-md p-1.5 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                        title="Delete identity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <User className="mb-3 h-8 w-8 text-slate-300" />
                        <p className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                          No enrolled identities found
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

      {/* Clean Modern Alert Delete Modal (React Portal) */}
      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={closeDeleteModal}
            />
            <div className="relative animate-in zoom-in-95 w-full max-w-md rounded-2xl border border-rose-100 bg-white shadow-2xl z-10 duration-200 overflow-hidden">
              {/* Prominent Red Accent Top Banner */}
              <div className="h-1.5 w-full bg-linear-to-r from-rose-500 via-red-500 to-rose-600" />
              
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 shadow-xs shrink-0">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Delete Identity Profile
                        </h3>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700 uppercase">
                          Destructive
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Typed verification required to proceed
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={confirmDelete} className="flex flex-col gap-4">
                  <div className="rounded-xl border border-rose-200/60 bg-rose-50/70 p-4 text-xs space-y-1.5">
                    <p className="font-bold text-slate-800 leading-relaxed">
                      You are about to delete enrolled biometric identity for{" "}
                      <span className="font-black text-slate-950 underline decoration-rose-400 decoration-2">{deleteTarget.name}</span>.
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      Identity ID: {deleteTarget.id}
                    </p>
                    <div className="pt-1 text-[11px] font-extrabold text-rose-600 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      This action cannot be undone or reverted.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-2">
                      To confirm, type <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-slate-900 font-bold select-all">{deleteTarget.name}</span> below:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder={`Type "${deleteTarget.name}" to verify`}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:outline-none"
                        autoFocus
                      />
                      {confirmInput === deleteTarget.name && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-in zoom-in-50 duration-150" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={confirmInput !== deleteTarget.name}
                      className={`rounded-xl px-5 py-2.5 text-xs font-black text-white transition-all shadow-md ${
                        confirmInput === deleteTarget.name
                          ? "bg-rose-600 shadow-rose-500/20 hover:bg-rose-700 active:scale-95 cursor-pointer"
                          : "bg-slate-300 opacity-60 cursor-not-allowed shadow-none"
                      }`}
                    >
                      Confirm Permanent Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}



