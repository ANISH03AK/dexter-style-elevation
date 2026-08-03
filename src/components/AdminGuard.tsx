import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * AdminGuard — gate for /admin routes.
 * Requires localStorage.admin_token (set by the owner login at /dexter-boss)
 * and verifies that a backend owner session exists, since every write
 * (products, storefront, promos, lookbook, orders) is validated server-side.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      let token = false;
      try {
        token = !!localStorage.getItem("admin_token");
      } catch {
        token = false;
      }
      if (!token) {
        if (active) setAllowed(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        toast.error("Owner session expired — sign in again to save changes.");
        try {
          localStorage.removeItem("admin_token");
        } catch {
          /* ignore */
        }
        setAllowed(false);
        return;
      }
      setAllowed(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/dexter-boss" replace />;
  return <>{children}</>;
};

export default AdminGuard;
