import { Calendar, Fingerprint, Search, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      await api.users.delete(id);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm),
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            User Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            Manage and audit enrolled identities
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-2xl border border-slate-200 bg-white py-2.5 pr-4 pl-11 text-sm font-medium shadow-xs transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl sm:rounded-4xl border border-slate-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
                <th className="px-4 sm:px-8 py-4 sm:py-5">Identity</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5">Internal ID</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5">Enrolled On</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="group transition-colors hover:bg-blue-50/30"
                >
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <span className="block font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Verified Identity
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold text-slate-500">
                      <Fingerprint className="h-3 w-3" />
                      {user.id}
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex items-center gap-2 font-semibold text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(user.enrolledAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="rounded-xl p-2.5 text-slate-300 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                      title="Delete user"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 sm:px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <User className="mb-4 h-12 w-12 text-slate-100" />
                      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No users found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
