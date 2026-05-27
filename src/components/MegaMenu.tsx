import { Link } from "react-router-dom";
import { Shirt, Layers, Sparkles } from "lucide-react";

const groups: { title: string; icon: typeof Shirt; items: { label: string; cat: string; tag?: string }[] }[] = [
  {
    title: "Topwear",
    icon: Shirt,
    items: [
      { label: "White Shirts", cat: "Shirts", tag: "Bestseller" },
      { label: "Casual Shirts", cat: "Shirts" },
      { label: "Printed Shirts", cat: "Shirts", tag: "New" },
      { label: "Oversized Tees", cat: "T-Shirts", tag: "Hot" },
      { label: "Polo / Puma Tees", cat: "T-Shirts" },
    ],
  },
  {
    title: "Bottomwear",
    icon: Layers,
    items: [
      { label: "Cargo Pants", cat: "Pants", tag: "Trending" },
      { label: "Track Pants", cat: "Pants" },
      { label: "Cotton Pants", cat: "Pants" },
    ],
  },
  {
    title: "Essentials",
    icon: Sparkles,
    items: [
      { label: "Hoodies", cat: "Hoodies" },
      { label: "Activewear", cat: "Activewear" },
      { label: "Innerwear", cat: "Innerwear", tag: "Jockey · Ramraj" },
      { label: "Belts & Caps", cat: "Accessories" },
    ],
  },
];

const MegaMenu = () => (
  <div className="absolute left-0 top-full pt-3 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 w-[680px]">
    <div className="bg-background border-2 border-foreground/10 shadow-elevated rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 gap-6 p-6">
        {groups.map(g => {
          const Icon = g.icon;
          return (
            <div key={g.title}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Icon className="h-3.5 w-3.5 text-red-cta" />
                <h4 className="text-[11px] uppercase tracking-[0.25em] text-foreground font-bold">{g.title}</h4>
              </div>
              <ul className="space-y-2">
                {g.items.map(i => (
                  <li key={i.label}>
                    <Link
                      to={`/shop?cat=${encodeURIComponent(i.cat)}`}
                      className="flex items-center justify-between text-sm text-foreground/85 hover:text-red-cta transition-colors py-1 font-medium"
                    >
                      <span>{i.label}</span>
                      {i.tag && (
                        <span className="text-[9px] uppercase tracking-wider bg-gold/20 text-foreground px-1.5 py-0.5 rounded font-bold">
                          {i.tag}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Link to="/shop" className="block bg-ink text-primary-foreground text-center py-2.5 text-[10px] uppercase tracking-[0.3em] hover:bg-red-cta transition-colors font-bold">
        View Full Catalogue →
      </Link>
    </div>
  </div>
);

export default MegaMenu;
