import { Navigate, Outlet } from "react-router-dom";
import { useAuth, dashboardFor } from "../context/AuthContext";
export function Protected() {
  const { user, loading } = useAuth();
  if (loading)
    return <div className="empty">Restoring secure RC ERP session…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export function RoleOnly({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? (
    <Outlet />
  ) : (
    <Navigate to={dashboardFor(user.role)} replace />
  );
}
