import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Percent, Calculator, Calendar, Check, AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCms, DiscountCampaign, OfferType } from "@/context/CmsContext";
import { useProducts, Category } from "@/context/ProductsContext";
import { formatINR } from "@/lib/format";

const OFFER_TYPES: { id: OfferType; label: string; desc: string }[] = [
  { id: "percentage", label: "Percentage Discount", desc: "e.g. 20% off all selected items" },
  { id: "fixed_amount", label: "Fixed Amount Discount", desc: "e.g. Flat ₹300 off" },
  { id: "coupon_code", label: "Promotional Coupon Code", desc: "Coupon applied at cart / checkout" },
  { id: "category_specific", label: "Category Special", desc: "Applies to an entire category (e.g. Hoodies)" },
  { id: "product_specific", label: "Product Flash Deal", desc: "Applies to specifically chosen products" },
  { id: "sitewide", label: "Sitewide Mega Offer", desc: "Applies to all products across the entire store" },
  { id: "flash_sale", label: "Limited-Time Flash Sale", desc: "Time-limited urgent drop discount" },
];

const emptyCampaign: Omit<DiscountCampaign, "id" | "created_at"> = {
  name: "",
  description: "",
  offer_type: "percentage",
  discount_value: 15,
  coupon_code: "",
  applicable_products: [],
  applicable_categories: [],
  min_purchase_amount: 0,
  max_discount_amount: undefined,
  start_date: null,
  end_date: null,
  is_active: true,
  display_label: "15% OFF",
  priority: 1,
};

const CATEGORIES: Category[] = ["Shirts", "T-Shirts", "Pants", "Jeans", "Jackets", "Hoodies", "Suits", "Activewear", "Accessories"];

