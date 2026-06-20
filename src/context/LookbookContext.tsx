import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LookbookItem = {
  id: string;
  image_url: string;
  product_id: string | null;
  caption: string | null;
  sort_order: number;
  active: boolean;
};

const Ctx = createContext<{ items: LookbookItem[]; refresh: () => Promise<void> }>({
  items: [], refresh: async () => {},
});

export const LookbookProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<LookbookItem[]>([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("lookbook_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setItems(data as LookbookItem[]);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("lookbook-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "lookbook_items" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return <Ctx.Provider value={{ items, refresh }}>{children}</Ctx.Provider>;
};

export const useLookbook = () => useContext(Ctx);
