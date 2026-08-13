import { createContext, useContext, useMemo, useState } from "react";
import { clearAuthSession, getStoredToken, getStoredUser, storeAuthSession } from "../utils/tokenStorage";

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    if (stored && stored.role) {
      return { ...stored, role: normalizeRole(stored.role) };
    }
    return stored;
  });

  const isAuthenticated = Boolean(token);

  const login = ({ token: nextToken, user: nextUser }) => {
    const normalizedUser = nextUser ? { ...nextUser, role: normalizeRole(nextUser.role) } : nextUser;
    storeAuthSession(nextToken, normalizedUser);
    setToken(nextToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
    }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
