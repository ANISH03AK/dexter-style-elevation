import { ReactNode, useRef, useState, CSSProperties } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  strength?: number;
  style?: CSSProperties;
};

/**
 * Magnetic hover: element is subtly pulled toward the cursor.
 * Falls back to no movement on touch / reduced-motion.
 */
const Magnetic = ({ children, className = "", strength = 0.35, style }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    setT({ x, y });
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{
        ...style,
        transform: `translate3d(${t.x}px, ${t.y}px, 0)`,
        transition: t.x === 0 && t.y === 0 ? "transform .5s cubic-bezier(.22,1,.36,1)" : "transform .12s ease-out",
      }}
      className={`inline-flex will-change-transform motion-reduce:!transform-none ${className}`}
    >
      {children}
    </span>
  );
};

export default Magnetic;
