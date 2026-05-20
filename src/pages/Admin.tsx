import { useEffect, useState } from "react";
import { Trash2, Plus, Search, Loader2, LogOut, Upload, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProducts } from "@/context/ProductsContext";
import { Category } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CATS: Category[] = ["Shirts","T-Shirts","Jeans","Jackets","Hoodies","Suits","Activewear","Accessories"];

const empty = {
  name: "",
  category: "Shirts" as Category,
  price: "",
  offerPrice: "",
  tag: "",
  description: "",
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { products, addProduct, updateProduct, removeProduct, refresh } = useProducts();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container-px mx-auto max-w-3xl py-32 text-center">
          <h1 className="font-display text-3xl font-bold mb-3">Restricted area</h1>
          <p className="text-muted-foreground">This dashboard is only available to the Store Owner.</p>
        </div>
      </Layout>
    );
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) { toast.error(`Upload failed: ${error.message}`); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const resetForm = () => { setForm(empty); setFile(null); setEditingId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Name and original price are required"); return; }
    const original = Number(form.price);
    const offer = form.offerPrice ? Number(form.offerPrice) : undefined;
    if (offer !== undefined && offer >= original) { toast.error("Offer price must be lower than original price"); return; }

    setBusy(true);
    let imageUrl: string | null = null;
    if (file) imageUrl = await uploadImage();

    if (editingId) {
      const res = await updateProduct(editingId, {
        name: form.name,
        category: form.category,
        price: offer ?? original,
        mrp: offer !== undefined ? original : undefined,
        ...(imageUrl ? { image: imageUrl } : {}),
        tag: form.tag,
        description: form.description,
      });
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product updated");
    } else {
      if (!imageUrl) { setBusy(false); return toast.error("Please choose a product image"); }
      const res = await addProduct({
        name: form.name,
        category: form.category,
        price: offer ?? original,
        mrp: offer !== undefined ? original : undefined,
        image: imageUrl,
        tag: form.tag,
        description: form.description,
      });
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product added");
    }
    resetForm();
    refresh();
  };

  const startEdit = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      name: p.name,
      category: p.category as Category,
      price: String(p.mrp ?? p.price),
      offerPrice: p.mrp ? String(p.price) : "",
      tag: p.tag || "",
      description: p.description || "",
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await removeProduct(id);
    if (res.error) toast.error(res.error); else toast.success("Deleted");
  };

  // Only show DB-managed products in the admin table (seed catalog isn't editable)
  // Heuristic: DB products have UUID-style ids
  const isDbId = (id: string) => /^[0-9a-f]{8}-/.test(id);
  const dbProducts = products.filter(p => isDbId(p.id));
  const filtered = dbProducts.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Layout>
      <div className="container-px mx-auto max-w-[1400px] py-12">
        <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2">Store Owner</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Product Management</h1>
            <p className="text-sm text-muted-foreground mt-2">{user.email} · {dbProducts.length} live products</p>
          </div>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="text-xs uppercase tracking-[0.2em] flex items-center gap-2 border border-border px-4 py-2 hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-10">
          {/* FORM */}
          <form onSubmit={submit} className="border border-border p-6 rounded-md bg-card h-fit sticky top-32">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <Field label="Product Name">
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value as Category})} className="input">
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Original Price ₹">
                  <input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input" />
                </Field>
                <Field label="Offer Price ₹">
                  <input type="number" min="1" value={form.offerPrice} onChange={e => setForm({...form, offerPrice: e.target.value})} className="input" placeholder="optional" />
                </Field>
              </div>
              <Field label="Tag (optional)">
                <input value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} className="input" placeholder="New, Hot, Premium…" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="input resize-none" />
              </Field>
              <Field label={editingId ? "Replace Image (optional)" : "Product Image"}>
                <label className="block border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-foreground transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {preview ? (
                    <img src={preview} alt="preview" className="mx-auto h-32 object-cover rounded" />
                  ) : (
                    <div className="text-xs text-muted-foreground flex flex-col items-center gap-2 py-4">
                      <Upload className="h-5 w-5" />
                      Click to upload image
                    </div>
                  )}
                </label>
              </Field>
            </div>

            <button disabled={busy} type="submit" className="mt-6 w-full bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Save Changes" : "Add Product"}
            </button>
          </form>

          {/* LIST */}
          <div>
            <div className="flex items-center gap-3 border-b border-border pb-3 mb-5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" className="flex-1 bg-transparent text-sm focus:outline-none" />
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center rounded-md">
                <p className="text-muted-foreground text-sm">No live products yet. Add your first one with the form on the left.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <div key={p.id} className="border border-border rounded-md overflow-hidden bg-card group">
                    <div className="aspect-[4/5] bg-secondary overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.category}</p>
                      <h3 className="text-sm font-semibold line-clamp-1 mt-1">{p.name}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-bold">{formatINR(p.price)}</span>
                        {p.mrp && <span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startEdit(p.id)} className="flex-1 text-[11px] uppercase tracking-[0.18em] border border-border py-2 hover:bg-muted flex items-center justify-center gap-1">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => onDelete(p.id)} className="text-[11px] uppercase tracking-[0.18em] bg-destructive text-destructive-foreground px-3 py-2 hover:opacity-90 flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: transparent;
          border: 1px solid hsl(var(--border));
          padding: 0.625rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color .15s;
        }
        .input:focus { border-color: hsl(var(--foreground)); }
      `}</style>
    </Layout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

export default Admin;
