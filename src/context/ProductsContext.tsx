import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { products as defaultProducts, type Product, type Category } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

export type NewProductInput = {
  name: string;
  category: Category;
  price: number;
  mrp?: number;
  image: string;
  images?: string[];
  tag?: string;
  description?: string;
  pinned?: boolean;
  badgeText?: string;
  stockBySize?: Record<string, number>;
  brand?: string;
  sku?: string;
  colors?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  status?: "active" | "draft" | "archived";
};

type Ctx = {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (p: NewProductInput) => Promise<{ error: string | null; id?: string }>;
  updateProduct: (id: string, p: Partial<NewProductInput>) => Promise<{ error: string | null }>;
  removeProduct: (id: string) => Promise<{ error: string | null }>;
  deductStock: (items: Array<{ id: string; size: string; qty: number }>) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  refresh: () => Promise<void>;
};

const ProductsCtx = createContext<Ctx | null>(null);

const LS_PRODUCTS_KEY = "dexter_live_products";
const LS_DELETED_KEY = "dexter_deleted_products";

const safeReadProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const safeWriteProducts = (items: Product[]) => {
  try {
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("localStorage write failed:", err);
  }
};

const safeReadDeleted = (): string[] => {
  try {
    const raw = localStorage.getItem(LS_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const safeWriteDeleted = (ids: string[]) => {
  try {
    localStorage.setItem(LS_DELETED_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("localStorage write failed:", err);
  }
};

const mapRow = (r: any): Product => {
  const hasOffer = r.offer_price != null && Number(r.offer_price) < Number(r.price);
  
  // Extract images array if available
  let imagesArray: string[] = [];
  if (Array.isArray(r.images) && r.images.length > 0) {
    imagesArray = r.images;
  } else if (typeof r.images === "string") {
    try {
      imagesArray = JSON.parse(r.images);
    } catch {
      imagesArray = [r.image_url || ""];
    }
  } else if (r.image_url) {
    imagesArray = [r.image_url];
  }

  const primaryImage = imagesArray[0] || r.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85";

  return {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    price: hasOffer ? Number(r.offer_price) : Number(r.price),
    mrp: hasOffer ? Number(r.price) : (r.mrp ? Number(r.mrp) : undefined),
    image: primaryImage,
    images: imagesArray.length > 0 ? imagesArray : [primaryImage],
    tag: r.tag ?? undefined,
    description: r.description ?? "",
    pinned: !!r.pinned,
    badgeText: r.badge_text ?? undefined,
    stockBySize: (r.stock_by_size as Record<string, number>) ?? {},
    brand: r.brand || "DEXTER",
    sku: r.sku || undefined,
    colors: Array.isArray(r.colors) ? r.colors : undefined,
    isNew: !!r.is_new,
    isBestseller: !!r.is_bestseller,
    status: (r.status as "active" | "draft" | "archived") || "active",
  };
};

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [live, setLive] = useState<Product[]>(() => safeReadProducts());
  const [deletedIds, setDeletedIds] = useState<string[]>(() => safeReadDeleted());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) {
        console.warn("Supabase products fetch note:", sbError.message);
        setError(sbError.message);
      } else if (data && data.length > 0) {
        const mapped = data.map(mapRow);
        setLive(mapped);
        safeWriteProducts(mapped);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch live products from database");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    try {
      const channel = supabase
        .channel("products-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "product_images" }, () => refresh())
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore channel errors if offline
    }
  }, [refresh]);

  // Live products take precedence; merged with default fallback catalog while excluding deleted IDs
  const allProducts = useMemo(() => {
    const activeLive = live.filter((p) => !deletedIds.includes(p.id));
    const activeDefaults = defaultProducts.filter(
      (def) => !deletedIds.includes(def.id) && !activeLive.some((l) => l.id === def.id)
    );
    return [...activeLive, ...activeDefaults];
  }, [live, deletedIds]);

  const addProduct: Ctx["addProduct"] = async (p) => {
    const newId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const gallery = p.images && p.images.length > 0 ? p.images : [p.image];
    const primaryImg = gallery[0] || p.image;

    const newProduct: Product = {
      id: newId,
      name: p.name,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      image: primaryImg,
      images: gallery,
      tag: p.tag,
      description: p.description || "",
      pinned: p.pinned ?? false,
      badgeText: p.badgeText,
      stockBySize: p.stockBySize ?? { S: 5, M: 10, L: 10, XL: 5 },
      brand: p.brand || "DEXTER",
      sku: p.sku || `DX-${Date.now().toString().slice(-4)}`,
      colors: p.colors || ["Black"],
      isNew: p.isNew ?? true,
      isBestseller: p.isBestseller ?? false,
      status: p.status || "active",
    };

    // Optimistic local update
    setLive((prev) => {
      const next = [newProduct, ...prev];
      safeWriteProducts(next);
      return next;
    });

    try {
      const { error } = await supabase.from("products").insert({
        id: newId,
        name: p.name,
        category: p.category,
        price: p.mrp ?? p.price,
        offer_price: p.mrp ? p.price : null,
        image_url: primaryImg,
        images: gallery,
        tag: p.tag || null,
        description: p.description || null,
        pinned: p.pinned ?? false,
        badge_text: p.badgeText || null,
        stock_by_size: p.stockBySize ?? {},
        brand: p.brand || "DEXTER",
        sku: p.sku || null,
        colors: p.colors || [],
        is_new: p.isNew ?? false,
        is_bestseller: p.isBestseller ?? false,
        status: p.status || "active",
      } as any);

      // Also insert into product_images table
      if (!error && gallery.length > 0) {
        const imageRows = gallery.map((imgUrl, idx) => ({
          product_id: newId,
          image_url: imgUrl,
          is_primary: idx === 0,
          sort_order: idx,
          view_type: idx === 0 ? "front" : idx === 1 ? "back" : idx === 2 ? "side" : idx === 3 ? "detail" : "other",
        }));
        await supabase.from("product_images").insert(imageRows as any);
      }
    } catch {
      // Local fallback succeeded
    }

    return { error: null, id: newId };
  };

  const updateProduct: Ctx["updateProduct"] = async (id, p) => {
    // Optimistic local update
    setLive((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item;
        const gallery = p.images ? p.images : (p.image ? [p.image] : item.images || [item.image]);
        const primary = gallery[0] || p.image || item.image;
        return {
          ...item,
          ...p,
          image: primary,
          images: gallery,
        };
      });
      safeWriteProducts(next);
      return next;
    });

    try {
      const patch: any = {};
      if (p.name !== undefined) patch.name = p.name;
      if (p.category !== undefined) patch.category = p.category;
      if (p.images !== undefined) {
        patch.images = p.images;
        patch.image_url = p.images[0] || p.image;
      } else if (p.image !== undefined) {
        patch.image_url = p.image;
      }
      if (p.tag !== undefined) patch.tag = p.tag || null;
      if (p.description !== undefined) patch.description = p.description || null;
      if (p.pinned !== undefined) patch.pinned = p.pinned;
      if (p.badgeText !== undefined) patch.badge_text = p.badgeText || null;
      if (p.stockBySize !== undefined) patch.stock_by_size = p.stockBySize;
      if (p.brand !== undefined) patch.brand = p.brand;
      if (p.sku !== undefined) patch.sku = p.sku;
      if (p.colors !== undefined) patch.colors = p.colors;
      if (p.isNew !== undefined) patch.is_new = p.isNew;
      if (p.isBestseller !== undefined) patch.is_bestseller = p.isBestseller;
      if (p.status !== undefined) patch.status = p.status;
      if (p.price !== undefined || p.mrp !== undefined) {
        patch.price = p.mrp ?? p.price;
        patch.offer_price = p.mrp ? p.price : null;
      }

      await supabase.from("products").update(patch).eq("id", id);

      // If images were updated, refresh product_images table
      if (p.images && p.images.length > 0) {
        await supabase.from("product_images").delete().eq("product_id", id);
        const imageRows = p.images.map((imgUrl, idx) => ({
          product_id: id,
          image_url: imgUrl,
          is_primary: idx === 0,
          sort_order: idx,
          view_type: idx === 0 ? "front" : idx === 1 ? "back" : idx === 2 ? "side" : idx === 3 ? "detail" : "other",
        }));
        await supabase.from("product_images").insert(imageRows as any);
      }
    } catch {
      // Local fallback succeeded
    }

    return { error: null };
  };

  const removeProduct: Ctx["removeProduct"] = async (id) => {
    setLive((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeWriteProducts(next);
      return next;
    });

    try {
      await supabase.from("products").delete().eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  const getProduct = (id: string) => allProducts.find((p) => p.id === id);

  return (
    <ProductsCtx.Provider
      value={{
        products: allProducts,
        loading,
        addProduct,
        updateProduct,
        removeProduct,
        getProduct,
        refresh,
      }}
    >
      {children}
    </ProductsCtx.Provider>
  );
};

export const useProducts = () => {
  const c = useContext(ProductsCtx);
  if (!c) throw new Error("useProducts outside provider");
  return c;
};

export type { Category };
