import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
const AuthContext = createContext(null);
export const dashboardFor = (role) =>
  role === "admin"
    ? "/admin/dashboard"
    : role === "finance"
      ? "/finance/dashboard"
      : "/sales/dashboard";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const clearExpiredSession = () => setUser(null);
    window.addEventListener('rcerp:session-expired', clearExpiredSession);
    return () => window.removeEventListener('rcerp:session-expired', clearExpiredSession);
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const r = await api.post("/auth/login", payload);
        setUser(r.data.data);
        return r.data.data;
      },
      async logout() {
        try {
          await api.post("/auth/logout");
        } finally {
          setUser(null);
        }
      },
      refresh: async () => {
        const r = await api.get("/auth/me");
        setUser(r.data.data);
        return r.data.data;
      },
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
