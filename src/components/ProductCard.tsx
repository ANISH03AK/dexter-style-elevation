import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [loaded, setLoaded] = useState(false);
  const wished = has(product.id);
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const savings = product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;

  return (
    <article className="product-editorial-card group">
      <div className="aspect-[4/5] relative overflow-hidden bg-secondary">
        <Link to={`/product/${product.id}`} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          {!loaded && <div className="absolute inset-0 skeleton-shimmer" />}
          <img src={product.image} alt={product.name} loading="lazy" decoding="async"
            onLoad={() => setLoaded(true)}
            className={`product-editorial-image w-full h-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`} />
        </Link>
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start gap-1 pointer-events-none">
          <div className="flex flex-col items-start gap-1">
            {product.tag && <span className="bg-ink text-primary-foreground text-[9px] font-semibold px-2 py-1 rounded-sm">{product.tag}</span>}
            {product.badgeText && <span className="product-editorial-badge text-[9px] font-semibold px-2 py-1 rounded-sm">{product.badgeText}</span>}
          </div>
          {savings > 0 && <span className="product-editorial-offer text-[9px] font-bold px-2 py-1 rounded-sm whitespace-nowrap">SAVE ₹{savings}</span>}
        </div>
        <div className="product-editorial-actions">
          <Button variant="ghost" size="icon" aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wished} title={wished ? "Remove from wishlist" : "Save to wishlist"}
            onClick={() => { toggle(product); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}>
            <Heart className={wished ? "fill-current text-red-cta" : ""} />
          </Button>
          <Button asChild variant="ghost" size="icon" title="View product details">
            <Link to={`/product/${product.id}`} aria-label={`Details for ${product.name}`}><Eye /></Link>
          </Button>
        </div>
        <Button className="product-editorial-quickadd" onClick={() => { add(product); toast.success(`${product.name} added to cart`); }}
          aria-label={`Add ${product.name} to cart`}><ShoppingBag /> Quick Add</Button>
      </div>
      <div className="p-3 sm:p-4 bg-card">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] text-muted-foreground font-semibold">{product.category}</p>
          {product.rating && <span className="product-editorial-rating inline-flex items-center gap-1 text-[10px] font-semibold">{product.rating}<Star className="h-2.5 w-2.5 fill-current" /></span>}
        </div>
        <Link to={`/product/${product.id}`} className="block mt-1.5 text-sm font-semibold hover:text-red-cta transition-colors line-clamp-2 min-h-[40px]">{product.name}</Link>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <p className="text-base font-bold text-foreground">{formatINR(product.price)}</p>
          {discount > 0 && <><p className="text-xs text-muted-foreground line-through">{formatINR(product.mrp ?? 0)}</p><span className="product-editorial-discount text-[10px] font-bold">{discount}% off</span></>}
        </div>
        {product.reviews != null && <p className="mt-1 text-[10px] text-muted-foreground">({product.reviews.toLocaleString("en-IN")} reviews)</p>}
      </div>
    </article>
  );
};
export default ProductCard;
