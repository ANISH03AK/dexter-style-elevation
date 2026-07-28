import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "customer" | null;

type AuthCtx = {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  isAdmin: boolean;
  // Mobile-number based auth (default for customers)
  signInWithPhone: (phone: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPhone: (phone: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  // Email auth (used by store owner / admin)
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

// Convert a raw phone string to a deterministic email alias we can use with
// Supabase's password auth (avoids needing an external SMS provider).
const phoneToEmail = (phone: string) => {
  const digits = phone.replace(/\D+/g, "");
  return `${digits}@dexter.phone`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();
    setRole((data?.role as Role) ?? "customer");
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => fetchRole(s.user.id), 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthCtx["signUp"] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithPhone: AuthCtx["signInWithPhone"] = async (phone, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password,
    });
    if (!error) return { error: null };
    const msg = /invalid login credentials/i.test(error.message)
      ? "No account found with this number, or the password is wrong."
      : error.message;
    return { error: msg };
  };

  const signUpWithPhone: AuthCtx["signUpWithPhone"] = async (phone, password, fullName) => {
    const digits = phone.replace(/\D+/g, "");
    const { data, error } = await supabase.auth.signUp({
      email: phoneToEmail(digits),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone: digits },
      },
    });
    if (error) {
      const msg = /already registered|already exists/i.test(error.message)
        ? "This mobile number already has an account. Please sign in."
        : error.message;
      return { error: msg };
    }
    // Supabase returns an obfuscated user with no identities when the email
    // (phone alias) is already taken — enforce one account per mobile number.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      return { error: "This mobile number already has an account. Please sign in." };
    }
    return { error: null };
  };


  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{
      user, session, role, loading, isAdmin: role === "admin",
      signIn, signUp, signInWithPhone, signUpWithPhone, signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
};
