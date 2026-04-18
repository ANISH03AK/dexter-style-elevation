import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/context/ProductsContext";
import { formatINR } from "@/lib/format";

const SearchBar = ({ onClose }: { onClose: () => void }) => {
  const [q, setQ] = useState("");
  const { products } = useProducts();
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [q, products]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate(`/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <div className="border-t border-border bg-background animate-fade-in">
      <form onSubmit={submit} className="container-px mx-auto max-w-[1400px] py-4 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          ref={ref}
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search shirts, jeans, jackets..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button onClick={onClose} type="button"><X className="h-4 w-4" /></button>
      </form>
      {results.length > 0 && (
        <div className="container-px mx-auto max-w-[1400px] pb-4">
          <div className="border border-border bg-background rounded-md overflow-hidden divide-y divide-border">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => { onClose(); navigate(`/product/${p.id}`); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary text-left transition-colors"
              >
                <div className="h-12 w-10 bg-secondary overflow-hidden flex-shrink-0">
                  <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{p.category}</p>
                </div>
                <p className="text-sm font-semibold">{formatINR(p.price)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
