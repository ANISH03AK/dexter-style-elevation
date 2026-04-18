import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

export type CartItem = { product: Product; size: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product, size?: string) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "dexter:cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add: CartCtx["add"] = (p, size = "M") => {
    setItems(prev => {
      const found = prev.find(i => i.product.id === p.id && i.size === size);
      if (found) return prev.map(i => i === found ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product: p, size, qty: 1 }];
    });
  };
  const remove: CartCtx["remove"] = (id, size) =>
    setItems(prev => prev.filter(i => !(i.product.id === id && i.size === size)));
  const setQty: CartCtx["setQty"] = (id, size, qty) => {
    if (qty <= 0) return remove(id, size);
    setItems(prev => prev.map(i => i.product.id === id && i.size === size ? { ...i, qty } : i));
  };
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.product.price, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total }}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
