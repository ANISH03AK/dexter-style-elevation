import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroStreetwearDesktop from "@/assets/hero-streetwear-pc.jpg";
import heroStreetwearMobile from "@/assets/hero-streetwear-mobile.jpg";

// ==========================================
// TYPES
// ==========================================

export type AdPlacement = "hero" | "home_promo" | "banner_strip" | "shop" | "category";

export type Advertisement = {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  image_url: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  button_text?: string;
  button_url?: string;
  placement: AdPlacement;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  sort_order: number;
  background_color?: string;
  text_color?: string;
  text_alignment?: "left" | "center" | "right";
  overlay_opacity?: number;
  created_at: string;
};

export type BannerPlacement = "announcement" | "compact_card" | "medium_promo" | "large_banner" | "shop_top";
export type BannerLayout = "thin_announcement" | "compact" | "medium" | "large_hero";

export type PromotionalBanner = {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  background_color: string;
  text_color: string;
  button_text?: string;
  button_url?: string;
  placement: BannerPlacement;
  layout_preset: BannerLayout;
  sort_order: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
};

export type OfferType =
  | "percentage"
  | "fixed_amount"
  | "product_specific"
  | "category_specific"
  | "sitewide"
  | "coupon_code"
  | "flash_sale";

export type DiscountCampaign = {
  id: string;
  name: string;
  description?: string;
  offer_type: OfferType;
  discount_value: number; // percentage (e.g. 25) or fixed amount (e.g. 300)
  coupon_code?: string;
  applicable_products?: string[]; // Product IDs
  applicable_categories?: string[]; // Category names
  min_purchase_amount?: number;
  max_discount_amount?: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  display_label?: string; // e.g. "25% OFF" or "SAVE ₹300"
  banner_image_url?: string;
  priority: number;
  created_at: string;
};

export type HomepageSection = {
  id: string;
  enabled: boolean;
  title: string;
  subtitle?: string;
};

export type HomepageSettings = {
  id: string;
  background_image_url: string | null;
  background_mobile_image_url: string | null;
  background_sizing: "cover" | "contain";
  focal_point: string; // e.g. "center 18%"
  overlay_opacity: number; // 0.0 to 1.0
  is_background_published: boolean;
  draft_background_image_url: string | null;
  sections_order: HomepageSection[];
  featured_product_ids: string[];
  featured_categories: string[];
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  name: string;
  file_url: string;
  file_type: "image" | "video" | "document";
  category: "products" | "backgrounds" | "advertisements" | "banners" | "categories" | "other";
  file_size?: number;
  dimensions?: string;
  created_at: string;
};

// ==========================================
// DEFAULT SEED DATA
// ==========================================

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: "announcement", enabled: true, title: "" },
  { id: "hero", enabled: true, title: "DEXTER MENS CLOTHING", subtitle: "Premium Menswear · Jayankondam" },
  { id: "promo_banners", enabled: true, title: "" },
  { id: "categories", enabled: true, title: "Shop By Category", subtitle: "Curated collections for modern men" },
  { id: "featured_products", enabled: true, title: "Featured Streetwear", subtitle: "Hand-picked elevated essentials" },
  { id: "new_arrivals", enabled: true, title: "New Arrivals", subtitle: "Fresh drop of premium streetwear" },
  { id: "advertisements", enabled: true, title: "Special Highlights", subtitle: "Limited edition campaigns" },
  { id: "lookbook", enabled: true, title: "Lookbook — Street Elevation", subtitle: "Real styling, real fabric, real Jayankondam culture." },
  { id: "reviews", enabled: true, title: "Customer Reviews", subtitle: "Verified feedback from style-conscious men" },
  { id: "store_info", enabled: true, title: "Visit Our Store", subtitle: "Anna Silai, Jayankondam" },
];

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  id: "main",
  background_image_url: heroStreetwearDesktop,
  background_mobile_image_url: heroStreetwearMobile,
  background_sizing: "cover",
  focal_point: "center 18%",
  overlay_opacity: 0.40,
  is_background_published: true,
  draft_background_image_url: null,
  sections_order: DEFAULT_HOMEPAGE_SECTIONS,
  featured_product_ids: ["shirt-white-formal", "tee-oversized-drop", "pants-cargo", "active-hoodie"],
  featured_categories: ["Shirts", "T-Shirts", "Pants", "Hoodies"],
  updated_at: new Date().toISOString(),
};

