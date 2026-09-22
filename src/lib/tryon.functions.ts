import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { newRequestId } from "@/lib/request-id";

// Provador Virtual real: chama o Fal.ai (Kling Kolors v1.5), guarda o resultado
// no bucket privado "tryon" e registra a prova em tryon_history.

const WARDROBE_BUCKET = "wardrobe";
const TRYON_BUCKET = "tryon";
const DAILY_LIMIT = 5;
export const RATE_LIMIT_CODE = "RATE_LIMIT";
const FAL_MODEL = "fal-ai/kling/v1-5/kolors-virtual-try-on";

type TryOnInput = {
  wardrobeItemId: string;
  avatarDataUrl?: string | undefined;
};

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string; ext: string } {
  const [header, base64] = dataUrl.split(",");
  const contentType = (header ?? "").match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return { bytes, contentType, ext };
}

export const runTryOn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: TryOnInput) => {
    if (!input || typeof input.wardrobeItemId !== "string" || !input.wardrobeItemId) {
      throw new Error("Peça inválida");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const requestId = newRequestId();
    const { supabase, userId } = context;
    const falKey = process.env["FAL_API_KEY"] ?? process.env["APIFALAI"];
    if (!falKey) {
      console.error(`[try-on][${requestId}] FAL_API_KEY/APIFALAI ausente no ambiente do servidor`);
      throw new Error("O provador virtual não está configurado.");
    }

    // Rate limiting: só provas concluídas com sucesso contam para a cota.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("tryon_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "success")
      .gte("created_at", since);

    if ((count ?? 0) >= DAILY_LIMIT) {
      throw new Error(`${RATE_LIMIT_CODE}: Limite diário de provas atingido`);
    }

    // Peça a provar (RLS garante que é do próprio usuário).
    const { data: item, error: itemError } = await supabase
      .from("wardrobe_items")
      .select("id, image_url")
      .eq("id", data.wardrobeItemId)
      .single();
    if (itemError || !item) throw new Error("Peça não encontrada no seu guarda-roupa.");

    const { data: garmentSigned } = await supabase.storage
      .from(WARDROBE_BUCKET)
      .createSignedUrl(item.image_url, 600);
    const garmentUrl = garmentSigned?.signedUrl;
    if (!garmentUrl) throw new Error("Não conseguimos ler a foto dessa peça.");

    // Avatar: usa a selfie enviada agora (e salva no perfil) ou a já salva.
    let avatarPath: string | null = null;
    if (data.avatarDataUrl?.startsWith("data:")) {
      const { bytes, contentType, ext } = decodeDataUrl(data.avatarDataUrl);
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(TRYON_BUCKET)
        .upload(path, bytes, { contentType, upsert: true });
      if (!upErr) {
        avatarPath = path;
        await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
      }
    }
    if (!avatarPath) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();
      avatarPath = profile?.avatar_url ?? null;
    }
    if (!avatarPath) {
      throw new Error("Adicione uma selfie ao seu perfil para provar peças.");
    }

    const { data: avatarSigned } = await supabase.storage
      .from(TRYON_BUCKET)
      .createSignedUrl(avatarPath, 600);
    const avatarUrl = avatarSigned?.signedUrl;
    if (!avatarUrl) throw new Error("Não conseguimos ler a sua selfie.");

    try {
      const response = await fetch(`https://fal.run/${FAL_MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ human_image_url: avatarUrl, garment_image_url: garmentUrl }),
      });

      if (!response.ok) {
        throw new Error(`Fal.ai respondeu ${response.status}: ${await response.text()}`);
      }

      const payload = (await response.json()) as { image?: { url?: string } };
      const resultUrl = payload.image?.url;
      if (!resultUrl) throw new Error("Fal.ai não devolveu imagem");

      const imageResponse = await fetch(resultUrl);
      if (!imageResponse.ok) throw new Error("Não conseguimos baixar o resultado");
      const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
      const contentType = imageResponse.headers.get("content-type") ?? "image/png";
      const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
      const resultPath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(TRYON_BUCKET)
        .upload(resultPath, imageBytes, { contentType, upsert: false });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("tryon_history").insert({
        user_id: userId,
        wardrobe_item_id: item.id,
        result_image_url: resultPath,
        status: "success",
      });
      if (insertError) throw insertError;

      const { data: signed } = await supabase.storage
        .from(TRYON_BUCKET)
        .createSignedUrl(resultPath, 3600);

      return { imageUrl: signed?.signedUrl ?? "", path: resultPath };
    } catch (error) {
      console.error(`[try-on][${requestId}] falha`, error);
      await supabase.from("tryon_history").insert({
        user_id: userId,
        wardrobe_item_id: item.id,
        result_image_url: "",
        status: "failed",
      });
      throw new Error("Não conseguimos gerar essa prova agora. Tente novamente.");
    }
  });
