import { supabase, ok, fail, type ServiceResult } from "./base";

export const listProducts = async (): Promise<ServiceResult<any[]>> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data ?? []);
  } catch (e) {
    return fail(e);
  }
};

export const getProduct = async (id: string): Promise<ServiceResult<any>> => {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return fail(e);
  }
};

export const listCategories = async (): Promise<ServiceResult<string[]>> => {
  try {
    const { data, error } = await supabase.from("products").select("category");
    if (error) throw error;
    return ok(Array.from(new Set((data ?? []).map((r: any) => r.category).filter(Boolean))));
  } catch (e) {
    return fail(e);
  }
};

/** Uploads a product image to the `product-images` storage bucket. */
export const uploadProductImage = async (file: File): Promise<ServiceResult<string>> => {
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return ok(data.publicUrl);
  } catch (e) {
    return fail(e);
  }
};
