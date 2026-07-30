import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/context/WishlistContext";
import dexterLogo from "@/assets/dexter-logo.png";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";

const EASE = [0.22, 1, 0.36, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
};


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
  const navigate = useNavigate();
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
            <MotionToggle className="hidden sm:inline-flex" />

            {user ? (
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                aria-label="Sign out"
                title="Sign out"
                className="hidden sm:block hover:text-red-cta transition-smooth"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            ) : (
              <Link to="/auth" aria-label="Account" className="hidden sm:block hover:text-red-cta transition-smooth">
                <User className="h-[18px] w-[18px]" />
              </Link>
            )}

            <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-red-cta transition-smooth hover:scale-110 active:scale-90 duration-200">
              <Heart className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {wishCount > 0 && (
                  <motion.span
                    key={wishCount}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-red-cta text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {wishCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative hover:text-red-cta transition-smooth hover:scale-110 active:scale-90 duration-200">
              <ShoppingBag className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0, y: -6, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 20 }}
                    className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <SearchBar onClose={() => setSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute top-0 left-0 h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <img src={dexterLogo} alt="DEXTER" className="h-10 w-auto object-contain" />
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1 text-foreground hover:rotate-90 transition-transform duration-300">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <motion.nav
                className="flex-1 overflow-y-auto py-3"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } }}
              >
                {allLinks.map(l => (
                  <motion.div key={l.label} variants={itemVariants}>
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-foreground hover:bg-muted hover:text-red-cta hover:pl-7 transition-all duration-300 border-b border-border/50"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div variants={itemVariants}>
                  <Link to="/wishlist" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-foreground hover:bg-muted hover:text-red-cta hover:pl-7 transition-all duration-300 border-b border-border/50">
                    Wishlist
                  </Link>
                </motion.div>
                {isAdmin && (
                  <motion.div variants={itemVariants}>
                    <Link to="/admin" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm uppercase tracking-[0.18em] font-bold text-red-cta hover:bg-muted border-b border-border/50">
                      Admin Dashboard
                    </Link>
                  </motion.div>
                )}
                <motion.div variants={itemVariants}>
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
                </motion.div>
              </motion.nav>
              <a href="tel:08925259787" className="block text-center bg-red-cta text-white py-3.5 text-xs uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-ink transition-colors">
                Call Store
              </a>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Navbar;
