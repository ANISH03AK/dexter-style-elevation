import { useEffect, useState, useCallback } from "react";
import { Trash2, Plus, Search, Loader2, LogOut, Upload, Pencil, X, IndianRupee, Clock, Package, ShoppingBag, CreditCard, Wallet, Banknote, Pin, Save, Image as ImageIcon, Tag as TagIcon, Settings as SettingsIcon, Layers, ShieldCheck, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProducts } from "@/context/ProductsContext";
import { Category } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditLog from "@/components/admin/AuditLog";


const CATS: Category[] = ["Shirts","T-Shirts","Pants","Jeans","Jackets","Hoodies","Suits","Activewear","Innerwear","Accessories"];
const SIZES = ["S","M","L","XL","XXL"];

const empty = {
  name: "", category: "Shirts" as Category, price: "", offerPrice: "",
  tag: "", description: "", badgeText: "", pinned: false,
  stock: Object.fromEntries(SIZES.map(s => [s, 0])) as Record<string, number>,
};

type Order = { id: string; customer_name: string; phone: string; address: string; city: string; pincode: string; total: number; status: string; payment_method: string; created_at: string; items: Array<{ name: string; qty: number; size: string; price: number; image?: string }>; };
type Promo = { id: string; code: string; kind: "percent"|"flat"; value: number; active: boolean };
type Lookbook = { id: string; image_url: string; product_id: string | null; caption: string | null; sort_order: number; active: boolean };

const uploadToBucket = async (file: File, prefix: string) => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) { toast.error(`Upload failed: ${error.message}`); return null; }
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
};

