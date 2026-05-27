import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, MapPin, Phone } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import { useProducts } from "@/context/ProductsContext";
import hero from "@/assets/hero-model.jpg";
import dexterLogo from "@/assets/dexter-logo.png";
import catShirts from "@/assets/cat-shirts.jpg";
import catTees from "@/assets/cat-tshirts.jpg";
import catJeans from "@/assets/cat-jeans.jpg";
import catJackets from "@/assets/cat-jackets.jpg";

const categories = [
  { name: "Shirts", image: catShirts, cat: "Shirts" },
  { name: "T-Shirts", image: catTees, cat: "T-Shirts" },
  { name: "Pants", image: catJeans, cat: "Pants" },
  { name: "Hoodies", image: catJackets, cat: "Hoodies" },
];

const Index = () => {
  const { products } = useProducts();
  return (
    <Layout>
      {/* HERO — clean lifestyle imagery, NO floating clutter, logo overlay with drop-shadow */}
      <section className="relative w-full h-[70vh] min-h-[520px] md:h-[80vh] md:min-h-[640px] overflow-hidden bg-ink">
        <img
          src={hero}
          alt="DEXTER MENS CLOTHING — premium men's fashion lifestyle"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

        {/* Big Dexter logo overlay with sophisticated drop-shadow */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <img
            src={dexterLogo}
            alt="DEXTER MENS CLOTHING"
            className="w-[260px] sm:w-[360px] md:w-[460px] lg:w-[560px] h-auto object-contain shadow-logo"
            style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.65)) drop-shadow(0 6px 12px rgba(0,0,0,0.5))" }}
          />
          <p className="mt-6 text-white text-xs sm:text-sm md:text-base uppercase tracking-[0.4em] font-bold drop-shadow-lg">
            Premium Menswear · Jayankondam
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-red-cta text-white px-7 py-3.5 text-xs uppercase tracking-[0.25em] font-bold rounded shadow-lg hover:scale-[1.03] transition-transform"
            >
              Shop Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:08925259787"
              className="inline-flex items-center gap-3 bg-gold text-ink px-7 py-3.5 text-xs uppercase tracking-[0.25em] font-bold rounded shadow-lg hover:scale-[1.03] transition-transform"
            >
              <Phone className="h-4 w-4" /> 089252 59787
            </a>
          </div>
        </div>
      </section>

      {/* MARQUEE strip — store info */}
      <section className="bg-ink text-primary-foreground py-4 overflow-hidden border-y border-white/10">
        <div className="flex marquee-track whitespace-nowrap text-xs uppercase tracking-[0.4em] font-bold">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              {["Anna Silai · Jayankondam", "Open Daily 9:30 AM", "Tees from ₹300", "Original Puma · Jockey · Ramraj", "Call 089252 59787"].map((t, j) => (
                <span key={j} className="px-10 flex items-center gap-10">
                  {t} <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-px mx-auto max-w-[1400px] py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Curated</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-foreground hover:text-red-cta link-underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(c => (
            <Link key={c.name} to={`/shop?cat=${encodeURIComponent(c.cat)}`} className="group relative aspect-[4/5] overflow-hidden rounded-md bg-secondary">
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5">
                <h3 className="font-display text-2xl font-extrabold text-white">{c.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold mt-1">Shop Now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVE PRODUCTS — fetched from admin DB */}
      <section className="container-px mx-auto max-w-[1400px] pb-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Live Collection</p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">Latest Drops</h2>
          <p className="mt-3 text-muted-foreground text-sm">Updated directly by our store team — fresh inventory every week.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
          {products.slice(0, 12).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <Reviews />

      {/* MORE PRODUCTS */}
      {products.length > 12 && (
        <section className="container-px mx-auto max-w-[1400px] py-20">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-10 text-foreground">More From The Store</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-8 md:gap-x-4">
            {products.slice(12, 22).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* STORE LOCATION CTA */}
      <section className="bg-ink text-primary-foreground">
        <div className="container-px mx-auto max-w-[1400px] py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 font-bold">Visit Us In-Store</p>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold">Anna Silai, Jayankondam</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-md">
              The full DEXTER collection — try-on, sizing help, and exclusive in-store offers.
              Open daily from 9:30 AM.
            </p>
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
            <iframe
              title="DEXTER MENS CLOTHING map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.4800363294025!2d79.2903743!3d11.0022359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3arqzsRm118pMRIUCM%3A0x235014a8a9154fdb!2sDEXTER%20MENS%20CLOTHING!5e0!3m2!1sen!2sin!4v1716762000000!5m2!1sen!2sin"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* USP STRIP */}
      <section className="border-t border-border">
        <div className="container-px mx-auto max-w-[1400px] grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { icon: Truck, title: "Fast Delivery", text: "Quick dispatch across Tamil Nadu and pan-India." },
            { icon: RotateCcw, title: "Easy Returns", text: "Hassle-free returns at our Jayankondam store." },
            { icon: ShieldCheck, title: "Authentic Brands", text: "Original Puma, Jockey, Ramraj & more." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="py-10 px-6 flex items-center gap-5">
              <div className="h-12 w-12 grid place-items-center border-2 border-foreground rounded-full text-red-cta">
                <Icon className="h-5 w-5" />
              </div>
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
