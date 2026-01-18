import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/utils/auth/useAuth";
import type { Role } from "@/api";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { isLoggedIn, loading, roles } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Ładowanie...</div>;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
