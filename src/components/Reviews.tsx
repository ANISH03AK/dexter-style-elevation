import { Star, BadgeCheck, MapPin } from "lucide-react";

type Review = {
  text: string;
  author: string;
  location: string;
  initial: string;
  accent: "red" | "gold";
};

const reviews: Review[] = [
  {
    text: "Best price and low cost for back printed shirts collections",
    author: "Anish Kumar",
    location: "Jayankondam",
    initial: "A",
    accent: "red",
  },
  {
    text: "Good quality drop shoulder t-shirt 💥 Fabric is heavy and perfect fit.",
    author: "Rahul R.",
    location: "Trichy",
    initial: "R",
    accent: "gold",
  },
  {
    text: "Nice customer service.. Very fast delivery for online orders!",
    author: "Vignesh S.",
    location: "Ariyalur",
    initial: "V",
    accent: "red",
  },
  {
    text: "Best place for oversized tees and trendy streetwear clothes. Value for money.",
    author: "Praveen Kumar",
    location: "Tanjore",
    initial: "P",
    accent: "gold",
  },
];

const Card = ({ r }: { r: Review }) => {
  const avatarBg = r.accent === "red" ? "bg-red-cta text-white" : "bg-gold text-ink";
  return (
    <div className="shrink-0 w-[290px] md:w-[340px] bg-white border-2 border-border rounded-xl p-6 shadow-card mx-3 hover:-translate-y-1 hover:shadow-elevated hover:border-gold transition-all duration-500">
      <div className="flex text-gold mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="text-foreground font-medium leading-relaxed min-h-[80px]">"{r.text}"</p>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <div className={`h-10 w-10 rounded-full ${avatarBg} grid place-items-center font-extrabold text-lg shrink-0`}>
          {r.initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground flex items-center gap-1">
            {r.author} <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" /> {r.location}, Tamil Nadu
          </p>
        </div>
      </div>
    </div>
  );
};

const Reviews = () => (
  <section className="bg-secondary py-20 overflow-hidden">
    <div className="container-px mx-auto max-w-[1400px] text-center mb-12">
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
    </div>

    {/* Desktop: clean grid */}
    <div className="hidden md:block container-px mx-auto max-w-[1400px]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {reviews.map((r, i) => (
          <Card key={i} r={r} />
        ))}
      </div>
    </div>

    {/* Mobile: smooth marquee */}
    <div className="md:hidden relative">
      <div className="flex marquee-track" style={{ width: "max-content" }}>
        {[...reviews, ...reviews].map((r, i) => (
          <Card key={i} r={r} />
        ))}
      </div>
    </div>
  </section>
);

export default Reviews;
