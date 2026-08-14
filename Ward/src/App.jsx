import { lazy, Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CircleAlert,
  FolderKanban,
  Landmark,
  ShieldCheck,
  Users,
} from "lucide-react";
import advenwareLogo from "./assets/Advenware.jpeg";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { loginRequest } from "./services/authService";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import CitizenProtectedRoute from "./routes/CitizenProtectedRoute";

function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

function RoleBasedRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user?.role);
  if (role === "citizen") {
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

const Citizens = lazy(() => import("./pages/Citizens"));
const Complaints = lazy(() => import("./pages/Complaints"));
const BursaryApplications = lazy(() => import("./pages/BursaryApplications"));
const Projects = lazy(() => import("./pages/Projects"));
const Meetings = lazy(() => import("./pages/Meetings"));
const Staff = lazy(() => import("./pages/Staff"));
const Budget = lazy(() => import("./pages/Budget"));
const Report = lazy(() => import("./pages/Report"));
const Settings = lazy(() => import("./pages/Settings"));

// Citizen Dashboard pages
const CitizenDashboard = lazy(() => import("./pages/citizens/CitizenDashboard"));
const CitizenComplaints = lazy(() => import("./pages/citizens/CitizenComplaints"));
const CitizenComplaintDetails = lazy(() => import("./pages/citizens/CitizenComplaintDetails"));
const CitizenProjects = lazy(() => import("./pages/citizens/CitizenProjects"));
const CitizenMeetings = lazy(() => import("./pages/citizens/CitizenMeetings"));
const CitizenAnnouncements = lazy(() => import("./pages/citizens/CitizenAnnouncements"));
const CitizenNotifications = lazy(() => import("./pages/citizens/CitizenNotifications"));
const CitizenProfile = lazy(() => import("./pages/citizens/CitizenProfile"));

const FEATURE_ITEMS = [
  {
    icon: Users,
    title: "WOMEN Records",
    description: "Maintain accurate and secure Women profiles for informed local administration.",
  },
  {
    icon: FolderKanban,
    title: "Development Projects",
    description: "Track planning, budget utilization, beneficiaries and implementation progress efficiently.",
  },
  {
    icon: CircleAlert,
    title: "Complaint Management",
    description: "Receive, assign, and resolve ward issues transparently and on time.",
  },
];

function FeatureItem({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      className="feature-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.12, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="feature-icon-wrap" aria-hidden="true">
        <Icon size={20} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,20}$/;

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    remember: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
  });

  const isSignUp = mode === "signup";

  const errors = useMemo(() => {
    const next = {};

    if (isSignUp && !formData.fullName.trim()) {
      next.fullName = "Full name is required.";
    }

    if (!formData.username.trim()) {
      next.username = "Username is required.";
    } else if (!USERNAME_REGEX.test(formData.username.trim())) {
      next.username = "Use 4-20 characters: letters, numbers, ., _, -";
    }

    return next;
  }, [formData, isSignUp]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (authError) setAuthError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const setAllTouchedForMode = () => {
    setTouched({
      fullName: isSignUp,
      username: true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAllTouchedForMode();
    setAuthError("");

    if (hasErrors) return;

    try {
      setIsSubmitting(true);

      if (isSignUp) {
        const { registerRequest } = await import("./services/authService");
        await registerRequest({
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
        });

        // Requirement: on signup success, stay on login screen (no auto-login)
        setMode("signin");
        setAuthError("");
        setTouched({
          fullName: false,
          username: false,
        });
        setFormData({
          fullName: "",
          username: "",
          remember: false,
        });
        return;
      }

      const data = await loginRequest({
        username: formData.username.trim(),
      });

      login(data);

      const role = normalizeRole(data.user?.role);
      if (role === "citizen") {
        navigate("/citizen/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      if (isSignUp && error?.response?.status === 409) {
        setAuthError("Username already exists.");
      } else if (!isSignUp && error?.response?.status === 401) {
        setAuthError("Invalid username.");
      } else {
        setAuthError(isSignUp ? "Unable to create account. Please try again." : "Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setAuthError("");
    setTouched({
      fullName: false,
      username: false,
    });
  };

  if (isAuthenticated) {
    const role = normalizeRole(user?.role);
    if (role === "citizen") {
      return <Navigate to="/citizen/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="gov-login-page">
      <section className="gov-login-left fade-in">
        <div className="gov-overlay-pattern" aria-hidden="true" />
        <div className="left-inner">
          <div className="login-logo-stack" aria-hidden="true">
            <div className="login-logo-ring">
              <img
                src={advenwareLogo}
                alt=""
                className="login-logo-img"
                loading="eager"
              />
            </div>
            <div className="login-logo-caption">
              <span className="login-logo-caption-main">Advenware</span>
              <span className="login-logo-caption-sub">Women Repsentative system</span>
            </div>
          </div>

          <div className="gov-badge">
            <Landmark size={18} />
            <span>Kenya County e-Service Portal</span>
          </div>

          <h1>Women Repsentative system</h1>
          <p className="subtitle">Digital Governance for Efficient Ward Administration</p>

          <div className="feature-list">
            {FEATURE_ITEMS.map((item, index) => (
              <FeatureItem key={item.title} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="gov-login-right">
        <div className="community-bg" aria-hidden="true" />
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p className="card-subtitle">
            {isSignUp
              ? "Register your ward officer account to access secure county services."
              : "Sign in to continue to the ward administration dashboard."}
          </p>

          <form className="login-form" noValidate onSubmit={handleSubmit}>
            {isSignUp ? (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(touched.fullName && errors.fullName)}
                  aria-describedby={touched.fullName && errors.fullName ? "fullName-error" : undefined}
                  placeholder="Enter your full name"
                />
                {touched.fullName && errors.fullName ? (
                  <p id="fullName-error" className="error-text" role="alert">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(touched.username && errors.username)}
                aria-describedby={touched.username && errors.username ? "username-error" : undefined}
                placeholder={isSignUp ? "Create a username" : "Enter your username"}
              />
              {touched.username && errors.username ? (
                <p id="username-error" className="error-text" role="alert">
                  {errors.username}
                </p>
              ) : null}
            </div>

            <div className="form-row">
              <label className="remember-wrap" htmlFor="remember">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <span>{isSignUp ? "Remember this device" : "Remember Me"}</span>
              </label>

              {!isSignUp ? (
                <span className="secure-note">
                  <ShieldCheck size={14} />
                  Secure access
                </span>
              ) : (
                <span className="secure-note">
                  <ShieldCheck size={14} />
                  Secure registration
                </span>
              )}
            </div>

            {authError ? (
              <p className="error-text" role="alert">
                {authError}
              </p>
            ) : null}

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>

            <button type="button" className="switch-mode-btn" onClick={switchMode}>
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
            </button>
          </form>

          <footer className="login-footer">© 2026 Advenware. All rights reserved.</footer>
        </motion.div>
      </section>
    </main>
  );
}

function App() {
  const { logout } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizens"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Citizens />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Complaints />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bursary"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <BursaryApplications onLogout={logout} />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Projects />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Meetings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Staff />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Budget />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Report />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      {/* Citizen Dashboard Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenDashboard />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenComplaints />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/bursary/apply"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenBursaryForm />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/bursary/tracking"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenBursaryTracking />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenComplaintDetails />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/projects"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenProjects />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/meetings"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenMeetings />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/announcements"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenAnnouncements />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/notifications"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenNotifications />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <CitizenProtectedRoute>
            <Suspense fallback={<div className="loading-screen">Loading...</div>}>
              <CitizenProfile />
            </Suspense>
          </CitizenProtectedRoute>
        }
      />

      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  );
}

export default App;
