import { useState, useRef } from "react";
import { X, Upload, Star, Trash2, ArrowLeft, ArrowRight, RefreshCw, Eye, Check, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/data/products";
import { useCms } from "@/context/CmsContext";

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSaveGallery: (productId: string, images: string[]) => Promise<void>;
}

const VIEW_TYPES = ["Front View", "Back View", "Side View", "Detail View", "Model Styling", "Additional Angle"];

export const AdminProductGalleryModal = ({ product, isOpen, onClose, onSaveGallery }: Props) => {
  const { uploadMediaAsset } = useCms();
  const initialImages = product.images && product.images.length > 0 ? [...product.images] : [product.image];
  const [images, setImages] = useState<string[]>(initialImages);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Multiple file upload in one operation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // File type & size validation (max 12MB)
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image format.`);
        continue;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 12MB file size limit.`);
        continue;
      }

      const res = await uploadMediaAsset(file, "products");
      if (res.url) {
        newUrls.push(res.url);
      } else if (res.error) {
        toast.error(`Upload failed for ${file.name}: ${res.error}`);
      }
    }

    if (newUrls.length > 0) {
      setImages((prev) => [...prev, ...newUrls]);
      toast.success(`Successfully uploaded ${newUrls.length} product image(s).`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add from URL
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
    toast.success("Image URL added to gallery.");
  };

  // Set Primary Image (moves to index 0)
  const setPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([target, ...rest]);
    setActivePreviewIndex(0);
    toast.success("Primary product image updated.");
  };

  // Reorder: Move Left
  const moveLeft = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setImages(next);
    if (activePreviewIndex === index) setActivePreviewIndex(index - 1);
    else if (activePreviewIndex === index - 1) setActivePreviewIndex(index);
  };

  // Reorder: Move Right
  const moveRight = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setImages(next);
    if (activePreviewIndex === index) setActivePreviewIndex(index + 1);
    else if (activePreviewIndex === index + 1) setActivePreviewIndex(index);
  };

  // Remove individual image
  const removeImage = (index: number) => {
    if (images.length <= 1) {
      toast.error("A product must have at least one image.");
      return;
    }
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    if (activePreviewIndex >= next.length) {
      setActivePreviewIndex(Math.max(0, next.length - 1));
    }
    toast.success("Image removed from gallery.");
  };

  // Replace individual image
  const replaceImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadMediaAsset(file, "products");
    if (res.url) {
      const next = [...images];
      next[index] = res.url;
      setImages(next);
      toast.success("Image replaced successfully.");
    } else {
      toast.error(res.error || "Failed to replace image");
    }
    setUploading(false);
  };

  // Save changes
  const handleSave = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image.");
      return;
    }
    setSaving(true);
    try {
      await onSaveGallery(product.id, images);
      toast.success(`Gallery updated with ${images.length} images!`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save gallery");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Image Gallery Management</span>
              <span className="bg-ink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{images.length} Image(s)</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mt-0.5">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid lg:grid-cols-[1.1fr_1fr] gap-6">
          {/* LEFT: Live Customer-Facing Preview */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-gold" /> Customer-Facing Gallery Preview
            </h3>

            <div className="relative aspect-[4/5] bg-secondary rounded-xl overflow-hidden border border-border shadow-inner">
              <img
                src={images[activePreviewIndex] || product.image}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-ink/80 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded font-bold">
                {activePreviewIndex === 0 ? "★ Primary Image" : VIEW_TYPES[activePreviewIndex] || `Angle ${activePreviewIndex + 1}`}
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white/90 text-[10px] px-2.5 py-1 rounded">
                Image {activePreviewIndex + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnails strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`relative aspect-[4/5] w-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${activePreviewIndex === idx ? "border-gold shadow-md scale-105" : "border-border opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-0.5 right-0.5 text-gold text-[10px]">★</span>
                  )}
                </button>
              ))}
            </div>

            {images.length < 5 && (
              <div className="flex items-start gap-2 p-3 bg-gold/10 border border-gold/30 rounded-lg text-xs text-foreground">
                <AlertCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <p>
                  <strong>Pro Tip:</strong> Men's fashion sells best with at least 5 images (Front, Back, Side angle, Fabric detail, and Model styling). Add {5 - images.length} more image(s) to hit the recommendation.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Gallery Controls & Ordering */}
          <div className="flex flex-col gap-5">
            {/* Upload Zone */}
            <div className="p-4 bg-muted/30 border-2 border-dashed border-border rounded-xl text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="gallery-file-upload"
              />
              <label
                htmlFor="gallery-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
              >
                <div className="h-12 w-12 rounded-full bg-gold/15 text-gold grid place-items-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Click to Upload Multiple Images</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload front, back, side, and detail views in one step (JPG, PNG, WebP up to 12MB)</p>
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 text-xs font-bold text-gold mt-2 animate-pulse">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading media to storage...
                  </div>
                )}
              </label>

              {/* URL fallback */}
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-background border border-border px-3 py-1.5 text-xs rounded"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="bg-secondary hover:bg-ink hover:text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* List of images with controls */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Manage Image Sequence</span>
                <span className="text-[10px] text-muted-foreground">Reorder using arrows · Top image is Primary</span>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${idx === 0 ? "bg-gold/10 border-gold/40" : "bg-card border-border hover:border-muted-foreground/30"}`}
                  >
                    <div className="w-12 h-14 bg-secondary rounded overflow-hidden shrink-0 relative">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white text-center font-bold">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {idx === 0 ? "★ Primary Image (Storefront Card)" : VIEW_TYPES[idx] || `Angle ${idx + 1}`}
                        </span>
                        {idx === 0 && (
                          <span className="bg-gold text-ink text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                            Main
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{img}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimary(idx)}
                          title="Set as Primary Image"
                          className="p-1.5 text-muted-foreground hover:text-gold hover:bg-gold/10 rounded transition-colors"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => moveLeft(idx)}
                        disabled={idx === 0}
                        title="Move Up in sequence"
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20 hover:bg-secondary rounded transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveRight(idx)}
                        disabled={idx === images.length - 1}
                        title="Move Down in sequence"
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20 hover:bg-secondary rounded transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      {/* Replace input */}
                      <label className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors cursor-pointer" title="Replace image">
                        <RefreshCw className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => replaceImage(idx, e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        disabled={images.length <= 1}
                        title="Delete image"
                        className="p-1.5 text-muted-foreground hover:text-red-500 disabled:opacity-20 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Changes persist directly in database & customer product details.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-red-cta text-white px-6 py-2.5 text-xs uppercase tracking-widest font-extrabold rounded hover:bg-gold hover:text-ink transition-colors shadow-lg flex items-center gap-2"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
