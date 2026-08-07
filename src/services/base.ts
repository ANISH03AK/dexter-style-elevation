import { supabase } from "@/lib/supabase";

export type ServiceResult<T> = { data: T | null; error: string | null };

export const ok = <T,>(data: T): ServiceResult<T> => ({ data, error: null });
export const fail = <T,>(error: unknown): ServiceResult<T> => ({
  data: null,
  error: error instanceof Error ? error.message : String(error ?? "Unexpected error"),
});

export { supabase };
