import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ApiKeys from "./pages/ApiKeys";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import Documentation from "./pages/Documentation";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Logs from "./pages/Logs";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Users from "./pages/Users";
import Webhooks from "./pages/Webhooks";
import { api } from "./services/api";

function ProtectedRoute({ children }) {
  const user = api.auth.getCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicOnlyRoute({ children }) {
  const user = api.auth.getCurrentUser();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function NotFound() {
  const user = api.auth.getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100">
        <span className="text-5xl font-black text-slate-300">404</span>
      </div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm font-medium text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href={user ? "/dashboard" : "/"}
        className="mt-8 inline-flex items-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
      >
        {user ? "Go to Dashboard" : "Back to Home"}
      </a>
    </div>
  );
}

function App() {
  const location = useLocation();

  // If we navigated to /login or /signup with a background location,
  // render that background location underneath the modal.
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route
          path="/"
          element={
            api.auth.getCurrentUser()
              ? <Navigate to="/dashboard" replace />
              : <Landing />
          }
        />

        {/* These still work as standalone full-page routes when accessed directly via URL */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPassword />
            </PublicOnlyRoute>
          }
        />

        <Route path="/docs" element={<Documentation />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <ApiKeys />
            </ProtectedRoute>
          }
        />
        <Route
          path="/webhooks"
          element={
            <ProtectedRoute>
              <Webhooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Modal routes — rendered on top of the background location */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login modal />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup modal />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPassword modal />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicOnlyRoute>
                <ResetPassword modal />
              </PublicOnlyRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}

export default App;
