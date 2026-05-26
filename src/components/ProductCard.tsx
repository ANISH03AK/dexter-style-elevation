import { Heart, Star } from "lucide-react";
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

  return (
    <div className="group relative animate-fade-in">
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-secondary aspect-[4/5] relative rounded-md">
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {product.tag && (
          <span className="absolute top-3 left-3 bg-ink text-primary-foreground text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-sm shadow-lg">
            {product.tag}
          </span>
        )}
        {product.mrp && product.mrp > product.price && (
          <span className="absolute top-3 right-3 bg-gold text-ink text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-gold animate-scale-in">
            Offer · {discount}% Off
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
          className={`absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/90 backdrop-blur rounded-full transition-colors duration-200 hover:text-gold ${wished ? "text-gold" : ""} ${discount > 30 ? "top-12" : ""}`}
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); add(product); toast.success(`${product.name} added to cart`); }}
          className="absolute bottom-0 inset-x-0 bg-ink text-primary-foreground text-xs uppercase tracking-[0.2em] py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 hover:bg-gold hover:text-ink"
        >
          Quick Add
        </button>
      </Link>
      <div className="pt-4 pb-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
        <Link to={`/product/${product.id}`} className="block mt-1 text-sm font-medium hover:text-gold transition-smooth line-clamp-1">
          {product.name}
        </Link>
        {product.rating && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm font-semibold">
              {product.rating} <Star className="h-2.5 w-2.5 fill-current" />
            </span>
            <span>({product.reviews?.toLocaleString("en-IN")})</span>
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{formatINR(product.price)}</p>
          {product.mrp && product.mrp > product.price && (
            <>
              <p className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</p>
              <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">
                {discount}% Off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
