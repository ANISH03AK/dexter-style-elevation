import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/data/products";

type Ctx = {
  items: Product[];
  toggle: (p: Product) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
};

const WishlistCtx = createContext<Ctx | null>(null);
const KEY = "dexter:wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const has = (id: string) => items.some(i => i.id === id);
  const toggle = (p: Product) =>
    setItems(prev => prev.some(i => i.id === p.id) ? prev.filter(i => i.id !== p.id) : [p, ...prev]);
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <WishlistCtx.Provider value={{ items, toggle, remove, has, count: items.length }}>
      {children}
    </WishlistCtx.Provider>
  );
};

export const useWishlist = () => {
  const c = useContext(WishlistCtx);
  if (!c) throw new Error("useWishlist outside provider");
  return c;
};
