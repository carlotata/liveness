import { ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AuthLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const openModal = (path) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 font-sans text-slate-900">
      <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between border-b border-slate-100 bg-white/80 px-4 sm:px-6 md:px-12 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Liveness Cloud
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("/login")}
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 cursor-pointer transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => openModal("/signup")}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        {children}
      </main>

      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs font-medium text-slate-400">
        &copy; {new Date().getFullYear()} Liveness Cloud. All rights reserved.
      </footer>
    </div>
  );
}
