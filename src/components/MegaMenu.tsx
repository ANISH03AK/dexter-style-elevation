import { Link } from "react-router-dom";
import { Shirt, Layers, Sparkles } from "lucide-react";

const groups: { title: string; icon: typeof Shirt; items: { label: string; cat: string; tag?: string }[] }[] = [
  {
    title: "Topwear",
    icon: Shirt,
    items: [
      { label: "Shirts", cat: "Shirts", tag: "Bestseller" },
      { label: "T-Shirts", cat: "T-Shirts", tag: "Buy 2 Get 1" },
      { label: "Hoodies", cat: "Hoodies", tag: "60% Off" },
      { label: "Jackets", cat: "Jackets", tag: "New" },
    ],
  },
  {
    title: "Bottomwear",
    icon: Layers,
    items: [
      { label: "Jeans", cat: "Jeans", tag: "B1G1" },
    ],
  },
  {
    title: "Premium",
    icon: Sparkles,
    items: [
      { label: "Suits", cat: "Suits" },
      { label: "Activewear", cat: "Activewear" },
      { label: "Accessories", cat: "Accessories" },
    ],
  },
];

const MegaMenu = () => (
  <div className="absolute left-0 top-full pt-3 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 w-[640px]">
    <div className="bg-background border border-border shadow-elevated rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 gap-6 p-6">
        {groups.map(g => {
          const Icon = g.icon;
          return (
            <div key={g.title}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Icon className="h-3.5 w-3.5 text-gold" />
                <h4 className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">{g.title}</h4>
              </div>
              <ul className="space-y-2">
                {g.items.map(i => (
                  <li key={i.label}>
                    <Link
                      to={`/shop?cat=${encodeURIComponent(i.cat)}`}
                      className="group/item flex items-center justify-between text-sm text-foreground/80 hover:text-gold transition-colors py-1"
                    >
                      <span>{i.label}</span>
                      {i.tag && (
                        <span className="text-[9px] uppercase tracking-wider bg-gold/15 text-gold px-1.5 py-0.5 rounded">
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
      <Link to="/shop" className="block bg-ink text-primary-foreground text-center py-2.5 text-[10px] uppercase tracking-[0.3em] hover:bg-gold hover:text-ink transition-colors">
        View Full Catalogue →
      </Link>
    </div>
  </div>
);

export default MegaMenu;
