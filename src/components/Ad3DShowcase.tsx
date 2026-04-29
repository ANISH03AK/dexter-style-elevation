import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Tag, Zap } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { formatINR } from "@/lib/format";
import type { Category } from "@/data/products";

type AdCfg = {
  cat: Category;
  eyebrow: string;
  title: string;
  badge: string;
  icon: typeof Flame;
  gradient: string;
  glow: string;
};

const ads: AdCfg[] = [
  {
    cat: "Hoodies",
    eyebrow: "Streetwear Drop",
    title: "Hoodie Heat",
    badge: "FLAT 60% OFF",
    icon: Flame,
    gradient: "from-rose-600 via-orange-500 to-amber-400",
    glow: "shadow-[0_20px_60px_-15px_rgba(244,63,94,0.6)]",
  },
  {
    cat: "Jackets",
    eyebrow: "Winter Edit",
    title: "Outerwear",
    badge: "UP TO 50% OFF",
    icon: Sparkles,
    gradient: "from-amber-500 via-yellow-400 to-yellow-200",
    glow: "shadow-[0_20px_60px_-15px_rgba(245,158,11,0.6)]",
  },
  {
    cat: "Shirts",
    eyebrow: "Premium Picks",
    title: "Shirt Sale",
    badge: "₹999 ONLY",
    icon: Tag,
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    glow: "shadow-[0_20px_60px_-15px_rgba(16,185,129,0.6)]",
  },
  {
    cat: "T-Shirts",
    eyebrow: "Daily Essentials",
    title: "Tees Combo",
    badge: "BUY 2 GET 1",
    icon: Zap,
    gradient: "from-violet-600 via-fuchsia-500 to-pink-400",
    glow: "shadow-[0_20px_60px_-15px_rgba(139,92,246,0.6)]",
  },
];

const Ad3DShowcase = () => {
  const { products } = useProducts();

  const cards = ads
    .map((a) => {
      const product = products.find((p) => p.category === a.cat);
      return product ? { ...a, product } : null;
    })
    .filter(Boolean) as (AdCfg & { product: NonNullable<ReturnType<typeof products.find>> })[];

  if (cards.length === 0) return null;

  return (
    <section className="container-px mx-auto max-w-[1400px] py-20">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Featured Drops</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">3D Ad Spotlight</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
          Tap any card to explore the collection.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [perspective:1200px]">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.cat}
              to={`/product/${c.product.id}`}
              style={{ animationDelay: `${i * 0.1}s` }}
              className={`group relative block rounded-2xl overflow-hidden bg-ink text-primary-foreground border border-gold/25 ${c.glow} transition-all duration-500 hover:-translate-y-2 [transform-style:preserve-3d] hover:[transform:rotateX(6deg)_rotateY(-6deg)_scale(1.03)] animate-fade-in`}
            >
              {/* Gradient glow background */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${c.gradient} opacity-30 blur-2xl group-hover:opacity-60 transition-opacity duration-500`} />

              <div className="relative">
                {/* Product image with 3D float */}
                <div className="relative h-56 overflow-hidden bg-secondary">
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />
                  <img
                    src={c.product.image}
                    alt={c.product.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-110 [transform:translateZ(40px)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                  {/* Floating 3D badge */}
                  <div className={`absolute top-3 right-3 bg-gradient-to-r ${c.gradient} text-ink px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] shadow-xl [transform:translateZ(60px)] group-hover:scale-110 transition-transform`}>
                    {c.badge}
                  </div>

                  {/* Icon orb */}
                  <div className="absolute top-3 left-3 h-9 w-9 grid place-items-center rounded-full bg-ink/80 backdrop-blur-md border border-gold/40 [transform:translateZ(50px)] group-hover:rotate-12 transition-transform">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 [transform:translateZ(20px)]">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{c.eyebrow}</p>
                  <h3 className="font-display text-xl font-bold mt-1">{c.title}</h3>
                  <p className="text-xs text-primary-foreground/70 mt-1 truncate">{c.product.name}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold text-gold">{formatINR(c.product.price)}</span>
                      {c.product.mrp && (
                        <span className="text-[10px] text-primary-foreground/40 line-through">{formatINR(c.product.mrp)}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gold group-hover:translate-x-1 transition-transform">
                      Shop <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Shine sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Ad3DShowcase;
