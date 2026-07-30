import { Sparkles, Gauge } from "lucide-react";
import { useMotionPreference } from "@/context/MotionPreferenceContext";

type Props = { className?: string; withLabel?: boolean };

/** Lets visitors switch between full cinematic motion and reduced motion. */
const MotionToggle = ({ className = "", withLabel = false }: Props) => {
  const { reduced, toggle } = useMotionPreference();
  const label = reduced ? "Enable full animations" : "Reduce animations";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!reduced}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-2 min-h-11 min-w-11 justify-center transition-smooth hover:text-red-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md ${className}`}
    >
      {reduced ? <Gauge className="h-[18px] w-[18px]" /> : <Sparkles className="h-[18px] w-[18px]" />}
      {withLabel && (
        <span className="text-[11px] uppercase tracking-[0.18em] font-bold">
          {reduced ? "Reduced motion" : "Full motion"}
        </span>
      )}
    </button>
  );
};

export default MotionToggle;
