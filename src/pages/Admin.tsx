import { useState } from "react";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useProducts } from "@/context/ProductsContext";
import { Category } from "@/data/products";
import { formatINR } from "@/lib/format";

const CATS: Category[] = ["Shirts","T-Shirts","Jeans","Jackets","Hoodies","Suits","Activewear","Accessories"];

const Admin = () => {
  const { products, addProduct, removeProduct } = useProducts();
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "Shirts" as Category,
    price: "",
    mrp: "",
    image: "",
    tag: "",
    description: "",
  });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 60);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) {
      toast.error("Name, price and image URL are required");
      return;
    }
    addProduct({
      name: form.name,
      category: form.category,
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      image: form.image,
      tag: form.tag || undefined,
      description: form.description || `${form.name} — premium menswear from DEXTER.`,
    });
    toast.success(`${form.name} added`);
    setForm({ ...form, name: "", price: "", mrp: "", image: "", tag: "", description: "" });
  };

  return (
    <Layout>
      <section className="container-px mx-auto max-w-[1400px] py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Admin</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">Catalog Manager</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add new products or remove existing ones. Total: {products.length.toLocaleString("en-IN")} items.</p>

        <div className="mt-10 grid lg:grid-cols-[400px_1fr] gap-10">
          {/* Add form */}
          <form onSubmit={submit} className="space-y-4 border border-border p-6 rounded-lg bg-background h-fit lg:sticky lg:top-32">
            <h2 className="font-semibold uppercase tracking-[0.2em] text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-gold" /> Add Product
            </h2>
            <input
              required
              placeholder="Product name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
            />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as Category })}
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
            >
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                placeholder="Price (₹)"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
              />
              <input
                type="number"
                placeholder="MRP (₹)"
                value={form.mrp}
                onChange={e => setForm({ ...form, mrp: e.target.value })}
                className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
              />
            </div>
            <input
              required
              placeholder="Image URL"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
            />
            <input
              placeholder="Tag (e.g. New, Hot)"
              value={form.tag}
              onChange={e => setForm({ ...form, tag: e.target.value })}
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-transparent border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
            />
            <button type="submit" className="w-full bg-ink text-primary-foreground uppercase tracking-[0.2em] text-xs py-3 hover:bg-gold hover:text-ink transition-smooth rounded-md">
              Add to Catalog
            </button>
          </form>

          {/* List */}
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search products to remove..."
                value={q}
                onChange={e => setQ(e.target.value)}
                className="w-full bg-transparent border border-border pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-foreground rounded-md"
              />
            </div>
            <p className="text-xs text-muted-foreground mb-4">Showing {filtered.length} of {products.length.toLocaleString("en-IN")}</p>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {filtered.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 border border-border rounded-md hover:border-gold transition-smooth bg-background">
                  <img src={p.image} alt={p.name} className="h-16 w-16 object-cover rounded-md" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      {p.tag && <span className="text-[9px] uppercase tracking-[0.18em] bg-gold/15 text-gold px-1.5 py-0.5 rounded">{p.tag}</span>}
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground/80 mt-0.5">ID: {p.id}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{p.category}</span>
                      <span className="text-xs font-semibold text-foreground">{formatINR(p.price)}</span>
                      {p.mrp && <span className="text-[11px] text-muted-foreground line-through">{formatINR(p.mrp)}</span>}
                    </div>
                  </div>
                  <a
                    href={`/product/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/40 px-2.5 py-1 rounded hover:bg-gold hover:text-ink transition-smooth"
                  >
                    View
                  </a>
                  <button
                    onClick={() => { removeProduct(p.id); toast.success(`Removed ${p.name}`); }}
                    className="h-9 w-9 grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-smooth"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
