import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import dexterLogo from "@/assets/dexter-logo.png";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=Shirts", label: "Shirts" },
  { to: "/shop?cat=T-Shirts", label: "T-Shirts" },
  { to: "/shop?cat=Jeans", label: "Jeans" },
  { to: "/shop?cat=Jackets", label: "Jackets" },
];

const Navbar = () => {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-smooth",
      scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
    )}>
      {/* announcement */}
      <div className="bg-ink text-primary-foreground text-[11px] tracking-[0.2em] uppercase py-2 text-center">
        Free shipping worldwide on orders over <span className="text-gold">$150</span>
      </div>

      <div className="container-px mx-auto max-w-[1400px] flex items-center justify-between h-16">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" aria-label="DEXTER home" className="flex items-center">
          <img src={dexterLogo} alt="DEXTER Men's Clothing" className="h-10 sm:h-12 w-auto object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.18em] font-medium">
          {links.map(l => (
            <NavLink key={l.label} to={l.to} className="link-underline text-foreground/80 hover:text-foreground">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(s => !s)} aria-label="Search" className="hidden sm:block hover:text-gold transition-smooth">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link to="/auth" aria-label="Account" className="hover:text-gold transition-smooth">
            <User className="h-[18px] w-[18px]" />
          </Link>
          <button aria-label="Wishlist" className="hover:text-gold transition-smooth">
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <Link to="/cart" aria-label="Cart" className="relative hover:text-gold transition-smooth">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background animate-fade-in">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearchOpen(false); navigate("/shop"); }}
            className="container-px mx-auto max-w-[1400px] py-4 flex items-center gap-3"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input autoFocus placeholder="Search for products, brands and more..." className="flex-1 bg-transparent outline-none text-sm" />
            <button onClick={() => setSearchOpen(false)} type="button"><X className="h-4 w-4" /></button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[80%] max-w-xs bg-background p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <img src={dexterLogo} alt="DEXTER" className="h-9 w-auto object-contain" />
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-5 text-sm uppercase tracking-[0.2em]">
              {links.map(l => (
                <Link key={l.label} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
