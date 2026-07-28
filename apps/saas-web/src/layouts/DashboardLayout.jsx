import {
  BarChart3,
  Book,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Users,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalChecks, setTotalChecks] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const user = api.auth.getCurrentUser();

  // Fetch stats for authentic quota usage
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const stats = await api.stats.getOverview();
        if (stats && typeof stats.totalChecks === "number") {
          setTotalChecks(stats.totalChecks);
        }
      } catch (err) {
        console.error("Failed to load quota stats", err);
      }
    };
    fetchUsage();
  }, []);

  // Handle Escape key to close modal and Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && searchModalOpen) {
        setSearchModalOpen(false);
        setSearchQuery("");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await api.auth.logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
    { path: "/webhooks", icon: Webhook, label: "Webhooks" },
    { path: "/docs", icon: Book, label: "Documentation" },
  ];

  // Optimal 4 core items for mobile bottom navigation bar (iOS/Android HIG standard)
  const mobileBottomNavItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
  ];

  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
      "AD"
    : "AD";

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Administrator";

  const currentPlan = user?.subscriptionTier?.toUpperCase() || "STARTER";

  const currentPageLabel =
    navItems.find((n) => n.path === location.pathname)?.label ||
    (location.pathname === "/billing"
      ? "Billing"
      : location.pathname === "/settings"
        ? "Settings"
        : "Dashboard");

  const renderNavContent = () => (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Mobile Header Brand & Close Button (Mobile Drawer Only - Hidden on Desktop) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 md:hidden">
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 group">
            <ShieldCheck className="h-7 w-7 text-blue-600 shrink-0 transition-transform group-hover:scale-105" />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Liveness<span className="text-blue-600 font-light ml-0.5">Cloud</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile User Profile Card (Mobile Drawer Only - Hidden on Desktop) */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 shadow-xs md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-500/20 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col text-left overflow-hidden min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 truncate">
                  {fullName}
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black text-blue-700 uppercase">
                  {currentPlan}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 truncate">
                {user?.email || "admin@liveness.cloud"}
              </span>
            </div>
          </div>
        </div>



        {/* Navigation Group */}
        <div className="mb-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group relative flex items-center rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-blue-50/80 text-blue-600 font-extrabold"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Account Management (Mobile Drawer Only - Hidden on Desktop) */}
        <div className="md:hidden">
          <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Account Management
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  location.pathname === "/settings"
                    ? "bg-blue-50/80 text-blue-600 font-extrabold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <SettingsIcon className="mr-3 h-4.5 w-4.5 text-slate-400" />
                Account Settings
              </Link>
            </li>
            <li>
              <Link
                to="/billing"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  location.pathname === "/billing"
                    ? "bg-blue-50/80 text-blue-600 font-extrabold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center">
                  <CreditCard className="mr-3 h-4.5 w-4.5 text-slate-400" />
                  Billing & Plans
                </div>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-600 uppercase">
                  {currentPlan}
                </span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="mr-3 h-4.5 w-4.5 text-rose-500" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Authentic Plan Quota Card */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <Link
          to="/billing"
          onClick={() => setMobileMenuOpen(false)}
          className="group block rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition-all hover:border-slate-300 hover:bg-slate-100/60 shadow-2xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Subscription
            </span>
            <span className="rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase">
              {currentPlan}
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-bold text-slate-900">
              {currentPlan === "PRO"
                ? `${totalChecks.toLocaleString()} checks`
                : `${totalChecks.toLocaleString()} / 1,000 checks`}
            </span>
            <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              {currentPlan === "PRO" ? "Manage" : "Upgrade"} &rarr;
            </span>
          </div>

          {/* Authentic Usage Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
            <div
              style={{
                width: currentPlan === "PRO" ? "100%" : `${Math.min(100, Math.max(4, (totalChecks / 1000) * 100))}%`,
              }}
              className={`h-full rounded-full transition-all duration-300 ${
                currentPlan === "PRO" ? "bg-emerald-500" : "bg-blue-600"
              }`}
            />
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-white font-sans text-slate-900">
      {/* Background Subtle Gradient Glow matching Landing Page */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-white to-white z-0" />

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden cursor-pointer transition-opacity animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel (Smooth Slide-In) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80vw] flex-col justify-between border-l border-slate-100 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="relative z-10 hidden h-screen w-64 flex-col justify-between border-r border-slate-100 bg-white md:flex shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {/* Desktop Sidebar Header */}
        <div className="flex h-16 md:h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <ShieldCheck className="h-7 w-7 text-blue-600 shrink-0 transition-transform group-hover:scale-105" />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Liveness<span className="text-blue-600 font-light ml-0.5">Cloud</span>
            </span>
          </Link>
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
            title="Search Platform (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        {renderNavContent()}
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 md:h-20 items-center justify-between border-b border-slate-100 bg-white/80 px-4 sm:px-6 md:px-8 backdrop-blur-md">
          
          {/* Left: Mobile Brand Logo & Desktop Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Brand Logo + Search Trigger */}
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/dashboard" className="flex items-center gap-1.5">
                <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Liveness<span className="text-blue-600 font-light ml-0.5">Cloud</span>
                </span>
              </Link>
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer ml-1"
                aria-label="Search"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Desktop Breadcrumb Hierarchy */}
            <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-500 min-w-0">
              <span className="text-slate-400">Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              <h2 className="font-extrabold text-slate-900 truncate text-lg">
                {currentPageLabel}
              </h2>
            </div>
          </div>

          {/* Right Controls: Profile Dropdown (Desktop Only) & Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Profile Dropdown - Hidden on Mobile to avoid redundancy with Mobile Drawer */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white p-1.5 pr-3 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
                aria-label="Profile menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {fullName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {user?.email || "admin@liveness.cloud"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ml-0.5 ${
                    profileDropdownOpen ? "rotate-180 text-blue-600" : "group-hover:text-slate-600"
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 animate-in fade-in zoom-in-95 duration-150 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{fullName}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      {user?.email || "admin@liveness.cloud"}
                    </p>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4 text-slate-400" />
                    Account Settings
                  </Link>

                  <Link
                    to="/billing"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      Billing & Subscription
                    </div>
                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-600 uppercase">
                      {currentPlan}
                    </span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden cursor-pointer transition-all active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">{children}</div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-lg md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {mobileBottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600 font-extrabold"
                    : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110 text-blue-600" : "text-slate-400"
                  }`}
                />
                <span className="mt-1 text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Global Real-Time Search Pop-Up Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => {
              setSearchModalOpen(false);
              setSearchQuery("");
            }}
          />
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Search Header Input */}
            <div className="flex items-center border-b border-slate-100 px-4 py-3.5">
              <Search className="h-5 w-5 text-blue-600 shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchModalOpen(false);
                    setSearchQuery("");
                  }
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages, documentation, or users..."
                className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  setSearchQuery("");
                }}
                className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500 hover:bg-slate-200"
              >
                ESC
              </button>
            </div>

            {/* Modal Results List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {(() => {
                const q = searchQuery.trim().toLowerCase();
                const pages = navItems.filter(
                  (i) => i.label.toLowerCase().includes(q) || i.path.includes(q)
                );
                return (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Platform Navigation
                    </div>
                    {pages.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            setSearchModalOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-blue-50/80 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-700">
                                {item.label}
                              </span>
                              <span className="block text-[10px] font-medium text-slate-400">
                                Jump to {item.path}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-300 group-hover:text-blue-600">
                            Go &rarr;
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


