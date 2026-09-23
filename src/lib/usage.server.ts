import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type UsageKind = "tryon" | "stylist";

export async function reserveUsage(
  userId: string,
  kind: UsageKind,
  isPro: boolean,
): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("reserve_usage", {
    p_user_id: userId,
    p_kind: kind,
    p_is_pro: isPro,
  });

  if (error) throw error;
  if (!data) throw new Error("Não foi possível reservar o uso.");
  return data;
}

export async function releaseUsage(reservationId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("usage_reservations")
    .delete()
    .eq("id", reservationId);
  if (error) throw error;
}