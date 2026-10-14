import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dexterLogo from "@/assets/dexter-logo.png";

const SESSION_KEY = "dexter:intro-shown";

/** Luxury first-visit loading curtain with logo reveal + progress line. */
const LoadingScreen = () => {
  const [show, setShow] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    let p = 0;
    const int = window.setInterval(() => {
      p = Math.min(100, p + Math.random() * 18 + 6);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(int);
        window.setTimeout(() => {
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
          setShow(false);
        }, 420);
      }
    }, 160);
    return () => {
      window.clearInterval(int);
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="curtain"
          className="fixed inset-0 z-[200] grid place-items-center bg-ink"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(600px_circle_at_50%_40%,hsl(var(--gold)/0.18),transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-8 px-8">
            <motion.img
              src={dexterLogo}
              alt="DEXTER MENS CLOTHING"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="w-[220px] sm:w-[300px] h-auto object-contain"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-[10px] uppercase tracking-[0.5em] text-white/60 font-bold"
            >
              Jayankondam · Est. Style
            </motion.p>
            <div className="w-56 h-px bg-white/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-cta via-gold to-red-cta transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
