import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Tag } from "lucide-react";
import slideFestival from "@/assets/slide-festival.jpg";
import slideTees from "@/assets/slide-tees.jpg";
import slideBrands from "@/assets/slide-brands.jpg";

type Slide = {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  bg: string;
  accent: "red" | "gold";
  icon: typeof Flame;
  image: string;
  imageAlt: string;
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
    image: slideFestival,
    imageAlt: "Festival sale lookbook - model with shopping bags",
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
    image: slideTees,
    imageAlt: "Premium oversized drop-shoulder t-shirt on model",
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
    image: slideBrands,
    imageAlt: "Stack of authentic premium menswear brands",
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
      <div className="relative aspect-[16/8] sm:aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] min-h-[200px] max-h-[420px]">
        {slides.map((s, i) => {
          const Icon = s.icon;
          const accentBtn =
            s.accent === "red"
              ? "bg-red-cta text-white hover:bg-gold hover:text-ink"
              : "bg-gold text-ink hover:bg-red-cta hover:text-white";
          const accentText = s.accent === "red" ? "text-red-cta" : "text-gold";
          const ringColor = s.accent === "red" ? "border-red-cta text-red-cta" : "border-gold text-gold";
          return (
            <div
              key={i}
              className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-opacity duration-700 ${
                i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={i !== idx}
            >
              {/* Decorative diagonal stripes */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 18px)",
                }}
              />

              {/* SPLIT FLEX: text left, image right */}
              <div className="relative h-full grid grid-cols-[1fr_38%] sm:grid-cols-[1fr_40%] md:grid-cols-2">
                {/* TEXT */}
                <div className="container-px flex items-center min-w-0 py-3 sm:py-4">
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0 w-full">
                    <div className={`hidden sm:grid place-items-center h-12 w-12 md:h-14 md:w-14 rounded-full border-2 ${ringColor} shrink-0 animate-pulse-gold`}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold ${accentText} truncate`}>
                        {s.eyebrow}
                      </p>
                      <h3 className="font-display text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mt-0.5 truncate">
                        {s.title}
                      </h3>
                      <p className="hidden sm:block text-xs md:text-sm text-white/70 mt-1 truncate">{s.sub}</p>
                      <Link
                        to={s.href}
                        className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 text-[9px] sm:text-[11px] uppercase tracking-[0.2em] font-bold rounded shadow-lg transition-all duration-300 hover:scale-[1.04] active:scale-95 ${accentBtn}`}
                      >
                        <span className="hidden sm:inline">{s.cta}</span>
                        <span className="sm:hidden">Shop</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* IMAGE */}
                <Link
                  to={s.href}
                  className="relative overflow-hidden block group"
                  aria-label={s.cta}
                  tabIndex={i === idx ? 0 : -1}
                >
                  <img
                    src={s.image}
                    alt={s.imageAlt}
                    width={1024}
                    height={1024}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-center will-change-transform transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  {/* Left-edge fade so text blends seamlessly */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
