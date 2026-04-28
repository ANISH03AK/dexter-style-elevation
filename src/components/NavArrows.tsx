import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NavArrows = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const btn =
    "h-7 w-7 grid place-items-center rounded-full bg-background/90 backdrop-blur border border-border shadow-[0_2px_8px_-2px_hsl(var(--gold)/0.35)] hover:bg-gold hover:text-ink hover:scale-105 active:scale-95 transition-all";

  return (
    <div className="fixed top-[44px] left-1 sm:left-1.5 z-[60] flex items-center gap-1">
      <button
        aria-label="Go back"
        onClick={() => navigate(-1)}
        disabled={isHome}
        className={cn(btn, isHome && "opacity-40 cursor-not-allowed hover:bg-background/90 hover:text-foreground hover:scale-100")}
      >
        <ArrowLeft className="h-3 w-3" />
      </button>
      <button
        aria-label="Go forward"
        onClick={() => navigate(1)}
        className={btn}
      >
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

export default NavArrows;
