import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect citizens away from admin routes
  if (normalizeRole(user?.role) === "citizen") {
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
