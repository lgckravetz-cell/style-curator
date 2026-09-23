// Estado de assinatura — só o servidor lê e grava esta tabela.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PRO_ENTITLEMENT } from "@/lib/plan-limits";

export type SubscriptionStatus = "active" | "expired" | "canceled";

export async function isPro(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("status, expires_at, entitlement")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return false;
  if (data.entitlement && data.entitlement !== PRO_ENTITLEMENT) return false;
  // Ativo só conta como Pro se expires_at for nulo ou estiver no futuro.
  if (data.status === "active") {
    if (!data.expires_at) return true;
    return new Date(data.expires_at).getTime() > Date.now();
  }
  // Cancelado mantém o acesso até a data de expiração.
  if (data.status === "canceled" && data.expires_at) {
    return new Date(data.expires_at).getTime() > Date.now();
  }
  return false;
}

export async function upsertSubscription(input: {
  userId: string;
  status: SubscriptionStatus;
  entitlement: string;
  expiresAt: string | null;
}): Promise<void> {
  // Proteção contra eventos fora de ordem: se já existe um registro com
  // expires_at mais recente que o do evento recebido, não sobrescreve.
  // Eventos sem expires_at seguem gravando normalmente.
  if (input.expiresAt) {
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("expires_at")
      .eq("user_id", input.userId)
      .maybeSingle();
    if (existing?.expires_at) {
      const existingTs = new Date(existing.expires_at).getTime();
      const eventTs = new Date(input.expiresAt).getTime();
      if (existingTs > eventTs) return;
    }
  }
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: input.userId,
      status: input.status,
      entitlement: input.entitlement,
      expires_at: input.expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function userExists(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  return !error && Boolean(data?.user);
}
