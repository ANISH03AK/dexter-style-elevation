import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-secondary aspect-[4/5] relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-smooth duration-700 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute top-3 left-3 bg-ink text-primary-foreground text-[10px] tracking-[0.18em] uppercase px-2.5 py-1">
            {product.tag}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toast.success("Added to wishlist"); }}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-smooth hover:text-gold"
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); add(product); toast.success(`${product.name} added to cart`); }}
          className="absolute bottom-0 inset-x-0 bg-ink text-primary-foreground text-xs uppercase tracking-[0.2em] py-3.5 translate-y-full group-hover:translate-y-0 transition-smooth"
        >
          Quick Add
        </button>
      </Link>
      <div className="pt-4 pb-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
        <Link to={`/product/${product.id}`} className="block mt-1 text-sm font-medium hover:text-gold transition-smooth">
          {product.name}
        </Link>
        <p className="mt-1 text-sm font-semibold">{formatINR(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
