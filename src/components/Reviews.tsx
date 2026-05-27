import { Star, BadgeCheck } from "lucide-react";

const reviews = [
  { text: "Best price and low cost for back printed shirts collections", author: "Anish Kumar" },
  { text: "Good quality drop shoulder t-shirt 💥", author: "Anish Kumar" },
  { text: "Nice customer service..", author: "Anish Kumar" },
  { text: "Best price and low cost for back printed shirts collections", author: "Anish Kumar" },
  { text: "Good quality drop shoulder t-shirt 💥", author: "Anish Kumar" },
];

const Card = ({ text, author }: { text: string; author: string }) => (
  <div className="shrink-0 w-[300px] md:w-[360px] bg-white border-2 border-border rounded-xl p-6 shadow-card mx-3">
    <div className="flex text-gold mb-3">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
    </div>
    <p className="text-foreground font-medium leading-relaxed">"{text}"</p>
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
      <div className="h-9 w-9 rounded-full bg-red-cta text-white grid place-items-center font-bold">A</div>
      <div>
        <p className="text-sm font-bold text-foreground flex items-center gap-1">{author} <BadgeCheck className="h-3.5 w-3.5 text-blue-500" /></p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Google Business Review</p>
      </div>
    </div>
  </div>
);

const Reviews = () => (
  <section className="bg-secondary py-20 overflow-hidden">
    <div className="container-px mx-auto max-w-[1400px] text-center mb-10">
      <p className="text-xs uppercase tracking-[0.3em] text-red-cta mb-3 font-bold">Verified Google Reviews</p>
      <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground">What Our Customers Say</h2>
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="flex text-gold">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
        </div>
        <span className="text-foreground font-bold">5.0 · Top-rated in Jayankondam</span>
      </div>
    </div>

    <div className="relative">
      <div className="flex marquee-track" style={{ width: "max-content" }}>
        {[...reviews, ...reviews].map((r, i) => <Card key={i} {...r} />)}
      </div>
    </div>
  </section>
);

export default Reviews;
