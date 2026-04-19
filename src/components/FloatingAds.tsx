import { Link } from "react-router-dom";
import { Flame, Tag, Gift, Sparkles } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { formatINR } from "@/lib/format";
import type { Category } from "@/data/products";

type AdConfig = {
  cat: Category;
  icon: typeof Flame;
  badge: string;
  pos: string;
  anim: string;
  accent: string;
};

const adConfigs: AdConfig[] = [
  {
    cat: "Hoodies",
    icon: Flame,
    badge: "FLAT 60% OFF",
    pos: "top-8 left-6 md:top-16 md:left-10",
    anim: "animate-float-y",
    accent: "from-rose-600 to-orange-500",
  },
  {
    cat: "Shirts",
    icon: Tag,
    badge: "₹999 ONLY",
    pos: "top-24 right-8 md:top-20 md:right-12",
    anim: "animate-float-x",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    cat: "T-Shirts",
    icon: Gift,
    badge: "BUY 2 GET 1",
    pos: "bottom-32 right-6 md:bottom-44 md:right-16",
    anim: "animate-float-y",
    accent: "from-violet-600 to-fuchsia-500",
  },
  {
    cat: "Jackets",
    icon: Sparkles,
    badge: "UP TO 50% OFF",
    pos: "bottom-24 left-6 md:bottom-36 md:left-12",
    anim: "animate-float-x",
    accent: "from-amber-500 to-yellow-400",
  },
];

const FloatingAds = () => {
  const { products } = useProducts();

  // Pick one representative product per category
  const ads = adConfigs
    .map((cfg) => {
      const product = products.find((p) => p.category === cfg.cat);
      return product ? { ...cfg, product } : null;
    })
    .filter(Boolean) as (AdConfig & { product: NonNullable<ReturnType<typeof products.find>> })[];

  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block z-10">
      {ads.map((ad, i) => {
        const Icon = ad.icon;
        return (
          <Link
            key={ad.cat}
            to={`/product/${ad.product.id}`}
            style={{ animationDelay: `${i * 0.4}s` }}
            className={`absolute ${ad.pos} ${ad.anim} pointer-events-auto group`}
          >
            <div className="relative">
              {/* Glow ring */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${ad.accent} opacity-50 blur-lg group-hover:opacity-90 transition-opacity rounded-2xl`} />

              {/* Card */}
              <div className="relative bg-ink/90 backdrop-blur-xl border border-gold/30 rounded-2xl p-3 w-60 shadow-elevated hover:scale-105 transition-transform duration-300">
                <div className="flex gap-3">
                  {/* Product image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <img
                      src={ad.product.image}
                      alt={ad.product.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-gradient-to-br ${ad.accent} grid place-items-center animate-pulse-gold`}>
                      <Icon className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-primary-foreground/60">{ad.cat}</p>
                    <h4 className="font-display text-sm font-bold text-gold leading-tight mt-0.5 truncate">{ad.badge}</h4>
                    <p className="text-[11px] text-primary-foreground/80 mt-0.5 truncate">{ad.product.name}</p>
                    <p className="text-[11px] font-semibold text-primary-foreground mt-0.5">
                      {formatINR(ad.product.price)}
                      {ad.product.mrp && (
                        <span className="ml-1.5 text-[10px] text-primary-foreground/40 line-through">{formatINR(ad.product.mrp)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-gold group-hover:translate-x-1 transition-transform">Shop now →</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default FloatingAds;
