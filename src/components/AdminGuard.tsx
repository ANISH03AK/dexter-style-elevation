import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * AdminGuard — gate for /admin routes.
 * Requires a real backend session whose account holds the `admin` role.
 * Role membership is read through RLS (users may only read their own roles),
 * so this cannot be spoofed from the browser. Every write is additionally
 * enforced server-side by row-level security.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!active) return;
      if (!user) {
        setAllowed(false);
        return;
      }

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!active) return;
      if (!role) {
        toast.error("You are not authorized to access store operations.");
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
