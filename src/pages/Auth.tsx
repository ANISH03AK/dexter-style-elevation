import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Phone, Mail, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import authImg from "@/assets/auth-side.jpg";
import dexterLogo from "@/assets/dexter-logo.png";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";

type Method = "phone" | "email";

// Owner identifier — single source of truth
const OWNER_PHONE = "8668183926";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.3 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.7 6.3 29.1 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.8 13.2-4.9l-6.1-5c-2 1.4-4.4 2.4-7.1 2.4-5.4 0-9.9-3.1-11.4-7.5l-6.6 5.1C9.6 39.1 16.2 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2.1 3.9-3.9 5.2l6.1 5c-.4.4 6.5-4.7 6.5-14.2 0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);

// Generate a 6-digit OTP and surface it via toast (simulated SMS/email)
const issueOtp = (target: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  toast.success(`OTP sent to ${target}`, {
    description: `Your verification code is ${code}`,
    duration: 12000,
  });
  return code;
};

const PasswordInput = ({
  value, onChange, placeholder = "Password",
}: { value: string; onChange: (v: string) => void; placeholder?: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        required minLength={6} type={show ? "text" : "password"}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-border py-3 pr-10 focus:outline-none focus:border-foreground transition-smooth"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
        aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const Auth = () => {
  const [method, setMethod] = useState<Method>("phone");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP gating for signup
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");

  // Forgot-password modal
  const [forgotOpen, setForgotOpen] = useState(false);

  const { signIn, signUp, signInWithPhone, signUpWithPhone, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error("Google sign-in failed");
  };

  const completeSignup = async () => {
    setSubmitting(true);
    const res = method === "phone"
      ? await signUpWithPhone(phone, password, fullName)
      : await signUp(email, password, fullName);
    setSubmitting(false);
    if (res.error) { toast.error(res.error); return; }
    const isOwner = method === "phone" && phone.replace(/\D/g, "") === OWNER_PHONE;
    toast.success(isOwner ? "Owner account created — entering admin" : "Account created");
    setPendingOtp(null);
    setOtpInput("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "phone") {
      const digits = phone.replace(/\D+/g, "");
      if (digits.length < 10) { toast.error("Enter a valid 10-digit mobile number"); return; }
    }

    // SIGN UP → require simulated OTP verification first
    if (mode === "signup") {
      const target = method === "phone" ? `+91 ${phone}` : email;
      const code = issueOtp(target);
      setPendingOtp(code);
      setOtpInput("");
      return;
    }

    // SIGN IN
    setSubmitting(true);
    const res = method === "phone"
      ? await signInWithPhone(phone, password)
      : await signIn(email, password);
    setSubmitting(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Welcome back");
  };

  const verifyOtp = async () => {
    if (otpInput !== pendingOtp) { toast.error("Invalid OTP — please try again"); return; }
    toast.success("Verified ✓");
    await completeSignup();
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block bg-ink">
        <img src={authImg} alt="DEXTER" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/85 via-ink/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" aria-label="DEXTER home" className="inline-block">
            <img src={dexterLogo} alt="DEXTER" className="h-11 w-auto object-contain brightness-0 invert" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Member Privileges</p>
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight">Join the inner <br/> circle.</h2>
            <p className="mt-4 text-primary-foreground/70 max-w-sm">
              Early access to drops, exclusive editions, and members-only events.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" aria-label="DEXTER home" className="lg:hidden block mb-10">
            <img src={dexterLogo} alt="DEXTER" className="h-9 w-auto object-contain" />
          </Link>

          {/* Method switch */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-secondary rounded-md">
            {([
              { id: "phone", label: "Mobile", Icon: Phone },
              { id: "email", label: "Email", Icon: Mail },
            ] as const).map(m => (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                className={`py-2.5 rounded text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-smooth ${method === m.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <m.Icon className="h-3.5 w-3.5" /> {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 mb-8 border-b border-border">
            {(["login", "signup"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} type="button"
                className={`pb-3 px-4 text-xs uppercase tracking-[0.25em] font-semibold transition-smooth -mb-px border-b-2 ${mode === m ? "border-ink text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome back." : "Become a member."}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {method === "phone" ? "Sign in with your mobile number and password." : "Sign in with your email and password."}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
              </div>
            )}

            {method === "phone" ? (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mobile Number</label>
                <div className="mt-2 flex items-center gap-2 border-b border-border focus-within:border-foreground transition-smooth">
                  <span className="text-sm text-muted-foreground">+91</span>
                  <input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    className="flex-1 bg-transparent py-3 focus:outline-none" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Password</label>
              <div className="mt-2">
                <PasswordInput value={password} onChange={setPassword} />
              </div>
              {mode === "login" && (
                <button type="button" onClick={() => setForgotOpen(true)}
                  className="mt-3 text-xs text-muted-foreground hover:text-red-cta transition-smooth link-underline">
                  Forgot Password?
                </button>
              )}
            </div>

            <button disabled={submitting} type="submit" className="w-full bg-ink text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3 mt-4 disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === "login" ? "Sign In" : "Send OTP")}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Google */}
          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> Or <span className="flex-1 h-px bg-border" />
          </div>
          <button type="button" onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-border py-3.5 text-sm font-medium rounded hover:bg-secondary transition-smooth">
            <GoogleIcon /> Continue with Google
          </button>
        </div>
      </div>

      {/* OTP modal for signup */}
      {pendingOtp && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background w-full max-w-md p-8 rounded-lg shadow-elevated relative">
            <button onClick={() => setPendingOtp(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <ShieldCheck className="h-10 w-10 text-gold mb-3" />
            <h3 className="font-display text-2xl font-bold">Verify your {method === "phone" ? "mobile" : "email"}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the 6-digit code sent to{" "}
              <span className="text-foreground font-semibold">{method === "phone" ? `+91 ${phone}` : email}</span>.
            </p>
            <div className="flex justify-center my-6">
              <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}>
                <InputOTPGroup>
                  {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button onClick={verifyOtp} disabled={otpInput.length < 6 || submitting}
              className="w-full bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify & Create Account
            </button>
            <button onClick={() => { const c = issueOtp(method === "phone" ? `+91 ${phone}` : email); setPendingOtp(c); }}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-smooth">
              Resend code
            </button>
          </div>
        </div>
      )}

      {/* Forgot-password modal */}
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  );
};

/* ---------- Forgot Password Flow ---------- */
const ForgotPasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [issuedCode, setIssuedCode] = useState("");
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const send = () => {
    if (!identifier.trim()) { toast.error("Enter your mobile number or email"); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    toast.success(`OTP sent to ${identifier}`, { description: `Your code is ${code}`, duration: 12000 });
    setIssuedCode(code);
    setStep(2);
  };

  const verify = () => {
    if (otp !== issuedCode) { toast.error("Incorrect OTP"); return; }
    toast.success("Verified ✓");
    setStep(3);
  };

  const reset = () => {
    if (pwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwd !== confirm) { toast.error("Passwords don't match"); return; }
    // Simulated reset — in production this would call a secure backend endpoint
    toast.success("Password reset successfully. Please sign in.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-background w-full max-w-md p-8 rounded-lg shadow-elevated relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-red-cta font-bold mb-2">Step {step} of 3</p>
        <h3 className="font-display text-2xl font-bold mb-1">Reset Password</h3>

        {step === 1 && (
          <>
            <p className="text-sm text-muted-foreground mb-5">Enter your registered mobile number or email.</p>
            <input value={identifier} onChange={e => setIdentifier(e.target.value)}
              placeholder="Mobile number or email"
              className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-foreground" />
            <button onClick={send} className="w-full mt-6 bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth">
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-muted-foreground mb-5">Enter the 6-digit code sent to <span className="text-foreground font-semibold">{identifier}</span>.</p>
            <div className="flex justify-center my-2">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button onClick={verify} disabled={otp.length < 6}
              className="w-full mt-6 bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth disabled:opacity-50">
              Verify Code
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-muted-foreground mb-5">Choose a new password.</p>
            <div className="space-y-4">
              <PasswordInput value={pwd} onChange={setPwd} placeholder="New password" />
              <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm new password" />
            </div>
            <button onClick={reset} className="w-full mt-6 bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth">
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
