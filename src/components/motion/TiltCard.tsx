import { ReactNode, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  max?: number;
  /** show a soft moving glare */
  glare?: boolean;
};

/**
 * 3D card tilt with depth + optional glare highlight.
 * Children can use `[transform:translateZ(40px)]` for parallax depth layers.
 */
const TiltCard = ({ children, className = "", max = 8, glare = true }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setPos({ x: px * 100, y: py * 100 });
    setRot({ x: (0.5 - py) * max * 2, y: (px - 0.5) * max * 2 });
  };

  const reset = () => {
    setActive(false);
    setRot({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setActive(true)}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ perspective: "1200px" }}
      className={className}
    >
      <div
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${active ? 1.02 : 1})`,
          transformStyle: "preserve-3d",
          transition: active
            ? "transform .12s ease-out"
            : "transform .7s cubic-bezier(.22,1,.36,1)",
        }}
        className="relative will-change-transform motion-reduce:!transform-none"
      >
        {children}
        {glare && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500"
            style={{
              opacity: active ? 0.5 : 0,
              background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, hsl(var(--gold) / 0.22), transparent 45%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TiltCard;
