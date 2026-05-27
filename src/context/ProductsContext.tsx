import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Product, Category } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

type NewProductInput = {
  name: string;
  category: Category;
  price: number;
  mrp?: number;
  image: string;
  tag?: string;
  description?: string;
};

type Ctx = {
  products: Product[];
  loading: boolean;
  addProduct: (p: NewProductInput) => Promise<{ error: string | null }>;
  updateProduct: (id: string, p: Partial<NewProductInput>) => Promise<{ error: string | null }>;
  removeProduct: (id: string) => Promise<{ error: string | null }>;
  getProduct: (id: string) => Product | undefined;
  refresh: () => Promise<void>;
};

const ProductsCtx = createContext<Ctx | null>(null);

// DB row → Product shape compatible with existing UI
// offer_price (if present) becomes the displayed price; original price becomes mrp
const mapRow = (r: any): Product => {
  const hasOffer = r.offer_price != null && Number(r.offer_price) < Number(r.price);
  return {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    price: hasOffer ? Number(r.offer_price) : Number(r.price),
    mrp: hasOffer ? Number(r.price) : undefined,
    image: r.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    tag: r.tag ?? undefined,
    description: r.description ?? "",
  };
};

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [live, setLive] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLive(data.map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  // Live (admin-managed) products take precedence; seed list shown as fallback inventory
  // Live admin-managed catalogue is the single source of truth.
  const all = live;

  const addProduct: Ctx["addProduct"] = async (p) => {
    const { error } = await supabase.from("products").insert({
      name: p.name,
      category: p.category,
      price: p.mrp ?? p.price,           // original price
      offer_price: p.mrp ? p.price : null, // discounted (if mrp provided, price is the offer)
      image_url: p.image,
      tag: p.tag || null,
      description: p.description || null,
    });
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const updateProduct: Ctx["updateProduct"] = async (id, p) => {
    const patch: any = {};
    if (p.name !== undefined) patch.name = p.name;
    if (p.category !== undefined) patch.category = p.category;
    if (p.image !== undefined) patch.image_url = p.image;
    if (p.tag !== undefined) patch.tag = p.tag || null;
    if (p.description !== undefined) patch.description = p.description || null;
    if (p.price !== undefined || p.mrp !== undefined) {
      patch.price = p.mrp ?? p.price;
      patch.offer_price = p.mrp ? p.price : null;
    }
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const removeProduct: Ctx["removeProduct"] = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const getProduct = (id: string) => all.find(p => p.id === id);

  return (
    <ProductsCtx.Provider value={{ products: all, loading, addProduct, updateProduct, removeProduct, getProduct, refresh }}>
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
