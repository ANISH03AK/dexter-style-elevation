import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Globe2, Leaf, Sparkles, Target, Users } from "lucide-react";
import Layout from "@/components/Layout";
import dexterLogo from "@/assets/dexter-logo.png";


const stats = [
  { v: 1000000, l: "Pieces Shipped", suffix: "+" },
  { v: 250, l: "Cities Across India", suffix: "+" },
  { v: 98, l: "Customer Satisfaction", suffix: "%" },
  { v: 12, l: "Years of Craft", suffix: "" },
];

const milestones = [
  { y: "2013", t: "Founded in Milan", d: "DEXTER begins as a small atelier crafting bespoke menswear." },
  { y: "2017", t: "First Flagship", d: "Opened our first global flagship store in Mumbai." },
  { y: "2020", t: "Sustainable Pivot", d: "Committed to certified-organic cottons and recycled wool." },
  { y: "2023", t: "1M Customers", d: "Crossed 1 million pieces shipped across 250+ cities." },
  { y: "2025", t: "Atelier 2.0", d: "Launched our digital atelier with AI-personalised fits." },
];

const values = [
  { i: Sparkles, t: "Crafted with Intent", d: "Every stitch, seam and selvedge is chosen for longevity." },
  { i: Leaf, t: "Sustainable by Design", d: "GOTS-certified cottons, recycled wool, low-impact dyes." },
  { i: Award, t: "Premium Materials", d: "Italian wool, Japanese denim, Peruvian Pima cotton." },
  { i: Globe2, t: "Made for Modern Men", d: "Engineered fits for real bodies and real lives." },
];

const useCounter = (target: number, run: boolean, duration = 1600) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return v;
};

const StatCard = ({ stat, run }: { stat: typeof stats[number]; run: boolean }) => {
  const v = useCounter(stat.v, run);
  return (
    <div className="text-center p-6 border border-border rounded-lg bg-background hover:shadow-elevated transition-smooth hover-lift">
      <div className="font-display text-4xl md:text-5xl font-bold text-gold">
        {v.toLocaleString("en-IN")}{stat.suffix}
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">{stat.l}</p>
    </div>
  );
};

const About = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setRun(true), { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-ink text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-transparent" />
        <div className="relative container-px mx-auto max-w-[1400px] py-28 md:py-40">
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4 animate-fade-in">Our Story</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold max-w-2xl leading-[1.05] animate-fade-in">
            Modern menswear, <span className="text-gold">crafted with intent.</span>
          </h1>
          <p className="mt-6 max-w-xl text-primary-foreground/70 text-base md:text-lg animate-fade-in">
            We design uncompromising essentials for men who value quiet confidence over loud trends.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container-px mx-auto max-w-[1400px] py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Mission</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Built to outlast trends, not seasons.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            DEXTER exists at the intersection of streetwear energy and tailored craft. We obsess over weight, drape, and finish — so every piece feels familiar from the first wear and stays sharp through the hundredth.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From our atelier in Milan to our flagship in Mumbai, every collection is engineered for the modern individual.
          </p>
        </div>
        <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-elevated bg-ink grid place-items-center p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-soft to-ink" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 22px)" }}
          />
          <img
            src={dexterLogo}
            alt="DEXTER MENS CLOTHING logo"
            className="relative max-w-[78%] max-h-[70%] w-auto h-auto object-contain transition-transform duration-700 hover:scale-[1.04]"
            style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55)) drop-shadow(0 6px 12px rgba(0,0,0,0.35))" }}
          />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="bg-secondary py-20">
        <div className="container-px mx-auto max-w-[1400px]">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">By the Numbers</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">A decade of craft, in numbers.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map(s => <StatCard key={s.l} stat={s} run={run} />)}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-px mx-auto max-w-[1400px] py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 text-center">What We Stand For</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ i: Icon, t, d }) => (
            <div key={t} className="p-6 border border-border rounded-lg hover:border-gold transition-smooth hover-lift group">
              <div className="h-12 w-12 grid place-items-center bg-ink text-gold rounded-md group-hover:bg-gold group-hover:text-ink transition-smooth">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-ink text-primary-foreground py-20">
        <div className="container-px mx-auto max-w-[1400px]">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 text-center">Milestones</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">Our Journey</h2>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/20 md:-translate-x-px" />
            {milestones.map((m, i) => (
              <div key={m.y} className={`relative mb-10 md:grid md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className={`pl-12 md:pl-0 ${i % 2 ? "md:text-left" : "md:text-right"}`}>
                  <div className="text-gold font-display text-2xl font-bold">{m.y}</div>
                  <h3 className="mt-1 font-semibold">{m.t}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/60">{m.d}</p>
                </div>
                <div />
                <span className="absolute left-4 md:left-1/2 top-2 h-3 w-3 rounded-full bg-gold -translate-x-1/2 ring-4 ring-ink" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-px mx-auto max-w-[1400px] py-20 text-center">
        <Target className="h-10 w-10 text-gold mx-auto mb-4" />
        <h2 className="font-display text-3xl md:text-4xl font-bold">Built for the next chapter.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Discover the latest collection — engineered, refined, and ready to wear.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/shop" className="bg-ink text-primary-foreground uppercase tracking-[0.2em] text-xs px-8 py-4 hover:bg-gold hover:text-ink transition-smooth">
            Shop Collection
          </Link>
          <Link to="/admin" className="border border-border uppercase tracking-[0.2em] text-xs px-8 py-4 hover:border-foreground transition-smooth inline-flex items-center gap-2">
            <Users className="h-4 w-4" /> Manage Catalog
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
