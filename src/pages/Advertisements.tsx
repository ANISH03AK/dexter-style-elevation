import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Tag, Flame, Clock, Check, Copy,
  Calendar, Layers, ShieldCheck, Truck, Phone, ChevronRight,
  TrendingUp, ExternalLink, Percent, Zap, Eye
} from "lucide-react";
import Layout from "@/components/Layout";
import { useCms, Advertisement, DiscountCampaign } from "@/context/CmsContext";
import { useProducts } from "@/context/ProductsContext";
import { useMotionPreference } from "@/context/MotionPreferenceContext";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import dexterLogo from "@/assets/dexter-logo-clean.png";
import heroStreetwearDesktop from "@/assets/hero-streetwear-pc.jpg";
import heroStreetwearMobile from "@/assets/hero-streetwear-mobile.jpg";

const EASE = [0.22, 1, 0.36, 1] as const;

export const AdvertisementsPage = () => {
  const {
    advertisements,
    discountCampaigns,
    recordAdImpression,
    recordAdClick,
  } = useCms();
  const { products } = useProducts();
  const { prefersReducedMotion } = useMotionPreference();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Active advertisements that are currently published and scheduled
  const activeAds = useMemo(() => {
    const now = Date.now();
    return advertisements.filter((ad) => {
      if (!ad.is_active) return false;
      if (ad.start_date && new Date(ad.start_date).getTime() > now) return false;
      if (ad.end_date && new Date(ad.end_date).getTime() < now) return false;
      return true;
    }).sort((a, b) => a.sort_order - b.sort_order);
  }, [advertisements]);

  // Featured hero ad (either marked as hero placement or first active ad)
  const heroAd = useMemo(() => {
    const heroPlacement = activeAds.find((a) => a.placement === "hero");
    return heroPlacement || activeAds[0] || null;
  }, [activeAds]);

  // Record impressions on visible ads
  useEffect(() => {
    activeAds.forEach((ad) => {
      recordAdImpression(ad.id);
    });
  }, [activeAds, recordAdImpression]);

  // Categories present in ads
  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeAds.forEach((ad) => {
      if (ad.campaign_category) cats.add(ad.campaign_category);
      if (ad.associated_categories) {
        ad.associated_categories.forEach((c) => cats.add(c));
      }
    });
    return ["all", ...Array.from(cats)];
  }, [activeAds]);

  // Filtered ads by category chip
  const filteredAds = useMemo(() => {
    if (activeCategory === "all") return activeAds;
    return activeAds.filter(
      (ad) =>
        ad.campaign_category === activeCategory ||
        ad.associated_categories?.includes(activeCategory)
    );
  }, [activeAds, activeCategory]);

  // Copy coupon code
  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code ${code} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  // Handle ad navigation & tracking
  const handleAdClick = (ad: Advertisement) => {
    recordAdClick(ad.id);
    const dest = ad.button_url || "/shop";
    if (dest.startsWith("http")) {
      window.open(dest, "_blank", "noopener,noreferrer");
    } else {
      navigate(dest);
    }
  };

  return (
    <Layout>
      {/* 1. ADVERTISEMENT HERO SPOTLIGHT */}
      <section className="relative w-full bg-ink text-white overflow-hidden border-b border-border">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-cta/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container-px mx-auto max-w-[1400px] py-12 md:py-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-14">
            {/* Left Content */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="space-y-6 text-center lg:text-left z-10"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
                <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-extrabold text-gold">
                  Official Campaigns & Offers
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                {heroAd?.title || "DEXTER EXCLUSIVE CAMPAIGNS"}
              </h1>

              <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {heroAd?.subtitle ||
                  heroAd?.description ||
                  "Explore active seasonal campaigns, streetwear collections, and limited-time deals curated directly by our Jayankondam store team."}
              </p>

              {/* Price / Offer Highlight */}
              {(heroAd?.offer_percentage || heroAd?.promotional_price) && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  {heroAd.offer_percentage && (
                    <span className="px-4 py-2 bg-gradient-to-r from-red-cta to-gold text-ink font-black text-sm uppercase tracking-wider rounded-lg shadow-lg">
                      FLAT {heroAd.offer_percentage}% OFF
                    </span>
                  )}
                  {heroAd.promotional_price && (
                    <div className="flex items-baseline gap-2 text-left">
                      <span className="text-2xl md:text-3xl font-black text-gold">
                        {formatINR(heroAd.promotional_price)}
                      </span>
                      {heroAd.original_price && heroAd.original_price > heroAd.promotional_price && (
                        <span className="text-sm line-through text-white/50">
                          {formatINR(heroAd.original_price)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Primary Call to Action */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => heroAd && handleAdClick(heroAd)}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-red-cta hover:bg-gold hover:text-ink text-white text-xs uppercase tracking-[0.25em] font-black rounded-lg transition-all duration-300 shadow-xl hover:scale-[1.03] active:scale-95"
                >
                  {heroAd?.button_text || "Shop The Collection"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-4 border border-white/25 hover:border-gold hover:text-gold text-white text-xs uppercase tracking-[0.2em] font-bold rounded-lg transition-colors"
                >
                  View All Products
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[11px] text-white/60 font-semibold uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-gold" /> Free Shipping &gt; ₹2,500
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 100% Authentic Menswear
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gold" /> 089252 59787
                </span>
              </div>
            </motion.div>

            {/* Right Hero Image (Responsive Art Direction) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group"
            >
              {/* Desktop Image */}
              <img
                src={heroAd?.desktop_image_url || heroAd?.image_url || heroStreetwearDesktop}
                alt={heroAd?.title || "DEXTER Campaign"}
                className="hidden sm:block w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Mobile Image */}
              <img
                src={heroAd?.mobile_image_url || heroAd?.image_url || heroStreetwearMobile}
                alt={heroAd?.title || "DEXTER Campaign"}
                className="block sm:hidden w-full h-full object-cover"
              />

              {/* Gradient Vignette for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent sm:via-ink/20" />

              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="px-3 py-1 bg-ink/90 backdrop-blur-md border border-gold/30 text-gold text-[10px] uppercase tracking-widest font-extrabold rounded-md shadow">
                  {heroAd?.promotional_badge || heroAd?.campaign_category || "FEATURED"}
                </span>
              </div>

              {heroAd?.end_date && (
                <div className="absolute bottom-4 right-4 z-10 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-[10px] text-white flex items-center gap-1.5 font-mono">
                  <Clock className="h-3 w-3 text-gold" />
                  Ends: {new Date(heroAd.end_date).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SPECIAL OFFERS & COUPONS BANNER */}
      {discountCampaigns.filter((d) => d.is_active).length > 0 && (
        <section className="bg-secondary/40 border-b border-border py-12">
          <div className="container-px mx-auto max-w-[1400px]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-red-cta block mb-1">
                  Instant Savings
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
                  Active Discounts & Coupon Codes
                </h2>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Apply these codes during checkout or cart summary for direct price reductions.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {discountCampaigns
                .filter((d) => d.is_active)
                .map((disc, idx) => (
                  <motion.div
                    key={disc.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className="p-5 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all flex flex-col justify-between gap-4 relative overflow-hidden group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gold text-ink">
                          {disc.display_label || `${disc.discount_value}% OFF`}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {disc.offer_type.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                        {disc.name}
                      </h3>

                      {disc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {disc.description}
                        </p>
                      )}

                      {disc.min_purchase_amount && disc.min_purchase_amount > 0 ? (
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Min. spend: <span className="font-bold text-foreground">{formatINR(disc.min_purchase_amount)}</span>
                        </p>
                      ) : null}
                    </div>

                    {/* Coupon action or direct shop */}
                    {disc.coupon_code ? (
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black tracking-widest px-3 py-1.5 bg-secondary rounded border border-border text-foreground">
                          {disc.coupon_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(disc.coupon_code!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white hover:bg-gold hover:text-ink text-[10px] uppercase tracking-wider font-extrabold rounded transition-colors shadow"
                        >
                          {copiedCode === disc.coupon_code ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Code
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-border flex justify-end">
                        <Link
                          to="/shop"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-red-cta transition-colors"
                        >
                          Shop Eligible Pieces →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. ALL PROMOTIONAL ADVERTISEMENTS */}
      <section className="container-px mx-auto max-w-[1400px] py-16 md:py-24">
        {/* Section Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-gold block mb-2">
              Curated Highlights
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
              Featured Promotional Campaigns
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              All active advertisements synchronized live with the store control room. Click any campaign to shop its pieces.
            </p>
          </div>

          {/* Category Filter Chips */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                    activeCategory === cat
                      ? "bg-ink text-white shadow-md scale-[1.02]"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-border/60"
                  }`}
                >
                  {cat === "all" ? "All Campaigns" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advertisement Cards Grid */}
        {filteredAds.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-2xl">
            <Tag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground">No active campaigns in this category</h3>
            <p className="text-xs text-muted-foreground mt-1">Check back soon or explore our complete catalog.</p>
            <Link
              to="/shop"
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs uppercase tracking-wider font-bold rounded-lg transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {filteredAds.map((ad, index) => {
              const bgCol = ad.background_color || "#0d0e12";
              const textCol = ad.text_color || "#ffffff";
              const hasPrices = ad.promotional_price && ad.original_price;

              return (
                <motion.article
                  key={ad.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
                  className="group relative rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-elevated transition-all duration-500 flex flex-col justify-between"
                  style={{ backgroundColor: bgCol, color: textCol }}
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                    {/* Desktop vs Mobile Image */}
                    <img
                      src={ad.desktop_image_url || ad.image_url}
                      alt={ad.title}
                      loading="lazy"
                      className="hidden sm:block w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <img
                      src={ad.mobile_image_url || ad.image_url}
                      alt={ad.title}
                      loading="lazy"
                      className="block sm:hidden w-full h-full object-cover"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Badge Stack */}
                    <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap gap-2">
                      {ad.promotional_badge && (
                        <span className="px-2.5 py-1 bg-red-cta text-white text-[10px] font-black uppercase tracking-widest rounded shadow">
                          {ad.promotional_badge}
                        </span>
                      )}
                      {ad.campaign_category && (
                        <span className="px-2.5 py-1 bg-ink/80 backdrop-blur border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow">
                          {ad.campaign_category}
                        </span>
                      )}
                    </div>

                    {/* Offer Tag */}
                    {ad.offer_percentage && (
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="px-3 py-1 bg-gold text-ink font-black text-xs uppercase tracking-wider rounded shadow-lg animate-pulse-gold">
                          {ad.offer_percentage}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-extrabold block">
                        {ad.name}
                      </span>

                      <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow">
                        {ad.title}
                      </h3>

                      {ad.subtitle && (
                        <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-medium">
                          {ad.subtitle}
                        </p>
                      )}

                      {ad.description && (
                        <p className="text-xs opacity-75 leading-relaxed pt-1 line-clamp-3">
                          {ad.description}
                        </p>
                      )}

                      {/* Associated Categories Tags */}
                      {ad.associated_categories && ad.associated_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {ad.associated_categories.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-white/10 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Pricing & CTA */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {hasPrices ? (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider opacity-60 block">Special Offer</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-black text-gold">
                              {formatINR(ad.promotional_price!)}
                            </span>
                            <span className="text-xs line-through opacity-50">
                              {formatINR(ad.original_price!)}
                            </span>
                          </div>
                        </div>
                      ) : ad.start_date || ad.end_date ? (
                        <div className="text-[11px] opacity-70 font-mono flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gold" />
                          <span>
                            {ad.end_date
                              ? `Valid till ${new Date(ad.end_date).toLocaleDateString()}`
                              : "Limited Time Offer"}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        onClick={() => handleAdClick(ad)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-cta hover:bg-gold hover:text-ink text-white text-xs uppercase tracking-[0.2em] font-extrabold rounded-lg transition-all duration-300 shadow-md hover:scale-[1.03] active:scale-95"
                      >
                        {ad.button_text || "Shop Campaign"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. STORE LOCATOR & VISIT BANNER */}
      <section className="bg-ink text-white border-t border-white/10 py-16">
        <div className="container-px mx-auto max-w-[1400px] grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2 block">
              Flagship Destination
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">
              Experience the Full Collection in Jayankondam
            </h2>
            <p className="mt-4 text-white/75 text-sm leading-relaxed max-w-lg">
              Visit Anna Silai, Jayankondam for exclusive in-store trial rooms, bespoke sizing assistance, and limited offline campaign drops. Open daily from 9:30 AM.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="tel:08925259787"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-cta text-white text-xs uppercase tracking-wider font-extrabold rounded-lg hover:bg-gold hover:text-ink transition-colors"
              >
                <Phone className="h-4 w-4" /> Call 089252 59787
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white text-xs uppercase tracking-wider font-extrabold rounded-lg hover:bg-white/20 transition-colors"
              >
                Store Directions →
              </Link>
            </div>
          </div>

          <div className="aspect-[16/9] rounded-xl overflow-hidden border border-white/15 shadow-2xl">
            <iframe
              title="DEXTER Jayankondam Store Location"
              src="https://www.google.com/maps?q=Anna+Silai+Jayankondam+Tamil+Nadu&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdvertisementsPage;
