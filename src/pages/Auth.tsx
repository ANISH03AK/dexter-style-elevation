import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import authImg from "@/assets/auth-side.jpg";
import dexterLogo from "@/assets/dexter-logo.png";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password, fullName);
    setSubmitting(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(mode === "login" ? "Welcome back" : "Account created");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block bg-ink">
        <img src={authImg} alt="DEXTER" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/70 via-ink/30 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" aria-label="DEXTER home" className="inline-block">
            <img src={dexterLogo} alt="DEXTER" className="h-11 w-auto object-contain brightness-0 invert" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Member Privileges</p>
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
              Join the inner <br/> circle.
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-sm">
              Early access to drops, exclusive editions, and members-only events.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" aria-label="DEXTER home" className="lg:hidden block mb-12">
            <img src={dexterLogo} alt="DEXTER" className="h-9 w-auto object-contain" />
          </Link>

          <div className="flex gap-1 mb-10 border-b border-border">
            {(["login", "signup"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                type="button"
                className={`pb-3 px-4 text-xs uppercase tracking-[0.25em] font-semibold transition-smooth -mb-px border-b-2 ${mode === m ? "border-ink text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome back." : "Become a member."}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login" ? "Enter your details to access your account." : "Sign up for early access and exclusive offers."}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Password</label>
              <input required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
            </div>

            <button disabled={submitting} type="submit" className="w-full bg-ink text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3 mt-4 disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Store Owner? Sign in with the admin account to access the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
