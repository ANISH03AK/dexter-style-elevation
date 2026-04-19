import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

// Counts down to next midnight IST
const getTarget = () => {
  const now = new Date();
  const t = new Date(now);
  t.setHours(24, 0, 0, 0);
  return t.getTime();
};

const CountdownDeal = () => {
  const [target] = useState(getTarget);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

  return (
    <section className="container-px mx-auto max-w-[1400px] my-12">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-ink via-graphite to-ink text-primary-foreground p-6 md:p-10 shadow-elevated">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.3em] mb-3">
              <Zap className="h-4 w-4 animate-pulse fill-current" />
              Deal of the Day
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Up to <span className="text-gold">70% Off</span> — Ends Soon
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/70 max-w-md">
              Premium menswear at flash prices. Restocks every midnight.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex gap-2">
              {[
                { v: h, l: "Hours" },
                { v: m, l: "Mins" },
                { v: s, l: "Secs" },
              ].map((u) => (
                <div key={u.l} className="bg-background/10 backdrop-blur border border-white/15 rounded-lg px-4 py-3 min-w-[68px] text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-gold tabular-nums">{u.v}</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60 mt-1">{u.l}</div>
                </div>
              ))}
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-gold text-ink font-semibold uppercase tracking-[0.18em] text-xs px-6 py-3 rounded-md hover:scale-105 transition-transform shadow-gold">
              Shop the Deal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownDeal;
