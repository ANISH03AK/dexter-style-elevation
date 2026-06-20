import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight, ShoppingBag, Sparkles, Tag, Check, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FREE_ITEM_THRESHOLD = 3;
const PROMO_KEY = "dexter:promo";

type Promo = { code: string; label: string; off: number } | null;

const Cart = () => {
  const { items, setQty, remove, count, total } = useCart();
  const { settings } = useStoreSettings();
  const FREE_SUBTOTAL_THRESHOLD = settings.free_shipping_threshold;
  const SHIPPING_FEE = settings.flat_shipping_fee;

  const qualifiesFree = count >= FREE_ITEM_THRESHOLD || total >= FREE_SUBTOTAL_THRESHOLD;
  const shipping = items.length === 0 ? 0 : (qualifiesFree ? 0 : SHIPPING_FEE);

  const [codeInput, setCodeInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [promo, setPromo] = useState<Promo>(() => {
    try { const raw = sessionStorage.getItem(PROMO_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const validateCode = async (raw: string, subtotal: number): Promise<Promo> => {
    const code = raw.trim().toUpperCase();
    if (!code) return null;
    const { data } = await supabase
      .from("promo_codes")
      .select("code, kind, value, active")
      .ilike("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!data) return null;
    const v = Number(data.value);
    const off = data.kind === "percent" ? Math.round(subtotal * (v / 100)) : Math.min(v, subtotal);
    const label = data.kind === "percent" ? `${v}% OFF` : `${formatINR(v)} OFF`;
    return { code: data.code, label, off };
  };

  // Re-validate when subtotal changes
  useEffect(() => {
    if (!promo) return;
    let cancelled = false;
    (async () => {
      const fresh = await validateCode(promo.code, total);
      if (cancelled) return;
      if (!fresh) { setPromo(null); sessionStorage.removeItem(PROMO_KEY); }
      else if (fresh.off !== promo.off) { setPromo(fresh); sessionStorage.setItem(PROMO_KEY, JSON.stringify(fresh)); }
    })();
    return () => { cancelled = true; };
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    const p = await validateCode(codeInput, total);
    setApplying(false);
    if (!p) { toast.error("Invalid or inactive promo code"); return; }
    setPromo(p);
    sessionStorage.setItem(PROMO_KEY, JSON.stringify(p));
    setCodeInput("");
    toast.success(`Code ${p.code} applied — ${p.label}`);
  };

  const removePromo = () => { setPromo(null); sessionStorage.removeItem(PROMO_KEY); };

  const discount = promo?.off ?? 0;
  const grand = Math.max(0, total + shipping - discount);
  const freeShipRemaining = Math.max(0, FREE_SUBTOTAL_THRESHOLD - total);
  const freeShipPct = Math.min(100, (total / FREE_SUBTOTAL_THRESHOLD) * 100);

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Your bag</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Shopping Cart</h1>

        {items.length > 0 && (
          <div className={`mb-8 rounded-md px-5 py-4 text-sm font-semibold border-2 transition-colors ${
            qualifiesFree ? "bg-gold/15 border-gold text-ink" : "bg-red-cta/10 border-red-cta text-ink"
          }`}>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-red-cta" />
              <span>
                {qualifiesFree
                  ? "🎉 CONGRATULATIONS! You've unlocked FREE SHIPPING!"
                  : `Add ${formatINR(freeShipRemaining)} more (or hit ${FREE_ITEM_THRESHOLD} items) for FREE SHIPPING.`}
              </span>
            </div>
            {!qualifiesFree && (
              <div className="mt-3 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                <div className="h-full bg-red-cta transition-all duration-500" style={{ width: `${freeShipPct}%` }} />
              </div>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-24 border border-border">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-6" />
            <h2 className="font-display text-2xl mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Discover pieces that define your edge.</p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-ink transition-smooth">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            <div className="divide-y divide-border border-y border-border">
              {items.map(i => (
                <div key={i.product.id + i.size} className="py-6 flex gap-5">
                  <Link to={`/product/${i.product.id}`} className="w-24 sm:w-32 aspect-[4/5] bg-secondary overflow-hidden shrink-0">
                    <img src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{i.product.category}</p>
                        <Link to={`/product/${i.product.id}`} className="font-medium hover:text-gold transition-smooth">{i.product.name}</Link>
                        <p className="text-xs text-muted-foreground mt-1">Size: {i.size}</p>
                      </div>
                      <button onClick={() => remove(i.product.id, i.size)} className="text-muted-foreground hover:text-destructive transition-smooth h-fit">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4">
                      <div className="flex items-center border border-border">
                        <button onClick={() => setQty(i.product.id, i.size, i.qty - 1)} className="h-9 w-9 grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                        <span className="w-9 text-center text-sm">{i.qty}</span>
                        <button onClick={() => setQty(i.product.id, i.size, i.qty + 1)} className="h-9 w-9 grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      </div>
                      <p className="font-semibold">{formatINR(i.product.price * i.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-secondary p-8 self-start sticky top-32">
              <h3 className="font-display text-2xl font-bold mb-6">Order Summary</h3>

              <div className="mb-6">
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2 mb-2">
                  <Tag className="h-3 w-3" /> Promo Code
                </label>
                {promo ? (
                  <div className="flex items-center justify-between bg-gold/15 border-2 border-dashed border-gold rounded px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Check className="h-4 w-4 text-gold" />
                      <span>{promo.code}</span>
                      <span className="text-xs text-muted-foreground">— {promo.label}</span>
                    </div>
                    <button onClick={removePromo} className="text-muted-foreground hover:text-destructive" aria-label="Remove promo">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyPromo} className="flex gap-2">
                    <input
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 border border-border bg-background px-3 py-2 text-sm rounded focus:outline-none focus:border-gold"
                    />
                    <button disabled={applying} className="bg-ink text-primary-foreground px-4 text-[11px] uppercase tracking-[0.2em] font-bold rounded hover:bg-gold hover:text-ink transition disabled:opacity-60 inline-flex items-center gap-1">
                      {applying && <Loader2 className="h-3 w-3 animate-spin" />} Apply
                    </button>
                  </form>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({count} items)</span><span>{formatINR(total)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={qualifiesFree ? "text-gold font-semibold" : ""}>
                    {qualifiesFree ? "Free" : formatINR(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-cta font-semibold">
                    <span>Discount ({promo?.code})</span>
                    <span>− {formatINR(discount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-border flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatINR(grand)}</span>
              </div>
              <Link to="/checkout" className="w-full mt-8 bg-ink text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3">
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className="block text-center mt-4 text-xs uppercase tracking-[0.2em] link-underline w-fit mx-auto">
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Cart;
