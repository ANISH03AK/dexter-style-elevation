import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Phone } from "lucide-react";
import authImg from "@/assets/auth-side.jpg";
import dexterLogo from "@/assets/dexter-logo.png";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Password",
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        required
        minLength={6}
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-border py-3 pr-10 focus:outline-none focus:border-foreground transition-smooth"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { signInWithPhone, signUpWithPhone, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate(isAdmin ? "/admin" : "/", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const digits = phone.replace(/\D/g, "");
  const phoneValid = digits.length === 10 && /^[6-9]/.test(digits);
  const passValid = password.length >= 6;
  const nameValid = mode === "login" || fullName.trim().length >= 2;
  const canSubmit = phoneValid && passValid && nameValid && !submitting;

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setPassword("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) return toast.error("Enter a valid 10-digit mobile number");
    if (!passValid) return toast.error("Password must be at least 6 characters");
    if (!nameValid) return toast.error("Please enter your full name");

    setSubmitting(true);
    const res =
      mode === "login"
        ? await signInWithPhone(digits, password, remember)
        : await signUpWithPhone(digits, password, fullName.trim(), remember);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
      if (mode === "signup" && /already/i.test(res.error)) switchMode("login");
      return;
    }
    toast.success(mode === "login" ? "Welcome back" : "Account created");
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block bg-ink">
        <img src={authImg} alt="DEXTER Mens Clothing store" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/85 via-ink/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" aria-label="DEXTER home" className="inline-block">
            <img src={dexterLogo} alt="DEXTER" className="h-11 w-auto object-contain brightness-0 invert" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Member Privileges</p>
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
              One number. <br /> One account.
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-sm">
              Sign in with your mobile number to track orders, save favourites and get early access to drops.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" aria-label="DEXTER home" className="lg:hidden block mb-10">
            <img src={dexterLogo} alt="DEXTER" className="h-9 w-auto object-contain" />
          </Link>

          <div className="flex gap-1 mb-8 border-b border-border">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                type="button"
                className={`pb-3 px-4 text-xs uppercase tracking-[0.25em] font-semibold transition-smooth -mb-px border-b-2 ${
                  mode === m ? "border-ink text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login"
              ? "Use the mobile number you registered with."
              : "Each mobile number can have one account only."}
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <input
                  required
                  value={fullName}
                  autoComplete="name"
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth"
                />
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mobile Number</label>
              <div className="mt-2 flex items-center gap-2 border-b border-border focus-within:border-foreground transition-smooth">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+91</span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="flex-1 bg-transparent py-3 focus:outline-none tracking-wide"
                />
                {phoneValid && <Check className="h-4 w-4 text-green-600" />}
              </div>
              {digits.length > 0 && !phoneValid && (
                <p className="mt-2 text-xs text-red-cta">Enter a valid Indian mobile number starting with 6-9.</p>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Password</label>
              <div className="mt-2">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "login" ? "Your password" : "At least 6 characters"}
                />
              </div>
              {mode === "signup" && (
                <p className="mt-2 text-xs text-muted-foreground">Keep it safe — you'll need it to sign in next time.</p>
              )}
            </div>

            <button
              disabled={!canSubmit}
              type="submit"
              className="w-full bg-ink text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-ink disabled:hover:text-primary-foreground"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? "New to DEXTER?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-foreground font-semibold link-underline hover:text-red-cta transition-smooth"
            >
              {mode === "login" ? "Create an account" : "Sign in instead"}
            </button>
          </p>

          <p className="mt-8 text-xs text-muted-foreground text-center leading-relaxed">
            Forgot your password? Call the store at{" "}
            <a href="tel:08925259787" className="text-foreground font-semibold">
              089252 59787
            </a>{" "}
            and we'll help you get back in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
