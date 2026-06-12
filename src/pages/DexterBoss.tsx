import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldAlert, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const OWNER_PHONE = "8668183926";
const OWNER_PIN = "DexterAdmin";

const DexterBoss = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Restricted Access — Dexter Operations";
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    setBusy(false);
    if (phone.replace(/\D/g, "") === OWNER_PHONE && pin === OWNER_PIN) {
      const token = btoa(`${OWNER_PHONE}:${Date.now()}`);
      localStorage.setItem("admin_token", token);
      toast.success("Owner verified — entering control room");
      navigate("/admin", { replace: true });
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-black p-4 relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-cta/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl pointer-events-none" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 grid place-items-center rounded-full border-2 border-gold text-gold shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.4em] text-red-cta font-bold flex items-center gap-2">
            <ShieldAlert className="h-3 w-3" /> Restricted Access
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white mt-2">
            Store Operations
          </h1>
          <p className="text-xs text-white/50 mt-2">Authorized owner credentials required.</p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-white/60">Master Phone</label>
            <input
              required
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              placeholder="10-digit owner mobile"
              className="mt-2 w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-cta focus:shadow-[0_0_0_3px_rgba(220,38,38,0.18)] transition"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-white/60">Master PIN</label>
            <div className="relative mt-2">
              <input
                required
                type={show ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
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
          </div>
        </div>

        <button
          disabled={busy}
          className="mt-8 w-full bg-gradient-to-r from-red-cta to-gold text-black py-3.5 rounded-lg text-xs uppercase tracking-[0.3em] font-extrabold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Unlock Control Room
        </button>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
          Unauthorized access is logged
        </p>
      </form>
    </div>
  );
};

export default DexterBoss;
