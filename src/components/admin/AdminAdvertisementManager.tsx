import { useState } from "react";
import { Plus, Pencil, Trash2, Copy, Eye, Power, Calendar, ExternalLink, RefreshCw, Upload, Check, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCms, Advertisement, AdPlacement } from "@/context/CmsContext";

const PLACEMENTS: { id: AdPlacement; label: string; desc: string }[] = [
  { id: "hero", label: "Homepage Hero Area", desc: "Top hero spotlight banner" },
  { id: "home_promo", label: "Homepage Promotional Section", desc: "Large featured campaign cards on homepage" },
  { id: "banner_strip", label: "Promotional Banner Strip", desc: "Horizontal high-impact banner across sections" },
  { id: "shop", label: "Shop / Product Listing Page", desc: "Top of catalogue banner on /shop" },
  { id: "category", label: "Category Pages", desc: "Targeted banners for category shoppers" },
];

const emptyAd: Omit<Advertisement, "id" | "created_at"> = {
  name: "",
  title: "",
  subtitle: "",
  image_url: "",
  desktop_image_url: "",
  mobile_image_url: "",
  button_text: "Shop Collection",
  button_url: "/shop",
  placement: "home_promo",
  start_date: null,
  end_date: null,
  is_active: true,
  sort_order: 1,
  background_color: "#0d0e12",
  text_color: "#ffffff",
  text_alignment: "center",
  overlay_opacity: 0.35,
};

export const AdminAdvertisementManager = () => {
  const { advertisements, saveAdvertisement, deleteAdvertisement, toggleAdStatus, uploadMediaAsset } = useCms();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Advertisement, "id" | "created_at">>(emptyAd);
  const [showModal, setShowModal] = useState(false);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [uploading, setUploading] = useState(false);
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
      image_url: ad.image_url,
      desktop_image_url: ad.desktop_image_url || "",
      mobile_image_url: ad.mobile_image_url || "",
      button_text: ad.button_text || "",
      button_url: ad.button_url || "/shop",
      placement: ad.placement,
      start_date: ad.start_date || null,
      end_date: ad.end_date || null,
      is_active: ad.is_active,
      sort_order: ad.sort_order,
      background_color: ad.background_color || "#0d0e12",
      text_color: ad.text_color || "#ffffff",
      text_alignment: ad.text_alignment || "center",
      overlay_opacity: ad.overlay_opacity ?? 0.35,
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
    };
    delete (copyData as any).id;
    delete (copyData as any).created_at;
    const res = await saveAdvertisement(copyData);
    if (!res.error) toast.success(`Duplicated "${ad.name}"`);
  };

  // Upload ad image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "desktop_image_url" | "mobile_image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const res = await uploadMediaAsset(file, "advertisements");
    if (res.url) {
      setFormData((prev) => ({
        ...prev,
        [field]: res.url,
        ...(field === "image_url" && !prev.desktop_image_url ? { desktop_image_url: res.url } : {}),
      }));
      toast.success("Ad image uploaded successfully.");
    } else {
      toast.error(res.error || "Upload failed");
    }
    setUploading(false);
  };

  // Save Ad Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter an ad title.");
    if (!formData.image_url.trim()) return toast.error("Please upload or provide an image for the advertisement.");

    setSaving(true);
    const res = await saveAdvertisement({
      ...formData,
      ...(editingId ? { id: editingId } : {}),
    });
    setSaving(false);

    if (!res.error) {
      toast.success(editingId ? "Advertisement updated successfully!" : "Advertisement created successfully!");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Marketing Suite</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Advertisement Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create, schedule, target, and monitor promotional advertisements across the homepage, shop, and categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Advertisement
        </button>
      </div>

      {/* Ads List Grid */}
      {advertisements.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl">
          <Sparkles className="h-10 w-10 text-gold mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground">No Advertisements Configured</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create promotional banners for seasonal drops, festive offers, and special collections.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 px-5 py-2.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs uppercase tracking-wider font-bold rounded transition-colors"
          >
            Create Your First Ad
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((ad) => {
            const isLive = ad.is_active;
            const placementObj = PLACEMENTS.find((p) => p.id === ad.placement);

            return (
              <div
                key={ad.id}
                className={`flex flex-col rounded-2xl border overflow-hidden transition-all shadow-card hover:shadow-elevated ${
                  isLive ? "bg-card border-border" : "bg-muted/20 border-border/50 opacity-75"
                }`}
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Placement Badge */}
                  <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur text-white text-[9px] uppercase tracking-wider px-2.5 py-1 rounded font-bold">
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
                    <p className="text-[10px] text-gold uppercase tracking-wider font-bold">{ad.name}</p>
                    <h3 className="font-display text-lg font-bold truncate drop-shadow">{ad.title}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5 text-xs">
                    {ad.subtitle && <p className="text-muted-foreground line-clamp-2">{ad.subtitle}</p>}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Order: #{ad.sort_order}</span>
                      {ad.button_text && <span className="font-bold text-foreground">CTA: {ad.button_text}</span>}
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
                        title="Preview on storefront"
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
          <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingId ? "Edit Advertisement" : "Create New Advertisement"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Campaign Name (Internal)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter Drop 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Display Placement</label>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Headline Title</label>
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
                <label className="text-xs font-bold text-foreground">Subtitle / Promotional Copy</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handcrafted heavyweight drop-shoulder hoodies with luxury textures."
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Advertisement Banner Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    placeholder="Image URL or upload below..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                  <label className="cursor-pointer bg-secondary hover:bg-gold hover:text-ink px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors shrink-0 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "image_url")}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploading && (
                  <p className="text-xs font-bold text-gold animate-pulse">Uploading image to storage...</p>
                )}
                {formData.image_url && (
                  <div className="relative aspect-[21/9] max-h-36 rounded overflow-hidden border border-border mt-2">
                    <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Collection"
                    value={formData.button_text || ""}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Destination URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /shop or /product/active-hoodie"
                    value={formData.button_url || ""}
                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              {/* Status and Order */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Display Order</label>
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
                <div className="space-y-1 col-span-2 sm:col-span-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="accent-gold h-4 w-4"
                    />
                    <span className="text-xs font-bold text-foreground">Publish Active</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded hover:bg-gold hover:text-ink transition-colors flex items-center gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Advertisement" : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-gold">Live Ad Rendering Simulation</span>
              <button onClick={() => setPreviewAd(null)} className="h-8 w-8 grid place-items-center hover:bg-secondary rounded">
                ✕
              </button>
            </div>
            <div
              style={{ backgroundColor: previewAd.background_color || "#0d0e12", color: previewAd.text_color || "#ffffff" }}
              className="relative overflow-hidden rounded-xl border border-white/10"
            >
              <div className="grid md:grid-cols-[1.3fr_1fr] items-center min-h-[300px]">
                <div className="p-8 md:p-12 z-10">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold mb-2 block">{previewAd.name}</span>
                  <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-tight mb-3">{previewAd.title}</h2>
                  {previewAd.subtitle && <p className="text-xs md:text-sm opacity-80 max-w-md mb-6">{previewAd.subtitle}</p>}
                  {previewAd.button_text && (
                    <span className="inline-flex items-center gap-2 bg-red-cta text-white px-6 py-3 text-xs uppercase tracking-widest font-black rounded shadow">
                      {previewAd.button_text} →
                    </span>
                  )}
                </div>
                <div className="relative h-64 md:h-full min-h-[260px] overflow-hidden">
                  <img src={previewAd.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
