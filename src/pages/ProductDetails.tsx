import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, Minus, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

const sizes = ["S", "M", "L", "XL"];

const reviews = [
  { name: "Marcus L.", rating: 5, date: "2 days ago", text: "The fit and feel are extraordinary. Worth every penny." },
  { name: "Jordan K.", rating: 5, date: "1 week ago", text: "Easily the most premium piece in my wardrobe right now." },
  { name: "Alex R.", rating: 4, date: "3 weeks ago", text: "Beautiful craftsmanship. Sizing runs slightly large." },
];

const ProductDetails = () => {
  const { id } = useParams();
  const { getProduct, products } = useProducts();
  const product = getProduct(id || "");
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  if (!product) return <Layout><div className="container-px py-32 text-center">Product not found.</div></Layout>;

  const gallery = [product.image, product.image, product.image];

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-8">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          <Link to="/" className="link-underline">Home</Link> / <Link to="/shop" className="link-underline">Shop</Link> / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="flex flex-col gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-[4/5] bg-secondary overflow-hidden border-2 transition-smooth ${activeImg === i ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={g} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="aspect-[4/5] bg-secondary overflow-hidden">
              <img src={gallery[activeImg]} alt={product.name} className="w-full h-full object-cover animate-fade-in" />
            </div>
          </div>

          {/* Details */}
          <div className="lg:pt-4">
            {product.tag && (
              <span className="inline-block bg-gold text-ink text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 mb-4">{product.tag}</span>
            )}
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.category}</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <span className="text-xs text-muted-foreground">128 reviews</span>
            </div>
            <div className="mt-6 flex items-baseline gap-3 flex-wrap">
              <p className="text-3xl font-semibold">{formatINR(product.price)}</p>
              {product.mrp && product.mrp > product.price && (
                <>
                  <p className="text-lg text-muted-foreground line-through">{formatINR(product.mrp)}</p>
                  <span className="text-xs font-semibold text-gold uppercase tracking-wider bg-gold/10 px-2 py-1">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% Off
                  </span>
                </>
              )}
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold">Size</span>
                <button className="text-xs underline text-muted-foreground">Size guide</button>
              </div>
              <div className="flex gap-2">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-12 w-12 border text-sm font-medium transition-smooth ${size === s ? "bg-ink text-primary-foreground border-ink" : "border-border hover:border-foreground"}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-stretch gap-3">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-12 grid place-items-center hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-12 w-12 grid place-items-center hover:bg-secondary"><Plus className="h-4 w-4" /></button>
              </div>
              <button
                onClick={() => { for (let i = 0; i < qty; i++) add(product, size); toast.success(`${product.name} added to cart`); }}
                className="flex-1 bg-ink text-primary-foreground text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={() => { toggle(product); toast.success(has(product.id) ? "Removed from wishlist" : "Added to wishlist"); }}
                className={`h-12 w-12 grid place-items-center border border-border hover:border-foreground transition-smooth ${has(product.id) ? "text-gold border-gold" : ""}`}
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 ${has(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-xs">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "30-Day Returns" },
                { icon: ShieldCheck, label: "Authentic" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="border border-border p-4 text-center">
                  <Icon className="h-5 w-5 mx-auto text-gold mb-2" />
                  <p className="uppercase tracking-[0.15em]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-24 border-t border-border pt-16">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Customer Reviews</h2>
            <button className="text-xs uppercase tracking-[0.25em] border border-border px-5 py-3 hover:bg-ink hover:text-primary-foreground transition-smooth">Write a Review</button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="border border-border p-6 hover-lift">
                <div className="flex text-gold mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed">"{r.text}"</p>
                <div className="mt-5 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <span>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        <RelatedProducts currentId={product.id} category={product.category} all={products} />

      </section>
    </Layout>
  );
};

export default ProductDetails;