export const AdminOffersManager = () => {
  const { discountCampaigns, saveDiscountCampaign, deleteDiscountCampaign, toggleDiscountStatus, calculateProductPrice } = useCms();
  const { products } = useProducts();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DiscountCampaign, "id" | "created_at">>(emptyCampaign);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Simulator Test State
  const [testProductId, setTestProductId] = useState<string>(products[0]?.id || "");
  const selectedProduct = products.find((p) => p.id === testProductId) || products[0];
  const simulated = selectedProduct ? calculateProductPrice(selectedProduct) : null;

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyCampaign);
    setShowModal(true);
  };

  const openEdit = (c: DiscountCampaign) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      description: c.description || "",
      offer_type: c.offer_type,
      discount_value: c.discount_value,
      coupon_code: c.coupon_code || "",
      applicable_products: c.applicable_products || [],
      applicable_categories: c.applicable_categories || [],
      min_purchase_amount: c.min_purchase_amount || 0,
      max_discount_amount: c.max_discount_amount,
      start_date: c.start_date || null,
      end_date: c.end_date || null,
      is_active: c.is_active,
      display_label: c.display_label || "",
      priority: c.priority,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Please provide an offer name.");

    // Validation
    if (formData.offer_type === "percentage" && (formData.discount_value <= 0 || formData.discount_value > 90)) {
      return toast.error("Percentage discount must be between 1% and 90%.");
    }
    if (formData.offer_type === "fixed_amount" && formData.discount_value <= 0) {
      return toast.error("Fixed discount amount must be greater than ₹0.");
    }
    if (formData.offer_type === "coupon_code" && !formData.coupon_code?.trim()) {
      return toast.error("Please enter a coupon code (e.g. DEXTER20).");
    }

    setSaving(true);
    const res = await saveDiscountCampaign({
      ...formData,
      coupon_code: formData.coupon_code?.trim().toUpperCase(),
      ...(editingId ? { id: editingId } : {}),
    });
    setSaving(false);

    if (!res.error) {
      toast.success(editingId ? "Offer campaign updated!" : "Offer campaign activated!");
      setShowModal(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete discount campaign "${name}"?`)) return;
    await deleteDiscountCampaign(id);
    toast.success("Offer deleted.");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Revenue & Promotions</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Offers & Discount Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure percentage cuts, flat cash discounts, coupon codes, category deals, and automated price calculations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Offer
        </button>
      </div>

      {/* Interactive Price Calculation Simulator */}
      {selectedProduct && simulated && (
        <div className="p-5 bg-card border border-border rounded-2xl shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/15 text-gold grid place-items-center">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-foreground">
                  Live Offer Price Calculator Simulator
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Select any catalogue piece to verify how your active discounts calculate on storefront cards & checkout.
                </p>
              </div>
            </div>

            <select
              value={testProductId}
              onChange={(e) => setTestProductId(e.target.value)}
              className="bg-background border border-border px-3 py-1.5 text-xs rounded-lg font-bold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category} - {formatINR(p.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Regular MRP</span>
              <span className="text-sm font-bold text-muted-foreground line-through">{formatINR(simulated.originalPrice)}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
              <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold block">Customer Offer Price</span>
              <span className="text-lg font-black text-emerald-600">{formatINR(simulated.finalPrice)}</span>
            </div>
            <div className="bg-gold/10 border border-gold/30 p-3 rounded-lg">
              <span className="text-[10px] text-ink uppercase tracking-wider font-bold block">Displayed Savings</span>
              <span className="text-sm font-black text-ink">Save {formatINR(simulated.savings)} ({simulated.discountPercent}% OFF)</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg flex flex-col justify-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Applied Campaign</span>
              <span className="text-xs font-bold text-foreground truncate">
                {simulated.appliedCampaign ? simulated.appliedCampaign.name : "Regular Store Price"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discountCampaigns.map((camp) => (
          <div
            key={camp.id}
            className={`flex flex-col rounded-2xl border p-5 transition-all shadow-card hover:shadow-elevated ${
              camp.is_active ? "bg-card border-border" : "bg-muted/20 border-border/50 opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                  {camp.offer_type.replace("_", " ").toUpperCase()}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground mt-2">{camp.name}</h3>
              </div>

              <button
                type="button"
                onClick={() => toggleDiscountStatus(camp.id, !camp.is_active)}
                className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                  camp.is_active ? "bg-emerald-500 text-white" : "bg-zinc-700 text-white/70"
                }`}
              >
                {camp.is_active ? "Active" : "Inactive"}
              </button>
            </div>

            {camp.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{camp.description}</p>
            )}

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <div className="font-bold text-foreground">
                Value:{" "}
                <span className="text-gold font-black">
                  {camp.offer_type === "percentage" || camp.offer_type === "coupon_code"
                    ? `${camp.discount_value}% OFF`
                    : formatINR(camp.discount_value)}
                </span>
              </div>
              {camp.coupon_code && (
                <span className="font-mono bg-ink text-white px-2 py-0.5 rounded text-[10px] font-black tracking-wider">
                  {camp.coupon_code}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Priority #{camp.priority}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(camp)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
                  title="Edit offer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(camp.id, camp.name)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded"
                  title="Delete offer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT OFFER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingId ? "Edit Offer Campaign" : "Create Offer Campaign"}
              </h3>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full grid place-items-center hover:bg-secondary">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Diwali Streetwear Offer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Offer Type</label>
                  <select
                    value={formData.offer_type}
                    onChange={(e) => setFormData({ ...formData, offer_type: e.target.value as OfferType })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  >
                    {OFFER_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Discount Value {formData.offer_type === "fixed_amount" ? "(₹ Amount)" : "(% Percent)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.offer_type === "percentage" ? 90 : 100000}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono font-bold"
                  />
                </div>
              </div>

              {formData.offer_type === "coupon_code" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Coupon Promo Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DEXTER20"
                      value={formData.coupon_code || ""}
                      onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Min Purchase Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0 for none"
                      value={formData.min_purchase_amount || 0}
                      onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.offer_type === "category_specific" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Target Categories</label>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-muted/20 border border-border rounded-lg">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.applicable_categories?.includes(cat)}
                          onChange={(e) => {
                            const cur = formData.applicable_categories || [];
                            setFormData({
                              ...formData,
                              applicable_categories: e.target.checked
                                ? [...cur, cat]
                                : cur.filter((c) => c !== cat),
                            });
                          }}
                          className="accent-gold"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Badge Display Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF or FESTIVE DEAL"
                    value={formData.display_label || ""}
                    onChange={(e) => setFormData({ ...formData, display_label: e.target.value })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Offer Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    className="w-full bg-background border border-border px-3 py-2 text-xs rounded font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Internal Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes about this promotion..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-xs rounded"
                />
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
                  {editingId ? "Update Campaign" : "Save & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
