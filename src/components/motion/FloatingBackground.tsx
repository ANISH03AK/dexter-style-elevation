/** Ambient floating orbs — layered depth behind sections. */
const FloatingBackground = ({ className = "" }: { className?: string }) => (
  <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <span className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-red-cta/10 blur-3xl animate-float-slow" />
    <span className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl animate-float-slower" />
    <span className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gold/[0.07] blur-3xl animate-float-slow" />
  </div>
);

export default FloatingBackground;
