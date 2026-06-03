import { useEffect, useState, useCallback } from "react";
import { Trash2, Plus, Search, Loader2, LogOut, Upload, Pencil, X, IndianRupee, Clock, Package, ShoppingBag, CreditCard, Wallet, Banknote } from "lucide-react";

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

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: Array<{ name: string; qty: number; size: string; price: number; image?: string }>;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [paySettings, setPaySettings] = useState<Record<string, boolean>>({ cod: true, upi: true, card: true });


  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data as any);
    setOrdersLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
    const ch1 = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();

    const loadPay = async () => {
      const { data } = await supabase.from("payment_settings").select("*");
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((r: any) => { map[r.method] = r.enabled; });
        setPaySettings({ cod: map.cod ?? true, upi: map.upi ?? true, card: map.card ?? true });
      }
    };
    loadPay();
    const ch2 = supabase
      .channel("pay-settings-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_settings" }, loadPay)
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [isAdmin, fetchOrders]);

  const togglePayment = async (method: "cod" | "upi" | "card", next: boolean) => {
    setPaySettings((p) => ({ ...p, [method]: next }));
    const { error } = await supabase
      .from("payment_settings")
      .update({ enabled: next, updated_at: new Date().toISOString() })
      .eq("method", method);
    if (error) {
      setPaySettings((p) => ({ ...p, [method]: !next }));
      toast.error(error.message);
    } else {
      toast.success(`${method.toUpperCase()} ${next ? "enabled" : "disabled"}`);
    }
  };


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
    const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
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
        name: form.name, category: form.category,
        price: offer ?? original, mrp: offer !== undefined ? original : undefined,
        ...(imageUrl ? { image: imageUrl } : {}),
        tag: form.tag, description: form.description,
      });
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product updated");
    } else {
      if (!imageUrl) { setBusy(false); return toast.error("Please choose a product image"); }
      const res = await addProduct({
        name: form.name, category: form.category,
        price: offer ?? original, mrp: offer !== undefined ? original : undefined,
        image: imageUrl, tag: form.tag, description: form.description,
      });
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product added — now live on homepage");
    }
    resetForm();
    refresh();
  };

  const startEdit = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      name: p.name, category: p.category as Category,
      price: String(p.mrp ?? p.price),
      offerPrice: p.mrp ? String(p.price) : "",
      tag: p.tag || "", description: p.description || "",
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await removeProduct(id);
    if (res.error) toast.error(res.error); else toast.success("Deleted");
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else toast.success(`Order ${status}`);
  };

  const dbProducts = products;
  const filtered = dbProducts.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  );

  const totalSales = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  return (
    <Layout>
      <div className="container-px mx-auto max-w-[1400px] py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2">Store Owner Dashboard</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Welcome back.</h1>
            <p className="text-sm text-muted-foreground mt-2">{user.email}</p>
          </div>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="text-xs uppercase tracking-[0.2em] flex items-center gap-2 border border-border px-4 py-2 hover:bg-muted rounded-md">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard icon={IndianRupee} label="Total Sales" value={formatINR(totalSales)} accent />
          <StatCard icon={Clock} label="Pending Orders" value={String(pendingOrders)} />
          <StatCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} />
          <StatCard icon={Package} label="Live Products" value={String(dbProducts.length)} />
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-10">
          {/* Product Form */}
          <form onSubmit={submit} className="border border-border p-6 rounded-md bg-card h-fit lg:sticky lg:top-32">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">{editingId ? "Edit Product" : "Add New Product"}</h2>
              {editingId && (<button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>)}
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
                      <Upload className="h-5 w-5" /> Click to upload image
                    </div>
                  )}
                </label>
              </Field>
            </div>

            <button disabled={busy} type="submit" className="mt-6 w-full bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-2 disabled:opacity-60 rounded-md">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Save Changes" : "Add Product"}
            </button>
          </form>

          {/* Products List */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Product Management</h2>
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
                    <div className="aspect-[4/5] bg-secondary overflow-hidden relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {p.mrp && (
                        <span className="absolute top-2 right-2 bg-gold text-ink text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">Offer</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.category}</p>
                      <h3 className="text-sm font-semibold line-clamp-1 mt-1">{p.name}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm font-bold">{formatINR(p.price)}</span>
                        {p.mrp && <span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startEdit(p.id)} className="flex-1 text-[11px] uppercase tracking-[0.18em] border border-border py-2 hover:bg-muted flex items-center justify-center gap-1 rounded">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => onDelete(p.id)} className="text-[11px] uppercase tracking-[0.18em] bg-destructive text-destructive-foreground px-3 py-2 hover:opacity-90 flex items-center gap-1 rounded">
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

        {/* Live Orders */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2">Real-time</p>
              <h2 className="font-display text-2xl font-bold">Live Orders</h2>
            </div>
            <span className="text-xs text-muted-foreground">{orders.length} total</span>
          </div>

          {ordersLoading ? (
            <div className="py-16 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : orders.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center rounded-md">
              <p className="text-muted-foreground text-sm">No orders yet. Orders will appear here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="border border-border rounded-md p-5 bg-card">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Order DX-{o.id.slice(0, 8).toUpperCase()}</p>
                      <h3 className="font-semibold mt-1">{o.customer_name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-gold">{formatINR(Number(o.total))}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{o.payment_method}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm border-t border-border pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Mobile</p>
                      <a href={`tel:+91${o.phone}`} className="font-medium hover:text-gold">+91 {o.phone}</a>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Address</p>
                      <p className="text-sm">{o.address}, {o.city} — {o.pincode}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Items ({o.items?.length || 0})</p>
                    <div className="space-y-1.5">
                      {(o.items || []).map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          {it.image && <img src={it.image} alt="" className="h-10 w-9 object-cover rounded" />}
                          <span className="flex-1 truncate">{it.name} <span className="text-muted-foreground">· {it.size} · ×{it.qty}</span></span>
                          <span className="font-medium">{formatINR(Number(it.price) * it.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between flex-wrap gap-2 border-t border-border pt-4">
                    <span className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                      o.status === "pending" ? "bg-gold/20 text-gold" :
                      o.status === "shipped" ? "bg-blue-500/15 text-blue-600" :
                      o.status === "delivered" ? "bg-emerald-500/15 text-emerald-600" :
                      "bg-muted text-muted-foreground"
                    }`}>{o.status}</span>
                    <div className="flex gap-2 text-[11px] uppercase tracking-[0.18em]">
                      {o.status === "pending" && (
                        <button onClick={() => updateOrderStatus(o.id, "shipped")} className="border border-border px-3 py-1.5 hover:bg-muted rounded">Mark Shipped</button>
                      )}
                      {o.status === "shipped" && (
                        <button onClick={() => updateOrderStatus(o.id, "delivered")} className="border border-border px-3 py-1.5 hover:bg-muted rounded">Mark Delivered</button>
                      )}
                      {o.status !== "cancelled" && o.status !== "delivered" && (
                        <button onClick={() => updateOrderStatus(o.id, "cancelled")} className="border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10 rounded">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) => (
  <div className={`border rounded-md p-5 ${accent ? "bg-ink text-primary-foreground border-ink" : "bg-card border-border"}`}>
    <div className="flex items-center justify-between">
      <p className={`text-[10px] uppercase tracking-[0.22em] ${accent ? "text-gold" : "text-muted-foreground"}`}>{label}</p>
      <div className={`h-9 w-9 grid place-items-center rounded-full ${accent ? "bg-gold/20 text-gold" : "bg-secondary text-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="font-display text-2xl font-bold mt-3">{value}</p>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

export default Admin;
