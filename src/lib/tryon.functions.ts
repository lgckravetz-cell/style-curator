import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { newRequestId } from "@/lib/request-id";
import { captureServerError } from "@/lib/sentry.server";
import {
  PAYWALL_REQUIRED_CODE,
} from "@/lib/plan-limits";

// Provador Virtual real: chama o Fal.ai (Kling Kolors v1.5), guarda o resultado
// no bucket privado "tryon" e registra a prova em tryon_history.

const WARDROBE_BUCKET = "wardrobe";
const TRYON_BUCKET = "tryon";
export const RATE_LIMIT_CODE = "RATE_LIMIT";
const FAL_MODEL = "fal-ai/kling/v1-5/kolors-virtual-try-on";
const MAX_RESULT_BYTES = 15 * 1024 * 1024;
const RESULT_MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

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

function validateFalResultUrl(value: string): URL {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  const allowedHost =
    hostname === "fal.media" ||
    hostname.endsWith(".fal.media") ||
    hostname.endsWith(".fal.run");
  if (url.protocol !== "https:" || !allowedHost) {
    throw new Error("Fal.ai devolveu uma URL de imagem inválida");
  }
  return url;
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
      captureServerError(new Error("Configuração FAL ausente"), {
        requestId,
        area: "try-on",
        userId,
        operation: "configuration",
      });
      throw new Error("O provador virtual não está configurado.");
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

    const { isPro } = await import("@/lib/subscription.server");
    const { releaseUsage, reserveUsage } = await import("@/lib/usage.server");
    let reservationId: string;
    try {
      reservationId = await reserveUsage(userId, "tryon", await isPro(userId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes(PAYWALL_REQUIRED_CODE)) {
        throw new Error(`${PAYWALL_REQUIRED_CODE}: Assine o Pro para continuar provando`);
      }
      if (message.includes(RATE_LIMIT_CODE)) {
        throw new Error(`${RATE_LIMIT_CODE}: Limite diário de provas atingido`);
      }
      throw error;
    }

    let releaseReservationOnFailure = true;
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

      const validatedResultUrl = validateFalResultUrl(resultUrl);
      const imageResponse = await fetch(validatedResultUrl);
      if (!imageResponse.ok) throw new Error("Não conseguimos baixar o resultado");
      const contentType = ((imageResponse.headers.get("content-type") ?? "")
        .split(";", 1)[0] ?? "")
        .trim()
        .toLowerCase();
      const ext = RESULT_MIME_EXTENSIONS[contentType as keyof typeof RESULT_MIME_EXTENSIONS];
      if (!ext) throw new Error("Fal.ai devolveu um tipo de imagem inválido");
      const declaredSize = Number(imageResponse.headers.get("content-length"));
      if (Number.isFinite(declaredSize) && declaredSize > MAX_RESULT_BYTES) {
        throw new Error("Fal.ai devolveu uma imagem acima de 15 MB");
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      if (imageBuffer.byteLength > MAX_RESULT_BYTES) {
        throw new Error("Fal.ai devolveu uma imagem acima de 15 MB");
      }
      const imageBytes = new Uint8Array(imageBuffer);
      releaseReservationOnFailure = false;
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
      if (releaseReservationOnFailure) {
        try {
          await releaseUsage(reservationId);
        } catch (releaseError) {
          console.error(`[try-on][${requestId}] falha ao liberar reserva`, releaseError);
        }
      }
      console.error(`[try-on][${requestId}] falha`, error);
      captureServerError(error, {
        requestId,
        area: "try-on",
        userId,
        operation: "generate",
      });
      await supabase.from("tryon_history").insert({
        user_id: userId,
        wardrobe_item_id: item.id,
        result_image_url: "",
        status: "failed",
      });
      throw new Error("Não conseguimos gerar essa prova agora. Tente novamente.");
    }
  });
