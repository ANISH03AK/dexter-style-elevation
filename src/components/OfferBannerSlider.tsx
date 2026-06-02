import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Tag } from "lucide-react";
import slideFestival from "@/assets/slide-rack-festival.jpg";
import slideTees from "@/assets/slide-rack-tees.jpg";
import slideBrands from "@/assets/slide-rack-brands.jpg";

type Slide = {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
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
    accent: "red",
    icon: Flame,
    image: slideFestival,
    imageAlt: "Festival sale — premium menswear hanging on rack",
  },
  {
    eyebrow: "Premium Drop-Shoulder Tees",
    title: "STARTING AT ₹300",
    sub: "Heavyweight cotton · Oversized fits",
    cta: "Grab Yours",
    href: "/shop?cat=T-Shirts",
    accent: "gold",
    icon: Sparkles,
    image: slideTees,
    imageAlt: "Premium oversized tees on hangers",
  },
  {
    eyebrow: "Authentic Brands",
    title: "JOCKEY · RAMRAJ · PUMA",
    sub: "100% Original · In-store & Online",
    cta: "Explore Brands",
    href: "/shop",
    accent: "red",
    icon: Tag,
    image: slideBrands,
    imageAlt: "Branded menswear hanging on boutique rack",
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
      <div className="relative h-[160px] sm:h-[200px] md:h-[260px] lg:h-[300px] max-h-[160px] sm:max-h-[200px] md:max-h-[260px] lg:max-h-[300px]">
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
              className={`absolute inset-0 bg-ink transition-opacity duration-700 ${
                i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={i !== idx}
            >
              {/* Full-width background rack image */}
              <img
                src={s.image}
                alt={s.imageAlt}
                width={1536}
                height={768}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
              />

              {/* Seamless transparent gradient — fades into black on the left for text readability,
                  and softly into black on edges so there are no harsh vertical cut-lines */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(0 0% 0% / 0.92) 0%, hsl(0 0% 0% / 0.75) 30%, hsl(0 0% 0% / 0.35) 60%, hsl(0 0% 0% / 0.55) 100%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

              {/* Decorative diagonal stripes */}
              <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 18px)",
                }}
              />

              {/* TEXT OVERLAY */}
              <div className="relative h-full container-px flex items-center">
                <div className="flex items-center gap-3 sm:gap-5 min-w-0 w-full max-w-[70%] sm:max-w-[60%]">
                  <div className={`hidden sm:grid place-items-center h-11 w-11 md:h-14 md:w-14 rounded-full border-2 ${ringColor} shrink-0 animate-pulse-gold`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold ${accentText} truncate`}>
                      {s.eyebrow}
                    </p>
                    <h3 className="font-display text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mt-0.5 truncate">
                      {s.title}
                    </h3>
                    <p className="hidden sm:block text-xs md:text-sm text-white/75 mt-1 truncate">{s.sub}</p>
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
