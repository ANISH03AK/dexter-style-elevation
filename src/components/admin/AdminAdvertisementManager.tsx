import { useState } from "react";
import {
  Plus, Pencil, Trash2, Copy, Eye, Power, Calendar, ExternalLink,
  RefreshCw, Upload, Check, AlertCircle, Sparkles, Monitor, Tablet,
  Smartphone, TrendingUp, MousePointerClick, BarChart3, Tag, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { useCms, Advertisement, AdPlacement } from "@/context/CmsContext";
import { formatINR } from "@/lib/format";

const PLACEMENTS: { id: AdPlacement; label: string; desc: string }[] = [
  { id: "hero", label: "Homepage Hero Area", desc: "Top hero spotlight banner" },
  { id: "home_promo", label: "Homepage Promotional Section", desc: "Large featured campaign cards on homepage" },
  { id: "banner_strip", label: "Promotional Banner Strip", desc: "Horizontal high-impact banner across sections" },
  { id: "shop", label: "Shop / Product Listing Page", desc: "Top of catalogue banner on /shop" },
  { id: "category", label: "Category Pages", desc: "Targeted banners for category shoppers" },
];

const CAMPAIGN_CATEGORIES = [
  "Streetwear",
  "Shirts",
  "T-Shirts",
  "Pants",
  "Jeans",
  "Hoodies",
  "Jackets",
  "Accessories",
  "Festive",
  "Limited Drop",
];

const PROMO_BADGES = [
  "HOT DROP",
  "LIMITED EDITION",
  "EXCLUSIVE",
  "FESTIVE DEAL",
  "BESTSELLER",
  "TRENDING",
  "WEEKEND SPECIAL",
  "SUMMER DROP",
];

const emptyAd: Omit<Advertisement, "id" | "created_at"> = {
  name: "",
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  desktop_image_url: "",
  mobile_image_url: "",
  button_text: "Shop Collection",
  button_url: "/shop",
  placement: "home_promo",
  campaign_category: "Streetwear",
  promotional_badge: "HOT DROP",
  offer_percentage: undefined,
  original_price: undefined,
  promotional_price: undefined,
  associated_categories: ["Streetwear"],
  start_date: null,
  end_date: null,
  is_active: true,
  sort_order: 1,
  background_color: "#0d0e12",
  text_color: "#ffffff",
  text_alignment: "center",
  overlay_opacity: 0.35,
  impressions: 0,
  clicks: 0,
};

export const AdminAdvertisementManager = () => {
  const {
    advertisements,
    saveAdvertisement,
    deleteAdvertisement,
    toggleAdStatus,
    uploadMediaAsset,
    adStats,
  } = useCms();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Advertisement, "id" | "created_at">>(emptyAd);
  const [showModal, setShowModal] = useState(false);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Open Create Modal
  const openCreate = () => {
    setEditingId(null);
    setFormData({
      ...emptyAd,
      sort_order: advertisements.length + 1,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setFormData({
      name: ad.name,
      title: ad.title,
      subtitle: ad.subtitle || "",
      description: ad.description || "",
      image_url: ad.image_url,
      desktop_image_url: ad.desktop_image_url || "",
      mobile_image_url: ad.mobile_image_url || "",
      button_text: ad.button_text || "Shop Collection",
      button_url: ad.button_url || "/shop",
      placement: ad.placement,
      campaign_category: ad.campaign_category || "Streetwear",
      promotional_badge: ad.promotional_badge || "",
      offer_percentage: ad.offer_percentage,
      original_price: ad.original_price,
      promotional_price: ad.promotional_price,
      associated_categories: ad.associated_categories || [],
      start_date: ad.start_date || null,
      end_date: ad.end_date || null,
      is_active: ad.is_active,
      sort_order: ad.sort_order,
      background_color: ad.background_color || "#0d0e12",
      text_color: ad.text_color || "#ffffff",
      text_alignment: ad.text_alignment || "center",
      overlay_opacity: ad.overlay_opacity ?? 0.35,
      impressions: ad.impressions || 0,
      clicks: ad.clicks || 0,
    });
    setShowModal(true);
  };

  // Duplicate Ad
  const handleDuplicate = async (ad: Advertisement) => {
    const copyData = {
      ...ad,
      name: `${ad.name} (Copy)`,
      title: ad.title,
      is_active: false,
      sort_order: advertisements.length + 1,
      impressions: 0,
      clicks: 0,
    };
    delete (copyData as any).id;
    delete (copyData as any).created_at;
    const res = await saveAdvertisement(copyData);
    if (!res.error) toast.success(`Duplicated "${ad.name}"`);
  };

  // Upload ad image
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image_url" | "desktop_image_url" | "mobile_image_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    const res = await uploadMediaAsset(file, "advertisements");
    if (res.url) {
      setFormData((prev) => ({
        ...prev,
        [field]: res.url,
        ...(field === "image_url" && !prev.desktop_image_url ? { desktop_image_url: res.url } : {}),
      }));
      toast.success("Advertisement image uploaded successfully.");
    } else {
      toast.error(res.error || "Upload failed");
    }
    setUploadingField(null);
  };

  // Save Ad Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter a headline title.");
    if (!formData.image_url.trim()) return toast.error("Please provide a primary image for the advertisement.");

    setSaving(true);
    const res = await saveAdvertisement({
      ...formData,
      ...(editingId ? { id: editingId } : {}),
    });
    setSaving(false);

    if (!res.error) {
      toast.success(editingId ? "Advertisement updated successfully!" : "Advertisement published to live store!");
      setShowModal(false);
    } else {
      toast.error(res.error);
    }
  };

  // Delete with confirmation
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete advertisement "${name}"?`)) return;
    const res = await deleteAdvertisement(id);
    if (!res.error) toast.success("Advertisement deleted.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Campaign Control</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Advertisement Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create, schedule, and preview dynamic campaigns for the Homepage, /advertisements page, and /shop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-cta hover:bg-gold hover:text-ink text-white text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all shadow-md"
          >
            <Plus className="h-4 w-4" /> Create Advertisement
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Campaigns</span>
            <Tag className="h-4 w-4 text-gold" />
          </div>
          <span className="font-display text-2xl font-black text-foreground">{advertisements.length}</span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {advertisements.filter((a) => a.is_active).length} active now
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Impressions</span>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <span className="font-display text-2xl font-black text-foreground">
            {adStats.totalImpressions.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Verified ad views</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Clicks</span>
            <MousePointerClick className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="font-display text-2xl font-black text-foreground">
            {adStats.totalClicks.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Target destination visits</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Click-Through Rate (CTR)</span>
            <TrendingUp className="h-4 w-4 text-red-cta" />
          </div>
          <span className="font-display text-2xl font-black text-gold">{adStats.ctr}%</span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Average engagement</span>
        </div>
      </div>

      {/* Advertisements List */}
      {advertisements.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">No advertisements created yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Create Advertisement" to add a hero banner or promotional card.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((ad) => {
            const placementObj = PLACEMENTS.find((p) => p.id === ad.placement);
            const ctr = ad.impressions && ad.impressions > 0 ? (((ad.clicks || 0) / ad.impressions) * 100).toFixed(1) : "0.0";

            return (
              <div
                key={ad.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card flex flex-col justify-between group hover:border-gold/50 transition-all"
              >
                {/* Visual Banner Preview */}
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                  <img
                    src={ad.desktop_image_url || ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Placement Badge */}
                  <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur text-gold text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded shadow">
                    {placementObj?.label || ad.placement}
                  </span>

                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleAdStatus(ad.id, !ad.is_active)}
                    className={`absolute top-3 right-3 text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded shadow-md transition-colors ${
                      ad.is_active ? "bg-emerald-500 text-white" : "bg-zinc-700 text-white/80"
                    }`}
                  >
                    {ad.is_active ? "● Active" : "○ Inactive"}
                  </button>

                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gold uppercase tracking-wider font-bold">{ad.name}</p>
                      {ad.promotional_badge && (
                        <span className="px-1.5 py-0.2 bg-red-cta text-white text-[8px] font-black rounded">
                          {ad.promotional_badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-base font-bold truncate drop-shadow">{ad.title}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5 text-xs">
                    {ad.subtitle && <p className="text-muted-foreground line-clamp-2">{ad.subtitle}</p>}

                    <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Order: #{ad.sort_order}</span>
                      {ad.offer_percentage ? (
                        <span className="font-bold text-red-cta">{ad.offer_percentage}% OFF</span>
                      ) : null}
                      {ad.button_text && <span className="font-bold text-foreground">CTA: {ad.button_text}</span>}
                    </div>

                    {/* Impressions & Clicks bar */}
                    <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>👁 {(ad.impressions || 0).toLocaleString()} views</span>
                      <span>🖱 {(ad.clicks || 0).toLocaleString()} clicks</span>
                      <span className="font-bold text-gold">{ctr}% CTR</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(ad)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                        title="Edit advertisement"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(ad)}
                        className="p-2 text-muted-foreground hover:text-gold hover:bg-secondary rounded transition-colors"
                        title="Duplicate ad"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewAd(ad)}
                        className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-secondary rounded transition-colors"
                        title="Preview Responsive Rendering"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(ad.id, ad.name)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete advertisement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-cta">Campaign Studio</span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {editingId ? "Edit Advertisement" : "Create New Advertisement"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Campaign Name & Placement */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-foreground">Campaign Name (Internal) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter Streetwear Drop"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Campaign Category</label>
                  <select
                    value={formData.campaign_category}
                    onChange={(e) => setFormData({ ...formData, campaign_category: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  >
                    {CAMPAIGN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Display Placement *</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  >
                    {PLACEMENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Headline & Badge */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">Headline Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ELEVATE YOUR EVERYDAY STYLE"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Promotional Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. HOT DROP or 30% OFF"
                    list="badges-list"
                    value={formData.promotional_badge || ""}
                    onChange={(e) => setFormData({ ...formData, promotional_badge: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold text-red-cta"
                  />
                  <datalist id="badges-list">
                    {PROMO_BADGES.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Subtitle & Detailed Description */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Subtitle / Short Copy</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Handcrafted heavyweight drop-shoulder hoodies with luxury textures."
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Detailed Description (Advertisement Page)</label>
                  <textarea
                    rows={2}
                    placeholder="Extended copy shown on the /advertisements page detail card..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              {/* Pricing & Discounts (Optional) */}
              <div className="grid sm:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Offer Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 30"
                    value={formData.offer_percentage ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offer_percentage: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1999"
                    value={formData.original_price ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Promotional Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1399"
                    value={formData.promotional_price ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotional_price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono font-bold text-gold"
                  />
                </div>
              </div>

              {/* Image Uploads (Desktop & Mobile) */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Primary / Desktop Image */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5 text-gold" />
                      Desktop / Primary Image *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        placeholder="Image URL..."
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image_url: e.target.value,
                            desktop_image_url: e.target.value,
                          })
                        }
                        className="flex-1 bg-background border border-border px-3 py-2 text-xs rounded"
                      />
                      <label className="cursor-pointer bg-secondary hover:bg-gold hover:text-ink px-3 py-2 text-xs font-bold rounded transition-colors shrink-0 flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "image_url")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadingField === "image_url" && (
                      <p className="text-[11px] text-gold animate-pulse">Uploading desktop asset...</p>
                    )}
                    {formData.image_url && (
                      <div className="relative aspect-[16/9] max-h-32 rounded overflow-hidden border border-border mt-1">
                        <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Mobile Image */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-gold" />
                      Mobile Portrait Image (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Mobile image URL (or fallback to primary)..."
                        value={formData.mobile_image_url || ""}
                        onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                        className="flex-1 bg-background border border-border px-3 py-2 text-xs rounded"
                      />
                      <label className="cursor-pointer bg-secondary hover:bg-gold hover:text-ink px-3 py-2 text-xs font-bold rounded transition-colors shrink-0 flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "mobile_image_url")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadingField === "mobile_image_url" && (
                      <p className="text-[11px] text-gold animate-pulse">Uploading mobile portrait asset...</p>
                    )}
                    {formData.mobile_image_url && (
                      <div className="relative aspect-[4/5] max-h-32 rounded overflow-hidden border border-border mt-1">
                        <img src={formData.mobile_image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button and Destination */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">CTA Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Collection"
                    value={formData.button_text || ""}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Destination Route / URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /shop?cat=Shirts"
                    value={formData.button_url || ""}
                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                  />
                  <div className="flex gap-1.5 pt-1 text-[10px] text-muted-foreground flex-wrap">
                    <span>Quick:</span>
                    <button type="button" onClick={() => setFormData({ ...formData, button_url: "/shop" })} className="underline hover:text-gold">/shop</button>
                    <button type="button" onClick={() => setFormData({ ...formData, button_url: "/shop?cat=Shirts" })} className="underline hover:text-gold">Shirts</button>
                    <button type="button" onClick={() => setFormData({ ...formData, button_url: "/shop?cat=T-Shirts" })} className="underline hover:text-gold">T-Shirts</button>
                    <button type="button" onClick={() => setFormData({ ...formData, button_url: "/shop?cat=Pants" })} className="underline hover:text-gold">Pants</button>
                    <button type="button" onClick={() => setFormData({ ...formData, button_url: "/advertisements" })} className="underline hover:text-gold">/advertisements</button>
                  </div>
                </div>
              </div>

              {/* Scheduling: Start & End Dates */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    Start Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date ? formData.start_date.slice(0, 16) : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    End Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date ? formData.end_date.slice(0, 16) : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              {/* Status and Order */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Display Priority Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.background_color || "#0d0e12"}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="h-8 w-12 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={formData.background_color || "#0d0e12"}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="accent-gold h-4 w-4"
                    />
                    <span className="text-xs font-bold text-foreground">Publish Immediately</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-red-cta hover:bg-gold hover:text-ink text-white text-xs uppercase tracking-wider font-black rounded transition-all shadow flex items-center gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Publish Advertisement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-DEVICE RESPONSIVE LIVE PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Preview Header with Device Toggles */}
            <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/40">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider font-bold text-gold">
                  Live Viewport Simulation
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {previewDevice === "desktop" ? "1280px" : previewDevice === "tablet" ? "768px" : "390px"}
                </span>
              </div>

              {/* Viewport switchers */}
              <div className="flex items-center bg-background border border-border rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                    previewDevice === "desktop" ? "bg-ink text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                    previewDevice === "tablet" ? "bg-ink text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" /> Tablet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                    previewDevice === "mobile" ? "bg-ink text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewAd(null)}
                className="h-8 w-8 grid place-items-center hover:bg-secondary rounded font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulation Canvas */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 flex items-center justify-center">
              <div
                className={`transition-all duration-300 w-full ${
                  previewDevice === "desktop"
                    ? "max-w-4xl"
                    : previewDevice === "tablet"
                    ? "max-w-[680px]"
                    : "max-w-[360px]"
                }`}
              >
                <div
                  style={{
                    backgroundColor: previewAd.background_color || "#0d0e12",
                    color: previewAd.text_color || "#ffffff",
                  }}
                  className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
                >
                  {/* Visual Layout depending on device */}
                  {previewDevice === "mobile" ? (
                    <div className="flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                        <img
                          src={previewAd.mobile_image_url || previewAd.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        {previewAd.promotional_badge && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-cta text-white text-[9px] font-black uppercase rounded shadow">
                            {previewAd.promotional_badge}
                          </span>
                        )}
                      </div>
                      <div className="p-5 space-y-3">
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                          {previewAd.name}
                        </span>
                        <h3 className="font-display text-lg font-black leading-tight">{previewAd.title}</h3>
                        {previewAd.subtitle && (
                          <p className="text-xs opacity-85 leading-relaxed">{previewAd.subtitle}</p>
                        )}
                        {previewAd.button_text && (
                          <div className="pt-2">
                            <span className="w-full text-center block py-2.5 bg-red-cta text-white text-[11px] uppercase tracking-wider font-extrabold rounded shadow">
                              {previewAd.button_text} →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-[1.25fr_1fr] items-center min-h-[300px]">
                      <div className="p-8 md:p-10 z-10 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
                            {previewAd.name}
                          </span>
                          {previewAd.promotional_badge && (
                            <span className="px-2 py-0.5 bg-red-cta text-white text-[9px] font-black uppercase rounded shadow">
                              {previewAd.promotional_badge}
                            </span>
                          )}
                        </div>

                        <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">
                          {previewAd.title}
                        </h2>

                        {previewAd.subtitle && (
                          <p className="text-xs md:text-sm opacity-85 leading-relaxed">{previewAd.subtitle}</p>
                        )}

                        {previewAd.description && (
                          <p className="text-xs opacity-75 line-clamp-2">{previewAd.description}</p>
                        )}

                        {previewAd.promotional_price && (
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-xl font-black text-gold">
                              {formatINR(previewAd.promotional_price)}
                            </span>
                            {previewAd.original_price && (
                              <span className="text-xs line-through opacity-50">
                                {formatINR(previewAd.original_price)}
                              </span>
                            )}
                          </div>
                        )}

                        {previewAd.button_text && (
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-2 bg-red-cta text-white px-6 py-2.5 text-xs uppercase tracking-widest font-black rounded shadow">
                              {previewAd.button_text} →
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative h-64 md:h-full min-h-[260px] overflow-hidden">
                        <img
                          src={previewAd.desktop_image_url || previewAd.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
