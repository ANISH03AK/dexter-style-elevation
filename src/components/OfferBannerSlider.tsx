import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Tag } from "lucide-react";

type Slide = {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  bg: string;
  accent: "red" | "gold";
  icon: typeof Flame;
};

const slides: Slide[] = [
  {
    eyebrow: "Festival Drop",
    title: "UP TO 40% OFF",
    sub: "Premium Shirts · Hoodies · Streetwear",
    cta: "Shop The Offer",
    href: "/shop",
    bg: "from-black via-zinc-900 to-black",
    accent: "red",
    icon: Flame,
  },
  {
    eyebrow: "Premium Drop-Shoulder Tees",
    title: "STARTING AT ₹300",
    sub: "Heavyweight cotton · Oversized fits",
    cta: "Grab Yours",
    href: "/shop?cat=T-Shirts",
    bg: "from-black via-zinc-900 to-zinc-800",
    accent: "gold",
    icon: Sparkles,
  },
  {
    eyebrow: "Authentic Brands",
    title: "JOCKEY · RAMRAJ · PUMA",
    sub: "100% Original · In-store & Online",
    cta: "Explore Brands",
    href: "/shop",
    bg: "from-zinc-900 via-black to-zinc-900",
    accent: "red",
    icon: Tag,
  },
];

const OfferBannerSlider = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) => setIdx((n + slides.length) % slides.length);

  return (
    <section className="relative w-full overflow-hidden border-y border-foreground/10 bg-ink">
      <div className="relative h-[140px] sm:h-[160px] md:h-[180px]">
        {slides.map((s, i) => {
          const Icon = s.icon;
          const accentBtn =
            s.accent === "red"
              ? "bg-red-cta text-white hover:bg-gold hover:text-ink"
              : "bg-gold text-ink hover:bg-red-cta hover:text-white";
          const accentText = s.accent === "red" ? "text-red-cta" : "text-gold";
          return (
            <div
              key={i}
              className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-opacity duration-700 ${
                i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Decorative diagonal stripes */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 18px)",
                }}
              />
              <div className="relative h-full container-px mx-auto max-w-[1400px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  <div className={`hidden sm:grid place-items-center h-12 w-12 md:h-14 md:w-14 rounded-full border-2 ${s.accent === "red" ? "border-red-cta text-red-cta" : "border-gold text-gold"} shrink-0 animate-pulse-gold`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold ${accentText}`}>{s.eyebrow}</p>
                    <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-tight truncate">
                      {s.title}
                    </h3>
                    <p className="hidden sm:block text-xs md:text-sm text-white/70 mt-0.5 truncate">{s.sub}</p>
                  </div>
                </div>
                <Link
                  to={s.href}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold rounded shadow-lg transition-all duration-300 hover:scale-[1.04] active:scale-95 ${accentBtn}`}
                >
                  <span className="hidden sm:inline">{s.cta}</span>
                  <span className="sm:hidden">Shop</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => go(idx - 1)}
          aria-label="Previous offer"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white/10 hover:bg-gold hover:text-ink text-white transition-colors backdrop-blur-sm z-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(idx + 1)}
          aria-label="Next offer"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white/10 hover:bg-gold hover:text-ink text-white transition-colors backdrop-blur-sm z-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Offer ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === idx ? "w-8 bg-gold" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfferBannerSlider;
