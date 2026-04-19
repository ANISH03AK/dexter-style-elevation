import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CountdownDeal from "@/components/CountdownDeal";
import HeroOffersCarousel from "@/components/HeroOffersCarousel";
import FloatingAds from "@/components/FloatingAds";
import { useProducts } from "@/context/ProductsContext";
import hero from "@/assets/hero-model.jpg";
import promo from "@/assets/promo-banner.jpg";
import catShirts from "@/assets/cat-shirts.jpg";
import catTees from "@/assets/cat-tshirts.jpg";
import catJeans from "@/assets/cat-jeans.jpg";
import catJackets from "@/assets/cat-jackets.jpg";

const categories = [
  { name: "Shirts", image: catShirts },
  { name: "T-Shirts", image: catTees },
  { name: "Jeans", image: catJeans },
  { name: "Jackets", image: catJackets },
];

const Index = () => {
  const { products } = useProducts();
  return (
    <Layout transparentNav>
      {/* HERO */}
      <section className="relative h-[100vh] min-h-[680px] w-full overflow-hidden bg-ink">
        {/* Animated gold blobs background */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gold/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-amber-500/10 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

        <img
          src={hero}
          alt="DEXTER model in premium black overcoat with golden rim light"
          width={1600}
          height={1920}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-95 animate-slow-zoom"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />

        {/* Floating animated ads */}
        <FloatingAds />

        {/* Spinning gold ring decoration */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-72 h-72 border border-gold/20 rounded-full animate-spin-slow hidden lg:block pointer-events-none">
          <div className="absolute inset-4 border border-gold/10 rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-gold rounded-full shadow-gold" />
        </div>

        <div className="relative h-full container-px mx-auto max-w-[1400px] flex flex-col justify-end pb-24 md:pb-32 z-20">
          <div className="max-w-xl text-primary-foreground animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/40 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
              <span className="h-2 w-2 bg-gold rounded-full animate-pulse-gold" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold">FW · 25 Collection · Live Now</p>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] font-bold">
              Elevate <br/> Your{" "}
              <em className="not-italic bg-gradient-to-r from-gold via-amber-300 to-gold bg-[length:200%_100%] animate-shimmer bg-clip-text text-transparent">
                Style.
              </em>
            </h1>
            <p className="mt-6 text-base md:text-lg text-primary-foreground/75 max-w-md">
              Premium menswear, engineered to outlast trends. Discover the new season silhouettes — now up to <span className="text-gold font-semibold">60% off</span>.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="group relative inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-primary-foreground transition-smooth shadow-gold animate-pulse-gold overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Shop the Sale
                <ArrowRight className="h-4 w-4 transition-smooth group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 border border-primary-foreground/40 backdrop-blur-md text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-primary-foreground hover:text-ink transition-smooth"
              >
                Lookbook
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="absolute bottom-0 left-0 right-0 bg-gold/95 text-ink py-2 overflow-hidden z-20">
          <div className="flex animate-ticker whitespace-nowrap text-[11px] uppercase tracking-[0.3em] font-semibold">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex shrink-0">
                {["🔥 Flat 60% Off Hoodies", "✨ Shirts under ₹999", "🎁 Buy 2 Get 1 Free Tees", "⚡ Free Shipping ₹1,499+", "💎 New Arrivals Weekly"].map((t, j) => (
                  <span key={j} className="px-8">{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFERS CAROUSEL */}
      <HeroOffersCarousel />

      {/* MARQUEE */}
      <section className="bg-ink text-primary-foreground py-5 overflow-hidden border-y border-white/10">
        <div className="flex marquee-track whitespace-nowrap text-xs uppercase tracking-[0.4em]">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              {["Free Shipping Over ₹12,500", "30-Day Returns", "Crafted in Italy", "Exclusive Member Drops", "New Arrivals Weekly"].map((t, j) => (
                <span key={j} className="px-10 flex items-center gap-10">
                  {t} <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-px mx-auto max-w-[1400px] py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Curated</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] link-underline">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {categories.map(c => (
            <Link
              key={c.name}
              to={`/shop?cat=${c.name}`}
              className="group relative aspect-[3/4] overflow-hidden bg-secondary"
            >
              <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-smooth duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 md:p-7 text-primary-foreground">
                <h3 className="font-display text-xl md:text-2xl font-semibold">{c.name}</h3>
                <span className="text-[11px] uppercase tracking-[0.25em] text-gold inline-flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-smooth">
                  Discover <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DEAL OF THE DAY */}
      <CountdownDeal />

      {/* TRENDING */}
      <section className="container-px mx-auto max-w-[1400px] pb-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Most Wanted</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Trending Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* PROMO */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden bg-ink">
        <img src={promo} alt="DEXTER sale promotion" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-ink/20" />
        <div className="relative h-full container-px mx-auto max-w-[1400px] flex items-center">
          <div className="max-w-xl text-primary-foreground">
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Limited Time</p>
            <h2 className="font-display text-5xl md:text-7xl font-bold leading-none">
              FLAT 30% <br/><span className="text-gold">OFF</span>
            </h2>
            <p className="mt-6 text-primary-foreground/75 max-w-sm">
              On all outerwear and denim. The wardrobe edit you've been waiting for.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-primary-foreground transition-smooth"
            >
              Shop the Sale <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* THEMED OFFER GRID */}
      <section className="container-px mx-auto max-w-[1400px] py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Today's Deals</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Offers You Can't Miss</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="relative aspect-[4/3] overflow-hidden bg-ink text-primary-foreground p-8 flex flex-col justify-end">
            <img src={catJackets} alt="Jackets sale" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Outerwear</p>
              <h3 className="font-display text-3xl font-bold">Up to 50% Off</h3>
              <p className="text-sm text-primary-foreground/80 mt-2">Bombers, biker jackets & overcoats</p>
              <Link to="/shop?cat=Jackets" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold link-underline">Shop Now <ArrowRight className="h-3 w-3"/></Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink text-primary-foreground p-8 flex flex-col justify-end">
            <img src={catJeans} alt="Denim deals" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Denim Days</p>
              <h3 className="font-display text-3xl font-bold">Buy 1 Get 1</h3>
              <p className="text-sm text-primary-foreground/80 mt-2">Free on selected denim styles</p>
              <Link to="/shop?cat=Jeans" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold link-underline">Grab Yours <ArrowRight className="h-3 w-3"/></Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink text-primary-foreground p-8 flex flex-col justify-end">
            <img src={catTees} alt="T-shirts under 999" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Essentials</p>
              <h3 className="font-display text-3xl font-bold">Tees Under ₹999</h3>
              <p className="text-sm text-primary-foreground/80 mt-2">Daily basics, premium quality</p>
              <Link to="/shop?cat=T-Shirts" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold link-underline">Shop Tees <ArrowRight className="h-3 w-3"/></Link>
            </div>
          </div>
        </div>
      </section>

      {/* COUPON STRIP */}
      <section className="bg-gold text-ink py-8">
        <div className="container-px mx-auto max-w-[1400px] grid md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">Code: DEXTER10</p>
            <p className="font-display text-xl font-bold mt-1">Extra 10% off ₹2,999+</p>
          </div>
          <div className="md:border-x border-ink/20 md:px-6">
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">Code: NEW500</p>
            <p className="font-display text-xl font-bold mt-1">₹500 off your first order</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">Code: BUNDLE3</p>
            <p className="font-display text-xl font-bold mt-1">Buy 3, Save 25% sitewide</p>
          </div>
        </div>
      </section>

      {/* MORE PRODUCTS */}
      <section className="container-px mx-auto max-w-[1400px] py-24">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-12">Just Dropped</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {products.slice(6, 14).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* USP STRIP */}
      <section className="border-t border-border">
        <div className="container-px mx-auto max-w-[1400px] grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { icon: Truck, title: "Complimentary Shipping", text: "On all orders over ₹12,500 across India." },
            { icon: RotateCcw, title: "Easy Returns", text: "30-day no-questions-asked returns." },
            { icon: ShieldCheck, title: "Authentic Craft", text: "Every piece, ethically sourced & made." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="py-10 px-6 flex items-center gap-5">
              <div className="h-12 w-12 grid place-items-center border border-border rounded-full text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">{title}</h4>
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
