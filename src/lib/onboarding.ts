import { supabase } from "@/integrations/supabase/client";

/** Lê no perfil se a pessoa já concluiu o fluxo de onboarding. */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.onboarding_completed);
}

/** Marca no perfil que o fluxo de onboarding foi concluído. */
export async function markOnboardingCompleted(): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;

  await supabase
    .from("profiles")
    .upsert({ id: userId, onboarding_completed: true }, { onConflict: "id" });
}
