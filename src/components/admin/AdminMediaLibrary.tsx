import { useState } from "react";
import { Upload, Search, Trash2, Copy, Check, Filter, Image as ImageIcon, AlertTriangle, RefreshCw, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCms, MediaAsset } from "@/context/CmsContext";

const CATEGORIES: { id: MediaAsset["category"] | "all"; label: string }[] = [
  { id: "all", label: "All Assets" },
  { id: "products", label: "Product Imagery" },
  { id: "backgrounds", label: "Homepage Backgrounds" },
  { id: "advertisements", label: "Advertisements" },
  { id: "banners", label: "Promotional Banners" },
  { id: "categories", label: "Category Assets" },
  { id: "other", label: "Other Media" },
];

export const AdminMediaLibrary = () => {
  const { mediaAssets, uploadMediaAsset, deleteMediaAsset, isMediaInUse } = useCms();

  const [categoryFilter, setCategoryFilter] = useState<MediaAsset["category"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered Assets
  const filtered = mediaAssets.filter((m) => {
    const matchCat = categoryFilter === "all" || m.category === categoryFilter;
    const matchQ = !searchQuery.trim() || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  // Multiple File Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const targetCat = categoryFilter === "all" ? "other" : categoryFilter;
      const res = await uploadMediaAsset(file, targetCat);
      if (res.url) count++;
    }
    setUploading(false);

    if (count > 0) {
      toast.success(`Uploaded ${count} media asset(s) to Media Library.`);
    }
  };

  // Copy Image URL to clipboard
  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe Delete with usage check
  const handleDelete = async (asset: MediaAsset) => {
    const usage = isMediaInUse(asset.file_url);
    if (usage.inUse) {
      toast.error(
        `Cannot delete "${asset.name}". It is currently referenced by: ${usage.usedBy.join(", ")}. Reassign those items first.`,
        { duration: 5000 }
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${asset.name}" from the Media Library?`)) {
      return;
    }

    const res = await deleteMediaAsset(asset.id, asset.file_url);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Media asset deleted.");
      if (selectedAsset?.id === asset.id) setSelectedAsset(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Asset Storage</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Central Media Library
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Upload, browse, inspect, and reuse high-resolution fashion assets across products, backgrounds, and marketing banners.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg cursor-pointer self-start md:self-auto">
          {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span>{uploading ? "Uploading..." : "Upload New Media"}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border pl-9 pr-4 py-2 text-xs rounded-lg"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === c.id
                  ? "bg-ink text-white shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-card border border-border rounded-2xl">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-foreground">No media assets found</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Upload new fashion photos or adjust your category filter to see stored assets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((asset) => {
            const usage = isMediaInUse(asset.file_url);

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`group relative aspect-[4/5] bg-secondary rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-card hover:shadow-elevated ${
                  selectedAsset?.id === asset.id ? "border-gold ring-2 ring-gold/30" : "border-border hover:border-foreground/40"
                }`}
              >
                <img
                  src={asset.file_url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-ink/80 text-white backdrop-blur">
                    {asset.category}
                  </span>
                  {usage.inUse && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-ink" title="In use by storefront" />
                  )}
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-bold truncate">{asset.name}</p>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-white/70">
                    <span>{asset.file_size ? `${Math.round(asset.file_size / 1024)} KB` : "Asset"}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(asset.file_url, asset.id);
                      }}
                      className="p-1 hover:text-gold"
                      title="Copy URL"
                    >
                      {copiedId === asset.id ? <Check className="h-3 w-3 text-gold" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Inspector Drawer / Modal */}
      {selectedAsset && (
        <div className="p-5 bg-card border border-border rounded-2xl shadow-card flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border">
              <img src={selectedAsset.file_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">{selectedAsset.name}</h4>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-muted">
                  {selectedAsset.category}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-md mt-1">{selectedAsset.file_url}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1.5">
                {selectedAsset.file_size && <span>Size: {Math.round(selectedAsset.file_size / 1024)} KB</span>}
                <span>Uploaded: {new Date(selectedAsset.created_at).toLocaleDateString()}</span>
                {isMediaInUse(selectedAsset.file_url).inUse && (
                  <span className="text-emerald-500 font-bold">● Active on storefront</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => copyUrl(selectedAsset.file_url, selectedAsset.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground text-xs uppercase tracking-wider font-bold rounded hover:bg-muted transition-colors"
            >
              {copiedId === selectedAsset.id ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5" />}
              Copy URL
            </button>
            <a
              href={selectedAsset.file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded hover:bg-secondary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open
            </a>
            <button
              type="button"
              onClick={() => handleDelete(selectedAsset)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-500/10 text-xs uppercase tracking-wider font-bold rounded transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
