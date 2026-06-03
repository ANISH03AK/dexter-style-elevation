import { useEffect, useState } from "react";
import { Star, BadgeCheck, MapPin, X, Send, Loader2, PenSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id?: string;
  text: string;
  author: string;
  location: string;
  initial: string;
  rating: number;
  accent: "red" | "gold";
};

const seedReviews: Review[] = [
  { text: "Best price and low cost for back printed shirts collections", author: "Anish Kumar", location: "Jayankondam", initial: "A", rating: 5, accent: "red" },
  { text: "Good quality drop shoulder t-shirt 💥 Fabric is heavy and perfect fit.", author: "Rahul R.", location: "Trichy", initial: "R", rating: 5, accent: "gold" },
  { text: "Nice customer service.. Very fast delivery for online orders!", author: "Vignesh S.", location: "Ariyalur", initial: "V", rating: 5, accent: "red" },
  { text: "Best place for oversized tees and trendy streetwear clothes. Value for money.", author: "Praveen Kumar", location: "Tanjore", initial: "P", rating: 5, accent: "gold" },
];

const Card = ({ r }: { r: Review }) => {
  const avatarBg = r.accent === "red" ? "bg-red-cta text-white" : "bg-gold text-ink";
  return (
    <div className="shrink-0 w-[290px] md:w-[340px] bg-white border-2 border-border rounded-xl p-6 shadow-card mx-3 hover:-translate-y-1 hover:shadow-elevated hover:border-gold transition-all duration-500 animate-fade-in">
      <div className="flex text-gold mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-30"}`} />
        ))}
      </div>
      <p className="text-foreground font-medium leading-relaxed min-h-[80px]">"{r.text}"</p>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <div className={`h-10 w-10 rounded-full ${avatarBg} grid place-items-center font-extrabold text-lg shrink-0`}>{r.initial}</div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground flex items-center gap-1">
            {r.author} <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" /> {r.location}{r.location ? ", Tamil Nadu" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

const Reviews = () => {
  const [items, setItems] = useState<Review[]>(seedReviews);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", body: "", rating: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data && data.length) {
        const mapped: Review[] = data.map((r: any, i: number) => ({
          id: r.id,
          text: r.body,
          author: r.author_name,
          location: r.location || "",
          initial: (r.author_name || "?").trim().charAt(0).toUpperCase(),
          rating: r.rating,
          accent: i % 2 === 0 ? "red" : "gold",
        }));
        setItems([...mapped, ...seedReviews]);
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) return toast.error("Please fill name and review");
    if (form.rating < 1) return toast.error("Please tap to rate");
    setSubmitting(true);
    const { data, error } = await supabase.from("reviews").insert({
      author_name: form.name.trim(),
      location: form.location.trim() || null,
      body: form.body.trim(),
      rating: form.rating,
    }).select("*").single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    const newR: Review = {
      id: data.id,
      text: data.body,
      author: data.author_name,
      location: data.location || "",
      initial: (data.author_name || "?").trim().charAt(0).toUpperCase(),
      rating: data.rating,
      accent: "gold",
    };
    setItems((prev) => [newR, ...prev]);
    setOpen(false);
    setForm({ name: "", location: "", body: "", rating: 0 });
    toast.success("✨ Review Posted for Moderation");
  };

  return (
    <section className="bg-secondary py-20 overflow-hidden">
      <div className="container-px mx-auto max-w-[1400px] text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Verified Google Reviews</p>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">What Our Customers Say</h2>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <span className="text-foreground font-bold">5.0 · Top-rated across Tamil Nadu</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex items-center gap-2 bg-ink text-white hover:bg-gold hover:text-ink transition-all px-6 py-3 text-xs uppercase tracking-[0.3em] font-bold rounded-md shadow-lg hover:scale-105"
        >
          <PenSquare className="h-4 w-4" /> Write a Review
        </button>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block container-px mx-auto max-w-[1400px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.slice(0, 8).map((r, i) => <Card key={r.id || i} r={r} />)}
        </div>
      </div>

      {/* Mobile marquee */}
      <div className="md:hidden relative">
        <div className="flex marquee-track" style={{ width: "max-content" }}>
          {[...items, ...items].map((r, i) => <Card key={i} r={r} />)}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm grid place-items-center p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="bg-white rounded-2xl w-full max-w-md p-7 shadow-2xl relative animate-scale-in"
          >
            <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Share your experience</p>
            <h3 className="font-display text-2xl font-extrabold mt-1 mb-5">Write a Review</h3>

            <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-2">Your Rating</label>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className="transition-transform hover:scale-125"
                  aria-label={`${n} star`}
                >
                  <Star className={`h-8 w-8 ${n <= form.rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your Name"
              maxLength={60}
              className="w-full border-2 border-border rounded-md px-4 py-3 text-sm mb-3 focus:outline-none focus:border-foreground"
            />
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City (optional)"
              maxLength={40}
              className="w-full border-2 border-border rounded-md px-4 py-3 text-sm mb-3 focus:outline-none focus:border-foreground"
            />
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Tell us what you loved…"
              rows={4}
              maxLength={500}
              className="w-full border-2 border-border rounded-md px-4 py-3 text-sm mb-5 focus:outline-none focus:border-foreground resize-none"
            />

            <button
              disabled={submitting}
              type="submit"
              className="w-full bg-ink text-white py-3.5 text-xs uppercase tracking-[0.3em] font-bold rounded-md hover:bg-gold hover:text-ink transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Review
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default Reviews;
