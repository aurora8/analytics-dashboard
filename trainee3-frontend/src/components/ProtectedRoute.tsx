import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}
