import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export type MotionMode = "full" | "reduced";

const STORAGE_KEY = "dexter:motion-preference";

type Ctx = {
  mode: MotionMode;
  reduced: boolean;
  /** true when the mode came from the OS setting rather than an explicit choice */
  isSystemDefault: boolean;
  setMode: (m: MotionMode) => void;
  toggle: () => void;
};

const MotionPreferenceContext = createContext<Ctx | undefined>(undefined);

const systemPrefersReduced = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const readStored = (): MotionMode | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "full" || v === "reduced" ? v : null;
  } catch {
    return null;
  }
};

export const MotionPreferenceProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = useState<MotionMode | null>(() => readStored());
  const [systemReduced, setSystemReduced] = useState(() => systemPrefersReduced());

  // Follow the OS setting while the user hasn't made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const mode: MotionMode = stored ?? (systemReduced ? "reduced" : "full");
  const reduced = mode === "reduced";

  // Expose the preference to CSS so non-framer animations can opt out too.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", reduced);
    root.dataset.motion = mode;
  }, [mode, reduced]);

  const setMode = useCallback((m: MotionMode) => {
    setStored(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* storage unavailable — preference stays for this session */
    }
  }, []);

  const toggle = useCallback(() => setMode(reduced ? "full" : "reduced"), [reduced, setMode]);

  const value = useMemo<Ctx>(
    () => ({ mode, reduced, isSystemDefault: stored === null, setMode, toggle }),
    [mode, reduced, stored, setMode, toggle]
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionPreferenceContext.Provider>
  );
};

export const useMotionPreference = () => {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx) throw new Error("useMotionPreference must be used within MotionPreferenceProvider");
  return ctx;
};
