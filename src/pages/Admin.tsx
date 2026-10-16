import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Trash2, Plus, Search, Loader2, LogOut, Upload, Pencil, X,
  IndianRupee, Clock, Package, ShoppingBag, CreditCard, Wallet,
  Banknote, Pin, Save, Image as ImageIcon, Tag as TagIcon,
  Settings as SettingsIcon, Layers, ShieldCheck, RefreshCw,
  ExternalLink, AlertTriangle, LayoutDashboard, Megaphone,
  Sparkles, Percent, Grid, Eye, Star, ArrowLeft, ArrowRight,
  Sliders, Users, CheckCircle2, AlertCircle, BarChart3, LayoutGrid,
  List, ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProducts, Category } from "@/context/ProductsContext";
import { useCms } from "@/context/CmsContext";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditLog from "@/components/admin/AuditLog";
import PaymentMethods from "@/components/admin/PaymentMethods";
import { AdminProductGalleryModal } from "@/components/admin/AdminProductGalleryModal";
import { AdminBackgroundManager } from "@/components/admin/AdminBackgroundManager";
import { AdminAdvertisementManager } from "@/components/admin/AdminAdvertisementManager";
import { AdminPromotionalBanners } from "@/components/admin/AdminPromotionalBanners";
import { AdminOffersManager } from "@/components/admin/AdminOffersManager";
import { AdminHomepageLayout } from "@/components/admin/AdminHomepageLayout";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminMediaLibrary } from "@/components/admin/AdminMediaLibrary";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

const CATS: Category[] = ["Shirts", "T-Shirts", "Pants", "Jeans", "Jackets", "Hoodies", "Suits", "Activewear", "Innerwear", "Accessories"];
const SIZES = ["S", "M", "L", "XL", "XXL"];

