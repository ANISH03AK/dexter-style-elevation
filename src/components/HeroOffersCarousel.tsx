import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    eyebrow: "Mega Sale · 24h Only",
    title: "FLAT 60% OFF",
    sub: "On all Hoodies & Jackets",
    cta: "Shop Outerwear",
    to: "/shop?cat=Jackets",
    bg: "from-gold/30 via-ink to-ink",
  },
  {
    eyebrow: "Just Dropped",
    title: "Premium Shirts",
    sub: "Under ₹1,499 · Limited stock",
    cta: "Explore Shirts",
    to: "/shop?cat=Shirts",
    bg: "from-emerald-700/40 via-ink to-ink",
  },
  {
    eyebrow: "Buy 2 Get 1 Free",
    title: "Tees & Essentials",
    sub: "Mix & match across collection",
    cta: "Grab the Deal",
    to: "/shop?cat=T-Shirts",
    bg: "from-rose-700/40 via-ink to-ink",
  },
];

const HeroOffersCarousel = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) => setIdx((n + slides.length) % slides.length);

  return (
    <section className="container-px mx-auto max-w-[1400px] pt-6">
      <div className="relative h-48 md:h-56 rounded-lg overflow-hidden shadow-elevated">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-gradient-to-r ${s.bg} flex items-center justify-between px-6 md:px-12 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div className="text-primary-foreground max-w-md animate-fade-in">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold mb-2">{s.eyebrow}</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold leading-tight">{s.title}</h3>
              <p className="text-xs md:text-sm text-primary-foreground/80 mt-2">{s.sub}</p>
              <Link to={s.to} className="mt-4 inline-block bg-gold text-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-primary-foreground transition-colors">
                {s.cta}
              </Link>
            </div>
          </div>
        ))}

        <button onClick={() => go(idx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center bg-background/30 backdrop-blur text-primary-foreground rounded-full hover:bg-background/60">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => go(idx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center bg-background/30 backdrop-blur text-primary-foreground rounded-full hover:bg-background/60">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-gold" : "w-1.5 bg-primary-foreground/50"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroOffersCarousel;
