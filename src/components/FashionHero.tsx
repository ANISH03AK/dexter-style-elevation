import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Pause, Play, Phone } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMotionPreference } from "@/context/MotionPreferenceContext";
import type { StoreSettings } from "@/context/StoreSettingsContext";
import logo from "@/assets/dexter-logo.png";
import shirt from "@/assets/dexter-editorial-shirt.jpg";
import jacket from "@/assets/dexter-editorial-jacket.jpg";

const campaign = [
  { src: shirt, alt: "Male model wearing a textured black shirt and tailored trousers in the DEXTER editorial studio" },
  { src: jacket, alt: "Male model wearing a deep-red jacket, white tee and black trousers in the DEXTER editorial studio" },
];
const ease = [0.22, 1, 0.36, 1] as const;

const FashionHero = ({ settings }: { settings: StoreSettings }) => {
  const { reduced } = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const pointer = useMotionValue(0);
  const x = useSpring(pointer, { stiffness: 45, damping: 25 });
  const looks = settings.hero_image_url ? [{ src: settings.hero_image_url, alt: settings.hero_headline }] : campaign;

  useEffect(() => {
    if (reduced) pointer.set(0);
  }, [reduced, pointer]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || hovered || !visible || looks.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(i => (i + 1) % looks.length);
    }, 11000);
    return () => window.clearInterval(timer);
  }, [reduced, paused, hovered, visible, looks.length]);

  const reveal = (delay: number) => ({
    initial: reduced ? false as const : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease },
  });

  return (
    <section ref={ref} aria-label="DEXTER fashion campaign" className="fashion-hero"
      onPointerMove={e => {
        if (reduced || e.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        pointer.set(((e.clientX - bounds.left) / bounds.width - 0.5) * 8);
      }}
      onPointerLeave={() => { pointer.set(0); setHovered(false); }}
      onPointerEnter={e => { if (e.pointerType === "mouse") setHovered(true); }}
    >
      <motion.div className="fashion-hero-photos" style={{ x: reduced ? 0 : x }}
        initial={reduced ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduced ? 0 : 1.25, ease }}>
        {looks.map((look, i) => (
          <div key={look.src} className={`fashion-hero-look ${i === index % looks.length ? "is-active" : ""}`}>
            <picture>
              {!settings.hero_image_url && <source media="(max-width: 767px)" srcSet={i === 0 ? "/src/assets/dexter-editorial-shirt-mobile.webp" : "/src/assets/dexter-editorial-jacket-mobile.webp"} />}
              <img src={look.src} alt={look.alt} width={1920} height={1024}
                loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} decoding="async" />
            </picture>
          </div>
        ))}
      </motion.div>

      <div className="fashion-hero-content container-px">
        <motion.img {...reveal(0.1)} src={logo} alt="DEXTER" className="fashion-hero-logo" />
        <motion.h1 {...reveal(0.22)} className="fashion-hero-heading">{settings.hero_headline}</motion.h1>
        <motion.p {...reveal(0.34)} className="fashion-hero-description">{settings.hero_subtext}</motion.p>
        <motion.div {...reveal(0.46)} className="fashion-hero-actions">
          <Button asChild size="lg" className="fashion-shop-button">
            <Link to="/shop">Shop Collection <ArrowRight /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="fashion-contact-button">
            <a href="tel:08925259787"><Phone /> 089252 59787</a>
          </Button>
        </motion.div>
      </div>

      {looks.length > 1 && <div className="fashion-hero-controls">
        {looks.map((look, i) => <Button key={look.src} variant="ghost" size="icon"
          aria-label={`Show fashion look ${i + 1}`} aria-pressed={index === i}
          className={`fashion-look-control ${index === i ? "is-current" : ""}`}
          onClick={() => { setIndex(i); setPaused(true); }}><span /></Button>)}
        <Button variant="ghost" size="icon" title={paused ? "Play fashion looks" : "Pause fashion looks"}
          aria-label={paused ? "Play fashion looks" : "Pause fashion looks"}
          onClick={() => setPaused(p => !p)}>{paused ? <Play /> : <Pause />}</Button>
      </div>}
    </section>
  );
};
export default FashionHero;