const DEFAULT_PROMO_BANNERS: PromotionalBanner[] = [
  {
    id: "banner-free-ship",
    title: "Free Express Shipping on Orders Over ₹2,500",
    subtitle: "Pan-India fast dispatch directly from Jayankondam store",
    background_color: "#dc2626",
    text_color: "#ffffff",
    button_text: "Shop Now",
    button_url: "/shop",
    placement: "announcement",
    layout_preset: "thin_announcement",
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "banner-festive",
    title: "Festive Streetwear Drop — Up to 35% OFF",
    subtitle: "Exclusive drop-shoulder oversized tees and heavyweight cargo pants",
    background_color: "#0d0e12",
    text_color: "#ffffff",
    button_text: "Explore Drop",
    button_url: "/shop",
    placement: "compact_card",
    layout_preset: "compact",
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_ADVERTISEMENTS: Advertisement[] = [
  {
    id: "ad-street-elevation",
    name: "Streetwear Elevation Season Drop",
    title: "ELEVATE YOUR EVERYDAY STYLE",
    subtitle: "Engineered fabrics, relaxed tailored fits, and authentic luxury menswear aesthetics.",
    image_url: heroStreetwearDesktop,
    desktop_image_url: heroStreetwearDesktop,
    mobile_image_url: heroStreetwearMobile,
    button_text: "Shop New Collection",
    button_url: "/shop",
    placement: "home_promo",
    is_active: true,
    sort_order: 1,
    background_color: "#0d0e12",
    text_color: "#ffffff",
    text_alignment: "center",
    overlay_opacity: 0.35,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_DISCOUNTS: DiscountCampaign[] = [
  {
    id: "disc-welcome10",
    name: "First Order Welcome Discount",
    description: "Flat 10% discount on all menswear orders",
    offer_type: "coupon_code",
    discount_value: 10,
    coupon_code: "DEXTER10",
    min_purchase_amount: 999,
    max_discount_amount: 500,
    is_active: true,
    display_label: "10% OFF",
    priority: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "disc-hoodies-20",
    name: "Winter Hoodies Special",
    description: "Flat 20% off all hoodies & jackets",
    offer_type: "category_specific",
    discount_value: 20,
    applicable_categories: ["Hoodies", "Jackets"],
    is_active: true,
    display_label: "20% OFF",
    priority: 2,
    created_at: new Date().toISOString(),
  },
];

// LocalStorage Persistence Keys
const LS_HOMEPAGE = "dexter_cms_homepage_settings";
const LS_ADS = "dexter_cms_advertisements";
const LS_BANNERS = "dexter_cms_banners";
const LS_DISCOUNTS = "dexter_cms_discounts";
const LS_MEDIA = "dexter_cms_media_assets";

// Helper to safely read from localStorage
const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("localStorage write failed:", err);
  }
};

// ==========================================
// CONTEXT DEFINITION
// ==========================================

type CmsContextType = {
  // Advertisements
  advertisements: Advertisement[];
  activeAdsForPlacement: (placement: AdPlacement) => Advertisement[];
  saveAdvertisement: (ad: Omit<Advertisement, "id" | "created_at"> & { id?: string }) => Promise<{ error: string | null; id?: string }>;
  deleteAdvertisement: (id: string) => Promise<{ error: string | null }>;
  toggleAdStatus: (id: string, active: boolean) => Promise<{ error: string | null }>;

  // Promotional Banners
  promotionalBanners: PromotionalBanner[];
  activeBannersForPlacement: (placement: BannerPlacement) => PromotionalBanner[];
  savePromotionalBanner: (b: Omit<PromotionalBanner, "id" | "created_at"> & { id?: string }) => Promise<{ error: string | null; id?: string }>;
  deletePromotionalBanner: (id: string) => Promise<{ error: string | null }>;
  toggleBannerStatus: (id: string, active: boolean) => Promise<{ error: string | null }>;

  // Offers and Discounts
  discountCampaigns: DiscountCampaign[];
  activeDiscounts: DiscountCampaign[];
  saveDiscountCampaign: (d: Omit<DiscountCampaign, "id" | "created_at"> & { id?: string }) => Promise<{ error: string | null; id?: string }>;
  deleteDiscountCampaign: (id: string) => Promise<{ error: string | null }>;
  toggleDiscountStatus: (id: string, active: boolean) => Promise<{ error: string | null }>;
  calculateProductPrice: (product: { id: string; category: string; price: number; mrp?: number }) => {
    finalPrice: number;
    originalPrice: number;
    savings: number;
    discountPercent: number;
    appliedCampaign: DiscountCampaign | null;
  };
  validateCouponCode: (code: string, subtotal: number, items: Array<{ id: string; category: string; price: number; qty: number }>) => {
    valid: boolean;
    discountAmount: number;
    message: string;
    campaign: DiscountCampaign | null;
  };

  // Homepage Design & Background
  homepageSettings: HomepageSettings;
  updateHomepageSettings: (patch: Partial<HomepageSettings>) => Promise<{ error: string | null }>;
  publishBackground: (newImageUrl?: string) => Promise<{ error: string | null }>;
  restoreDefaultBackground: () => Promise<{ error: string | null }>;

  // Media Library
  mediaAssets: MediaAsset[];
  uploadMediaAsset: (file: File, category?: MediaAsset["category"]) => Promise<{ url: string | null; asset: MediaAsset | null; error: string | null }>;
  deleteMediaAsset: (id: string, fileUrl: string) => Promise<{ error: string | null }>;
  isMediaInUse: (fileUrl: string) => { inUse: boolean; usedBy: string[] };

  // Global loading & refresh
  loading: boolean;
  refreshCms: () => Promise<void>;
};

const CmsContext = createContext<CmsContextType | null>(null);

export const CmsProvider = ({ children }: { children: ReactNode }) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => safeRead(LS_ADS, DEFAULT_ADVERTISEMENTS));
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBanner[]>(() => safeRead(LS_BANNERS, DEFAULT_PROMOBANNERS_CLEAN()));
  const [discountCampaigns, setDiscountCampaigns] = useState<DiscountCampaign[]>(() => safeRead(LS_DISCOUNTS, DEFAULT_DISCOUNTS));
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => safeRead(LS_HOMEPAGE, DEFAULT_HOMEPAGE_SETTINGS));
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => safeRead(LS_MEDIA, []));
  const [loading, setLoading] = useState(true);

  function DEFAULT_PROMOBANNERS_CLEAN(): PromotionalBanner[] {
    return DEFAULT_PROMO_BANNERS;
  }

  // Load from Supabase on mount
  const refreshCms = useCallback(async () => {
    try {
      // 1. Homepage Settings
      const { data: hpData } = await supabase.from("homepage_settings").select("*").eq("id", "main").maybeSingle();
      if (hpData) {
        const merged: HomepageSettings = {
          id: hpData.id || "main",
          background_image_url: hpData.background_image_url || DEFAULT_HOMEPAGE_SETTINGS.background_image_url,
          background_mobile_image_url: hpData.background_mobile_image_url || DEFAULT_HOMEPAGE_SETTINGS.background_mobile_image_url,
          background_sizing: (hpData.background_sizing as "cover" | "contain") || "cover",
          focal_point: hpData.focal_point || "center 18%",
          overlay_opacity: hpData.overlay_opacity !== null ? Number(hpData.overlay_opacity) : 0.40,
          is_background_published: hpData.is_background_published ?? true,
          draft_background_image_url: hpData.draft_background_image_url || null,
          sections_order: Array.isArray(hpData.sections_order) && hpData.sections_order.length > 0 ? (hpData.sections_order as any) : DEFAULT_HOMEPAGE_SECTIONS,
          featured_product_ids: Array.isArray(hpData.featured_product_ids) ? (hpData.featured_product_ids as string[]) : DEFAULT_HOMEPAGE_SETTINGS.featured_product_ids,
          featured_categories: Array.isArray(hpData.featured_categories) ? (hpData.featured_categories as string[]) : DEFAULT_HOMEPAGE_SETTINGS.featured_categories,
          updated_at: hpData.updated_at || new Date().toISOString(),
        };
        setHomepageSettings(merged);
        safeWrite(LS_HOMEPAGE, merged);
      }

      // 2. Advertisements
      const { data: adsData } = await supabase.from("advertisements").select("*").order("sort_order", { ascending: true });
      if (adsData && adsData.length > 0) {
        const mapped = adsData.map((a: any) => ({
          id: a.id,
          name: a.name,
          title: a.title,
          subtitle: a.subtitle || undefined,
          image_url: a.image_url,
          desktop_image_url: a.desktop_image_url || undefined,
          mobile_image_url: a.mobile_image_url || undefined,
          button_text: a.button_text || undefined,
          button_url: a.button_url || undefined,
          placement: a.placement as AdPlacement,
          start_date: a.start_date || null,
          end_date: a.end_date || null,
          is_active: a.is_active ?? true,
          sort_order: a.sort_order ?? 0,
          background_color: a.background_color || "#0d0e12",
          text_color: a.text_color || "#ffffff",
          text_alignment: a.text_alignment || "center",
          overlay_opacity: a.overlay_opacity !== null ? Number(a.overlay_opacity) : 0.35,
          created_at: a.created_at || new Date().toISOString(),
        }));
        setAdvertisements(mapped);
        safeWrite(LS_ADS, mapped);
      }

      // 3. Promotional Banners
      const { data: banData } = await supabase.from("promotional_banners").select("*").order("sort_order", { ascending: true });
      if (banData && banData.length > 0) {
        const mappedBanners = banData.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || undefined,
          image_url: b.image_url || undefined,
          desktop_image_url: b.desktop_image_url || undefined,
          mobile_image_url: b.mobile_image_url || undefined,
          background_color: b.background_color || "#dc2626",
          text_color: b.text_color || "#ffffff",
          button_text: b.button_text || undefined,
          button_url: b.button_url || undefined,
          placement: b.placement as BannerPlacement,
          layout_preset: b.layout_preset as BannerLayout,
          sort_order: b.sort_order ?? 0,
          start_date: b.start_date || null,
          end_date: b.end_date || null,
          is_active: b.is_active ?? true,
          created_at: b.created_at || new Date().toISOString(),
        }));
        setPromotionalBanners(mappedBanners);
        safeWrite(LS_BANNERS, mappedBanners);
      }

      // 4. Discount Campaigns
      const { data: discData } = await supabase.from("discount_campaigns").select("*").order("priority", { ascending: true });
      if (discData && discData.length > 0) {
        const mappedDiscounts = discData.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || undefined,
          offer_type: d.offer_type as OfferType,
          discount_value: Number(d.discount_value) || 0,
          coupon_code: d.coupon_code || undefined,
          applicable_products: Array.isArray(d.applicable_products) ? d.applicable_products : [],
          applicable_categories: Array.isArray(d.applicable_categories) ? d.applicable_categories : [],
          min_purchase_amount: d.min_purchase_amount ? Number(d.min_purchase_amount) : 0,
          max_discount_amount: d.max_discount_amount ? Number(d.max_discount_amount) : undefined,
          start_date: d.start_date || null,
          end_date: d.end_date || null,
          is_active: d.is_active ?? true,
          display_label: d.display_label || undefined,
          banner_image_url: d.banner_image_url || undefined,
          priority: d.priority ?? 1,
          created_at: d.created_at || new Date().toISOString(),
        }));
        setDiscountCampaigns(mappedDiscounts);
        safeWrite(LS_DISCOUNTS, mappedDiscounts);
      }

      // 5. Media Assets
      const { data: mediaData } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
      if (mediaData && mediaData.length > 0) {
        setMediaAssets(mediaData as any);
        safeWrite(LS_MEDIA, mediaData);
      }
    } catch {
      // Graceful offline/local mode
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCms();

    // Realtime Supabase channels for live dynamic synchronization across all visitors
    try {
      const channel = supabase
        .channel("dexter-cms-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "homepage_settings" }, () => refreshCms())
        .on("postgres_changes", { event: "*", schema: "public", table: "advertisements" }, () => refreshCms())
        .on("postgres_changes", { event: "*", schema: "public", table: "promotional_banners" }, () => refreshCms())
        .on("postgres_changes", { event: "*", schema: "public", table: "discount_campaigns" }, () => refreshCms())
        .on("postgres_changes", { event: "*", schema: "public", table: "media_assets" }, () => refreshCms())
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore channel setup errors if offline
    }
  }, [refreshCms]);

  // Check if a campaign/ad is currently within its schedule window
  const isScheduledNow = (start?: string | null, end?: string | null) => {
    const now = Date.now();
    if (start && new Date(start).getTime() > now) return false;
    if (end && new Date(end).getTime() < now) return false;
    return true;
  };

  // Filter active advertisements for a placement
  const activeAdsForPlacement = useCallback(
    (placement: AdPlacement) => {
      return advertisements
        .filter((a) => a.is_active && a.placement === placement && isScheduledNow(a.start_date, a.end_date))
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    [advertisements]
  );

  // Filter active promotional banners for a placement
  const activeBannersForPlacement = useCallback(
    (placement: BannerPlacement) => {
      return promotionalBanners
        .filter((b) => b.is_active && b.placement === placement && isScheduledNow(b.start_date, b.end_date))
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    [promotionalBanners]
  );

  // Filter active discount campaigns
  const activeDiscounts = discountCampaigns
    .filter((d) => d.is_active && isScheduledNow(d.start_date, d.end_date))
    .sort((a, b) => a.priority - b.priority);

  // Save Advertisement
  const saveAdvertisement: CmsContextType["saveAdvertisement"] = async (adData) => {
    const isNew = !adData.id;
    const adId = adData.id || `ad-${Date.now()}`;
    const payload = {
      ...adData,
      id: adId,
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    setAdvertisements((prev) => {
      const exists = prev.some((a) => a.id === adId);
      const updated = exists ? prev.map((a) => (a.id === adId ? ({ ...a, ...payload } as Advertisement) : a)) : [{ ...payload, created_at: new Date().toISOString() } as Advertisement, ...prev];
      safeWrite(LS_ADS, updated);
      return updated;
    });

    try {
      const { error } = await supabase.from("advertisements").upsert(payload as any);
      if (error) {
        console.warn("Supabase ad upsert error:", error.message);
      }
    } catch {
      // Local fallback succeeded
    }

    return { error: null, id: adId };
  };

  // Delete Advertisement
  const deleteAdvertisement: CmsContextType["deleteAdvertisement"] = async (id) => {
    setAdvertisements((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeWrite(LS_ADS, updated);
      return updated;
    });

    try {
      await supabase.from("advertisements").delete().eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  // Toggle Ad Active
  const toggleAdStatus: CmsContextType["toggleAdStatus"] = async (id, active) => {
    setAdvertisements((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, is_active: active } : a));
      safeWrite(LS_ADS, updated);
      return updated;
    });

    try {
      await supabase.from("advertisements").update({ is_active: active } as any).eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  // Save Promotional Banner
  const savePromotionalBanner: CmsContextType["savePromotionalBanner"] = async (bannerData) => {
    const bId = bannerData.id || `ban-${Date.now()}`;
    const payload = {
      ...bannerData,
      id: bId,
      updated_at: new Date().toISOString(),
    };

    setPromotionalBanners((prev) => {
      const exists = prev.some((b) => b.id === bId);
      const updated = exists ? prev.map((b) => (b.id === bId ? ({ ...b, ...payload } as PromotionalBanner) : b)) : [{ ...payload, created_at: new Date().toISOString() } as PromotionalBanner, ...prev];
      safeWrite(LS_BANNERS, updated);
      return updated;
    });

    try {
      await supabase.from("promotional_banners").upsert(payload as any);
    } catch {
      // Local fallback succeeded
    }

    return { error: null, id: bId };
  };

  // Delete Promotional Banner
  const deletePromotionalBanner: CmsContextType["deletePromotionalBanner"] = async (id) => {
    setPromotionalBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      safeWrite(LS_BANNERS, updated);
      return updated;
    });

    try {
      await supabase.from("promotional_banners").delete().eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  // Toggle Banner Active
  const toggleBannerStatus: CmsContextType["toggleBannerStatus"] = async (id, active) => {
    setPromotionalBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, is_active: active } : b));
      safeWrite(LS_BANNERS, updated);
      return updated;
    });

    try {
      await supabase.from("promotional_banners").update({ is_active: active } as any).eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  // Save Discount Campaign
  const saveDiscountCampaign: CmsContextType["saveDiscountCampaign"] = async (campData) => {
    const dId = campData.id || `disc-${Date.now()}`;
    const payload = {
      ...campData,
      id: dId,
      updated_at: new Date().toISOString(),
    };

    setDiscountCampaigns((prev) => {
      const exists = prev.some((d) => d.id === dId);
      const updated = exists ? prev.map((d) => (d.id === dId ? ({ ...d, ...payload } as DiscountCampaign) : d)) : [{ ...payload, created_at: new Date().toISOString() } as DiscountCampaign, ...prev];
      safeWrite(LS_DISCOUNTS, updated);
      return updated;
    });

    try {
      await supabase.from("discount_campaigns").upsert(payload as any);
    } catch {
      // Local fallback succeeded
    }

    return { error: null, id: dId };
  };

  // Delete Discount Campaign
  const deleteDiscountCampaign: CmsContextType["deleteDiscountCampaign"] = async (id) => {
    setDiscountCampaigns((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      safeWrite(LS_DISCOUNTS, updated);
      return updated;
    });

    try {
      await supabase.from("discount_campaigns").delete().eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  // Toggle Discount Status
  const toggleDiscountStatus: CmsContextType["toggleDiscountStatus"] = async (id, active) => {
    setDiscountCampaigns((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, is_active: active } : d));
      safeWrite(LS_DISCOUNTS, updated);
      return updated;
    });

    try {
      await supabase.from("discount_campaigns").update({ is_active: active } as any).eq("id", id);
    } catch {
      // Local fallback succeeded
    }
    return { error: null };
  };

  // Automatic Product Price Calculation with active campaigns
  const calculateProductPrice: CmsContextType["calculateProductPrice"] = useCallback(
    (product) => {
      const originalPrice = product.mrp && product.mrp > product.price ? product.mrp : product.price;
      let finalPrice = product.price;
      let appliedCampaign: DiscountCampaign | null = null;

      // Find highest priority active campaign matching product
      for (const camp of activeDiscounts) {
        if (camp.offer_type === "coupon_code") continue; // Coupons applied at checkout

        let match = false;
        if (camp.offer_type === "sitewide" || camp.offer_type === "flash_sale") {
          match = true;
        } else if (camp.offer_type === "product_specific" && camp.applicable_products?.includes(product.id)) {
          match = true;
        } else if (camp.offer_type === "category_specific" && camp.applicable_categories?.includes(product.category)) {
          match = true;
        }

        if (match) {
          let calculated = originalPrice;
          if (camp.offer_type === "percentage" || camp.offer_type === "sitewide" || camp.offer_type === "category_specific" || camp.offer_type === "product_specific" || camp.offer_type === "flash_sale") {
            const cut = Math.round((originalPrice * camp.discount_value) / 100);
            calculated = Math.max(1, originalPrice - cut);
          } else if (camp.offer_type === "fixed_amount") {
            calculated = Math.max(1, originalPrice - camp.discount_value);
          }

          if (calculated < finalPrice) {
            finalPrice = calculated;
            appliedCampaign = camp;
          }
        }
      }

      const savings = Math.max(0, originalPrice - finalPrice);
      const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

      return {
        finalPrice,
        originalPrice,
        savings,
        discountPercent,
        appliedCampaign,
      };
    },
    [activeDiscounts]
  );

  // Validate coupon code
  const validateCouponCode: CmsContextType["validateCouponCode"] = useCallback(
    (code, subtotal, items) => {
      const clean = code.trim().toUpperCase();
      const campaign = activeDiscounts.find((d) => d.coupon_code && d.coupon_code.trim().toUpperCase() === clean);

      if (!campaign) {
        return { valid: false, discountAmount: 0, message: "Invalid or expired coupon code", campaign: null };
      }

      if (campaign.min_purchase_amount && subtotal < campaign.min_purchase_amount) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Minimum order value of ₹${campaign.min_purchase_amount} required for this coupon`,
          campaign,
        };
      }

      let discountAmount = 0;
      if (campaign.offer_type === "percentage" || campaign.offer_type === "coupon_code") {
        discountAmount = Math.round((subtotal * campaign.discount_value) / 100);
      } else {
        discountAmount = campaign.discount_value;
      }

      if (campaign.max_discount_amount && discountAmount > campaign.max_discount_amount) {
        discountAmount = campaign.max_discount_amount;
      }

      discountAmount = Math.min(discountAmount, subtotal);

      return {
        valid: true,
        discountAmount,
        message: `${campaign.display_label || `${campaign.discount_value}% OFF`} applied successfully!`,
        campaign,
      };
    },
    [activeDiscounts]
  );

  // Update Homepage Design & Background Settings
  const updateHomepageSettings: CmsContextType["updateHomepageSettings"] = async (patch) => {
    const updated: HomepageSettings = {
      ...homepageSettings,
      ...patch,
      updated_at: new Date().toISOString(),
    };

    setHomepageSettings(updated);
    safeWrite(LS_HOMEPAGE, updated);

    try {
      await supabase.from("homepage_settings").upsert(updated as any);
      // Also sync hero_image_url into store_settings if background image changed
      if (patch.background_image_url !== undefined) {
        await supabase.from("store_settings").update({ hero_image_url: patch.background_image_url } as any).eq("id", true);
      }
    } catch {
      // Local fallback succeeded
    }

    return { error: null };
  };

  // Publish background (from draft or new URL)
  const publishBackground: CmsContextType["publishBackground"] = async (newImageUrl) => {
    const targetUrl = newImageUrl || homepageSettings.draft_background_image_url || homepageSettings.background_image_url;
    return updateHomepageSettings({
      background_image_url: targetUrl,
      draft_background_image_url: null,
      is_background_published: true,
    });
  };

  // Restore Default Background
  const restoreDefaultBackground: CmsContextType["restoreDefaultBackground"] = async () => {
    return updateHomepageSettings({
      background_image_url: heroStreetwearDesktop,
      background_mobile_image_url: heroStreetwearMobile,
      draft_background_image_url: null,
      focal_point: "center 18%",
      overlay_opacity: 0.40,
      background_sizing: "cover",
      is_background_published: true,
    });
  };

  // Media Library Upload
  const uploadMediaAsset: CmsContextType["uploadMediaAsset"] = async (file, category = "other") => {
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    try {
      // Try uploading to Supabase storage bucket
      const { data: uploadData, error } = await supabase.storage.from("product-images").upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

      let publicUrl = "";
      if (!error && uploadData) {
        publicUrl = supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
      } else {
        // Fallback: create object URL or base64 storage if storage bucket not configured yet
        publicUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const asset: MediaAsset = {
        id: `media-${Date.now()}`,
        name: file.name,
        file_url: publicUrl,
        file_type: "image",
        category,
        file_size: file.size,
        created_at: new Date().toISOString(),
      };

      setMediaAssets((prev) => {
        const next = [asset, ...prev];
        safeWrite(LS_MEDIA, next);
        return next;
      });

      try {
        await supabase.from("media_assets").insert(asset as any);
      } catch {
        // Local fallback succeeded
      }

      return { url: publicUrl, asset, error: null };
    } catch (err: any) {
      return { url: null, asset: null, error: err.message || "Upload failed" };
    }
  };

  // Check if media is in use before deleting
  const isMediaInUse: CmsContextType["isMediaInUse"] = (fileUrl) => {
    const usedBy: string[] = [];

    // Check homepage background
    if (homepageSettings.background_image_url === fileUrl || homepageSettings.draft_background_image_url === fileUrl) {
      usedBy.push("Homepage Background");
    }

    // Check Advertisements
    const matchedAds = advertisements.filter((a) => a.image_url === fileUrl || a.desktop_image_url === fileUrl || a.mobile_image_url === fileUrl);
    if (matchedAds.length > 0) {
      usedBy.push(`Advertisements (${matchedAds.map((a) => a.name).join(", ")})`);
    }

    // Check Promotional Banners
    const matchedBanners = promotionalBanners.filter((b) => b.image_url === fileUrl || b.desktop_image_url === fileUrl);
    if (matchedBanners.length > 0) {
      usedBy.push(`Promotional Banners (${matchedBanners.map((b) => b.title).join(", ")})`);
    }

    // Check Discount Banners
    const matchedDiscounts = discountCampaigns.filter((d) => d.banner_image_url === fileUrl);
    if (matchedDiscounts.length > 0) {
      usedBy.push(`Discounts (${matchedDiscounts.map((d) => d.name).join(", ")})`);
    }

    return {
      inUse: usedBy.length > 0,
      usedBy,
    };
  };

  // Delete Media Asset
  const deleteMediaAsset: CmsContextType["deleteMediaAsset"] = async (id, fileUrl) => {
    const check = isMediaInUse(fileUrl);
    if (check.inUse) {
      return {
        error: `Cannot delete image. It is currently in use by: ${check.usedBy.join("; ")}. Please reassign those items first.`,
      };
    }

    setMediaAssets((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      safeWrite(LS_MEDIA, updated);
      return updated;
    });

    try {
      await supabase.from("media_assets").delete().eq("id", id);
    } catch {
      // Local fallback succeeded
    }

    return { error: null };
  };

  return (
    <CmsContext.Provider
      value={{
        advertisements,
        activeAdsForPlacement,
        saveAdvertisement,
        deleteAdvertisement,
        toggleAdStatus,
        promotionalBanners,
        activeBannersForPlacement,
        savePromotionalBanner,
        deletePromotionalBanner,
        toggleBannerStatus,
        discountCampaigns,
        activeDiscounts,
        saveDiscountCampaign,
        deleteDiscountCampaign,
        toggleDiscountStatus,
        calculateProductPrice,
        validateCouponCode,
        homepageSettings,
        updateHomepageSettings,
        publishBackground,
        restoreDefaultBackground,
        mediaAssets,
        uploadMediaAsset,
        deleteMediaAsset,
        isMediaInUse,
        loading,
        refreshCms,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCms must be used within a CmsProvider");
  }
  return context;
};
