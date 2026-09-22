import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { newRequestId } from "@/lib/request-id";
import { captureServerError } from "@/lib/sentry.server";

const BUCKETS = ["wardrobe", "tryon"] as const;

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const requestId = newRequestId();
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      // 1) Arquivos do usuário nos buckets privados (pasta = userId)
      for (const bucket of BUCKETS) {
        const { data: files, error: listError } = await supabaseAdmin.storage
          .from(bucket)
          .list(userId, { limit: 1000 });
        if (listError) {
          console.error(`[delete-account] ${requestId} list ${bucket}:`, listError.message);
          continue;
        }
        const paths = (files ?? []).map((f) => `${userId}/${f.name}`);
        if (paths.length > 0) {
          const { error: removeError } = await supabaseAdmin.storage.from(bucket).remove(paths);
          if (removeError) {
            console.error(`[delete-account] ${requestId} remove ${bucket}:`, removeError.message);
          }
        }
      }

      // 2) Dados nas tabelas (explícito, além do cascade)
      for (const table of ["tryon_history", "stylist_messages", "outfits", "wardrobe_items"] as const) {
        const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
        if (error) console.error(`[delete-account] ${requestId} ${table}:`, error.message);
      }
      const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
      if (profileError) {
        console.error(`[delete-account] ${requestId} profiles:`, profileError.message);
      }

      // 3) Conta de autenticação
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) throw new Error(authError.message);

      return { ok: true as const };
    } catch (error) {
      console.error(`[delete-account] ${requestId} falha:`, error);
      captureServerError(error, { requestId, area: "delete-account", userId });
      throw new Error("Não foi possível excluir a conta. Tente novamente.");
    }
  });
