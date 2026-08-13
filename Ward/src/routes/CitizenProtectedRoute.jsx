import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

function CitizenProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only allow citizens to access citizen routes
  if (normalizeRole(user?.role) !== "citizen") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default CitizenProtectedRoute;
