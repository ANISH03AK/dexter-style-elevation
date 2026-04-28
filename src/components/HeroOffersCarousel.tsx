import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { formatINR } from "@/lib/format";
import type { Category } from "@/data/products";

type SlideCfg = {
  cat: Category;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  bg: string;
  accent: string;
};

const slideConfigs: SlideCfg[] = [
  {
    cat: "Jackets",
    eyebrow: "Mega Sale · 24h Only",
    title: "FLAT 60% OFF",
    sub: "On all Hoodies & Jackets",
    cta: "Shop Outerwear",
    bg: "from-gold/40 via-ink to-ink",
    accent: "from-amber-500 to-yellow-400",
  },
  {
    cat: "Shirts",
    eyebrow: "Just Dropped",
    title: "Premium Shirts",
    sub: "Under ₹1,499 · Limited stock",
    cta: "Explore Shirts",
    bg: "from-emerald-700/50 via-ink to-ink",
    accent: "from-emerald-500 to-teal-400",
  },
  {
    cat: "T-Shirts",
    eyebrow: "Buy 2 Get 1 Free",
    title: "Tees & Essentials",
    sub: "Mix & match across collection",
    cta: "Grab the Deal",
    bg: "from-rose-700/50 via-ink to-ink",
    accent: "from-rose-500 to-orange-400",
  },
  {
    cat: "Hoodies",
    eyebrow: "Streetwear Edit",
    title: "Hoodies from ₹1,299",
    sub: "Heavyweight cotton · Premium finish",
    cta: "Shop Hoodies",
    bg: "from-violet-700/50 via-ink to-ink",
    accent: "from-violet-500 to-fuchsia-400",
  },
];

const HeroOffersCarousel = () => {
  const { products } = useProducts();
  const [idx, setIdx] = useState(0);

  const slides = slideConfigs
    .map((cfg) => {
      const product = products.find((p) => p.category === cfg.cat);
      return product ? { ...cfg, product } : null;
    })
    .filter(Boolean) as (SlideCfg & { product: NonNullable<ReturnType<typeof products.find>> })[];

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const go = (n: number) => setIdx((n + slides.length) % slides.length);

  return (
    <section className="container-px mx-auto max-w-[1400px] pt-6">
      <div className="relative h-80 md:h-80 rounded-2xl overflow-hidden shadow-elevated border border-gold/20">
        {slides.map((s, i) => (
          <div
            key={s.cat}
            className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div className="grid grid-cols-2 h-full">
              {/* Text */}
              <div className="flex items-center px-4 md:px-12 z-10">
                <div className="text-primary-foreground max-w-md animate-fade-in">
                  <p className="text-[9px] md:text-xs uppercase tracking-[0.25em] text-gold mb-1.5">{s.eyebrow}</p>
                  <h3 className="font-display text-xl md:text-5xl font-bold leading-[1.05]">{s.title}</h3>
                  <p className="text-[11px] md:text-sm text-primary-foreground/80 mt-2">{s.sub}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm md:text-lg font-semibold text-gold">{formatINR(s.product.price)}</span>
                    {s.product.mrp && (
                      <span className="text-[10px] md:text-xs text-primary-foreground/50 line-through">{formatINR(s.product.mrp)}</span>
                    )}
                  </div>
                  <Link
                    to={`/shop?cat=${encodeURIComponent(s.cat)}`}
                    className="mt-3 md:mt-5 inline-flex items-center gap-1.5 bg-gold text-ink px-3 md:px-6 py-2 md:py-3 text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-primary-foreground transition-colors group"
                  >
                    {s.cta} <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Product Image — clickable, on every screen */}
              <Link to={`/product/${s.product.id}`} className="relative block group overflow-hidden" aria-label={`View ${s.product.name}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-30 group-hover:opacity-50 transition-opacity`} />
                <img
                  src={s.product.image}
                  alt={s.product.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-ink/40" />
                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-ink/85 backdrop-blur-md border border-gold/30 px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.18em] text-gold font-semibold truncate max-w-[120px] md:max-w-none">{s.product.name}</p>
                </div>
              </Link>
            </div>
          </div>
        ))}

        <button onClick={() => go(idx - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center bg-background/30 backdrop-blur text-primary-foreground rounded-full hover:bg-gold hover:text-ink transition-smooth z-20">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => go(idx + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center bg-background/30 backdrop-blur text-primary-foreground rounded-full hover:bg-gold hover:text-ink transition-smooth z-20">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-gold" : "w-1.5 bg-primary-foreground/50"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroOffersCarousel;
