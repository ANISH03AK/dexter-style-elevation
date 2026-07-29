import { useCallback, useState } from "react";

type Drop = { id: number; x: number; y: number; size: number };

/**
 * Tactile ripple on click. Spread `bind` onto a `relative overflow-hidden`
 * element and render `ripples` inside it.
 */
export const useRipple = () => {
  const [drops, setDrops] = useState<Drop[]>([]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const id = Date.now() + Math.random();
    setDrops((d) => [...d, { id, x: e.clientX - r.left, y: e.clientY - r.top, size }]);
    window.setTimeout(() => setDrops((d) => d.filter((x) => x.id !== id)), 650);
  }, []);

  const ripples = (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-current opacity-25 animate-ripple"
          style={{ left: d.x - d.size / 2, top: d.y - d.size / 2, width: d.size, height: d.size }}
        />
      ))}
    </span>
  );

  return { bind: { onPointerDown }, ripples };
};

export default useRipple;
