import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { formatINR } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "cod" as "cod" | "upi" | "card",
  });
  const navigate = useNavigate();

  const shipping = total > 12500 || total === 0 ? 0 : 1250;
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

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) { toast.error("Enter a valid 10-digit mobile number"); return; }
    if (!form.name || !form.address || !form.city || !form.pincode) {
      toast.error("Please fill all fields"); return;
    }

    setSubmitting(true);
    const payload = {
      user_id: user?.id ?? null,
      customer_name: form.name,
      phone: phoneDigits,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      payment_method: form.payment,
      total: grand,
      items: items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        image: i.product.image,
        price: i.product.price,
        size: i.size,
        qty: i.qty,
      })),
    };
    const { data, error } = await supabase.from("orders").insert(payload).select("id").single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setConfirmed({ id: data.id });
    clear();
    toast.success("Order placed successfully!");
  };

  if (confirmed) {
    return (
      <Layout>
        <div className="container-px mx-auto max-w-[700px] py-24 text-center">
          <div className="h-20 w-20 rounded-full bg-gold/20 grid place-items-center mx-auto mb-6">
            <Check className="h-10 w-10 text-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold">Order Placed!</h2>
          <p className="text-muted-foreground mt-3">Thank you for shopping with DEXTER.</p>
          <p className="text-sm mt-4">Order ID: <span className="font-semibold">DX-{confirmed.id.slice(0, 8).toUpperCase()}</span></p>
          <p className="text-sm text-muted-foreground mt-1">Estimated delivery: 3–5 business days</p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link to="/shop" className="bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em]">Continue Shopping</Link>
            <button onClick={() => navigate("/")} className="border border-border px-8 py-4 text-xs uppercase tracking-[0.25em]">Home</button>
          </div>
        </div>
      </Layout>
    );
  }

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
              <input
                required
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, "")})}
                placeholder="10-digit mobile number"
                className="flex-1 py-3 text-sm focus:outline-none bg-transparent"
              />
            </div>

            <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full Address (House, Street, Area, Landmark)" rows={3} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md resize-none" />

            <div className="grid md:grid-cols-2 gap-4">
              <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md" />
              <input required inputMode="numeric" maxLength={6} value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g, "")})} placeholder="Pincode" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground rounded-md" />
            </div>

            <h2 className="font-semibold uppercase tracking-[0.2em] text-sm pt-4">Payment Method</h2>
            {[
              { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
              { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm" },
              { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
            ].map(p => (
              <label key={p.id} className={`flex items-start gap-3 border p-4 cursor-pointer rounded-md transition-colors ${form.payment === p.id ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/50"}`}>
                <input type="radio" name="pay" checked={form.payment === p.id} onChange={() => setForm({...form, payment: p.id as any})} className="mt-1 accent-foreground" />
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              </label>
            ))}

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