const Admin = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { products, addProduct, updateProduct, removeProduct, refresh } = useProducts();
  const navigate = useNavigate();

  // Product form state
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Orders + payments
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [paySettings, setPaySettings] = useState<Record<string, boolean>>({ cod: true, upi: true, card: true });

  // Store settings
  const [settings, setSettings] = useState({
    free_shipping_threshold: 2500, flat_shipping_fee: 162,
    announcement_text: "", hero_headline: "", hero_subtext: "", hero_image_url: "",
  });
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  // Promo codes
  const [promos, setPromos] = useState<Promo[]>([]);
  const [newPromo, setNewPromo] = useState({ code: "", kind: "percent" as "percent"|"flat", value: "" });

  // Lookbook
  const [lookbook, setLookbook] = useState<Lookbook[]>([]);
  const [lookFile, setLookFile] = useState<File | null>(null);
  const [lookProductId, setLookProductId] = useState<string>("");
  const [lookBusy, setLookBusy] = useState(false);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data as any);
    setOrdersLoading(false);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();
    if (data) setSettings({
      free_shipping_threshold: Number(data.free_shipping_threshold),
      flat_shipping_fee: Number(data.flat_shipping_fee),
      announcement_text: data.announcement_text || "",
      hero_headline: data.hero_headline || "",
      hero_subtext: data.hero_subtext || "",
      hero_image_url: data.hero_image_url || "",
    });
  }, []);

  const loadPromos = useCallback(async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    if (data) setPromos(data as Promo[]);
  }, []);

  const loadLookbook = useCallback(async () => {
    const { data } = await supabase.from("lookbook_items").select("*").order("sort_order", { ascending: true });
    if (data) setLookbook(data as Lookbook[]);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders(); loadSettings(); loadPromos(); loadLookbook();
    const ch1 = supabase.channel("a-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders).subscribe();
    const ch2 = supabase.channel("a-pay").on("postgres_changes", { event: "*", schema: "public", table: "payment_settings" }, async () => {
      const { data } = await supabase.from("payment_settings").select("*");
      if (data) { const m: Record<string, boolean> = {}; data.forEach((r: any) => { m[r.method] = r.enabled; }); setPaySettings({ cod: m.cod ?? true, upi: m.upi ?? true, card: m.card ?? true }); }
    }).subscribe();
    (async () => {
      const { data } = await supabase.from("payment_settings").select("*");
      if (data) { const m: Record<string, boolean> = {}; data.forEach((r: any) => { m[r.method] = r.enabled; }); setPaySettings({ cod: m.cod ?? true, upi: m.upi ?? true, card: m.card ?? true }); }
    })();
    const ch3 = supabase.channel("a-settings").on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, loadSettings).subscribe();
    const ch4 = supabase.channel("a-promos").on("postgres_changes", { event: "*", schema: "public", table: "promo_codes" }, loadPromos).subscribe();
    const ch5 = supabase.channel("a-look").on("postgres_changes", { event: "*", schema: "public", table: "lookbook_items" }, loadLookbook).subscribe();
    return () => { [ch1, ch2, ch3, ch4, ch5].forEach(c => supabase.removeChannel(c)); };
  }, [isAdmin, fetchOrders, loadSettings, loadPromos, loadLookbook]);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Local-only gate. AdminGuard already enforced this; double-check here defensively.
  if (typeof window !== "undefined" && !localStorage.getItem("admin_token")) {
    return <Navigate to="/" replace />;
  }

  // ============ PRODUCT CRUD ============
  const resetForm = () => { setForm(empty); setFile(null); setEditingId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Name and price are required");
    const original = Number(form.price);
    const offer = form.offerPrice ? Number(form.offerPrice) : undefined;
    if (offer !== undefined && offer >= original) return toast.error("Offer price must be lower than original");

    setBusy(true);
    let imageUrl: string | null = null;
    if (file) imageUrl = await uploadToBucket(file, "product");

    const payload = {
      name: form.name, category: form.category,
      price: offer ?? original, mrp: offer !== undefined ? original : undefined,
      ...(imageUrl ? { image: imageUrl } : {}),
      tag: form.tag, description: form.description,
      badgeText: form.badgeText, pinned: form.pinned, stockBySize: form.stock,
    };

    if (editingId) {
      const res = await updateProduct(editingId, payload);
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product updated");
    } else {
      if (!imageUrl) { setBusy(false); return toast.error("Please choose a product image"); }
      const res = await addProduct({ ...payload, image: imageUrl } as any);
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
      name: p.name, category: p.category as Category,
      price: String(p.mrp ?? p.price),
      offerPrice: p.mrp ? String(p.price) : "",
      tag: p.tag || "", description: p.description || "",
      badgeText: p.badgeText || "", pinned: !!p.pinned,
      stock: { ...Object.fromEntries(SIZES.map(s => [s, 0])), ...(p.stockBySize || {}) },
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await removeProduct(id);
    if (res.error) toast.error(res.error); else toast.success("Deleted");
  };

  const togglePinned = async (id: string, next: boolean) => {
    const res = await updateProduct(id, { pinned: next });
    if (res.error) toast.error(res.error); else toast.success(next ? "Pinned to homepage" : "Unpinned");
  };

  // ============ ORDERS / PAYMENTS ============
  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else toast.success(`Order ${status}`);
  };

  const togglePayment = async (method: "cod"|"upi"|"card", next: boolean) => {
    setPaySettings(p => ({ ...p, [method]: next }));
    const { error } = await supabase.from("payment_settings").update({ enabled: next, updated_at: new Date().toISOString() }).eq("method", method);
    if (error) { setPaySettings(p => ({ ...p, [method]: !next })); toast.error(error.message); }
    else toast.success(`${method.toUpperCase()} ${next ? "enabled" : "disabled"}`);
  };

  // ============ STORE SETTINGS ============
  const saveSettings = async () => {
    setSettingsBusy(true);
    let hero_image_url = settings.hero_image_url || null;
    if (heroFile) {
      const u = await uploadToBucket(heroFile, "hero");
      if (u) hero_image_url = u;
    }
    const { error } = await supabase.from("store_settings").update({
      free_shipping_threshold: settings.free_shipping_threshold,
      flat_shipping_fee: settings.flat_shipping_fee,
      announcement_text: settings.announcement_text,
      hero_headline: settings.hero_headline,
      hero_subtext: settings.hero_subtext,
      hero_image_url,
    }).eq("id", true);
    setSettingsBusy(false);
    setHeroFile(null);
    if (error) toast.error(error.message); else toast.success("Storefront updated — live on site");
  };

  // ============ PROMO CRUD ============
  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newPromo.code.trim().toUpperCase();
    const value = Number(newPromo.value);
    if (!code || !value || value <= 0) return toast.error("Code and positive value required");
    const { error } = await supabase.from("promo_codes").insert({ code, kind: newPromo.kind, value });
    if (error) return toast.error(error.message);
    setNewPromo({ code: "", kind: "percent", value: "" });
    toast.success(`${code} created`);
  };

  const togglePromo = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ active }).eq("id", id);
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    toast.success("Promo deleted");
  };

  // ============ LOOKBOOK CRUD ============
  const addLookbookItem = async () => {
    if (!lookFile) return toast.error("Please choose an image");
    setLookBusy(true);
    const url = await uploadToBucket(lookFile, "lookbook");
    if (!url) { setLookBusy(false); return; }
    const { error } = await supabase.from("lookbook_items").insert({
      image_url: url,
      product_id: lookProductId || null,
      sort_order: (lookbook[lookbook.length - 1]?.sort_order ?? 0) + 1,
    });
    setLookBusy(false);
    if (error) return toast.error(error.message);
    setLookFile(null); setLookProductId("");
    toast.success("Lookbook image added");
  };

  const deleteLookbookItem = async (id: string) => {
    if (!confirm("Remove this lookbook image?")) return;
    await supabase.from("lookbook_items").delete().eq("id", id);
    toast.success("Removed");
  };

  const updateLookbookLink = async (id: string, product_id: string) => {
    await supabase.from("lookbook_items").update({ product_id: product_id || null }).eq("id", id);
    toast.success("Updated link");
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()));
  const totalSales = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const todayKey = new Date().toDateString();
  const todaysOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayKey);
  const todaysRevenue = todaysOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total || 0), 0);
  const pinnedCount = products.filter(p => p.pinned).length;
  const lowStock = products.filter(p => {
    const s = p.stockBySize || {};
    const total = Object.values(s).reduce((a: number, b: any) => a + Number(b || 0), 0);
    return total > 0 && total <= 5;
  }).length;
  const outOfStock = products.filter(p => {
    const s = p.stockBySize || {};
    return Object.values(s).reduce((a: number, b: any) => a + Number(b || 0), 0) === 0;
  }).length;
  const activePromos = promos.filter(p => p.active).length;
  const loginAt = typeof window !== "undefined" ? Number(localStorage.getItem("admin_login_at") || 0) : 0;

  const refreshAll = async () => {
    await Promise.all([refresh(), fetchOrders(), loadSettings(), loadPromos(), loadLookbook()]);
    toast.success("Dashboard synced");
  };

  return (
    <Layout>
      <div className="container-px mx-auto max-w-[1400px] py-10">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-ink text-primary-foreground p-6 sm:p-8 mb-6">
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-red-cta/20 blur-3xl pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Store Owner Control Room
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold">Welcome back, Boss.</h1>
              <div className="mt-3 flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-[0.2em] text-white/50">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live sync on
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1">Master · 8668183926</span>
                {loginAt > 0 && (
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Since {new Date(loginAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {user?.email && <span className="rounded-full border border-white/15 px-3 py-1">{user.email}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={refreshAll} className="text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 border border-white/20 px-4 py-2.5 rounded-lg hover:bg-white/10 transition">
                <RefreshCw className="h-3.5 w-3.5" /> Sync
              </button>
              <button onClick={() => navigate("/")} className="text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 border border-white/20 px-4 py-2.5 rounded-lg hover:bg-white/10 transition">
                <ExternalLink className="h-3.5 w-3.5" /> View store
              </button>
              <button onClick={async () => { localStorage.removeItem("admin_token"); await signOut(); navigate("/"); }} className="text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 bg-gradient-to-r from-red-cta to-gold text-black font-extrabold px-4 py-2.5 rounded-lg hover:opacity-90 transition">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard icon={IndianRupee} label="Total Sales" value={formatINR(totalSales)} sub={`${formatINR(todaysRevenue)} today`} accent />
          <StatCard icon={Clock} label="Pending Orders" value={String(pendingOrders)} sub={`${todaysOrders.length} placed today`} />
          <StatCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} sub="All time" />
          <StatCard icon={Package} label="Live Products" value={String(products.length)} sub={`${pinnedCount} pinned to homepage`} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={AlertTriangle} label="Low Stock" value={String(lowStock)} sub="5 or fewer units left" warn={lowStock > 0} />
          <StatCard icon={Package} label="Out Of Stock" value={String(outOfStock)} sub="Needs restocking" warn={outOfStock > 0} />
          <StatCard icon={TagIcon} label="Active Promos" value={String(activePromos)} sub={`${promos.length} total codes`} />
          <StatCard icon={Layers} label="Lookbook Slides" value={String(lookbook.length)} sub="Shop the look grid" />
        </div>


        <Tabs defaultValue="products" className="w-full">
          <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-secondary/50 p-1 mb-6">
            <TabsTrigger value="products" className="text-xs uppercase tracking-[0.18em] gap-1.5"><Package className="h-3.5 w-3.5" /> Products</TabsTrigger>
            <TabsTrigger value="storefront" className="text-xs uppercase tracking-[0.18em] gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Storefront</TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs uppercase tracking-[0.18em] gap-1.5"><SettingsIcon className="h-3.5 w-3.5" /> Shipping & Promo</TabsTrigger>
            <TabsTrigger value="lookbook" className="text-xs uppercase tracking-[0.18em] gap-1.5"><Layers className="h-3.5 w-3.5" /> Lookbook</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs uppercase tracking-[0.18em] gap-1.5"><ShoppingBag className="h-3.5 w-3.5" /> Orders</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs uppercase tracking-[0.18em] gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payments</TabsTrigger>
          </TabsList>

          {/* ============ PRODUCTS TAB ============ */}
          <TabsContent value="products" className="space-y-0">
            <div className="grid lg:grid-cols-[420px_1fr] gap-10">
              <form onSubmit={submit} className="border border-border p-6 rounded-md bg-card h-fit lg:sticky lg:top-32">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
                  {editingId && <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
                </div>
                <div className="space-y-4">
                  <Field label="Name"><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" /></Field>
                  <Field label="Category">
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value as Category})} className="input">
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price ₹"><input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input" /></Field>
                    <Field label="Sale Price ₹"><input type="number" min="1" value={form.offerPrice} onChange={e => setForm({...form, offerPrice: e.target.value})} className="input" placeholder="optional" /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tag"><input value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} className="input" placeholder="New, Hot…" /></Field>
                    <Field label="Sale Badge"><input value={form.badgeText} onChange={e => setForm({...form, badgeText: e.target.value})} className="input" placeholder="20% OFF" /></Field>
                  </div>
                  <Field label="Description"><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="input resize-none" /></Field>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">Stock By Size</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {SIZES.map(s => (
                        <div key={s}>
                          <div className="text-[10px] text-center text-muted-foreground">{s}</div>
                          <input type="number" min="0" value={form.stock[s] ?? 0} onChange={e => setForm({ ...form, stock: { ...form.stock, [s]: Number(e.target.value) || 0 } })} className="input text-center px-1 py-1.5 text-xs" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} className="h-4 w-4 accent-gold" />
                    <span className="text-sm font-semibold flex items-center gap-1.5"><Pin className="h-3.5 w-3.5" /> Pin to Homepage (Trending Now)</span>
                  </label>

                  <Field label={editingId ? "Replace Image (optional)" : "Image"}>
                    <label className="block border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-foreground transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                      {preview ? <img src={preview} alt="" className="mx-auto h-32 object-cover rounded" /> : (
                        <div className="text-xs text-muted-foreground flex flex-col items-center gap-2 py-4"><Upload className="h-5 w-5" /> Click to upload</div>
                      )}
                    </label>
                  </Field>
                </div>
                <button disabled={busy} type="submit" className="mt-6 w-full bg-ink text-primary-foreground py-3.5 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-2 disabled:opacity-60 rounded-md">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {editingId ? "Save Changes" : "Add Product"}
                </button>
              </form>

              <div>
                <h2 className="font-display text-xl font-bold mb-4">Catalog Manager</h2>
                <div className="flex items-center gap-3 border-b border-border pb-3 mb-5">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" className="flex-1 bg-transparent text-sm focus:outline-none" />
                </div>
                {filtered.length === 0 ? (
                  <div className="border border-dashed border-border p-12 text-center rounded-md">
                    <p className="text-muted-foreground text-sm">No products yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(p => (
                      <div key={p.id} className="border border-border rounded-md overflow-hidden bg-card group">
                        <div className="aspect-[4/5] bg-secondary overflow-hidden relative">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {p.pinned && <span className="absolute top-2 left-2 bg-gold text-ink text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1"><Pin className="h-2.5 w-2.5" /> Pinned</span>}
                          {p.badgeText && <span className="absolute top-2 right-2 bg-red-cta text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">{p.badgeText}</span>}
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
                            <button onClick={() => togglePinned(p.id, !p.pinned)} title={p.pinned ? "Unpin" : "Pin"} className={`text-[11px] px-3 py-2 rounded ${p.pinned ? "bg-gold text-ink" : "border border-border hover:bg-muted"}`}>
                              <Pin className="h-3 w-3" />
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
          </TabsContent>

          {/* ============ STOREFRONT TAB ============ */}
          <TabsContent value="storefront">
            <div className="border border-border rounded-md p-6 bg-card max-w-3xl">
              <h2 className="font-display text-xl font-bold mb-1">Storefront Editor</h2>
              <p className="text-xs text-muted-foreground mb-6">Live-edit homepage text and hero. Saved instantly to all visitors.</p>
              <div className="space-y-5">
                <Field label="Top Announcement Bar">
                  <input value={settings.announcement_text} onChange={e => setSettings({...settings, announcement_text: e.target.value})} className="input" placeholder="Free shipping over ₹2500…" />
                </Field>
                <Field label="Hero Headline">
                  <input value={settings.hero_headline} onChange={e => setSettings({...settings, hero_headline: e.target.value})} className="input" />
                </Field>
                <Field label="Hero Subtext">
                  <input value={settings.hero_subtext} onChange={e => setSettings({...settings, hero_subtext: e.target.value})} className="input" />
                </Field>
                <Field label="Hero Background Image">
                  <label className="block border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-foreground transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={e => setHeroFile(e.target.files?.[0] ?? null)} />
                    {heroFile ? (
                      <img src={URL.createObjectURL(heroFile)} alt="" className="mx-auto h-40 object-cover rounded" />
                    ) : settings.hero_image_url ? (
                      <img src={settings.hero_image_url} alt="" className="mx-auto h-40 object-cover rounded" />
                    ) : (
                      <div className="text-xs text-muted-foreground flex flex-col items-center gap-2 py-6"><Upload className="h-5 w-5" /> Click to upload hero image</div>
                    )}
                  </label>
                </Field>
                <button onClick={saveSettings} disabled={settingsBusy} className="bg-ink text-primary-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold rounded inline-flex items-center gap-2 hover:bg-gold hover:text-ink transition disabled:opacity-60">
                  {settingsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save & Publish
                </button>
              </div>
            </div>
          </TabsContent>

          {/* ============ SHIPPING & PROMO TAB ============ */}
          <TabsContent value="shipping" className="space-y-8">
            <div className="border border-border rounded-md p-6 bg-card max-w-3xl">
              <h2 className="font-display text-xl font-bold mb-1">Shipping Math</h2>
              <p className="text-xs text-muted-foreground mb-6">Drives the cart drawer instantly for every customer.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Free Shipping Threshold ₹">
                  <input type="number" min="0" value={settings.free_shipping_threshold} onChange={e => setSettings({...settings, free_shipping_threshold: Number(e.target.value) || 0})} className="input" />
                </Field>
                <Field label="Flat Shipping Fee ₹">
                  <input type="number" min="0" value={settings.flat_shipping_fee} onChange={e => setSettings({...settings, flat_shipping_fee: Number(e.target.value) || 0})} className="input" />
                </Field>
              </div>
              <button onClick={saveSettings} disabled={settingsBusy} className="mt-5 bg-ink text-primary-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold rounded inline-flex items-center gap-2 hover:bg-gold hover:text-ink transition disabled:opacity-60">
                {settingsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Shipping
              </button>
            </div>

            <div className="border border-border rounded-md p-6 bg-card">
              <h2 className="font-display text-xl font-bold mb-1">Promo Code Generator</h2>
              <p className="text-xs text-muted-foreground mb-6">Create discount codes customers can apply at checkout.</p>
              <form onSubmit={createPromo} className="grid sm:grid-cols-[1fr_140px_120px_auto] gap-3 mb-6 items-end">
                <Field label="Code"><input required value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} placeholder="SUMMER25" className="input uppercase" /></Field>
                <Field label="Type">
                  <select value={newPromo.kind} onChange={e => setNewPromo({...newPromo, kind: e.target.value as any})} className="input">
                    <option value="percent">% Percent</option>
                    <option value="flat">₹ Flat</option>
                  </select>
                </Field>
                <Field label="Value"><input required type="number" min="1" value={newPromo.value} onChange={e => setNewPromo({...newPromo, value: e.target.value})} className="input" /></Field>
                <button type="submit" className="bg-ink text-primary-foreground px-5 h-[42px] text-xs uppercase tracking-[0.22em] font-bold rounded inline-flex items-center gap-2 hover:bg-gold hover:text-ink transition">
                  <Plus className="h-4 w-4" /> Create
                </button>
              </form>
              <div className="divide-y divide-border border-y border-border">
                {promos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No promo codes yet. Create your first one above.</p>
                ) : promos.map(p => (
                  <div key={p.id} className="py-3 flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2"><TagIcon className="h-4 w-4 text-gold" /><code className="font-mono font-bold text-sm">{p.code}</code></div>
                    <span className="text-xs px-2 py-1 rounded bg-secondary">{p.kind === "percent" ? `${p.value}% off` : `${formatINR(p.value)} off`}</span>
                    <div className="flex-1" />
                    <label className="text-xs flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={p.active} onChange={e => togglePromo(p.id, e.target.checked)} className="accent-gold" />
                      <span className={p.active ? "text-gold font-semibold" : "text-muted-foreground"}>{p.active ? "Active" : "Inactive"}</span>
                    </label>
                    <button onClick={() => deletePromo(p.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ============ LOOKBOOK TAB ============ */}
          <TabsContent value="lookbook">
            <div className="border border-border rounded-md p-6 bg-card mb-6">
              <h2 className="font-display text-xl font-bold mb-1">Add Lookbook Image</h2>
              <p className="text-xs text-muted-foreground mb-5">Upload editorial photos and optionally link to a product for "Shop This Look".</p>
              <div className="grid sm:grid-cols-[1fr_280px_auto] gap-4 items-end">
                <Field label="Image">
                  <label className="block border-2 border-dashed border-border rounded-md p-3 text-center cursor-pointer hover:border-foreground transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={e => setLookFile(e.target.files?.[0] ?? null)} />
                    {lookFile ? <img src={URL.createObjectURL(lookFile)} alt="" className="mx-auto h-24 object-cover rounded" /> : <div className="text-xs text-muted-foreground py-4 flex items-center justify-center gap-2"><Upload className="h-4 w-4" /> Choose image</div>}
                  </label>
                </Field>
                <Field label="Link to Product (optional)">
                  <select value={lookProductId} onChange={e => setLookProductId(e.target.value)} className="input">
                    <option value="">— Not linked —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <button onClick={addLookbookItem} disabled={lookBusy} className="bg-ink text-primary-foreground px-5 h-[42px] text-xs uppercase tracking-[0.22em] font-bold rounded inline-flex items-center gap-2 hover:bg-gold hover:text-ink transition disabled:opacity-60">
                  {lookBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {lookbook.map(l => (
                <div key={l.id} className="border border-border rounded-md overflow-hidden bg-card">
                  <div className="aspect-[4/5] bg-secondary"><img src={l.image_url} alt="" className="w-full h-full object-cover" /></div>
                  <div className="p-2.5 space-y-2">
                    <select value={l.product_id || ""} onChange={e => updateLookbookLink(l.id, e.target.value)} className="input text-xs py-1.5">
                      <option value="">— Not linked —</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => deleteLookbookItem(l.id)} className="w-full text-[11px] uppercase tracking-[0.18em] bg-destructive text-destructive-foreground py-1.5 hover:opacity-90 rounded flex items-center justify-center gap-1">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {lookbook.length === 0 && <p className="col-span-full text-sm text-muted-foreground text-center py-12">No lookbook images yet.</p>}
            </div>
          </TabsContent>

          {/* ============ ORDERS TAB ============ */}
          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="py-16 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : orders.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center rounded-md"><p className="text-muted-foreground text-sm">No orders yet.</p></div>
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
                        {o.status === "pending" && <button onClick={() => updateOrderStatus(o.id, "shipped")} className="border border-border px-3 py-1.5 hover:bg-muted rounded">Mark Shipped</button>}
                        {o.status === "shipped" && <button onClick={() => updateOrderStatus(o.id, "delivered")} className="border border-border px-3 py-1.5 hover:bg-muted rounded">Mark Delivered</button>}
                        {o.status !== "cancelled" && o.status !== "delivered" && <button onClick={() => updateOrderStatus(o.id, "cancelled")} className="border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10 rounded">Cancel</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ============ PAYMENTS TAB ============ */}
          <TabsContent value="payments">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2">Storefront Gateway</p>
            <h2 className="font-display text-2xl font-bold mb-6">Payment Methods</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {([
                { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay on delivery" },
                { id: "upi", label: "UPI", icon: Wallet, desc: "GPay · PhonePe · Paytm" },
                { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa · MC · RuPay" },
              ] as const).map(({ id, label, icon: Icon, desc }) => {
                const on = paySettings[id];
                return (
                  <div key={id} className={`border-2 rounded-md p-5 transition-colors ${on ? "border-gold bg-gold/5" : "border-border bg-card opacity-70"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full grid place-items-center ${on ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"}`}><Icon className="h-5 w-5" /></div>
                        <div>
                          <p className="font-semibold text-sm">{label}</p>
                          <p className="text-[11px] text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <button onClick={() => togglePayment(id, !on)} aria-pressed={on} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-gold" : "bg-muted"}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    <p className={`mt-3 text-[10px] uppercase tracking-[0.22em] font-bold ${on ? "text-gold" : "text-muted-foreground"}`}>{on ? "Live on Checkout" : "Hidden from Checkout"}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ============ AUDIT LOG TAB ============ */}
          <TabsContent value="audit">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2">Accountability</p>
            <h2 className="font-display text-2xl font-bold mb-6">Audit Log</h2>
            <AuditLog />
          </TabsContent>
        </Tabs>

      </div>

      <style>{`
        .input { width: 100%; background: transparent; border: 1px solid hsl(var(--border)); padding: 0.625rem 0.75rem; border-radius: 4px; font-size: 0.875rem; outline: none; transition: border-color .15s; }
        .input:focus { border-color: hsl(var(--foreground)); }
      `}</style>
    </Layout>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, accent, warn }: { icon: any; label: string; value: string; sub?: string; accent?: boolean; warn?: boolean }) => (
  <div className={`border rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated ${accent ? "bg-ink text-primary-foreground border-ink" : warn ? "bg-card border-red-cta/40" : "bg-card border-border"}`}>
    <div className="flex items-center justify-between">
      <p className={`text-[10px] uppercase tracking-[0.22em] ${accent ? "text-gold" : warn ? "text-red-cta" : "text-muted-foreground"}`}>{label}</p>
      <div className={`h-9 w-9 grid place-items-center rounded-full ${accent ? "bg-gold/20 text-gold" : warn ? "bg-red-cta/10 text-red-cta" : "bg-secondary text-foreground"}`}><Icon className="h-4 w-4" /></div>
    </div>
    <p className="font-display text-2xl font-bold mt-3">{value}</p>
    {sub && <p className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${accent ? "text-white/45" : "text-muted-foreground"}`}>{sub}</p>}
  </div>
);


const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">{label}</label>
    {children}
  </div>
);

export default Admin;
