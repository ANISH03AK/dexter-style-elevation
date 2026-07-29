import { ReactNode, forwardRef } from "react";
import { motion } from "framer-motion";

const easing = [0.22, 1, 0.36, 1] as const;

/** Cinematic route transition wrapper. */
const PageTransition = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
    transition={{ duration: 0.5, ease: easing }}
    className="will-change-transform"
  >
    {children}
  </motion.div>
));
PageTransition.displayName = "PageTransition";

export default PageTransition;
