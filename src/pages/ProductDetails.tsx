import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product, Category } from "@/data/products";

const RelatedProducts = ({ currentId, category, all }: { currentId: string; category: Category; all: Product[] }) => {
  const [expanded, setExpanded] = useState(false);
  const sameCat = all.filter(p => p.id !== currentId && p.category === category);
  const others = all.filter(p => p.id !== currentId && p.category !== category);
  const related = [...sameCat, ...others];
  const initial = related.slice(0, 4);
  const more = related.slice(4, 16);

  return (
    <div className="mt-24">
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-10">Related Products</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
        {initial.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {expanded && (
        <div className="mt-10 flex flex-col gap-6 animate-fade-in">
          {more.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} className="group flex gap-4 md:gap-6 border border-border p-3 md:p-4 hover:border-foreground transition-smooth">
              <div className="w-28 h-32 md:w-40 md:h-48 bg-secondary overflow-hidden flex-shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-smooth" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.category}</p>
                <h3 className="font-display text-base md:text-xl font-semibold mt-1 truncate">{p.name}</h3>
                <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                  <span className="font-semibold">{formatINR(p.price)}</span>
                  {p.mrp && p.mrp > p.price && (
                    <span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>
                  )}
                </div>
                {p.tag && <span className="mt-2 inline-block w-fit bg-gold text-ink text-[9px] uppercase tracking-[0.2em] px-2 py-0.5">{p.tag}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {more.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-2 border border-border px-8 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-ink hover:text-primary-foreground transition-smooth"
          >
            {expanded ? "Show Less" : "More"}
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
};

import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, Minus, Plus, Zap, X, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { useEffect } from "react";

const sizes = ["S", "M", "L", "XL"];

const fallbackReviews = [
  { id: "1", author_name: "Karthik R.", rating: 5, created_at: "2 days ago", body: "The fit and feel are extraordinary. Fabric quality is unmatched." },
  { id: "2", author_name: "Suresh M.", rating: 5, created_at: "1 week ago", body: "Easily the most premium piece in my wardrobe right now. Fast dispatch." },
  { id: "3", author_name: "Vignesh P.", rating: 4, created_at: "3 weeks ago", body: "Beautiful craftsmanship. Sizing runs true to size." },
];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProduct, products } = useProducts();
  const product = getProduct(id || "");
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState({ x: 50, y: 50 });
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  // Real reviews
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", location: "Jayankondam", rating: 5, body: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", id)
          .eq("approved", true)
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          setDbReviews(data);
        }
      } catch {
        // Fallback to initial reviews
      }
    };
    fetchReviews();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.body.trim()) {
      toast.error("Please enter your name and review");
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: id,
      user_id: user?.id ?? null,
      author_name: reviewForm.name.trim(),
      location: reviewForm.location.trim() || null,
      rating: reviewForm.rating,
      body: reviewForm.body.trim(),
      approved: true,
    });
    setSubmittingReview(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Thank you! Your review has been published.");
      setShowReviewModal(false);
      setDbReviews(prev => [
        {
          id: String(Date.now()),
          author_name: reviewForm.name,
          location: reviewForm.location,
          rating: reviewForm.rating,
          body: reviewForm.body,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setReviewForm({ name: "", location: "Jayankondam", rating: 5, body: "" });
    }
  };

  const reviewsToDisplay = dbReviews.length > 0 ? dbReviews : fallbackReviews;

  const { calculateProductPrice } = useCms();
  const priceInfo = product ? calculateProductPrice(product) : null;
  const displayPrice = priceInfo ? priceInfo.finalPrice : (product?.price ?? 0);
  const displayMrp = priceInfo ? priceInfo.originalPrice : product?.mrp;
  const discountPercent = priceInfo ? priceInfo.discountPercent : 0;
  const appliedCampaign = priceInfo?.appliedCampaign;

  if (!product) return <Layout><div className="container-px py-32 text-center">Product not found.</div></Layout>;

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const VIEW_LABELS = ["Front", "Back", "Side", "Detail", "Model", "Extra"];

  const nextImg = () => setActiveImg((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImg((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-8">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          <Link to="/" className="link-underline">Home</Link> / <Link to="/shop" className="link-underline">Shop</Link> / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Customer-Facing Product Gallery with 4-5 or more images */}
          <div className="flex flex-col-reverse md:grid md:grid-cols-[96px_1fr] gap-4">
            {/* Clickable / Hoverable Thumbnail List */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] pb-2 md:pb-0 scrollbar-none">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  onMouseEnter={() => setActiveImg(i)}
                  className={`group relative aspect-[4/5] min-w-[72px] md:min-w-0 md:w-full bg-secondary overflow-hidden rounded-md border-2 transition-all duration-200 flex-shrink-0 ${activeImg === i ? "border-gold shadow-md scale-[1.02]" : "border-border/60 opacity-70 hover:opacity-100 hover:border-foreground/50"}`}
                  aria-label={`View ${VIEW_LABELS[i] || `angle ${i + 1}`}`}
                >
                  <img src={g} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <span className="absolute bottom-1 inset-x-1 text-[9px] uppercase tracking-wider font-bold bg-ink/80 text-white py-0.5 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {VIEW_LABELS[i] || `${i + 1}`}
                  </span>
                  {activeImg === i && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold shadow" />
                  )}
                </button>
              ))}
            </div>

            {/* Main Product Image Container with Zoom and Swipe Nav */}
            <div
              className="group aspect-[4/5] bg-secondary overflow-hidden rounded-xl relative shadow-card hover:shadow-elevated transition-shadow duration-500 select-none"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onMouseLeave={() => setZoom({ x: 50, y: 50 })}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={gallery[activeImg]}
                  alt={`${product.name} - ${VIEW_LABELS[activeImg] || "view"}`}
                  initial={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out md:group-hover:scale-[1.4]"
                />
              </AnimatePresence>

              {/* View label tag on main image */}
              <div className="absolute top-3 left-3 z-10">
                <span className="backdrop-blur-md bg-ink/80 text-white text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded shadow font-semibold">
                  {VIEW_LABELS[activeImg] || `Angle ${activeImg + 1}`} ({activeImg + 1}/{gallery.length})
                </span>
              </div>

              {/* Arrows for fast gallery navigation */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-ink shadow-lg grid place-items-center opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:bg-gold transition-all duration-200 z-10"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-ink shadow-lg grid place-items-center opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:bg-gold transition-all duration-200 z-10"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Zoom hint on desktop */}
              <div className="hidden md:flex items-center gap-1.5 absolute bottom-3 right-3 backdrop-blur-md bg-black/60 text-white/90 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Hover to Zoom
              </div>
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
              <p className="text-3xl font-bold text-ink">{formatINR(displayPrice)}</p>
              {displayMrp && displayMrp > displayPrice && (
                <>
                  <p className="text-lg text-muted-foreground line-through">{formatINR(displayMrp)}</p>
                  <span className="text-xs font-black text-ink uppercase tracking-wider bg-gold px-2.5 py-1 rounded shadow-sm">
                    {discountPercent}% OFF
                  </span>
                  {appliedCampaign && (
                    <span className="text-xs font-bold text-white bg-red-cta uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                      {appliedCampaign.display_label || appliedCampaign.name}
                    </span>
                  )}
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

            <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
              <div className="flex items-center border border-border h-12">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-full w-12 grid place-items-center hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-full w-12 grid place-items-center hover:bg-secondary"><Plus className="h-4 w-4" /></button>
              </div>
              <button
                onClick={() => { for (let i = 0; i < qty; i++) add(product, size); toast.success(`${product.name} added to cart`); }}
                className="flex-1 bg-ink text-primary-foreground text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-2.5 h-12 rounded"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={() => { for (let i = 0; i < qty; i++) add(product, size); navigate("/checkout"); }}
                className="flex-1 bg-red-cta text-white text-xs uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-2.5 h-12 rounded shadow-md"
              >
                <Zap className="h-4 w-4" /> Buy Now
              </button>
              <button
                onClick={() => { toggle(product); toast.success(has(product.id) ? "Removed from wishlist" : "Added to wishlist"); }}
                className={`h-12 w-12 shrink-0 grid place-items-center border border-border hover:border-foreground transition-smooth rounded ${has(product.id) ? "text-gold border-gold" : ""}`}
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 ${has(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-xs">
              {[
                { icon: Truck, label: "Fast Dispatch", link: "/policies?tab=shipping" },
                { icon: RotateCcw, label: "7-Day Exchange", link: "/policies?tab=returns" },
                { icon: ShieldCheck, label: "100% Authentic", link: "/about" },
              ].map(({ icon: Icon, label, link }) => (
                <Link key={label} to={link} className="border border-border p-4 text-center hover:border-gold transition rounded group">
                  <Icon className="h-5 w-5 mx-auto text-gold mb-2 group-hover:scale-110 transition-transform" />
                  <p className="uppercase tracking-[0.15em] font-medium">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-24 border-t border-border pt-16">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-1">Customer Feedback</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Verified Reviews</h2>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="text-xs uppercase tracking-[0.25em] border-2 border-foreground px-5 py-3 font-bold hover:bg-ink hover:text-primary-foreground transition-smooth rounded"
            >
              Write a Review
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviewsToDisplay.map((r, i) => (
              <div key={r.id || i} className="border border-border p-6 rounded-xl bg-card hover-lift">
                <div className="flex text-gold mb-3">
                  {Array.from({ length: r.rating || 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">"{r.body || r.text}"</p>
                <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{r.author_name || r.name}</span>
                  <span>{r.location ? `${r.location} · ` : ""}Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Modal Dialog */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display text-2xl font-bold mb-1">Write a Review</h3>
              <p className="text-xs text-muted-foreground mb-6">Reviewing {product.name}</p>

              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-1.5">Your Name</label>
                  <input
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="e.g. Anand K."
                    className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-1.5">Location / City</label>
                  <input
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                    placeholder="e.g. Jayankondam"
                    className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-1.5">Rating</label>
                  <div className="flex gap-2 text-gold">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                        className="p-1 hover:scale-125 transition-transform"
                        aria-label={`${num} star`}
                      >
                        <Star className={`h-6 w-6 ${reviewForm.rating >= num ? "fill-gold text-gold" : "text-muted border-border"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-1.5">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                    placeholder="Share your experience regarding fabric quality, fit, and comfort..."
                    className="w-full border border-border rounded-lg px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 border border-border py-3 rounded-lg text-xs uppercase tracking-[0.2em] font-bold hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-ink text-primary-foreground py-3 rounded-lg text-xs uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-ink transition flex items-center justify-center gap-2"
                  >
                    {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Related */}
        <RelatedProducts currentId={product.id} category={product.category} all={products} />

      </section>
    </Layout>
  );
};

export default ProductDetails;
