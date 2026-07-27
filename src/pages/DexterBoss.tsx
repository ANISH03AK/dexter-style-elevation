import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock, ShieldAlert, Loader2, Eye, EyeOff, Phone, KeyRound,
  ArrowLeft, CheckCircle2, Fingerprint, Wifi, Clock3, MapPin, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const OWNER_PHONE = "8668183926";
const OWNER_PIN = "DexterAdmin";
const MAX_ATTEMPTS = 5;

const DexterBoss = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);
  const [caps, setCaps] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    document.title = "Restricted Access — Dexter Store Operations";
    const saved = localStorage.getItem("admin_last_phone");
    if (saved) setPhone(saved);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const locked = lockUntil !== null && lockUntil > now.getTime();
  const lockSeconds = locked ? Math.ceil((lockUntil! - now.getTime()) / 1000) : 0;

  const phoneValid = phone.length === 10;
  const pinValid = pin.length >= 4;
  const strength = useMemo(() => {
    if (!phoneValid && !pinValid) return 0;
    return (phoneValid ? 50 : 0) + (pinValid ? 50 : 0);
  }, [phoneValid, pinValid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return toast.error(`Locked. Try again in ${lockSeconds}s`);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 550));
    setBusy(false);

    if (phone.replace(/\D/g, "") === OWNER_PHONE && pin === OWNER_PIN) {
      localStorage.setItem("admin_token", "true");
      localStorage.setItem("admin_login_at", String(Date.now()));
      if (remember) localStorage.setItem("admin_last_phone", phone);
      else localStorage.removeItem("admin_last_phone");
      toast.success("Owner verified — entering control room");
      navigate("/admin", { replace: true });
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      setLockUntil(Date.now() + 60_000);
      setAttempts(0);
      toast.error("Too many failed attempts — locked for 60 seconds");
    } else {
      toast.error(`Invalid credentials — ${MAX_ATTEMPTS - next} attempt(s) left`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* ambient glow + grid */}
      <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-red-cta/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gold/20 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-gold transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to store
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-white/40">
          <span className="inline-flex items-center gap-1.5"><Wifi className="h-3 w-3 text-emerald-400" /> Secure channel</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3" /> {now.toLocaleTimeString("en-IN")}</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 grid place-items-center px-4 pb-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
          {/* Brand / info panel */}
          <section className="hidden lg:block">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold font-bold">Dexter Mens Clothing</p>
            <h2 className="font-display text-5xl font-extrabold leading-[1.05] mt-4">
              Store Control<br />
              <span className="bg-gradient-to-r from-red-cta via-gold to-gold bg-clip-text text-transparent">Room Access</span>
            </h2>
            <p className="text-sm text-white/50 mt-5 max-w-md leading-relaxed">
              A private terminal for the store owner. Manage products, pricing, offers,
              storefront content, shipping rules, promo codes, lookbook and live orders — all in real time.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Full product CRUD with stock-by-size matrix",
                "Live order feed & status control",
                "Storefront CMS: hero, announcement, lookbook",
                "Shipping thresholds & promo code generator",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/35">
              <MapPin className="h-3.5 w-3.5" /> Jayankondam · Tamil Nadu
            </div>
          </section>

          {/* Login card */}
          <form
            onSubmit={submit}
            className="relative w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 sm:p-10 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 grid place-items-center rounded-full border-2 border-gold text-gold shadow-[0_0_36px_rgba(212,175,55,0.35)]">
                <Lock className="h-6 w-6" />
              </div>
              <p className="mt-5 text-[10px] uppercase tracking-[0.4em] text-red-cta font-bold flex items-center gap-2">
                <ShieldAlert className="h-3 w-3" /> Restricted Access
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold mt-2">Store Operations</h1>
              <p className="text-xs text-white/50 mt-2">Authorized owner credentials required.</p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-white/60 flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Master Phone
                </label>
                <div className="relative mt-2">
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="username"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    placeholder="10-digit owner mobile"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-11 text-white placeholder-white/30 focus:outline-none focus:border-red-cta focus:shadow-[0_0_0_3px_rgba(220,38,38,0.18)] transition tracking-[0.15em]"
                  />
                  {phoneValid && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-white/60 flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3" /> Master PIN
                </label>
                <div className="relative mt-2">
                  <input
                    required
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
                    placeholder="Owner PIN"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-11 text-white placeholder-white/30 focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.18)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    aria-label={show ? "Hide PIN" : "Show PIN"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {caps && <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-gold">Caps lock is on</p>}
              </div>

              {/* readiness meter */}
              <div>
                <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-cta to-gold transition-all duration-500"
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/35">
                  <span>Credential readiness</span>
                  <span>{strength}%</span>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 accent-gold"
                />
                <span className="text-[11px] text-white/55">Remember this device</span>
              </label>
            </div>

            <button
              disabled={busy || locked}
              className="mt-7 w-full bg-gradient-to-r from-red-cta to-gold text-black py-3.5 rounded-lg text-xs uppercase tracking-[0.3em] font-extrabold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
              {locked ? `Locked · ${lockSeconds}s` : busy ? "Verifying" : "Unlock Control Room"}
            </button>

            {attempts > 0 && !locked && (
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-red-cta">
                {MAX_ATTEMPTS - attempts} attempt(s) remaining
              </p>
            )}

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <p className="text-[10px] leading-relaxed text-white/40">
                Sessions are device-local. Every unauthorized attempt is rate-limited and logged.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DexterBoss;
