import { Link, NavLink } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import dexterLogo from "@/assets/dexter-logo.png";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";

const leftLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=Shirts", label: "Shirts" },
  { to: "/shop?cat=T-Shirts", label: "T-Shirts" },
];

const rightLinks = [
  { to: "/shop?cat=Jeans", label: "Jeans" },
  { to: "/shop?cat=Jackets", label: "Jackets" },
  { to: "/about", label: "About" },
];

const allLinks = [...leftLinks, ...rightLinks];

const Navbar = () => {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-smooth bg-white text-ink border-b border-border",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      {/* Announcement strip */}
      <div className="bg-ink text-primary-foreground text-[10px] sm:text-[11px] tracking-[0.2em] uppercase py-1.5 sm:py-2 text-center px-2">
        Free shipping across India on orders over <span className="text-gold">₹12,500</span>
      </div>

      {/* Main navbar row */}
      <div className="container-px mx-auto max-w-[1400px] grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-24 sm:h-28 lg:h-32">
        {/* LEFT: mobile menu button + desktop nav */}
        <div className="flex items-center gap-5 min-w-0">
          <button
            className="lg:hidden p-1.5 -ml-1.5 shrink-0"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="hidden lg:flex items-center gap-5 text-[12px] uppercase tracking-[0.18em] font-medium">
            <div className="group relative py-6 -my-6">
              <button className="link-underline text-ink/80 hover:text-gold inline-flex items-center gap-1 transition-colors">
                Categories <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform" />
              </button>
              <MegaMenu />
            </div>
            {leftLinks.map(l => (
              <NavLink key={l.label} to={l.to} className="link-underline text-ink/80 hover:text-gold transition-colors">
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* CENTER: logo */}
        <Link to="/" aria-label="DEXTER home" className="flex items-center justify-center shrink-0">
          <img
            src={dexterLogo}
            alt="DEXTER"
            className="h-20 sm:h-24 lg:h-32 w-auto object-contain"
          />
        </Link>

        {/* RIGHT: nav + icons */}
        <div className="flex items-center justify-end gap-5">
          <nav className="hidden lg:flex items-center gap-5 text-[12px] uppercase tracking-[0.18em] font-medium">
            {rightLinks.map(l => (
              <NavLink key={l.label} to={l.to} className="link-underline text-ink/80 hover:text-gold transition-colors">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
      </div>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}

      {/* Mobile slide-in menu (80% width) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[80%] max-w-[320px] bg-white shadow-xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <img src={dexterLogo} alt="DEXTER" className="h-9 w-auto object-contain" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              {allLinks.map(l => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 text-sm uppercase tracking-[0.18em] text-ink/85 hover:bg-muted hover:text-gold border-b border-border/50"
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/wishlist" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] text-ink/85 hover:bg-muted hover:text-gold border-b border-border/50">
                Wishlist
              </Link>
              <Link to="/auth" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] text-ink/85 hover:bg-muted hover:text-gold">
                Account
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