const emptyProductForm = {
  name: "",
  category: "Shirts" as Category,
  price: "",
  offerPrice: "",
  tag: "",
  description: "",
  badgeText: "",
  brand: "DEXTER",
  sku: "",
  pinned: false,
  stock: Object.fromEntries(SIZES.map((s) => [s, 5])) as Record<string, number>,
  images: [] as string[],
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

type Lookbook = {
  id: string;
  image_url: string;
  product_id: string | null;
  caption: string | null;
  sort_order: number;
  active: boolean;
};

const Admin = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { products, addProduct, updateProduct, removeProduct, refresh: refreshProducts } = useProducts();
  const { advertisements, promotionalBanners, discountCampaigns, homepageSettings, uploadMediaAsset } = useCms();
  const navigate = useNavigate();

  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Product form state
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [catalogueViewMode, setCatalogueViewMode] = useState<"grid" | "table">("grid");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc">("newest");
  const [form, setForm] = useState(emptyProductForm);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Dedicated Product Gallery Modal State
  const [galleryModalProduct, setGalleryModalProduct] = useState<any | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderQuery, setOrderQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Store settings
  const [settings, setSettings] = useState({
    free_shipping_threshold: 2500,
    flat_shipping_fee: 162,
    announcement_text: "",
    hero_headline: "DEXTER MENS CLOTHING",
    hero_subtext: "Premium Menswear · Jayankondam",
    hero_image_url: "",
  });
  const [settingsBusy, setSettingsBusy] = useState(false);

  // Lookbook
  const [lookbook, setLookbook] = useState<Lookbook[]>([]);
  const [lookFile, setLookFile] = useState<File | null>(null);
  const [lookProductId, setLookProductId] = useState<string>("");
  const [lookBusy, setLookBusy] = useState(false);

  // Load orders
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (data) setOrders(data as any);
    } catch {
      // Offline fallback
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const { data } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();
      if (data) {
        setSettings({
          free_shipping_threshold: Number(data.free_shipping_threshold) || 2500,
          flat_shipping_fee: Number(data.flat_shipping_fee) || 162,
          announcement_text: data.announcement_text || "",
          hero_headline: data.hero_headline || "DEXTER MENS CLOTHING",
          hero_subtext: data.hero_subtext || "Premium Menswear · Jayankondam",
          hero_image_url: data.hero_image_url || "",
        });
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Load lookbook
  const loadLookbook = useCallback(async () => {
    try {
      const { data } = await supabase.from("lookbook_items").select("*").order("sort_order", { ascending: true });
      if (data) setLookbook(data as Lookbook[]);
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    loadSettings();
    loadLookbook();
  }, [fetchOrders, loadSettings, loadLookbook]);

  // ==========================================
  // PRODUCT MULTI-IMAGE MANAGEMENT (5+ IMAGES)
  // ==========================================

  // Multi-image upload for Product Form
  const handleFormImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const res = await uploadMediaAsset(file, "products");
      if (res.url) newUrls.push(res.url);
    }

    if (newUrls.length > 0) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
      toast.success(`Added ${newUrls.length} image(s) to product gallery.`);
    }
    setUploadingGallery(false);
  };

  // Set primary image inside product form
  const setFormPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = form.images[index];
    const rest = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: [target, ...rest] }));
    toast.success("Set as primary product image (card thumbnail).");
  };

  // Reorder images inside product form
  const moveFormImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const next = [...form.images];
    const item = next.splice(from, 1)[0];
    next.splice(to, 0, item);
    setForm((prev) => ({ ...prev, images: next }));
  };

  // Remove image inside product form
  const removeFormImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Reset product form
  const resetProductForm = () => {
    setForm(emptyProductForm);
    setEditingId(null);
  };

  // Submit product create/update
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      return toast.error("Product name and price are required.");
    }

    const original = Number(form.price);
    const offer = form.offerPrice ? Number(form.offerPrice) : undefined;
    if (offer !== undefined && offer >= original) {
      return toast.error("Offer price must be lower than original MRP.");
    }

    if (form.images.length === 0) {
      return toast.error("Please upload at least one product image.");
    }

    setBusy(true);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: offer ?? original,
      mrp: offer !== undefined ? original : undefined,
      image: form.images[0],
      images: form.images,
      tag: form.tag || undefined,
      description: form.description || undefined,
      badgeText: form.badgeText || undefined,
      brand: form.brand || "DEXTER",
      sku: form.sku || undefined,
      pinned: form.pinned,
      stockBySize: form.stock,
      status: "active" as const,
    };

    if (editingId) {
      const res = await updateProduct(editingId, payload);
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product and gallery updated successfully!");
    } else {
      const res = await addProduct(payload as any);
      setBusy(false);
      if (res.error) return toast.error(res.error);
      toast.success("Product created with multi-image gallery!");
    }

    resetProductForm();
    refreshProducts();
  };

  // Start editing existing product
  const startEditProduct = (p: any) => {
    setEditingId(p.id);
    const gallery = p.images && p.images.length > 0 ? p.images : [p.image];
    setForm({
      name: p.name,
      category: p.category as Category,
      price: String(p.mrp ?? p.price),
      offerPrice: p.mrp ? String(p.price) : "",
      tag: p.tag || "",
      description: p.description || "",
      badgeText: p.badgeText || "",
      brand: p.brand || "DEXTER",
      sku: p.sku || "",
      pinned: !!p.pinned,
      stock: { ...Object.fromEntries(SIZES.map((s) => [s, 0])), ...(p.stockBySize || {}) },
      images: gallery,
    });
    setActiveTab("products");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await removeProduct(id);
    if (res.error) toast.error(res.error);
    else toast.success("Product deleted.");
  };

  // Save gallery directly from modal
  const handleSaveGalleryDirect = async (productId: string, images: string[]) => {
    const res = await updateProduct(productId, { images, image: images[0] });
    if (res.error) throw new Error(res.error);
    refreshProducts();
  };

  // Update order status
  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    }
  };

  // Save general store settings
  const handleSaveStoreSettings = async () => {
    setSettingsBusy(true);
    const { error } = await supabase.from("store_settings").update({
      free_shipping_threshold: settings.free_shipping_threshold,
      flat_shipping_fee: settings.flat_shipping_fee,
      announcement_text: settings.announcement_text,
      hero_headline: settings.hero_headline,
      hero_subtext: settings.hero_subtext,
    }).eq("id", true);

    setSettingsBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Store settings updated live!");
  };

  // Filtered Products with stock filter & sorting
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchQ =
        !q.trim() ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(q.toLowerCase()));
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;

      // Stock filter
      let matchStock = true;
      const totalUnits = Object.values(p.stockBySize || {}).reduce((a, b) => a + b, 0);
      const hasLowSize = Object.values(p.stockBySize || {}).some((qty) => qty <= 2);

      if (stockFilter === "in_stock") {
        matchStock = totalUnits > 5;
      } else if (stockFilter === "low_stock") {
        matchStock = hasLowSize || totalUnits <= 5;
      } else if (stockFilter === "out_of_stock") {
        matchStock = totalUnits === 0;
      }

      return matchQ && matchCat && matchStock;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock_asc") {
        const stockA = Object.values(a.stockBySize || {}).reduce((x, y) => x + y, 0);
        const stockB = Object.values(b.stockBySize || {}).reduce((x, y) => x + y, 0);
        return stockA - stockB;
      }
      if (sortBy === "stock_desc") {
        const stockA = Object.values(a.stockBySize || {}).reduce((x, y) => x + y, 0);
        const stockB = Object.values(b.stockBySize || {}).reduce((x, y) => x + y, 0);
        return stockB - stockA;
      }
      return 0; // newest
    });

    return list;
  }, [products, q, categoryFilter, stockFilter, sortBy]);

  // Overall Statistics for Overview tab
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0), [orders]);
  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      if (!p.stockBySize) return false;
      return Object.values(p.stockBySize).some((qty) => qty <= 2);
    }).length;
  }, [products]);
  const outOfStockCount = useMemo(() => {
    return products.filter((p) => {
      if (!p.stockBySize) return false;
      const sum = Object.values(p.stockBySize).reduce((a, b) => a + b, 0);
      return sum === 0;
    }).length;
  }, [products]);
  const totalCatalogueUnits = useMemo(() => {
    return products.reduce((acc, p) => {
      const sum = Object.values(p.stockBySize || {}).reduce((a, b) => a + b, 0);
      return acc + (sum || 10);
    }, 0);
  }, [products]);
  const totalCatalogueValuation = useMemo(() => {
    return products.reduce((acc, p) => {
      const sum = Object.values(p.stockBySize || {}).reduce((a, b) => a + b, 0) || 10;
      return acc + sum * p.price;
    }, 0);
  }, [products]);

  return (
    <Layout>
      <div className="container-px mx-auto max-w-[1500px] py-8">
        {/* Top Control Room Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-ink text-white rounded-2xl shadow-elevated mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold">DEXTER Operations Control Room</p>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold mt-1">
              Store & Content Management System
            </h1>
            <p className="text-xs text-white/60 mt-1">
              Full dynamic control over products, 5+ image galleries, advertisements, homepage background, banners, and offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-gold hover:text-ink text-xs uppercase tracking-wider font-bold rounded-lg transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Storefront
            </a>
            <button
              onClick={() => {
                signOut();
                localStorage.removeItem("dexter_dev_admin");
                navigate("/dexter-boss");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/20 hover:border-red-500 hover:text-red-400 text-xs uppercase tracking-wider font-bold rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Exit
            </button>
          </div>
        </div>

        {/* 14 Management Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="border-b border-border pb-2 overflow-x-auto scrollbar-none">
            <TabsList className="bg-transparent h-auto p-0 flex gap-2 w-max">
              <TabsTrigger value="overview" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5 text-gold" /> Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-gold" /> Analytics & Charts
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Package className="h-3.5 w-3.5 mr-1.5 text-gold" /> Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="background" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-gold" /> Homepage Design & Background
              </TabsTrigger>
              <TabsTrigger value="advertisements" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Megaphone className="h-3.5 w-3.5 mr-1.5 text-gold" /> Advertisements ({advertisements.length})
              </TabsTrigger>
              <TabsTrigger value="banners" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-gold" /> Promo Banners ({promotionalBanners.length})
              </TabsTrigger>
              <TabsTrigger value="offers" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Percent className="h-3.5 w-3.5 mr-1.5 text-gold" /> Offers & Discounts ({discountCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Grid className="h-3.5 w-3.5 mr-1.5 text-gold" /> Homepage Layout
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Layers className="h-3.5 w-3.5 mr-1.5 text-gold" /> Categories
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-gold" /> Media Library
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-gold" /> Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <Users className="h-3.5 w-3.5 mr-1.5 text-gold" /> Customers
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <CreditCard className="h-3.5 w-3.5 mr-1.5 text-gold" /> Payment Settings
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <SettingsIcon className="h-3.5 w-3.5 mr-1.5 text-gold" /> Content Settings
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-gold" /> Audit Log
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. DASHBOARD OVERVIEW & ANALYTICS */}
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Visual Analytics & Trajectory Suite */}
            <AdminAnalytics
              orders={orders}
              products={products}
              advertisements={advertisements}
              discountCampaigns={discountCampaigns}
              promotionalBanners={promotionalBanners}
            />

            {/* Quick Actions Panel */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-card">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Content Actions</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => { resetProductForm(); setActiveTab("products"); }}
                  className="p-4 bg-secondary hover:bg-gold hover:text-ink text-left rounded-xl transition-all border border-border group"
                >
                  <Package className="h-6 w-6 text-gold group-hover:text-ink mb-2" />
                  <p className="font-bold text-sm">Add New Product</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload 5+ images, size matrix & pricing</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("background")}
                  className="p-4 bg-secondary hover:bg-gold hover:text-ink text-left rounded-xl transition-all border border-border group"
                >
                  <ImageIcon className="h-6 w-6 text-red-cta mb-2" />
                  <p className="font-bold text-sm">Change Background</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Adjust hero photo, focal point & opacity</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("advertisements")}
                  className="p-4 bg-secondary hover:bg-gold hover:text-ink text-left rounded-xl transition-all border border-border group"
                >
                  <Megaphone className="h-6 w-6 text-gold group-hover:text-ink mb-2" />
                  <p className="font-bold text-sm">Create Advertisement</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Featured homepage & shop campaigns</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("offers")}
                  className="p-4 bg-secondary hover:bg-gold hover:text-ink text-left rounded-xl transition-all border border-border group"
                >
                  <Percent className="h-6 w-6 text-red-cta mb-2" />
                  <p className="font-bold text-sm">Create New Offer</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Discounts, flash sales & coupons</p>
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs uppercase tracking-wider font-bold text-gold hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No orders recorded yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{o.customer_name} ({o.phone})</p>
                        <p className="text-[11px] text-muted-foreground">Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-ink">{formatINR(o.total)}</p>
                        <span className="text-[10px] uppercase font-bold text-gold">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* DEDICATED ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-8 animate-fade-in">
            <AdminAnalytics
              orders={orders}
              products={products}
              advertisements={advertisements}
              discountCampaigns={discountCampaigns}
              promotionalBanners={promotionalBanners}
            />
          </TabsContent>

          {/* 2. PRODUCT MANAGEMENT WITH 4-5 OR MORE IMAGES */}
          <TabsContent value="products" className="space-y-8 animate-fade-in">
            {/* Add / Edit Product Form with 5+ Image Gallery */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-card">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Inventory Control</span>
                  <h3 className="font-display text-xl font-extrabold text-foreground mt-0.5">
                    {editingId ? "Edit Product & Gallery" : "Add New Product (with 5+ Image Gallery)"}
                  </h3>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-xs uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground"
                  >
                    Cancel Editing ✕
                  </button>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Heavyweight Oversized Drop-Shoulder Tee"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                    >
                      {CATS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Brand</label>
                    <input
                      type="text"
                      placeholder="DEXTER"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                    />
                  </div>
                </div>

                {/* Pricing & SKU */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">MRP / Original Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 1499"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Special Offer Price (Optional ₹)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 899"
                      value={form.offerPrice}
                      onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">SKU / Code</label>
                    <input
                      type="text"
                      placeholder="e.g. DX-TEE-005"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Promotional Tag / Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Bestseller / 240 GSM"
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                    />
                  </div>
                </div>

                {/* MULTIPLE PRODUCT IMAGES (5+ IMAGES SECTION) */}
                <div className="p-5 bg-muted/20 border border-border rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-extrabold text-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-gold" /> Product Gallery Images (5+ Recommended)
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Upload front-view, back-view, side-view, detail/texture, and model styling. The first image is the Primary Card Image.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-gold hover:text-ink text-xs uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-colors shrink-0">
                      <Upload className="h-3.5 w-3.5" /> Upload Multiple Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFormImageUpload}
                        disabled={uploadingGallery}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadingGallery && (
                    <p className="text-xs font-bold text-gold animate-pulse flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading image files to storage...
                    </p>
                  )}

                  {/* Gallery Thumbnails List with Reorder, Set Primary, Delete */}
                  {form.images.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground">
                        No product images selected. Upload 4–5 or more angles for optimal customer presentation.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {form.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${
                            idx === 0 ? "border-gold shadow-md" : "border-border"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />

                          {/* Index badge */}
                          <span className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-bold">
                            {idx === 0 ? "★ Primary" : `#${idx + 1}`}
                          </span>

                          {/* Controls bar */}
                          <div className="absolute inset-x-0 bottom-0 bg-black/85 p-1.5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setFormPrimaryImage(idx)}
                                  title="Make Primary"
                                  className="p-1 hover:text-gold"
                                >
                                  <Star className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => moveFormImage(idx, idx - 1)}
                                disabled={idx === 0}
                                title="Move Left"
                                className="p-1 disabled:opacity-20 hover:text-gold"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveFormImage(idx, idx + 1)}
                                disabled={idx === form.images.length - 1}
                                title="Move Right"
                                className="p-1 disabled:opacity-20 hover:text-gold"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFormImage(idx)}
                              title="Delete Image"
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stock Matrix per Size */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Inventory Stock Matrix (Units by Size)</label>
                  <div className="grid grid-cols-5 gap-3">
                    {SIZES.map((sz) => (
                      <div key={sz} className="p-2.5 bg-muted/30 border border-border rounded-lg text-center">
                        <span className="text-xs font-bold text-foreground block mb-1">Size {sz}</span>
                        <input
                          type="number"
                          min={0}
                          value={form.stock[sz] || 0}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              stock: { ...form.stock, [sz]: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="w-full bg-background border border-border px-2 py-1 text-xs text-center font-mono font-bold rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe tailoring, cotton fabric, styling recommendations, and wash care..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                      className="accent-gold h-4 w-4"
                    />
                    <span className="text-xs font-bold text-foreground">Pin to Homepage Trending Section</span>
                  </label>

                  <div className="flex items-center gap-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="px-4 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg flex items-center gap-2"
                    >
                      {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingId ? "Update Product & Gallery" : "Save Product to Store"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Products Search & List */}
            <div className="space-y-6">
              {/* Catalogue Quick Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/20 border border-border rounded-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block">Active Catalogue</span>
                  <span className="font-display text-lg font-black text-foreground">{products.length} Styles</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block">Total Stock Units</span>
                  <span className="font-display text-lg font-black text-foreground">{totalCatalogueUnits} Pieces</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block">Catalogue Valuation</span>
                  <span className="font-display text-lg font-black text-gold">{formatINR(totalCatalogueValuation)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block">Stock Health</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${lowStockCount > 0 ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                      {lowStockCount} Low
                    </span>
                    {outOfStockCount > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-500">
                        {outOfStockCount} OOS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by product name, category, or SKU..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full bg-card border border-border pl-9 pr-4 py-2 text-xs rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-card border border-border px-3 py-2 text-xs rounded-lg font-bold"
                  >
                    <option value="all">All Categories</option>
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Stock Level Filter */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="bg-card border border-border px-3 py-2 text-xs rounded-lg font-bold"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="in_stock">In Stock (&gt;5)</option>
                    <option value="low_stock">Low Stock (≤2)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-card border border-border px-3 py-2 text-xs rounded-lg font-bold"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="stock_asc">Stock: Low to High (Restock Priority)</option>
                    <option value="stock_desc">Stock: High to Low</option>
                  </select>

                  {/* View Mode Switcher */}
                  <div className="flex items-center p-1 bg-secondary rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setCatalogueViewMode("grid")}
                      className={`p-1.5 rounded transition-all ${
                        catalogueViewMode === "grid"
                          ? "bg-ink text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Grid Card View"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogueViewMode("table")}
                      className={`p-1.5 rounded transition-all ${
                        catalogueViewMode === "table"
                          ? "bg-ink text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Table List View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-card border border-border rounded-2xl">
                  <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground">No products match current filters.</p>
                  <p className="text-xs text-muted-foreground mt-1">Try resetting search keywords or category filters.</p>
                  <button
                    type="button"
                    onClick={() => { setQ(""); setCategoryFilter("all"); setStockFilter("all"); }}
                    className="mt-4 px-4 py-1.5 bg-secondary text-xs uppercase tracking-wider font-bold rounded hover:bg-border transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : catalogueViewMode === "grid" ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((p) => {
                    const imgCount = p.images?.length || 1;
                    const totalUnits = Object.values(p.stockBySize || {}).reduce((a, b) => a + b, 0);
                    const isLow = Object.values(p.stockBySize || {}).some((qty) => qty <= 2) || totalUnits <= 5;
                    const isOos = totalUnits === 0;

                    return (
                      <div
                        key={p.id}
                        className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
                      >
                        {/* Image Showcase */}
                        <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Pinned star badge */}
                          {p.pinned && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gold text-ink text-[9px] uppercase tracking-wider font-black rounded shadow flex items-center gap-1">
                              <Star className="h-2.5 w-2.5 fill-ink" /> Pinned
                            </span>
                          )}

                          {/* Gallery count pill */}
                          <button
                            type="button"
                            onClick={() => setGalleryModalProduct(p)}
                            className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 hover:bg-gold hover:text-ink text-white text-[9px] uppercase tracking-wider font-bold rounded backdrop-blur transition-colors"
                            title="Open 5+ multi-image gallery manager"
                          >
                            📷 {imgCount} Images
                          </button>

                          {/* Stock Alert Badge */}
                          <div className="absolute bottom-2 left-2">
                            {isOos ? (
                              <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] uppercase font-bold rounded shadow">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 bg-amber-500 text-ink text-[9px] uppercase font-bold rounded shadow">
                                Low Stock ({totalUnits} left)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-black/75 text-emerald-400 text-[9px] uppercase font-bold rounded shadow">
                                {totalUnits} in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              <span className="font-bold text-gold">{p.category}</span>
                              <span className="font-mono">{p.sku || "NO SKU"}</span>
                            </div>

                            <h4 className="font-display font-bold text-sm text-foreground line-clamp-1 group-hover:text-gold transition-colors">
                              {p.name}
                            </h4>

                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-base font-black text-ink">
                                {formatINR(p.price)}
                              </span>
                              {p.mrp && p.mrp > p.price && (
                                <span className="text-xs line-through text-muted-foreground">
                                  {formatINR(p.mrp)}
                                </span>
                              )}
                            </div>

                            {/* Stock by size pills */}
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {Object.entries(p.stockBySize || {}).map(([sz, qty]) => (
                                <span
                                  key={sz}
                                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded font-bold ${
                                    qty === 0
                                      ? "bg-red-500/10 text-red-500"
                                      : qty <= 2
                                      ? "bg-amber-500/10 text-amber-600"
                                      : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {sz}:{qty}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setGalleryModalProduct(p)}
                              className="px-2.5 py-1.5 bg-secondary hover:bg-gold hover:text-ink text-[10px] uppercase tracking-wider font-extrabold rounded transition-colors text-left flex-1"
                              title="Edit multi-angle product gallery"
                            >
                              Gallery ({imgCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditProduct(p)}
                              className="p-1.5 bg-secondary hover:bg-foreground hover:text-background rounded transition-colors"
                              title="Edit product details"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border uppercase tracking-wider text-[10px] text-muted-foreground font-extrabold">
                        <tr>
                          <th className="py-3 px-4">Product / Gallery</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Price / MRP</th>
                          <th className="py-3 px-4">Stock by Size</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredProducts.map((p) => {
                          const imgCount = p.images?.length || 1;
                          return (
                            <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-14 bg-secondary rounded overflow-hidden shrink-0 border border-border relative">
                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                    <span className="absolute bottom-0 inset-x-0 bg-ink/90 text-[8px] text-white text-center font-bold">
                                      {imgCount} img
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground text-sm line-clamp-1">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      SKU: {p.sku || "—"} {p.brand ? `· ${p.brand}` : ""}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-semibold text-muted-foreground">{p.category}</td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-ink">{formatINR(p.price)}</span>
                                {p.mrp && p.mrp > p.price && (
                                  <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                                    {formatINR(p.mrp)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1.5">
                                  {Object.entries(p.stockBySize || {}).map(([sz, qty]) => (
                                    <span
                                      key={sz}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                        qty <= 2 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {sz}:{qty}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setGalleryModalProduct(p)}
                                    className="px-2.5 py-1 bg-secondary hover:bg-gold hover:text-ink text-[10px] uppercase tracking-wider font-extrabold rounded transition-colors"
                                    title="Manage 5+ image gallery"
                                  >
                                    Gallery ({imgCount})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startEditProduct(p)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
                                    title="Edit product"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded"
                                    title="Delete product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 3. HOMEPAGE DESIGN & BACKGROUND */}
          <TabsContent value="background">
            <AdminBackgroundManager />
          </TabsContent>

          {/* 4. ADVERTISEMENT MANAGER */}
          <TabsContent value="advertisements">
            <AdminAdvertisementManager />
          </TabsContent>

          {/* 5. PROMOTIONAL BANNER MANAGER */}
          <TabsContent value="banners">
            <AdminPromotionalBanners />
          </TabsContent>

          {/* 6. OFFERS & DISCOUNT MANAGER */}
          <TabsContent value="offers">
            <AdminOffersManager />
          </TabsContent>

          {/* 7. HOMEPAGE LAYOUT MANAGER */}
          <TabsContent value="layout">
            <AdminHomepageLayout />
          </TabsContent>

          {/* 8. CATEGORY MANAGEMENT */}
          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>

          {/* 9. CENTRAL MEDIA LIBRARY */}
          <TabsContent value="media">
            <AdminMediaLibrary />
          </TabsContent>

          {/* 10. CUSTOMER ORDERS */}
          <TabsContent value="orders" className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Fulfillment</span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
                  Customer Orders
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage pipeline status: Pending, Confirmed, Shipped, Delivered, Cancelled.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Filter by customer / phone / ID..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="bg-card border border-border px-3 py-1.5 text-xs rounded-lg"
                />
              </div>
            </div>

            {ordersLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center bg-card border border-border rounded-2xl">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">No orders recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter((o) => !orderQuery || o.customer_name.toLowerCase().includes(orderQuery.toLowerCase()) || o.phone.includes(orderQuery))
                  .map((o) => (
                    <div key={o.id} className="p-5 bg-card border border-border rounded-2xl shadow-card space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border">
                        <div>
                          <span className="font-mono text-xs text-gold font-bold">Order #{o.id.slice(0, 8)}</span>
                          <h4 className="font-bold text-sm text-foreground mt-0.5">{o.customer_name}</h4>
                          <p className="text-xs text-muted-foreground">{o.phone} · {o.address}, {o.city} - {o.pincode}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-base text-ink">{formatINR(o.total)}</span>
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="bg-background border border-border px-2.5 py-1 text-xs rounded font-bold uppercase tracking-wider"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Item list */}
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(o.items || []).map((it, idx) => (
                          <div key={idx} className="p-2.5 bg-muted/20 rounded-lg flex items-center gap-3 text-xs">
                            <div className="w-10 h-12 bg-secondary rounded overflow-hidden shrink-0">
                              {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : null}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{it.name}</p>
                              <p className="text-[10px] text-muted-foreground">Size: {it.size} · Qty: {it.qty} · {formatINR(it.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* 11. CUSTOMER MANAGEMENT */}
          <TabsContent value="customers">
            <AdminCustomers />
          </TabsContent>

          {/* 12. PAYMENT SETTINGS */}
          <TabsContent value="payments">
            <PaymentMethods />
          </TabsContent>

          {/* 13. WEBSITE CONTENT SETTINGS */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <div className="p-6 bg-card border border-border rounded-2xl shadow-card space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Storefront Configuration</span>
                <h3 className="font-display text-xl font-extrabold text-foreground mt-0.5">Website Content Settings</h3>
                <p className="text-xs text-muted-foreground mt-1">Configure shipping rules, thresholds, and live top announcement banner text.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.free_shipping_threshold}
                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) || 0 })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground">Orders above this subtotal qualify for 100% free delivery.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Flat Standard Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.flat_shipping_fee}
                    onChange={(e) => setSettings({ ...settings, flat_shipping_fee: Number(e.target.value) || 0 })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground">Applied to orders below the free shipping threshold.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Header Announcement Text</label>
                <input
                  type="text"
                  placeholder="e.g. Free shipping on orders over ₹2500 · Call 089252 59787"
                  value={settings.announcement_text}
                  onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveStoreSettings}
                  disabled={settingsBusy}
                  className="px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg flex items-center gap-2"
                >
                  {settingsBusy && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Save Store Settings
                </button>
              </div>
            </div>
          </TabsContent>

          {/* 14. AUDIT LOG */}
          <TabsContent value="audit">
            <AuditLog />
          </TabsContent>
        </Tabs>

        {/* DEDICATED PRODUCT GALLERY MODAL */}
        {galleryModalProduct && (
          <AdminProductGalleryModal
            product={galleryModalProduct}
            isOpen={true}
            onClose={() => setGalleryModalProduct(null)}
            onSaveGallery={handleSaveGalleryDirect}
          />
        )}
      </div>
    </Layout>
  );
};

export default Admin;
