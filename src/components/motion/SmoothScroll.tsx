import { useEffect } from "react";
import Lenis from "lenis";
import { useMotionPreference } from "@/context/MotionPreferenceContext";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Cinematic smooth scrolling (disabled when the visitor chose reduced motion
 * and on coarse touch pointers where native momentum feels better).
 */
const SmoothScroll = () => {
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;


    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
};

export default SmoothScroll;
