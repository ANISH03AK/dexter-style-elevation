import { useState } from "react";
import { Upload, Eye, RefreshCw, Check, Undo, Sparkles, Image as ImageIcon, Sliders, Layers } from "lucide-react";
import { toast } from "sonner";
import { useCms } from "@/context/CmsContext";
import dexterLogo from "@/assets/dexter-logo-clean.png";
import heroStreetwearDesktop from "@/assets/hero-streetwear-pc.jpg";

const FOCAL_POINTS = [
  { label: "Top (Head / Mask)", value: "center 12%" },
  { label: "Upper Center (Collar / Jacket - Default)", value: "center 18%" },
  { label: "Chest / Logo Area", value: "center 25%" },
  { label: "Center Figure", value: "center 50%" },
  { label: "Lower Figure / Cargo Pants", value: "center 75%" },
];

export const AdminBackgroundManager = () => {
  const { homepageSettings, updateHomepageSettings, publishBackground, restoreDefaultBackground, uploadMediaAsset } = useCms();

  const [previewBg, setPreviewBg] = useState<string>(homepageSettings.background_image_url || heroStreetwearDesktop);
  const [focalPoint, setFocalPoint] = useState<string>(homepageSettings.focal_point || "center 18%");
  const [sizing, setSizing] = useState<"cover" | "contain">(homepageSettings.background_sizing || "cover");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(homepageSettings.overlay_opacity ?? 0.40);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // File upload for background
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    const res = await uploadMediaAsset(file, "backgrounds");
    if (res.url) {
      setPreviewBg(res.url);
      setIsDraft(true);
      toast.success("Background uploaded! Click 'Publish Live' to apply to the storefront.");
    } else {
      toast.error(res.error || "Failed to upload image");
    }
    setUploading(false);
  };

  // Publish to storefront
  const handlePublish = async () => {
    setSaving(true);
    const res = await updateHomepageSettings({
      background_image_url: previewBg,
      focal_point: focalPoint,
      background_sizing: sizing,
      overlay_opacity: overlayOpacity,
      is_background_published: true,
      draft_background_image_url: null,
    });
    setSaving(false);
    if (!res.error) {
      setIsDraft(false);
      toast.success("Homepage background published live! Visitors will see it immediately.");
    } else {
      toast.error("Failed to publish background");
    }
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    await updateHomepageSettings({
      draft_background_image_url: previewBg,
      focal_point: focalPoint,
      background_sizing: sizing,
      overlay_opacity: overlayOpacity,
    });
    setSaving(false);
    setIsDraft(true);
    toast.info("Draft saved. The live website remains unchanged until you click 'Publish Live'.");
  };

  // Restore Default Background
  const handleRestoreDefault = async () => {
    setSaving(true);
    await restoreDefaultBackground();
    setPreviewBg(heroStreetwearDesktop);
    setFocalPoint("center 18%");
    setSizing("cover");
    setOverlayOpacity(0.40);
    setIsDraft(false);
    setSaving(false);
    toast.success("Default streetwear background restored successfully!");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Visual CMS</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Homepage Design & Background
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Change the storefront hero background, adjust positioning, framing, and overlay contrast without editing source code.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRestoreDefault}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded hover:bg-secondary transition-colors"
          >
            <Undo className="h-3.5 w-3.5 text-gold" /> Restore Default
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-foreground text-xs uppercase tracking-wider font-bold rounded hover:bg-muted transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded hover:bg-gold hover:text-ink transition-all shadow-lg"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Publish Live
          </button>
        </div>
      </div>

      {isDraft && (
        <div className="p-4 bg-gold/15 border border-gold/40 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gold shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">You have unpublished background modifications.</p>
              <p className="text-[11px] text-muted-foreground">The preview below displays your current draft. Click "Publish Live" to update the live website.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            className="px-4 py-1.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs uppercase tracking-wider font-bold rounded transition-colors shrink-0"
          >
            Publish Now
          </button>
        </div>
      )}

      {/* Main Grid: Controls vs Live Responsive Simulator */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
        {/* LEFT: Controls Panel */}
        <div className="space-y-6 bg-card border border-border p-6 rounded-2xl shadow-card">
          <h3 className="text-xs uppercase tracking-[0.25em] font-extrabold text-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gold" /> Background Controls
          </h3>

          {/* Upload Button */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Upload Background Image</label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gold hover:bg-gold/5 transition-colors">
              <Upload className="h-8 w-8 text-gold mb-2" />
              <span className="text-xs font-bold text-foreground">Choose high-resolution photo</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Recommended: 2400x1600 or vertical 9:16 portrait</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && (
              <p className="text-xs font-bold text-gold animate-pulse flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading background image...
              </p>
            )}
          </div>

          {/* Focal Point Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Image Alignment & Focal Point</label>
            <p className="text-[11px] text-muted-foreground">
              Controls which part of the photo is centered when cropped on widescreen PC displays.
            </p>
            <select
              value={focalPoint}
              onChange={(e) => {
                setFocalPoint(e.target.value);
                setIsDraft(true);
              }}
              className="w-full bg-background border border-border px-3 py-2 text-xs rounded-lg font-medium"
            >
              {FOCAL_POINTS.map((fp) => (
                <option key={fp.value} value={fp.value}>
                  {fp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sizing Mode: Cover vs Contain */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Display Sizing</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setSizing("cover"); setIsDraft(true); }}
                className={`py-2 px-3 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all ${sizing === "cover" ? "bg-ink text-white border-ink shadow" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}
              >
                Cover (Full Bleed)
              </button>
              <button
                type="button"
                onClick={() => { setSizing("contain"); setIsDraft(true); }}
                className={`py-2 px-3 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all ${sizing === "contain" ? "bg-ink text-white border-ink shadow" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}
              >
                Contain (Full Frame)
              </button>
            </div>
          </div>

          {/* Overlay Opacity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">Overlay Contrast Opacity</span>
              <span className="text-gold font-mono">{Math.round(overlayOpacity * 100)}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Darkens the background behind the logo and buttons to ensure crystal-clear text readability without blurry glow lights.
            </p>
            <input
              type="range"
              min="0.0"
              max="0.80"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => {
                setOverlayOpacity(parseFloat(e.target.value));
                setIsDraft(true);
              }}
              className="w-full accent-gold cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0% (Pure Image)</span>
              <span>40% (Standard)</span>
              <span>80% (Deep Cinematic)</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Interactive Preview Simulator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-wider font-bold text-foreground">Live Storefront Preview</span>
            </div>
            {/* Device Switcher */}
            <div className="flex bg-muted/60 p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`px-3 py-1 font-bold rounded transition-colors ${previewDevice === "desktop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                PC / Laptop View
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`px-3 py-1 font-bold rounded transition-colors ${previewDevice === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Mobile View
              </button>
            </div>
          </div>

          {/* Simulator Frame */}
          <div className="bg-ink p-3 rounded-2xl shadow-elevated border border-border/80">
            <div
              className={`relative mx-auto overflow-hidden rounded-xl bg-[#0d0e12] transition-all duration-300 ${
                previewDevice === "desktop" ? "w-full aspect-[16/9] max-h-[500px]" : "w-[340px] aspect-[9/18] max-h-[580px]"
              }`}
            >
              {/* Background Image */}
              <img
                src={previewBg}
                alt="Background preview"
                style={{ objectPosition: focalPoint }}
                className={`absolute inset-0 w-full h-full ${sizing === "contain" ? "object-contain" : "object-cover"}`}
              />

              {/* Dynamic Overlay Gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0, 0, 0, ${overlayOpacity}) 0%, rgba(0, 0, 0, ${overlayOpacity * 0.45}) 55%, transparent 85%)`,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 1.1}) 0%, transparent 40%, transparent 60%, rgba(0,0,0,${overlayOpacity * 1.4}) 100%)`,
                }}
              />

              {/* Storefront Elements overlay to verify visibility */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
                <img
                  src={dexterLogo}
                  alt="DEXTER"
                  style={{
                    filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.7)) drop-shadow(0 12px 28px rgba(0,0,0,0.45))",
                  }}
                  className={`${previewDevice === "desktop" ? "w-72" : "w-52"} max-w-full h-auto object-contain mb-3`}
                />
                <p className="text-gold text-[10px] md:text-xs font-black uppercase tracking-[0.35em] drop-shadow-md">
                  Premium Menswear · Jayankondam
                </p>
                <div className="mt-5 flex gap-2.5">
                  <span className="bg-red-cta text-white text-[10px] uppercase tracking-wider font-extrabold px-4 py-2 rounded shadow">
                    Shop Collection →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
