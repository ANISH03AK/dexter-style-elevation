import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import dexterLogo from "@/assets/dexter-logo.png";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=Shirts", label: "Shirts" },
  { to: "/shop?cat=T-Shirts", label: "T-Shirts" },
  { to: "/shop?cat=Jeans", label: "Jeans" },
  { to: "/shop?cat=Jackets", label: "Jackets" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
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
      <div className="bg-ink text-primary-foreground text-[11px] tracking-[0.2em] uppercase py-2 text-center">
        Free shipping across India on orders over <span className="text-gold">₹12,500</span>
      </div>

      <div className="container-px mx-auto max-w-[1400px] flex items-center justify-between h-16">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" aria-label="DEXTER home" className="flex items-center">
          <img src={dexterLogo} alt="DEXTER" className="h-14 sm:h-16 lg:h-20 w-auto object-contain drop-shadow-[0_2px_12px_hsl(var(--gold)/0.4)] hover:scale-105 transition-transform duration-300" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.18em] font-medium">
          <div className="group relative">
            <button className="link-underline text-foreground/80 hover:text-foreground inline-flex items-center gap-1">
              Categories <ChevronDown className="h-3 w-3" />
            </button>
            <MegaMenu />
          </div>
          {links.map(l => (
            <NavLink key={l.label} to={l.to} className="link-underline text-foreground/80 hover:text-foreground">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(s => !s)} aria-label="Search" className="hover:text-gold transition-smooth">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link to="/auth" aria-label="Account" className="hidden sm:block hover:text-gold transition-smooth">
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-gold transition-smooth">
            <Heart className="h-[18px] w-[18px]" />
            {wishCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
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

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[80%] max-w-xs bg-background p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <img src={dexterLogo} alt="DEXTER" className="h-8 w-auto object-contain" />
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-5 text-sm uppercase tracking-[0.2em]">
              {links.map(l => (
                <Link key={l.label} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
              ))}
              <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
              <Link to="/auth" onClick={() => setOpen(false)}>Account</Link>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
