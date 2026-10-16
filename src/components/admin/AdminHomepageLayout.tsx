import { useState } from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff, Save, RefreshCw, Check, Layers, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCms, HomepageSection } from "@/context/CmsContext";

export const AdminHomepageLayout = () => {
  const { homepageSettings, updateHomepageSettings } = useCms();
  const [sections, setSections] = useState<HomepageSection[]>(() => [...homepageSettings.sections_order]);
  const [saving, setSaving] = useState(false);

  // Toggle Section Enabled
  const toggleSection = (idx: number) => {
    const next = [...sections];
    next[idx].enabled = !next[idx].enabled;
    setSections(next);
  };

  // Move Section Up
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...sections];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    setSections(next);
  };

  // Move Section Down
  const moveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const next = [...sections];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    setSections(next);
  };

  // Edit Title
  const editTitle = (idx: number, title: string) => {
    const next = [...sections];
    next[idx].title = title;
    setSections(next);
  };

  // Edit Subtitle
  const editSubtitle = (idx: number, subtitle: string) => {
    const next = [...sections];
    next[idx].subtitle = subtitle;
    setSections(next);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    const res = await updateHomepageSettings({
      sections_order: sections,
    });
    setSaving(false);
    if (!res.error) {
      toast.success("Homepage layout & section sequence saved successfully!");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Storefront Architecture</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Homepage Layout Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Reorder homepage sections, toggle visibility, and customize section headlines directly without modifying code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs uppercase tracking-wider font-bold rounded hover:bg-secondary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-gold" /> View Homepage
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-red-cta text-white text-xs uppercase tracking-widest font-black rounded-lg hover:bg-gold hover:text-ink transition-all shadow-lg"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Layout
          </button>
        </div>
      </div>

      {/* Sections Table / Cards */}
      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              sec.enabled ? "bg-card border-border shadow-card" : "bg-muted/15 border-border/40 opacity-60"
            }`}
          >
            {/* Left: Reorder handles + Section identifier */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
                  title="Move section up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
                  title="Move section down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gold font-bold">#{idx + 1}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {sec.id.replace("_", " ")}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {sec.enabled ? "● Visible on Storefront" : "○ Hidden from Visitors"}
                </span>
              </div>
            </div>

            {/* Middle: Customizable Title & Subtitle */}
            <div className="flex-1 grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Section Title / Heading..."
                value={sec.title || ""}
                onChange={(e) => editTitle(idx, e.target.value)}
                className="bg-background border border-border px-3 py-1.5 text-xs rounded font-bold"
              />
              <input
                type="text"
                placeholder="Optional Subtitle / Tagline..."
                value={sec.subtitle || ""}
                onChange={(e) => editSubtitle(idx, e.target.value)}
                className="bg-background border border-border px-3 py-1.5 text-xs rounded text-muted-foreground"
              />
            </div>

            {/* Right: Toggle Visibility */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => toggleSection(idx)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  sec.enabled
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {sec.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {sec.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
