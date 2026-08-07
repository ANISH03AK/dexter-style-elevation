import { supabase, ok, fail, type ServiceResult } from "./base";

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { full_name: fullName ?? "" },
    },
  });
  return { error: error?.message ?? null };
};

/** Google login — enable the Google provider in the backend auth settings first. */
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/` },
  });
  return { error: error?.message ?? null };
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message ?? null };
};

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getProfile = async (userId: string): Promise<ServiceResult<any>> => {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return ok(data);
  } catch (e) {
    return fail(e);
  }
};

export const updateProfile = async (userId: string, patch: Record<string, any>) => {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  return { error: error?.message ?? null };
};
