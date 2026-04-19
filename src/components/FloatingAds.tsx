import { Link } from "react-router-dom";
import { Sparkles, Tag, Flame, Gift } from "lucide-react";

const ads = [
  {
    icon: Flame,
    title: "Hoodies",
    offer: "FLAT 60% OFF",
    sub: "Premium fleece · Today only",
    to: "/shop?cat=Hoodies",
    pos: "top-8 left-6 md:top-12 md:left-12",
    anim: "animate-float-y",
    accent: "from-rose-600 to-orange-500",
  },
  {
    icon: Tag,
    title: "Shirts",
    offer: "₹999 ONLY",
    sub: "Linen & Oxford styles",
    to: "/shop?cat=Shirts",
    pos: "top-24 right-8 md:top-28 md:right-16",
    anim: "animate-float-x",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    icon: Gift,
    title: "Buy 2 Get 1",
    offer: "FREE TEE",
    sub: "Mix & match collection",
    to: "/shop?cat=T-Shirts",
    pos: "bottom-32 right-6 md:bottom-40 md:right-20",
    anim: "animate-float-y",
    accent: "from-violet-600 to-fuchsia-500",
  },
  {
    icon: Sparkles,
    title: "Jackets",
    offer: "UP TO 50% OFF",
    sub: "Bombers & overcoats",
    to: "/shop?cat=Jackets",
    pos: "bottom-24 left-6 md:bottom-32 md:left-16",
    anim: "animate-float-x",
    accent: "from-amber-500 to-yellow-400",
  },
];

const FloatingAds = () => {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block z-10">
      {ads.map((ad, i) => {
        const Icon = ad.icon;
        return (
          <Link
            key={i}
            to={ad.to}
            style={{ animationDelay: `${i * 0.4}s` }}
            className={`absolute ${ad.pos} ${ad.anim} pointer-events-auto group`}
          >
            <div className="relative">
              {/* Glow ring */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${ad.accent} opacity-60 blur-lg group-hover:opacity-90 transition-opacity rounded-2xl`} />

              {/* Card */}
              <div className="relative bg-ink/90 backdrop-blur-xl border border-gold/30 rounded-2xl p-4 w-52 shadow-elevated hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${ad.accent} grid place-items-center animate-pulse-gold`}>
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/70">{ad.title}</p>
                </div>
                <h4 className="font-display text-lg font-bold text-gold leading-tight">{ad.offer}</h4>
                <p className="text-[11px] text-primary-foreground/60 mt-1">{ad.sub}</p>
                <div className="mt-2 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold group-hover:translate-x-1 transition-transform">Shop now →</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default FloatingAds;
