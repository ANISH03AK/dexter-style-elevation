import { Link, NavLink } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/context/WishlistContext";
import dexterLogo from "@/assets/dexter-logo.png";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";

const leftLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?cat=Shirts", label: "Shirts" },
  { to: "/shop?cat=T-Shirts", label: "T-Shirts" },
];

const rightLinks = [
  { to: "/shop?cat=Pants", label: "Pants" },
  { to: "/shop?cat=Activewear", label: "Activewear" },
  { to: "/contact", label: "Contact" },
];

const allLinks = [...leftLinks, ...rightLinks, { to: "/about", label: "About" }];

const Navbar = () => {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    // NOT sticky / NOT fixed — scrolls naturally up and out of view
    <header className="relative z-40 bg-white text-foreground border-b border-border shadow-sm">
      {/* Announcement strip */}
      <div className="bg-ink text-primary-foreground text-[10px] sm:text-[11px] tracking-[0.2em] uppercase py-1.5 sm:py-2 text-center px-2 font-semibold">
        Visit our store — Anna Silai, Jayankondam · <span className="text-gold">Call 089252 59787</span>
      </div>

      {/* Main navbar row */}
      <div className="container-px mx-auto max-w-[1400px] grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-28 sm:h-32 lg:h-40">
        {/* LEFT */}
        <div className="flex items-center gap-5 min-w-0">
          <button
            className="lg:hidden p-1.5 -ml-1.5 shrink-0 text-foreground"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <nav className="hidden lg:flex items-center gap-6 text-[12px] uppercase tracking-[0.18em] font-bold text-foreground">
            <div className="group relative py-6 -my-6">
              <button className="link-underline inline-flex items-center gap-1 hover:text-red-cta transition-colors">
                Categories <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform" />
              </button>
              <MegaMenu />
            </div>
            {leftLinks.map(l => (
              <NavLink key={l.label} to={l.to} className="link-underline hover:text-red-cta transition-colors">
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* CENTER — significantly larger Dexter logo */}
        <Link to="/" aria-label="DEXTER MENS CLOTHING home" className="flex items-center justify-center shrink-0">
          <img
            src={dexterLogo}
            alt="DEXTER MENS CLOTHING"
            className="h-24 sm:h-28 lg:h-36 w-auto object-contain drop-shadow-sm"
          />
        </Link>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-5">
          <nav className="hidden lg:flex items-center gap-6 text-[12px] uppercase tracking-[0.18em] font-bold text-foreground">
            {rightLinks.map(l => (
              <NavLink key={l.label} to={l.to} className="link-underline hover:text-red-cta transition-colors">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-foreground">
            <button onClick={() => setSearchOpen(s => !s)} aria-label="Search" className="hover:text-red-cta transition-smooth">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/auth" aria-label="Account" className="hidden sm:block hover:text-red-cta transition-smooth">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-red-cta transition-smooth">
              <Heart className="h-[18px] w-[18px]" />
              {wishCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-red-cta text-white text-[10px] font-bold flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative hover:text-red-cta transition-smooth">
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

      {/* Mobile slide-in drawer (max 300px) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <img src={dexterLogo} alt="DEXTER" className="h-10 w-auto object-contain" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1 text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              {allLinks.map(l => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-foreground hover:bg-muted hover:text-red-cta border-b border-border/50"
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/wishlist" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-foreground hover:bg-muted hover:text-red-cta border-b border-border/50">
                Wishlist
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-red-cta hover:bg-muted border-b border-border/50">
                  Admin Dashboard
                </Link>
              )}
              {user ? (
                <button
                  onClick={async () => { await signOut(); setOpen(false); }}
                  className="block w-full text-left px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-foreground hover:bg-muted hover:text-red-cta"
                >
                  Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-foreground hover:bg-muted hover:text-red-cta">
                  Sign In
                </Link>
              )}
            </nav>
            <a href="tel:08925259787" className="block text-center bg-red-cta text-white py-3.5 text-xs uppercase tracking-[0.25em] font-bold">
              Call Store
            </a>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
