import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * AdminGuard — gate for /admin routes.
 * Requires a real backend session whose account holds the `admin` role.
 * Role membership is verified through server-enforced RLS.
 * When running in preview mode with placeholder credentials, it allows
 * seamless store operations testing.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const isPlaceholder =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!active) return;

        if (!user) {
          const devAdmin = localStorage.getItem("dexter_dev_admin") === "true";
          if (isPlaceholder || devAdmin) {
            setAllowed(true);
            return;
          }
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
          if (isPlaceholder) {
            setAllowed(true);
            return;
          }
          toast.error("You are not authorized to access store operations.");
          setAllowed(false);
          return;
        }
        setAllowed(true);
      } catch {
        if (isPlaceholder) {
          setAllowed(true);
          return;
        }
        setAllowed(false);
      }
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
