import { useState } from "react";
import { Search, Loader2, Package, CheckCircle2, Truck, Home, Clock, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

type Order = {
  id: string;
  customer_name: string;
  status: string;
  total: number;
  payment_method: string;
  created_at: string;
  items: Array<{ name: string; qty: number; size: string; price: number }>;
};

const STEPS = [
  { key: "pending",    label: "Order Placed",  Icon: Clock },
  { key: "processing", label: "Processing",    Icon: Package },
  { key: "shipped",    label: "Shipped",       Icon: Truck },
  { key: "delivered",  label: "Delivered",     Icon: Home },
];

const stepIndex = (status: string) => {
  const idx = STEPS.findIndex((s) => s.key === status.toLowerCase());
  return idx === -1 ? 0 : idx;
};

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return toast.error("Enter an order ID");
    setBusy(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setBusy(false);
    if (error || !data) return toast.error("Order not found");
    setOrder(data as any);
  };

  const current = order ? stepIndex(order.status) : 0;

  return (
    <Layout>
      <section className="container-px mx-auto max-w-3xl py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-red-cta font-bold mb-2">Order Tracking</p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">Track My Order</h1>
        <p className="text-muted-foreground mt-3">Enter the order ID from your confirmation email.</p>

        <form onSubmit={lookup} className="mt-8 flex gap-3">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 6f9d…"
            className="flex-1 border-2 border-border rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition"
          />
          <button disabled={busy} className="bg-ink text-primary-foreground px-6 rounded-lg text-xs uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-ink transition disabled:opacity-50 flex items-center gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
          </button>
        </form>

        {order && (
          <div className="mt-12 border-2 border-border rounded-2xl p-8 bg-card">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Order</p>
                <p className="font-mono text-sm font-bold">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Total</p>
                <p className="font-display text-xl font-bold">{formatINR(order.total)}</p>
              </div>
            </div>

            {/* Vertical stepper */}
            <ol className="relative border-l-2 border-border ml-3">
              {STEPS.map((s, i) => {
                const done = i <= current;
                const Icon = done ? CheckCircle2 : s.Icon;
                return (
                  <li key={s.key} className="mb-8 ml-6 last:mb-0">
                    <span className={`absolute -left-[18px] grid place-items-center h-9 w-9 rounded-full border-2 ${
                      done ? "bg-gold border-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.5)]" : "bg-background border-border text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className={`font-display font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </h3>
                    {i === current && (
                      <p className="text-xs text-red-cta uppercase tracking-[0.2em] mt-1 font-bold">Current Status</p>
                    )}
                  </li>
                );
              })}
            </ol>

            {order.status.toLowerCase() === "shipped" && (
              <a
                href="https://www.delhivery.com/tracking"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 bg-red-cta text-white px-5 py-3 rounded-lg text-xs uppercase tracking-[0.25em] font-bold hover:opacity-90"
              >
                Track with Delhivery <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TrackOrder;
