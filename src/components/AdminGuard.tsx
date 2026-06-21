import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * AdminGuard — local-only gate for /admin routes.
 * Reads localStorage.admin_token. No Supabase calls. No session checks.
 * Redirects to "/" when the token is missing.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setAllowed(!!localStorage.getItem("admin_token"));
    } catch {
      setAllowed(false);
    }
  }, []);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminGuard;
