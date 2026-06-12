import { useEffect, useState } from "react";
import { X, Gift, Copy } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const KEY = "dexter:exitIntentShown";
const CODE = "DEXTER5";

const ExitIntentPopup = () => {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (count === 0) return;
    if (sessionStorage.getItem(KEY)) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setOpen(true);
        sessionStorage.setItem(KEY, "1");
        document.removeEventListener("mouseout", handler);
      }
    };
    document.addEventListener("mouseout", handler);
    return () => document.removeEventListener("mouseout", handler);
  }, [count]);

  if (!open) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(CODE);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-ink to-black border border-gold/30 p-8 text-white shadow-2xl">
        <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white/60 hover:text-white" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <Gift className="h-10 w-10 text-gold" />
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-red-cta font-bold">Wait — don't go!</p>
        <h2 className="font-display text-3xl font-extrabold mt-2">Here's 5% off your bag.</h2>
        <p className="text-white/70 text-sm mt-2">Complete checkout now and use code below.</p>
        <button
          onClick={copy}
          className="mt-5 w-full flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gold bg-gold/10 py-4 font-mono text-xl font-bold tracking-[0.3em] hover:bg-gold hover:text-ink transition"
        >
          {CODE} <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOpen(false)}
          className="mt-5 w-full bg-red-cta py-3.5 rounded-lg text-xs uppercase tracking-[0.3em] font-bold hover:opacity-90 transition"
        >
          Apply & Continue
        </button>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
