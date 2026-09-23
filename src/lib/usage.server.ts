import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  FREE_STYLIST_TOTAL,
  FREE_TRYON_TOTAL,
  PRO_STYLIST_DAILY,
  PRO_STYLIST_MONTHLY,
  PRO_TRYON_DAILY,
  PRO_TRYON_MONTHLY,
} from "@/lib/plan-limits";

export type UsageKind = "tryon" | "stylist";

// Limites vêm de src/lib/plan-limits.ts — fonte única. O SQL não contém números.
function limitsFor(kind: UsageKind, isPro: boolean): {
  total: number | null;
  daily: number | null;
  monthly: number | null;
} {
  if (!isPro) {
    return {
      total: kind === "tryon" ? FREE_TRYON_TOTAL : FREE_STYLIST_TOTAL,
      daily: null,
      monthly: null,
    };
  }
  return {
    total: null,
    daily: kind === "tryon" ? PRO_TRYON_DAILY : PRO_STYLIST_DAILY,
    monthly: kind === "tryon" ? PRO_TRYON_MONTHLY : PRO_STYLIST_MONTHLY,
  };
}

export async function reserveUsage(
  userId: string,
  kind: UsageKind,
  isPro: boolean,
): Promise<string> {
  const limits = limitsFor(kind, isPro);
  const { data, error } = await supabaseAdmin.rpc("reserve_usage", {
    p_user_id: userId,
    p_kind: kind,
    p_total_limit: limits.total,
    p_daily_limit: limits.daily,
    p_monthly_limit: limits.monthly,
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
