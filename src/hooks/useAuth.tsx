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
  signInWithPhone: (phone: string, password: string, remember?: boolean) => Promise<{ error: string | null }>;
  signUpWithPhone: (phone: string, password: string, fullName: string, remember?: boolean) => Promise<{ error: string | null }>;
  // Email auth (used by store owner / admin)
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  remembered: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

const REMEMBER_KEY = "dexter_remember";
const TAB_KEY = "dexter_session_tab";

const safeGet = (store: Storage, k: string) => {
  try { return store.getItem(k); } catch { return null; }
};
const safeSet = (store: Storage, k: string, v: string) => {
  try { store.setItem(k, v); } catch { /* ignore */ }
};
const safeRemove = (store: Storage, k: string) => {
  try { store.removeItem(k); } catch { /* ignore */ }
};

// Persist the user's "remember me" choice. When it is off, the session is only
// valid for the current browser tab/session — we drop it on a fresh visit.
const setRemember = (remember: boolean) => {
  safeSet(localStorage, REMEMBER_KEY, remember ? "1" : "0");
  safeSet(sessionStorage, TAB_KEY, "1");
};

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
  const [remembered, setRemembered] = useState(
    () => safeGet(localStorage, REMEMBER_KEY) !== "0",
  );

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

    (async () => {
      // Session-only mode: the user did not tick "remember me", and this is a
      // fresh browser session (no tab marker) — drop the persisted session.
      const wantsRemember = safeGet(localStorage, REMEMBER_KEY) !== "0";
      const sameBrowserSession = safeGet(sessionStorage, TAB_KEY) === "1";
      if (!wantsRemember && !sameBrowserSession) {
        await supabase.auth.signOut();
        safeRemove(localStorage, REMEMBER_KEY);
        setRemembered(true);
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        safeSet(sessionStorage, TAB_KEY, "1");
        fetchRole(data.session.user.id);
      }
      setLoading(false);
    })();

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

  const signInWithPhone: AuthCtx["signInWithPhone"] = async (phone, password, remember = true) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password,
    });
    if (!error) {
      setRemember(remember);
      setRemembered(remember);
      return { error: null };
    }
    const msg = /invalid login credentials/i.test(error.message)
      ? "No account found with this number, or the password is wrong."
      : error.message;
    return { error: msg };
  };

  const signUpWithPhone: AuthCtx["signUpWithPhone"] = async (phone, password, fullName, remember = true) => {
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
    setRemember(remember);
    setRemembered(remember);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    safeRemove(localStorage, REMEMBER_KEY);
    safeRemove(sessionStorage, TAB_KEY);
    setRemembered(true);
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <Ctx.Provider value={{
      user, session, role, loading, isAdmin: role === "admin", remembered,
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
