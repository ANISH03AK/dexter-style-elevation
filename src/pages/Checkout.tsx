import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2, Truck, Receipt, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { formatINR } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SHIPPING_FEE = 162;
const FREE_ITEM_THRESHOLD = 3;
const FREE_SUBTOTAL_THRESHOLD = 2500;

type PayMethod = "cod" | "upi" | "card";

const UPI_REGEX = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

const Checkout = () => {
  const { items, total, count, clear } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<null | {
    id: string;
    tracking: string;
    items: typeof items;
    subtotal: number;
    shipping: number;
    grand: number;
    payment: PayMethod;
  }>(null);
  const [enabledMethods, setEnabledMethods] = useState<Record<PayMethod, boolean>>({ cod: true, upi: true, card: true });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "cod" as PayMethod,
    upiId: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("payment_settings").select("*");
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((r: any) => { map[r.method] = r.enabled; });
        setEnabledMethods({
          cod: map.cod ?? true,
          upi: map.upi ?? true,
          card: map.card ?? true,
        });
        // If currently selected payment is disabled, pick first enabled
        setForm((f) => {
          if (map[f.payment] === false) {
            const next = (["cod","upi","card"] as PayMethod[]).find(m => map[m] !== false) || "cod";
            return { ...f, payment: next };
          }
          return f;
        });
      }
    };
    load();
    const ch = supabase
      .channel("pay-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_settings" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const qualifiesFree = count >= FREE_ITEM_THRESHOLD || total >= FREE_SUBTOTAL_THRESHOLD;
  const shipping = items.length === 0 ? 0 : (qualifiesFree ? 0 : SHIPPING_FEE);
  const grand = total + shipping;

  if (items.length === 0 && !confirmed) {
    return (
      <Layout>
        <div className="container-px mx-auto max-w-[1400px] py-32 text-center">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Link to="/shop" className="bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em]">Shop Now</Link>
        </div>
      </Layout>
    );
  }

  const validatePayment = (): string | null => {
    if (form.payment === "upi") {
      if (!UPI_REGEX.test(form.upiId.trim())) return "Enter a valid UPI ID (e.g. name@oksbi)";
    }
    if (form.payment === "card") {
      const digits = form.cardNumber.replace(/\D/g, "");
      if (!form.cardName.trim()) return "Cardholder name is required";
      if (digits.length !== 16) return "Card number must be 16 digits";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.cardExpiry)) return "Expiry must be MM/YY";
      if (!/^\d{3}$/.test(form.cardCvv)) return "CVV must be 3 digits";
    }
    return null;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) { toast.error("Enter a valid 10-digit mobile number"); return; }
    if (!form.name || !form.address || !form.city || !form.pincode) {
      toast.error("Please fill all shipping fields"); return;
    }
    const payErr = validatePayment();
    if (payErr) { toast.error(payErr); return; }

    setSubmitting(true);
    const snapshotItems = items;
    const payload = {
      user_id: user?.id ?? null,
      customer_name: form.name,
      phone: phoneDigits,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      payment_method: form.payment,
      total: grand,
      items: snapshotItems.map(i => ({
        id: i.product.id, name: i.product.name, image: i.product.image,
        price: i.product.price, size: i.size, qty: i.qty,
      })),
    };
    const { data, error } = await supabase.from("orders").insert(payload).select("id").single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    const tracking = "DX" + Math.random().toString(36).slice(2, 10).toUpperCase();
    setConfirmed({
      id: data.id, tracking, items: snapshotItems,
      subtotal: total, shipping, grand, payment: form.payment,
    });
    clear();
    toast.success("✅ Order Confirmed!");
  };

  if (confirmed) {
    return (
      <Layout>
        <div className="container-px mx-auto max-w-[720px] py-16">
          <div className="text-center animate-fade-in">
            {/* Animated check */}
            <div className="relative h-24 w-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-gold grid place-items-center shadow-2xl">
                <Check className="h-12 w-12 text-ink animate-scale-in" strokeWidth={3} />
              </div>
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2 font-bold">Payment Successful</p>
            <h1 className="font-display text-4xl font-extrabold">Order Confirmed!</h1>
            <p className="text-muted-foreground mt-3">Thank you for shopping with DEXTER MENS CLOTHING.</p>
          </div>

          <div className="mt-10 bg-card border-2 border-gold/30 rounded-xl p-6 shadow-elevated animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Order ID</p>
                <p className="font-display font-bold">DX-{confirmed.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1 justify-end"><Truck className="h-3 w-3" /> Tracking</p>
                <p className="font-mono font-bold text-gold">{confirmed.tracking}</p>
              </div>
            </div>

            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 flex items-center gap-1"><Receipt className="h-3 w-3" /> Receipt</p>
            <div className="space-y-2 mb-4">
              {confirmed.items.map((i) => (
                <div key={`${i.product.id}-${i.size}`} className="flex items-center gap-3 text-sm">
                  <img src={i.product.image} alt="" className="h-12 w-10 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">Size {i.size} · ×{i.qty}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatINR(i.product.price * i.qty)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(confirmed.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{confirmed.shipping === 0 ? "Free" : formatINR(confirmed.shipping)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total Paid</span><span className="text-gold">{formatINR(confirmed.grand)}</span></div>
              <p className="text-[11px] text-muted-foreground pt-2 uppercase tracking-[0.18em]">Method: {confirmed.payment.toUpperCase()}</p>
            </div>

            <div className="mt-5 flex items-start gap-2 bg-gold/10 border border-gold/30 rounded-md p-3 text-xs">
              <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>Estimated delivery in <strong>3–5 business days</strong>. We'll text you status updates on +91 {form.phone}.</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link to="/shop" className="bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-ink transition-colors rounded-md">Continue Shopping</Link>
            <button onClick={() => navigate("/")} className="border border-border px-8 py-4 text-xs uppercase tracking-[0.25em] rounded-md">Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  const methods: { id: PayMethod; label: string; desc: string }[] = [
    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
    { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm" },
    { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  ];

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1100px] py-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">Secure checkout</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-10">Shipping & Payment</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <form onSubmit={placeOrder} className="space-y-5 animate-fade-in">
            <h2 className="font-semibold uppercase tracking-[0.2em] text-sm">Shipping Address</h2>

            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name" className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md" />

            <div className="flex items-center gap-2 border border-border rounded-md focus-within:border-foreground px-4">
              <span className="text-sm text-muted-foreground">+91</span>
              <input required inputMode="numeric" maxLength={10} value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, "")})}
                placeholder="10-digit mobile number"
                className="flex-1 py-3 text-sm focus:outline-none bg-transparent" />
            </div>

            <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              placeholder="Full Address (House, Street, Area, Landmark)" rows={3}
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md resize-none" />

            <div className="grid md:grid-cols-2 gap-4">
              <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md" />
              <input required inputMode="numeric" maxLength={6} value={form.pincode}
                onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g, "")})}
                placeholder="Pincode"
                className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md" />
            </div>

            <h2 className="font-semibold uppercase tracking-[0.2em] text-sm pt-4">Payment Method</h2>

            {methods.filter(m => enabledMethods[m.id]).map((p) => {
              const active = form.payment === p.id;
              return (
                <div key={p.id} className={`border rounded-md transition-all overflow-hidden ${active ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/50"}`}>
                  <label className="flex items-start gap-3 p-4 cursor-pointer">
                    <input type="radio" name="pay" checked={active} onChange={() => setForm({...form, payment: p.id})} className="mt-1 accent-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                  </label>

                  {active && p.id === "upi" && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-2">UPI ID / VPA</label>
                      <input
                        value={form.upiId}
                        onChange={(e) => setForm({...form, upiId: e.target.value.trim()})}
                        placeholder="yourname@oksbi"
                        className="w-full border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:border-foreground"
                      />
                      {form.upiId && !UPI_REGEX.test(form.upiId) && (
                        <p className="text-xs text-destructive mt-1.5">Format: name@bank (e.g. name@oksbi)</p>
                      )}
                    </div>
                  )}

                  {active && p.id === "card" && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">Cardholder Name</label>
                        <input value={form.cardName} onChange={(e) => setForm({...form, cardName: e.target.value})}
                          placeholder="Name on card" className="w-full border border-border px-4 py-2.5 text-sm rounded-md focus:outline-none focus:border-foreground" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">Card Number</label>
                        <input
                          value={form.cardNumber}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, "").slice(0, 16);
                            const formatted = d.replace(/(.{4})/g, "$1 ").trim();
                            setForm({...form, cardNumber: formatted});
                          }}
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          className="w-full border border-border px-4 py-2.5 text-sm rounded-md font-mono tracking-wider focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">Expiry (MM/YY)</label>
                          <input
                            value={form.cardExpiry}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                              setForm({...form, cardExpiry: v});
                            }}
                            placeholder="MM/YY"
                            className="w-full border border-border px-4 py-2.5 text-sm rounded-md focus:outline-none focus:border-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">CVV</label>
                          <input
                            type="password"
                            value={form.cardCvv}
                            onChange={(e) => setForm({...form, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 3)})}
                            inputMode="numeric"
                            placeholder="•••"
                            className="w-full border border-border px-4 py-2.5 text-sm rounded-md focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button disabled={submitting} type="submit" className="w-full bg-ink text-primary-foreground px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3 disabled:opacity-60 rounded-md">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Place Order · {formatINR(grand)}
            </button>
          </form>

          <aside className="bg-secondary/40 p-6 h-fit lg:sticky lg:top-32 rounded-md">
            <h3 className="font-semibold uppercase tracking-[0.2em] text-sm mb-5">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-auto mb-5">
              {items.map(i => (
                <div key={`${i.product.id}-${i.size}`} className="flex gap-3 text-sm">
                  <div className="h-14 w-12 bg-secondary overflow-hidden flex-shrink-0">
                    <img src={i.product.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 text-xs">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">Size {i.size} · Qty {i.qty}</p>
                  </div>
                  <p className="text-xs font-semibold">{formatINR(i.product.price * i.qty)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border text-base"><span>Total</span><span className="text-gold">{formatINR(grand)}</span></div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
