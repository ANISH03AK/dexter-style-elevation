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
            to={`/shop?cat=${encodeURIComponent(ad.cat)}`}
            style={{ animationDelay: `${i * 0.4}s` }}
            className={`absolute ${ad.pos} ${ad.anim} pointer-events-auto group`}
          >
            <div className="relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${ad.accent} opacity-40 blur-md group-hover:opacity-80 transition-opacity rounded-xl`} />
              <div className="relative bg-ink/95 backdrop-blur-xl border border-gold/25 rounded-xl p-2.5 w-56 shadow-elevated hover:scale-[1.04] transition-transform duration-300">
                <div className="flex gap-2.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src={ad.product.image}
                      alt={ad.product.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Icon className="h-3 w-3 text-gold" />
                      <p className="text-[9px] uppercase tracking-[0.2em] text-primary-foreground/60">{ad.cat}</p>
                    </div>
                    <h4 className="font-display text-xs font-bold text-gold leading-tight mt-0.5 truncate">{ad.badge}</h4>
                    <p className="text-[10px] text-primary-foreground/75 mt-0.5 truncate">{ad.product.name}</p>
                    <p className="text-[10px] font-semibold text-primary-foreground mt-0.5">
                      {formatINR(ad.product.price)}
                      {ad.product.mrp && (
                        <span className="ml-1 text-[9px] text-primary-foreground/40 line-through">{formatINR(ad.product.mrp)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-2 pt-2 border-t border-gold/15 text-[9px] uppercase tracking-[0.22em] text-gold text-center group-hover:tracking-[0.3em] transition-all">
                  Shop {ad.cat} →
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default FloatingAds;
