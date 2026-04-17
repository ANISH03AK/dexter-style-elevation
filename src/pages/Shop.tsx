import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const allCats = ["Shirts", "T-Shirts", "Jeans", "Jackets", "Hoodies", "Suits", "Activewear", "Accessories"] as const;
const allSizes = ["S", "M", "L", "XL", "XXL"];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat");
  const [cats, setCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sort, setSort] = useState("popularity");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = params.get("cat");
    if (c) setCats([c]);
  }, [params]);

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (cats.length === 0 || cats.includes(p.category)) &&
      p.price <= maxPrice
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [cats, maxPrice, sort, sizes]);

  const toggle = (arr: string[], v: string, set: (s: string[]) => void) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const Filters = () => (
    <div className="space-y-8 text-sm">
      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] mb-4 font-semibold">Category</h4>
        <div className="space-y-3">
          {allCats.map(c => (
            <label key={c} className="flex items-center gap-3 cursor-pointer hover:text-gold transition-smooth">
              <input
                type="checkbox"
                checked={cats.includes(c)}
                onChange={() => { toggle(cats, c, setCats); setParams({}); }}
                className="accent-foreground"
              />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] mb-4 font-semibold">Size</h4>
        <div className="flex flex-wrap gap-2">
          {allSizes.map(s => (
            <button
              key={s}
              onClick={() => toggle(sizes, s, setSizes)}
              className={`h-9 w-9 border text-xs transition-smooth ${sizes.includes(s) ? "bg-ink text-primary-foreground border-ink" : "border-border hover:border-foreground"}`}
            >{s}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] mb-4 font-semibold">Max Price</h4>
        <input type="range" min={500} max={15000} step={100} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} className="w-full accent-foreground" />
        <p className="mt-2 text-muted-foreground">Up to <span className="font-semibold text-foreground">₹{maxPrice.toLocaleString("en-IN")}</span></p>
      </div>
    </div>
  );

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Collection</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">All Menswear</h1>
          <p className="mt-2 text-sm text-muted-foreground">{filtered.length} pieces</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          <aside className="hidden lg:block sticky top-32 self-start">
            <Filters />
          </aside>

          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <button onClick={() => setOpen(true)} className="lg:hidden inline-flex items-center gap-2 text-sm border border-border px-4 py-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <div className="ml-auto flex items-center gap-3">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sort</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground">
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-20">No products match your filters.</p>
            )}
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 overflow-auto animate-fade-in">
            <div className="flex justify-between mb-6">
              <h3 className="font-semibold uppercase tracking-[0.2em] text-sm">Filters</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <Filters />
          </aside>
        </div>
      )}
    </Layout>
  );
};

export default Shop;
