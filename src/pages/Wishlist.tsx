import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

const Wishlist = () => {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Saved For Later</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">My Wishlist</h1>
          <p className="mt-2 text-sm text-muted-foreground">{items.length} item{items.length !== 1 && "s"}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-border rounded-md">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Your wishlist is empty.</p>
            <Link to="/shop" className="inline-block bg-ink text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em]">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {items.map(p => (
              <div key={p.id} className="group animate-fade-in">
                <Link to={`/product/${p.id}`} className="block aspect-[4/5] overflow-hidden bg-secondary rounded-md">
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </Link>
                <div className="pt-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.category}</p>
                  <Link to={`/product/${p.id}`} className="block text-sm font-medium line-clamp-1 hover:text-gold">{p.name}</Link>
                  <p className="text-sm font-semibold mt-1">{formatINR(p.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { add(p); toast.success("Added to cart"); }}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-ink text-primary-foreground text-[11px] uppercase tracking-[0.2em] py-2.5 hover:bg-gold hover:text-ink transition-smooth"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add
                    </button>
                    <button
                      onClick={() => { remove(p.id); toast.success("Removed"); }}
                      className="h-9 w-9 grid place-items-center border border-border hover:border-foreground"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Wishlist;
