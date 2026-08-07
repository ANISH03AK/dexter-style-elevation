import { supabase, ok, fail, type ServiceResult } from "./base";

export const createOrder = async (payload: Record<string, any>): Promise<ServiceResult<true>> => {
  try {
    const { error } = await supabase.from("orders").insert(payload as any);
    if (error) throw error;
    return ok(true as const);
  } catch (e) {
    return fail(e);
  }
};

export const listMyOrders = async (userId: string): Promise<ServiceResult<any[]>> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data ?? []);
  } catch (e) {
    return fail(e);
  }
};

export const listAllOrders = async (): Promise<ServiceResult<any[]>> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ok(data ?? []);
  } catch (e) {
    return fail(e);
  }
};

export const updateOrderStatus = async (id: string, status: string): Promise<ServiceResult<true>> => {
  try {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    return ok(true as const);
  } catch (e) {
    return fail(e);
  }
};
