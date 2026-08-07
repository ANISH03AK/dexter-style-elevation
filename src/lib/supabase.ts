/**
 * Reusable Supabase client.
 *
 * The underlying client is generated at `src/integrations/supabase/client.ts`
 * (do not edit that file). This module re-exports it so app code can use a
 * single, stable import path:
 *
 *   import { supabase } from "@/lib/supabase";
 *
 * Credentials come from environment variables only — nothing is hardcoded:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY   (alias: VITE_SUPABASE_PUBLISHABLE_KEY)
 */
import { supabase } from "@/integrations/supabase/client";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export { supabase };
export default supabase;
