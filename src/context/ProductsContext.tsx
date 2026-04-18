import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { products as seedProducts, Product, Category } from "@/data/products";

type Ctx = {
  products: Product[];
  addProduct: (p: Omit<Product, "id"> & { id?: string }) => void;
  removeProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
};

const ProductsCtx = createContext<Ctx | null>(null);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [extra, setExtra] = useState<Product[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    const all = [...extra, ...seedProducts];
    return all.filter(p => !removed.has(p.id));
  }, [extra, removed]);

  const addProduct: Ctx["addProduct"] = (p) => {
    const id = p.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setExtra(prev => [{ ...p, id } as Product, ...prev]);
  };

  const removeProduct = (id: string) => {
    setExtra(prev => prev.filter(p => p.id !== id));
    setRemoved(prev => new Set(prev).add(id));
  };

  const getProduct = (id: string) => list.find(p => p.id === id);

  return (
    <ProductsCtx.Provider value={{ products: list, addProduct, removeProduct, getProduct }}>
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
