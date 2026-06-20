import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StoreSettings = {
  free_shipping_threshold: number;
  flat_shipping_fee: number;
  announcement_text: string;
  hero_headline: string;
  hero_subtext: string;
  hero_image_url: string | null;
};

const DEFAULTS: StoreSettings = {
  free_shipping_threshold: 2500,
  flat_shipping_fee: 162,
  announcement_text: "Free shipping on orders over ₹2500 · Call 089252 59787",
  hero_headline: "DEXTER MENS CLOTHING",
  hero_subtext: "Premium Menswear · Jayankondam",
  hero_image_url: null,
};

type Ctx = { settings: StoreSettings; refresh: () => Promise<void> };
const Ctx = createContext<Ctx>({ settings: DEFAULTS, refresh: async () => {} });

export const StoreSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();
    if (data) {
      setSettings({
        free_shipping_threshold: Number(data.free_shipping_threshold) || DEFAULTS.free_shipping_threshold,
        flat_shipping_fee: Number(data.flat_shipping_fee) || DEFAULTS.flat_shipping_fee,
        announcement_text: data.announcement_text || DEFAULTS.announcement_text,
        hero_headline: data.hero_headline || DEFAULTS.hero_headline,
        hero_subtext: data.hero_subtext || DEFAULTS.hero_subtext,
        hero_image_url: data.hero_image_url ?? null,
      });
    }
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("store-settings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return <Ctx.Provider value={{ settings, refresh }}>{children}</Ctx.Provider>;
};

export const useStoreSettings = () => useContext(Ctx);
