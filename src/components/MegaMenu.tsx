import { Link } from "react-router-dom";

const groups: { title: string; items: { label: string; cat: string }[] }[] = [
  { title: "Topwear", items: [
    { label: "Shirts", cat: "Shirts" },
    { label: "T-Shirts", cat: "T-Shirts" },
    { label: "Hoodies", cat: "Hoodies" },
    { label: "Jackets", cat: "Jackets" },
  ]},
  { title: "Bottomwear", items: [
    { label: "Jeans", cat: "Jeans" },
  ]},
  { title: "Premium", items: [
    { label: "Suits", cat: "Suits" },
    { label: "Activewear", cat: "Activewear" },
    { label: "Accessories", cat: "Accessories" },
  ]},
];

const MegaMenu = () => (
  <div className="absolute left-0 right-0 top-full bg-background border-t border-border shadow-elevated invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40">
    <div className="container-px mx-auto max-w-[1400px] py-8 grid grid-cols-3 gap-8">
      {groups.map(g => (
        <div key={g.title}>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-4 font-semibold">{g.title}</h4>
          <ul className="space-y-2.5">
            {g.items.map(i => (
              <li key={i.label}>
                <Link to={`/shop?cat=${i.cat}`} className="text-sm text-foreground/80 hover:text-gold transition-colors">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

export default MegaMenu;
