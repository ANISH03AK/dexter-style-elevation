import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [loaded, setLoaded] = useState(false);
  const wished = has(product.id);

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const savings = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;

  return (
    <div className="group relative animate-fade-in">
      {/* Glow ring on hover */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-gold via-red-cta to-gold opacity-0 group-hover:opacity-70 blur-md transition-all duration-500 -z-10" />

      <div className="relative rounded-xl overflow-hidden bg-secondary shadow-card group-hover:shadow-elevated transition-all duration-500 ease-out group-hover:-translate-y-1.5">
        <Link to={`/product/${product.id}`} className="block overflow-hidden aspect-[4/5] relative bg-gradient-to-br from-secondary via-muted to-secondary">
          {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.12] group-hover:rotate-[0.5deg] ${loaded ? "opacity-100" : "opacity-0"}`}
          />

          {/* Sheen sweep */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />

          {/* Bottom fade for text/CTAs */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges (top-left stack) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {product.tag && (
              <span className="backdrop-blur-md bg-ink/85 text-primary-foreground text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full shadow-lg">
                {product.tag}
              </span>
            )}
            {product.badgeText && (
              <span className="bg-gradient-to-r from-red-cta to-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                {product.badgeText}
              </span>
            )}
          </div>

          {/* Discount ribbon (top-right) */}
          {savings > 0 && (
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
              <span className="bg-gradient-to-br from-gold via-yellow-400 to-gold text-ink text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-gold animate-pulse-gold">
                {discount}% OFF
              </span>
              <span className="backdrop-blur bg-red-cta/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Save ₹{savings}
              </span>
            </div>
          )}

          {/* Floating action buttons (right rail) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10">
            <button
              onClick={(e) => { e.preventDefault(); toggle(product); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
              className={`h-10 w-10 grid place-items-center bg-white/95 backdrop-blur rounded-full shadow-lg transition-all duration-200 hover:bg-gold hover:scale-110 active:scale-95 ${wished ? "text-red-cta" : "text-ink"}`}
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="h-10 w-10 grid place-items-center bg-white/95 backdrop-blur rounded-full shadow-lg text-ink hover:bg-gold hover:scale-110 transition-all duration-200"
              aria-label="View"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Add bar */}
          <button
            onClick={(e) => { e.preventDefault(); add(product); toast.success(`${product.name} added to cart`); }}
            className="absolute bottom-0 inset-x-0 bg-ink text-primary-foreground text-xs uppercase tracking-[0.22em] font-semibold py-3.5 translate-y-full group-hover:translate-y-0 transition-all duration-500 hover:bg-gold hover:text-ink active:bg-red-cta active:text-white flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
          </button>
        </Link>

        {/* Info panel */}
        <div className="p-4 bg-background">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">{product.category}</p>
            {product.rating && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">
                {product.rating} <Star className="h-2.5 w-2.5 fill-current" />
              </span>
            )}
          </div>
          <Link to={`/product/${product.id}`} className="block mt-1.5 text-sm font-semibold hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </Link>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <p className="text-base font-bold text-ink">{formatINR(product.price)}</p>
            {product.mrp && product.mrp > product.price && (
              <>
                <p className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</p>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          {product.reviews != null && (
            <p className="mt-1 text-[10px] text-muted-foreground">({product.reviews.toLocaleString("en-IN")} reviews)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
