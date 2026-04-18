import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";

const allCats = ["Shirts", "T-Shirts", "Jeans", "Jackets", "Hoodies", "Suits", "Activewear", "Accessories"] as const;
const allSizes = ["S", "M", "L", "XL", "XXL"];
const PER_PAGE = 24;

const Shop = () => {
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat");
  const initialQ = params.get("q") || "";
  const [cats, setCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sort, setSort] = useState("popularity");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    const c = params.get("cat");
    if (c) setCats([c]);
    setQ(params.get("q") || "");
  }, [params]);

  useEffect(() => { setPage(1); }, [cats, sizes, maxPrice, sort, q]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter(p =>
      (cats.length === 0 || cats.includes(p.category)) &&
      p.price <= maxPrice &&
      (term === "" || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "discount") list = [...list].sort((a, b) => {
      const da = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
      const db = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
      return db - da;
    });
    return list;
  }, [cats, maxPrice, sort, sizes, products, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = page > totalPages ? 1 : page;
  const pageItems = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

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

  // Build a compact pagination range
  const pageNumbers: (number | "...")[] = [];
  const add = (n: number | "...") => pageNumbers.push(n);
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) add(i);
    else if (pageNumbers[pageNumbers.length - 1] !== "...") add("...");
  }

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Collection</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">All Menswear</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length.toLocaleString("en-IN")} pieces · Page {current} of {totalPages}
          </p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-12">
          <aside className="hidden lg:block sticky top-32 self-start">
            <Filters />
            <Link to="/admin" className="mt-8 block text-center text-xs uppercase tracking-[0.25em] border border-border px-4 py-3 hover:border-gold hover:text-gold transition-smooth rounded-md">
              Manage Catalog
            </Link>
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
                  <option value="discount">Best Discount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6">
              {pageItems.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-20">No products match your filters.</p>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => { setPage(Math.max(1, current - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={current === 1}
                  className="h-10 px-3 border border-border inline-flex items-center gap-1 text-sm disabled:opacity-40 hover:border-foreground transition-smooth rounded-md"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                {pageNumbers.map((n, i) =>
                  n === "..." ? (
                    <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`h-10 min-w-10 px-3 text-sm border rounded-md transition-smooth ${n === current ? "bg-ink text-primary-foreground border-ink" : "border-border hover:border-foreground"}`}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  onClick={() => { setPage(Math.min(totalPages, current + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={current === totalPages}
                  className="h-10 px-3 border border-border inline-flex items-center gap-1 text-sm disabled:opacity-40 hover:border-foreground transition-smooth rounded-md"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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
