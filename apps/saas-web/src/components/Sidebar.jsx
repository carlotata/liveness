import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Book,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  Webhook,
  X,
} from "lucide-react";

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  setSearchModalOpen,
  totalChecks,
  currentPlan,
  fullName,
  initials,
  user,
  handleLogout,
}) {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/logs", icon: BarChart3, label: "Logs" },
    { path: "/api-keys", icon: Key, label: "API Keys" },
    { path: "/webhooks", icon: Webhook, label: "Webhooks" },
    { path: "/docs", icon: Book, label: "Documentation" },
  ];

  const renderNavContent = (isCollapsed = false) => (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Scrollable Nav Area */}
      <div className={`flex-1 overflow-y-auto py-5 ${isCollapsed ? "px-2" : "px-4"}`}>
        {/* Mobile Header Brand & Close Button (Mobile Drawer Only) */}
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

        {/* Mobile User Profile Card (Mobile Drawer Only) */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50/80 to-indigo-50/50 p-4 shadow-xs md:hidden">
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
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-colors duration-150 cursor-pointer ${
                      isCollapsed ? "justify-center px-0" : "px-3.5"
                    } ${
                      isActive
                        ? "bg-blue-50/80 text-blue-600 font-extrabold"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <item.icon
                      className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isCollapsed ? "" : "mr-3"
                      } ${
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? "hidden opacity-0 w-0" : "inline-block opacity-100"}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Account Management (Mobile Drawer Only) */}
        <div className="md:hidden">
          <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Account Management
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-150 ${
                  location.pathname === "/settings"
                    ? "bg-blue-50/80 text-blue-600 font-extrabold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <SettingsIcon className="mr-3 h-4.5 w-4.5 text-slate-400 shrink-0" />
                Account Settings
              </Link>
            </li>
            <li>
              <Link
                to="/billing"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-150 ${
                  location.pathname === "/billing"
                    ? "bg-blue-50/80 text-blue-600 font-extrabold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center">
                  <CreditCard className="mr-3 h-4.5 w-4.5 text-slate-400 shrink-0" />
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
                <LogOut className="mr-3 h-4.5 w-4.5 text-rose-500 shrink-0" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Subscription Quota Card */}
      <div className={`border-t border-slate-100 bg-white ${isCollapsed ? "p-2" : "p-4"}`}>
        <Link
          to="/billing"
          onClick={() => setMobileMenuOpen(false)}
          title={isCollapsed ? `${currentPlan} Tier` : undefined}
          className={`group block rounded-2xl border border-slate-200/80 bg-slate-50/70 transition-all hover:border-slate-300 hover:bg-slate-100/60 shadow-2xs cursor-pointer ${
            isCollapsed ? "p-2 text-center" : "p-3.5"
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-600 uppercase">
                {currentPlan}
              </span>
              <div className="h-1.5 w-full rounded-full bg-slate-200 mt-1 overflow-hidden">
                <div
                  style={{
                    width: currentPlan === "PRO" ? "100%" : `${Math.min(100, Math.max(4, (totalChecks / 1000) * 100))}%`,
                  }}
                  className={`h-full rounded-full ${
                    currentPlan === "PRO" ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Subscription
                </span>
                <span className="rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase">
                  {currentPlan}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {currentPlan === "PRO"
                    ? `${(totalChecks || 0).toLocaleString()} checks`
                    : `${(totalChecks || 0).toLocaleString()} / 1,000 checks`}
                </span>
                <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                  {currentPlan === "PRO" ? "Manage" : "Upgrade"} &rarr;
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  style={{
                    width: currentPlan === "PRO" ? "100%" : `${Math.min(100, Math.max(4, ((totalChecks || 0) / 1000) * 100))}%`,
                  }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    currentPlan === "PRO" ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                />
              </div>
            </>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
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
        {renderNavContent(false)}
      </aside>

      {/* Desktop Sidebar (Smooth Hardware-Accelerated Collapse) */}
      <aside
        className={`relative z-10 hidden h-screen flex-col justify-between border-r border-slate-100 bg-white md:flex shrink-0 transition-[width] duration-300 ease-in-out shadow-[1px_0_10px_rgba(0,0,0,0.02)] overflow-hidden ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Desktop Sidebar Header */}
        <div className={`flex h-16 md:h-20 items-center border-b border-slate-100 shrink-0 ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-6"}`}>
          {!sidebarCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2 group truncate">
              <ShieldCheck className="h-7 w-7 text-blue-600 shrink-0 transition-transform group-hover:scale-105" />
              <span className="text-sm font-extrabold tracking-tight text-slate-900 truncate">
                Liveness<span className="text-blue-600 font-light ml-0.5">Cloud</span>
              </span>
            </Link>
          )}

          <div className="flex items-center gap-1">
            {!sidebarCollapsed && (
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                title="Search Platform (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4.5 w-4.5 text-blue-600" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Nav Content */}
        {renderNavContent(sidebarCollapsed)}
      </aside>
    </>
  );
}
