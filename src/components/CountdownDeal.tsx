import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { formatINR } from "@/lib/format";

const getTarget = () => {
  const t = new Date();
  t.setHours(24, 0, 0, 0);
  return t.getTime();
};

const CountdownDeal = () => {
  const { products } = useProducts();
  const [target] = useState(getTarget);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Pick top discounted product as the featured deal
  const deal = products
    .filter((p) => p.mrp && p.mrp > p.price)
    .sort((a, b) => (b.mrp! - b.price) / b.mrp! - (a.mrp! - a.price) / a.mrp!)[0] || products[0];

  if (!deal) return null;
  const discount = deal.mrp ? Math.round(((deal.mrp - deal.price) / deal.mrp) * 100) : 0;

  const diff = Math.max(0, target - now);
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

  return (
    <section className="container-px mx-auto max-w-[1400px] my-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink via-graphite to-ink text-primary-foreground shadow-elevated border border-gold/20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 p-6 md:p-10 items-center">
          {/* Left: Info + Counter */}
          <div>
            <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.3em] mb-3">
              <Zap className="h-4 w-4 animate-pulse fill-current" />
              Deal of the Day
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-gold">{discount}% Off</span> — Ends Soon
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/70 max-w-md">
              Featured: <span className="text-primary-foreground">{deal.name}</span> · {formatINR(deal.price)}
              {deal.mrp && <span className="ml-2 line-through text-primary-foreground/40">{formatINR(deal.mrp)}</span>}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                {[
                  { v: h, l: "Hrs" },
                  { v: m, l: "Min" },
                  { v: s, l: "Sec" },
                ].map((u) => (
                  <div key={u.l} className="bg-background/10 backdrop-blur border border-white/15 rounded-lg px-4 py-3 min-w-[64px] text-center">
                    <div className="font-display text-2xl md:text-3xl font-bold text-gold tabular-nums">{u.v}</div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60 mt-1">{u.l}</div>
                  </div>
                ))}
              </div>
              <Link to={`/product/${deal.id}`} className="inline-flex items-center gap-2 bg-gold text-ink font-semibold uppercase tracking-[0.18em] text-xs px-6 py-3 rounded-md hover:scale-105 transition-transform shadow-gold">
                Grab Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Product image */}
          <Link to={`/product/${deal.id}`} className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-br from-gold/40 to-amber-400/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative aspect-square rounded-xl overflow-hidden border border-gold/30">
              <img src={deal.image} alt={deal.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-gold text-ink text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full">
                -{discount}%
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CountdownDeal;
