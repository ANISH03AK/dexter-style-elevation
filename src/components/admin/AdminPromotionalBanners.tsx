import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Sparkles, RefreshCw, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { useCms, PromotionalBanner, BannerPlacement, BannerLayout } from "@/context/CmsContext";

const PLACEMENTS: { id: BannerPlacement; label: string }[] = [
  { id: "announcement", label: "Top Announcement Bar" },
  { id: "compact_card", label: "Compact Promotional Card" },
  { id: "medium_promo", label: "Medium Promotional Strip" },
  { id: "large_banner", label: "Large Promotional Banner" },
  { id: "shop_top", label: "Shop Page Top Banner" },
];

const LAYOUTS: { id: BannerLayout; label: string }[] = [
  { id: "thin_announcement", label: "Thin Announcement Bar (Header)" },
  { id: "compact", label: "Compact Card with Badge" },
  { id: "medium", label: "Medium Banner with Side Image" },
  { id: "large_hero", label: "Large Hero Strip" },
];

const emptyBanner: Omit<PromotionalBanner, "id" | "created_at"> = {
  title: "",
  subtitle: "",
  image_url: "",
  background_color: "#dc2626",
  text_color: "#ffffff",
  button_text: "Shop Now",
  button_url: "/shop",
  placement: "announcement",
  layout_preset: "thin_announcement",
  sort_order: 1,
  start_date: null,
  end_date: null,
  is_active: true,
};

export const AdminPromotionalBanners = () => {
  const { promotionalBanners, savePromotionalBanner, deletePromotionalBanner, toggleBannerStatus, uploadMediaAsset } = useCms();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PromotionalBanner, "id" | "created_at">>(emptyBanner);
  const [showModal, setShowModal] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<PromotionalBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      ...emptyBanner,
      sort_order: promotionalBanners.length + 1,
    });
    setShowModal(true);
  };

  const openEdit = (b: PromotionalBanner) => {
    setEditingId(b.id);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || "",
      image_url: b.image_url || "",
      desktop_image_url: b.desktop_image_url || "",
      mobile_image_url: b.mobile_image_url || "",
      background_color: b.background_color || "#dc2626",
      text_color: b.text_color || "#ffffff",
      button_text: b.button_text || "",
      button_url: b.button_url || "/shop",
      placement: b.placement,
      layout_preset: b.layout_preset,
      sort_order: b.sort_order,
      start_date: b.start_date || null,
      end_date: b.end_date || null,
      is_active: b.is_active,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const res = await uploadMediaAsset(file, "banners");
    if (res.url) {
      setFormData((prev) => ({ ...prev, image_url: res.url }));
      toast.success("Banner image uploaded.");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter a banner message or title.");

    setSaving(true);
    const res = await savePromotionalBanner({
      ...formData,
      ...(editingId ? { id: editingId } : {}),
    });
    setSaving(false);

    if (!res.error) {
      toast.success(editingId ? "Promotional banner updated!" : "Promotional banner created!");
      setShowModal(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete promotional banner "${title}"?`)) return;
    await deletePromotionalBanner(id);
    toast.success("Banner deleted.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Notice & Offers</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Promotional Banner Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage thin announcement bars, compact campaign tags, and promotional strips across devices.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Banner
        </button>
      </div>

      {/* Grid of Banners */}
      {promotionalBanners.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl">
          <Sparkles className="h-10 w-10 text-gold mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground">No Promotional Banners</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create announcement bars for free shipping, limited-time discounts, or festive specials.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotionalBanners.map((b) => (
            <div
              key={b.id}
              className="flex flex-col rounded-2xl border border-border overflow-hidden bg-card shadow-card hover:shadow-elevated transition-all"
            >
              {/* Preview Bar */}
              <div
                style={{ backgroundColor: b.background_color, color: b.text_color }}
                className="p-4 flex flex-col justify-between min-h-[90px] relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-black/20">
                    {b.placement}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBannerStatus(b.id, !b.is_active)}
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                      b.is_active ? "bg-emerald-500 text-white" : "bg-black/40 text-white/70"
                    }`}
                  >
                    {b.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
                <p className="font-bold text-sm mt-2 line-clamp-2">{b.title}</p>
                {b.button_text && (
                  <span className="text-[10px] underline font-extrabold mt-1">
                    {b.button_text} →
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 flex items-center justify-between border-t border-border bg-card">
                <span className="text-xs text-muted-foreground">Order: #{b.sort_order}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
                    title="Edit banner"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBanner(b)}
                    className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-secondary rounded"
                    title="Preview banner"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded"
                    title="Delete banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingId ? "Edit Promotional Banner" : "Create Promotional Banner"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Banner Message / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Express Shipping on Orders Over ₹2,500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Subtitle / Additional Details</label>
                <input
                  type="text"
                  placeholder="e.g. Limited period offer across all menswear collections"
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as BannerPlacement })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  >
                    {PLACEMENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Layout Preset</label>
                  <select
                    value={formData.layout_preset}
                    onChange={(e) => setFormData({ ...formData, layout_preset: e.target.value as BannerLayout })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  >
                    {LAYOUTS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="h-8 w-12 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="h-8 w-12 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="flex-1 bg-background border border-border px-2 py-1 text-xs rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={formData.button_text || ""}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Button Link</label>
                  <input
                    type="text"
                    placeholder="e.g. /shop"
                    value={formData.button_url || ""}
                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              {/* Live Mini Preview inside modal */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-muted-foreground">Live Banner Preview</label>
                <div
                  style={{ backgroundColor: formData.background_color, color: formData.text_color }}
                  className="p-3 text-center rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>{formData.title || "Your promotional message appears here"}</span>
                  {formData.button_text && (
                    <span className="underline font-black ml-1">{formData.button_text} →</span>
                  )}
                </div>
              </div>

              {/* Submit */}
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
                  {editingId ? "Update Banner" : "Save & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
