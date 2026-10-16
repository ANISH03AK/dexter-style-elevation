import { useState } from "react";
import { Layers, Plus, Pencil, Trash2, Upload, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useProducts, Category } from "@/context/ProductsContext";
import { useCms } from "@/context/CmsContext";

export const AdminCategories = () => {
  const { products } = useProducts();
  const { uploadMediaAsset } = useCms();

  const allCategories: Category[] = [
    "Shirts", "T-Shirts", "Pants", "Jeans", "Jackets", "Hoodies", "Suits", "Activewear", "Innerwear", "Accessories"
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-cta font-extrabold">Taxonomy & Navigation</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mt-1">
            Category Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Organize menswear departments, monitor live product distribution, and manage navigation categories.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allCategories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          const sampleProduct = products.find((p) => p.category === cat);

          return (
            <div
              key={cat}
              className="p-5 bg-card border border-border rounded-2xl shadow-card hover:shadow-elevated transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{cat}</h3>
                  <span className="text-xs text-muted-foreground">{count} Active Product(s)</span>
                </div>
                <div className="h-10 w-10 bg-secondary rounded-lg overflow-hidden shrink-0">
                  {sampleProduct ? (
                    <img src={sampleProduct.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">DX</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <a
                  href={`/shop?cat=${encodeURIComponent(cat)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-gold font-bold hover:underline"
                >
                  View in Shop <ExternalLink className="h-3 w-3" />
                </a>
                <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold">
                  {count > 0 ? "In Stock" : "Catalog Ready"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
