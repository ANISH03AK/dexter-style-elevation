import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, MapPin, CreditCard, PackageCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

const Checkout = () => {
  const { items, total, clear } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", city: "", pincode: "" });
  const [payment, setPayment] = useState<"upi" | "card" | "cod">("upi");
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  const shipping = total > 12500 || total === 0 ? 0 : 1250;
  const grand = total + shipping;

  if (items.length === 0 && step !== 3) {
    return (
      <Layout>
        <div className="container-px mx-auto max-w-[1400px] py-32 text-center">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Link to="/shop" className="bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em]">Shop Now</Link>
        </div>
      </Layout>
    );
  }

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast.error("Please fill all address fields");
      return;
    }
    setStep(2);
  };

  const placeOrder = () => {
    const id = `DX${Date.now().toString().slice(-8)}`;
    setOrderId(id);
    clear();
    setStep(3);
    toast.success("Order placed successfully!");
  };

  const steps = [
    { n: 1, label: "Address", icon: MapPin },
    { n: 2, label: "Payment", icon: CreditCard },
    { n: 3, label: "Confirmation", icon: PackageCheck },
  ];

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1100px] py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-10">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className={`h-10 w-10 rounded-full grid place-items-center border-2 transition-colors ${step >= s.n ? "bg-ink text-primary-foreground border-ink" : "border-border text-muted-foreground"}`}>
                {step > s.n ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={`ml-3 text-xs uppercase tracking-[0.2em] ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-4 ${step > s.n ? "bg-ink" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div>
            {step === 1 && (
              <form onSubmit={submitAddress} className="space-y-4 animate-fade-in">
                <h2 className="font-semibold uppercase tracking-[0.2em] text-sm mb-4">Delivery Address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Full Name" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground" />
                  <input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="Phone" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <input value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="Address" className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground" />
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground" />
                  <input value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} placeholder="Pincode" className="border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <button type="submit" className="w-full md:w-auto bg-ink text-primary-foreground px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-ink transition-smooth">Continue to Payment</button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-semibold uppercase tracking-[0.2em] text-sm mb-4">Payment Method</h2>
                {[
                  { id: "upi", label: "UPI", desc: "Pay via Google Pay, PhonePe, Paytm" },
                  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                  { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                ].map(p => (
                  <label key={p.id} className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${payment === p.id ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/50"}`}>
                    <input type="radio" name="pay" checked={payment === p.id} onChange={() => setPayment(p.id as any)} className="mt-1 accent-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                  </label>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="px-6 py-4 text-xs uppercase tracking-[0.25em] border border-border">Back</button>
                  <button onClick={placeOrder} className="flex-1 bg-ink text-primary-foreground px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-ink transition-smooth">Place Order · {formatINR(grand)}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="h-20 w-20 rounded-full bg-gold/20 grid place-items-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-gold" />
                </div>
                <h2 className="font-display text-3xl font-bold">Order Placed!</h2>
                <p className="text-muted-foreground mt-3">Thank you for shopping with DEXTER.</p>
                <p className="text-sm mt-4">Order ID: <span className="font-semibold">{orderId}</span></p>
                <p className="text-sm text-muted-foreground mt-1">Estimated delivery: 3–5 business days</p>
                <div className="mt-8 flex gap-3 justify-center">
                  <Link to="/shop" className="bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em]">Continue Shopping</Link>
                  <button onClick={() => navigate("/")} className="border border-border px-8 py-4 text-xs uppercase tracking-[0.25em]">Home</button>
                </div>
              </div>
            )}
          </div>

          {step !== 3 && (
            <aside className="bg-secondary/40 p-6 h-fit sticky top-32 rounded-md">
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
                <div className="flex justify-between font-semibold pt-2 border-t border-border text-base"><span>Total</span><span>{formatINR(grand)}</span></div>
              </div>
            </aside>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
