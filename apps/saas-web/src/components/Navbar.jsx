import {
  ChevronRight,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (path) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  const isDocsPage = location.pathname === "/docs";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "pt-3 px-4 sm:px-6 md:px-12" : "pt-0 px-0"
      }`}
    >
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? "h-16 max-w-6xl rounded-2xl border border-white/60 bg-white/80 px-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl"
            : `h-16 md:h-20 max-w-7xl border-b border-slate-200/60 backdrop-blur-md px-4 sm:px-6 md:px-12 ${
                isDocsPage ? "bg-slate-50/80" : "bg-white/80"
              }`
        }`}
      >
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <ShieldCheck className="h-7 w-7 text-blue-600 shrink-0 transition-transform group-hover:scale-105" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Liveness<span className="text-blue-600 font-light ml-0.5">Cloud</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          {isDocsPage ? (
            <Link
              to="/#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Features
            </Link>
          ) : (
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Features
            </a>
          )}
          {isDocsPage ? (
            <Link
              to="/#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              How it works
            </Link>
          ) : (
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              How it works
            </a>
          )}
          {isDocsPage ? (
            <Link
              to="/#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Pricing
            </Link>
          ) : (
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Pricing
            </a>
          )}
          {isDocsPage ? (
            <Link
              to="/#faq"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              FAQ
            </Link>
          ) : (
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              FAQ
            </a>
          )}
          <Link
            to="/docs"
            className={`text-sm font-medium transition-colors ${
              isDocsPage
                ? "font-extrabold text-blue-600"
                : "text-slate-600 hover:text-blue-600"
            }`}
          >
            Docs
          </Link>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center space-x-3 md:flex">
          <button
            onClick={() => openModal("/login")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100/80 hover:text-slate-900 active:scale-98 cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => openModal("/signup")}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Dropdown Menu (Clean & Simple with Chevrons) */}
        {mobileMenuOpen && (
          <div
            className={`flex flex-col space-y-4 bg-white p-6 shadow-xl md:hidden transition-all duration-300 ${
              isScrolled
                ? "absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200"
                : "absolute top-full left-0 right-0 border-b border-slate-200"
            }`}
          >
            {isDocsPage ? (
              <Link
                to="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>Features</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ) : (
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>Features</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            )}

            {isDocsPage ? (
              <Link
                to="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>How it works</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ) : (
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>How it works</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            )}

            {isDocsPage ? (
              <Link
                to="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>Pricing</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ) : (
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>Pricing</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            )}

            {isDocsPage ? (
              <Link
                to="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>FAQ</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ) : (
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
              >
                <span>FAQ</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            )}

            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              <span>Docs</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <div className="pt-2 border-t border-slate-100" />

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal("/login");
              }}
              className="text-center text-base font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              Log in
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal("/signup");
              }}
              className="rounded-full bg-blue-600 py-3 text-center text-base font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
