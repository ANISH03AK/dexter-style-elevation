import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, MapPin, Phone, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import Reviews from "@/components/Reviews";
import OfferBannerSlider from "@/components/OfferBannerSlider";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import Counter from "@/components/motion/Counter";
import { useProducts } from "@/context/ProductsContext";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLookbook } from "@/context/LookbookContext";
import { useCms } from "@/context/CmsContext";
import heroStreetwearDesktop from "@/assets/hero-streetwear-pc.jpg";
import heroStreetwearMobile from "@/assets/hero-streetwear-mobile.jpg";
import dexterLogo from "@/assets/dexter-logo-clean.png";
import catShirts from "@/assets/cat-shirts-street.jpg";
import catTees from "@/assets/cat-tees-street.jpg";
import catJeans from "@/assets/cat-pants-waistdown.jpg";
import catJackets from "@/assets/cat-hoodies-street.jpg";

const EASE = [0.22, 1, 0.36, 1] as const;

const categories = [
  { name: "Shirts", image: catShirts, cat: "Shirts" },
  { name: "T-Shirts", image: catTees, cat: "T-Shirts" },
  { name: "Pants", image: catJeans, cat: "Pants" },
  { name: "Hoodies", image: catJackets, cat: "Hoodies" },
];

const Index = () => {
  const { products, loading } = useProducts();
  const { settings } = useStoreSettings();
  const { items: lookbook } = useLookbook();
  const { homepageSettings, activeAdsForPlacement, activeBannersForPlacement } = useCms();

  // Dynamic Background Image & Controls from Admin Dashboard
  const heroDesktopImg = homepageSettings.background_image_url || settings.hero_image_url || heroStreetwearDesktop;
  const heroMobileImg = homepageSettings.background_mobile_image_url || homepageSettings.background_image_url || settings.hero_image_url || heroStreetwearMobile;
  const focalPoint = homepageSettings.focal_point || "center 18%";
  const backgroundSizing = homepageSettings.background_sizing || "cover";
  const overlayOpacity = homepageSettings.overlay_opacity ?? 0.40;

  // Active promotional advertisements and banners
  const promoAds = activeAdsForPlacement("home_promo");
  const topBanners = activeBannersForPlacement("announcement");
  const heroAds = activeAdsForPlacement("hero");

  // Section visibility helper from layout manager
  const getSection = (id: string) => {
    return homepageSettings.sections_order?.find((s) => s.id === id) || { enabled: true, title: "", subtitle: "" };
  };

  const pinned = products.filter(p => p.pinned);

  // Layered hero parallax (gentle scroll + mouse, zero over-zoom)
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const onHeroMouse = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };


  return (
    <Layout>
      {/* DYNAMIC ANNOUNCEMENT BAR (admin-editable via CMS or settings) */}
      {(topBanners.length > 0 || settings.announcement_text) && (
        <div
          style={{
            backgroundColor: topBanners[0]?.background_color || "#dc2626",
            color: topBanners[0]?.text_color || "#ffffff",
          }}
          className="text-center text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold py-2.5 px-4 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>{topBanners[0]?.title || settings.announcement_text}</span>
            {topBanners[0]?.button_url && topBanners[0]?.button_text && (
              <Link to={topBanners[0].button_url} className="ml-2 underline font-extrabold hover:text-gold transition-colors">
                {topBanners[0].button_text} →
              </Link>
            )}
          </div>
        </div>
      )}

      {getSection("promo_banners").enabled && <OfferBannerSlider />}

      {/* HERO — curated streetwear aesthetic with dynamic CMS controls */}
      {getSection("hero").enabled && (
        <section
          ref={heroRef}
          onMouseMove={onHeroMouse}
          onMouseLeave={() => setMouse({ x: 0, y: 0 })}
          className="relative w-full h-[70vh] min-h-[520px] md:h-[84vh] md:min-h-[620px] max-h-[900px] overflow-hidden bg-[#0d0e12]"
        >
          {/* Desktop widescreen streetwear image (zoomed edge-to-edge, zero side blur, zero split) */}
          <motion.img
            src={heroDesktopImg}
            alt={getSection("hero").title || settings.hero_headline}
            style={{ y: heroY, x: mouse.x * -8, objectPosition: focalPoint }}
            className={`hidden md:block absolute inset-0 w-full h-full ${backgroundSizing === "contain" ? "object-contain" : "object-cover"} will-change-transform`}
          />

          {/* Mobile portrait streetwear image (natural vertical framing, full model visible) */}
          <motion.img
            src={heroMobileImg}
            alt={getSection("hero").title || settings.hero_headline}
            style={{ y: heroY, objectPosition: focalPoint }}
            className={`block md:hidden absolute inset-0 w-full h-full ${backgroundSizing === "contain" ? "object-contain" : "object-cover"} will-change-transform`}
          />

          {/* Dynamic neutral contrast overlay controlled by Admin opacity slider — zero glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0, 0, 0, ${overlayOpacity}) 0%, rgba(0, 0, 0, ${overlayOpacity * 0.45}) 55%, transparent 85%)`,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 1.1}) 0%, transparent 40%, transparent 60%, rgba(0,0,0,${overlayOpacity * 1.4}) 100%)`,
            }}
          />

        {/* Centered Hero Content with animated Dexter logo razor-sharp in the center point (no glow lights) */}
        <motion.div
          style={{ opacity: heroFade }}
          className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center z-10"
        >
          {/* Animated 3D Floating Logo Container */}
          <motion.div
            style={{
              perspective: 1000,
              x: mouse.x * 14,
              y: mouse.y * 8,
              rotateX: mouse.y * -5,
              rotateY: mouse.x * 8,
            }}
            className="relative will-change-transform select-none"
          >
            {/* Smooth floating + breathing animation (clean, natural, zero glow lights) */}
            <motion.div
              animate={{
                y: [-7, 7, -7],
                scale: [1, 1.025, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative inline-block"
            >
              <motion.img
                src={dexterLogo}
                alt={settings.hero_headline}
                initial={{ opacity: 0, y: 22, scale: 0.94 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.85,
                  ease: EASE,
                  delay: 0.1,
                }}
                style={{
                  filter:
                    "drop-shadow(0 4px 16px rgba(0, 0, 0, 0.72)) drop-shadow(0 14px 32px rgba(0, 0, 0, 0.5))",
                }}
                className="w-[270px] sm:w-[370px] md:w-[470px] lg:w-[560px] max-w-[85vw] h-auto object-contain pointer-events-none"
              />
            </motion.div>
          </motion.div>

          <h1 className="sr-only">{settings.hero_headline}</h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.28 }}
            style={{
              x: mouse.x * 10,
              filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.98))",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.85)",
            }}
            className="mt-5 text-gold text-xs sm:text-sm md:text-base uppercase tracking-[0.4em] font-black"
          >
            {settings.hero_subtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.42 }}
            className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            <Magnetic>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 sm:gap-3 bg-red-cta text-white px-7 sm:px-8 py-3.5 sm:py-4 text-xs uppercase tracking-[0.25em] font-extrabold rounded-lg shadow-xl hover:bg-gold hover:text-ink hover:scale-[1.04] active:scale-95 transition-all duration-300"
              >
                Shop Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic>
              <a
                href="tel:08925259787"
                className="inline-flex items-center gap-2.5 sm:gap-3 bg-gold text-ink px-7 sm:px-8 py-3.5 sm:py-4 text-xs uppercase tracking-[0.25em] font-extrabold rounded-lg shadow-xl hover:bg-red-cta hover:text-white hover:scale-[1.04] active:scale-95 transition-all duration-300"
              >
                <Phone className="h-4 w-4" /> 089252 59787
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none">
          <span className="h-9 w-5 rounded-full border border-white/40 grid place-items-start p-1 animate-levitate">
            <span className="h-2 w-1 rounded-full bg-gold" />
          </span>
        </div>
      </section>
      )}

      {/* LIVE STORE COUNTERS */}
      <section className="bg-background border-b border-border">
        <div className="container-px mx-auto max-w-[1400px] py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { to: products.length || 17, label: "Live Styles", suffix: "+" },
            { to: 4200, label: "Happy Customers", suffix: "+" },
            { to: 12, label: "Years In Jayankondam", suffix: "" },
            { to: 48, label: "Hour Dispatch", suffix: "h" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <p className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-bold">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>


      <section className="bg-ink text-primary-foreground py-4 overflow-hidden border-y border-white/10">
        <div className="flex marquee-track whitespace-nowrap text-xs uppercase tracking-[0.4em] font-bold">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              {["Anna Silai · Jayankondam", "Open Daily 9:30 AM", "Tees from ₹300", "Original Puma · Jockey · Ramraj", "Call 089252 59787"].map((t, j) => (
                <span key={j} className="px-10 flex items-center gap-10">{t} <span className="text-gold">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-px mx-auto max-w-[1400px] py-20">
        <Reveal className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Curated</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-foreground hover:text-red-cta link-underline transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Reveal key={c.name} delay={i * 80}>
              <Link to={`/shop?cat=${encodeURIComponent(c.cat)}`} className="trace-border group relative aspect-[4/5] overflow-hidden rounded-md bg-secondary block hover:shadow-elevated hover:scale-[1.03] transition-all duration-500 ease-out will-change-transform">
                <div className="absolute inset-0 overflow-hidden">
                  <img src={c.image} alt={`${c.name} - DEXTER streetwear lookbook`} width={1024} height={1280} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-center animate-ken-burns will-change-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h3 className="font-display text-2xl font-extrabold text-white drop-shadow-lg">{c.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold mt-1">Shop Now →</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRENDING NOW — admin-pinned products */}
      {pinned.length > 0 && (
        <section className="container-px mx-auto max-w-[1400px] pb-20">
          <Reveal className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Hand-Picked</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold">Trending Now</h2>
            <p className="mt-3 text-muted-foreground text-sm">Pinned by our store team — pieces moving fastest this week.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
            {pinned.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        </section>
      )}

      {/* LIVE PRODUCTS */}
      <section className="container-px mx-auto max-w-[1400px] pb-20">
        <Reveal className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Live Collection</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">Latest Drops</h2>
          <p className="mt-3 text-muted-foreground text-sm">Updated directly by our store team — fresh inventory every week.</p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
          {loading && products.length === 0 && <ProductCardSkeleton count={8} />}
          {products.slice(0, 12).map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}><ProductCard product={p} /></Reveal>
          ))}

        </div>
      </section>

      {/* SHOP THE LOOK — admin-managed lookbook gallery */}
      {lookbook.length > 0 && (
        <section className="container-px mx-auto max-w-[1400px] pb-20">
          <Reveal className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 font-bold">Lookbook</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold">Shop The Look</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-fr items-stretch">
            {lookbook.map((l) => {
              const linked = l.product_id ? `/product/${l.product_id}` : "/shop";
              return (
                <Link key={l.id} to={linked} className="trace-border group relative block overflow-hidden rounded-md bg-secondary aspect-[4/5] h-full">
                  <img src={l.image_url} alt={l.caption || "Lookbook"} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3 md:p-4 flex justify-center md:justify-start">
                    <span className="inline-flex items-center justify-center gap-1.5 bg-white text-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] font-bold rounded whitespace-nowrap">
                      {l.product_id ? "Shop This Look" : "Explore"} <ArrowRight className="h-3 w-3 shrink-0" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </section>
      )}

      {/* DEXTER HYPE ZONE */}
      <section className="container-px mx-auto max-w-[1400px] pb-20">
        <Reveal className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Featured Drops</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">Dexter Hype Zone</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: "Oversized Drop-Shoulder Festival", sub: "Street-ready silhouettes · Heavy 240 GSM", cta: "Shop Oversized", to: "/shop?cat=T-Shirts", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80", accent: "from-red-cta/80" },
            { title: "Street Utility Cargos", sub: "Multi-pocket tactical fits · Premium twill", cta: "Shop Cargos", to: "/shop?cat=Pants", img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1400&q=80", accent: "from-gold/80" },
          ].map((b, i) => (
            <Reveal key={b.title} delay={i * 100}>
              <Link to={b.to} className="trace-border group relative block aspect-[16/10] overflow-hidden rounded-lg bg-ink">
                <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${b.accent} via-black/60 to-black/85`} />
                <div className="absolute inset-0 p-7 md:p-10 flex flex-col justify-end">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold mb-3">Dexter Exclusive</p>
                  <h3 className="font-display text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg">{b.title}</h3>
                  <p className="text-sm text-white/80 mt-2 max-w-sm">{b.sub}</p>
                  <span className="mt-5 inline-flex items-center gap-2 bg-white text-ink px-5 py-2.5 text-xs uppercase tracking-[0.25em] font-bold rounded w-fit group-hover:bg-gold transition-smooth">
                    {b.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DYNAMIC PROMOTIONAL ADVERTISEMENTS (Managed via Advertisement Manager) */}
      {getSection("advertisements").enabled && promoAds.length > 0 && (
        <section className="container-px mx-auto max-w-[1400px] pb-20">
          <Reveal className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 font-bold">Featured Highlights</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">
              {getSection("advertisements").title || "Promotional Campaigns"}
            </h2>
          </Reveal>
          <div className="grid gap-6">
            {promoAds.map((ad, i) => (
              <Reveal key={ad.id} delay={i * 80}>
                <div
                  style={{ backgroundColor: ad.background_color || "#0d0e12", color: ad.text_color || "#ffffff" }}
                  className="relative overflow-hidden rounded-2xl shadow-elevated border border-border/40"
                >
                  <div className="grid md:grid-cols-[1.25fr_1fr] items-center min-h-[300px]">
                    <div className="relative p-8 md:p-12 z-10 flex flex-col justify-center">
                      <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold mb-2">{ad.name}</span>
                      <h3 className="font-display text-2xl md:text-4xl font-extrabold leading-tight mb-3 drop-shadow">{ad.title}</h3>
                      {ad.subtitle && <p className="text-xs md:text-sm opacity-80 max-w-lg mb-6 leading-relaxed">{ad.subtitle}</p>}
                      {ad.button_text && ad.button_url && (
                        <div>
                          <Link
                            to={ad.button_url}
                            className="inline-flex items-center gap-2 bg-red-cta text-white px-7 py-3 text-xs uppercase tracking-[0.25em] font-extrabold rounded hover:bg-gold hover:text-ink transition-all duration-300 shadow-lg"
                          >
                            {ad.button_text} <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="relative h-64 md:h-full min-h-[260px] overflow-hidden">
                      <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0d0e12]/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Reviews />

      {products.length > 12 && (
        <section className="container-px mx-auto max-w-[1400px] py-20">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-10 text-foreground">More From The Store</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-8 md:gap-x-4">
            {products.slice(12, 22).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="bg-ink text-primary-foreground">
        <div className="container-px mx-auto max-w-[1400px] py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 font-bold">Visit Us In-Store</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold">Anna Silai, Jayankondam</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-md">The full DEXTER collection — try-on, sizing help, and exclusive in-store offers. Open daily from 9:30 AM.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:08925259787" className="inline-flex items-center gap-2 bg-red-cta text-white px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold rounded">
                <Phone className="h-4 w-4" /> Call 089252 59787
              </a>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-gold text-ink px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold rounded">
                <MapPin className="h-4 w-4" /> Get Directions
              </Link>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/15">
            <iframe title="DEXTER MENS CLOTHING map" src="https://www.google.com/maps?q=Anna+Silai+Jayankondam+Tamil+Nadu&output=embed" width="100%" height="320" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-px mx-auto max-w-[1400px] grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { icon: Truck, title: "Fast Delivery", text: "Quick dispatch across Tamil Nadu and pan-India." },
            { icon: RotateCcw, title: "Easy Returns", text: "Hassle-free returns at our Jayankondam store." },
            { icon: ShieldCheck, title: "Authentic Brands", text: "Original Puma, Jockey, Ramraj & more." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="py-10 px-6 flex items-center gap-5">
              <div className="h-12 w-12 grid place-items-center border-2 border-foreground rounded-full text-red-cta"><Icon className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
