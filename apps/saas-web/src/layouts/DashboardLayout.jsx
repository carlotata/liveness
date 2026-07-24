import {
  BarChart3,
  Book,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = api.auth.getCurrentUser();

  const handleLogout = async () => {
    await api.auth.logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
    { path: "/webhooks", icon: Webhook, label: "Webhooks" },
    { path: "/billing", icon: CreditCard, label: "Billing" },
    { path: "/docs", icon: Book, label: "Documentation" },
  ];

  // Calculate initials
  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
      "AD"
    : "AD";

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Administrator";

  const renderNavContent = () => (
    <>
      <div>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
            <ShieldCheck className="mr-2 h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Liveness Cloud
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${location.pathname === item.path ? "text-white" : "text-slate-400"}`}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-100 p-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 font-sans text-slate-900">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)] md:flex shrink-0">
        {renderNavContent()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 md:h-20 items-center justify-between border-b border-slate-100 bg-white/80 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              {navItems.find((n) => n.path === location.pathname)?.label ||
                "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1.5 md:px-4 md:py-2">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
              {initials}
            </div>
            <span className="text-xs md:text-sm font-bold text-slate-700 truncate max-w-[100px] sm:max-w-none">
              {fullName}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

