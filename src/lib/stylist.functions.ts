import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { newRequestId } from "@/lib/request-id";

// Estilista real: conversa com a Anthropic (Claude), com limite de 30 mensagens
// por usuário a cada 24h e acesso às peças reais do guarda-roupa.

const DAILY_LIMIT = 30;
export const RATE_LIMIT_CODE = "RATE_LIMIT";
export const EMPTY_WARDROBE_CODE = "EMPTY_WARDROBE";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `Você é o Estilista da Veste, um consultor de moda pessoal brasileiro.
Fale em português do Brasil, em tom acolhedor, direto e prático.

Regras obrigatórias:
- Descreva apenas o que é visualmente observável na imagem: categoria da peça, cor, material aparente, padrão/estampa e silhueta.
- NUNCA invente marca, tecido, preço, nome de loja ou link de compra. O app ainda não tem catálogo de lojas conectado.
- Se uma informação não puder ser inferida com confiança (por exemplo o tecido exato), diga isso explicitamente em vez de adivinhar.
- Ao montar looks, use exclusivamente as peças do guarda-roupa listadas na mensagem; nunca acrescente peças que a pessoa não tem.
- Respostas curtas e organizadas, em texto simples com listas quando ajudar.`;

type StylistInput = {
  text?: string | undefined;
  imageDataUrl?: string | undefined;
  createLook?: boolean | undefined;
};

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

function splitDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const [header, base64] = dataUrl.split(",");
  if (!base64) return null;
  const mediaType = (header ?? "").match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  return { mediaType, base64 };
}

export const askStylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: StylistInput) => {
    const text = typeof input?.text === "string" ? input.text.trim() : "";
    const hasImage = typeof input?.imageDataUrl === "string" && input.imageDataUrl.startsWith("data:");
    if (!text && !hasImage && !input?.createLook) throw new Error("Escreva uma mensagem.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const requestId = newRequestId();
    const { supabase, userId } = context;
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      console.error(`[stylist-chat][${requestId}] ANTHROPIC_API_KEY ausente no ambiente do servidor`);
      throw new Error("O estilista ainda não está configurado. Salve a chave da Anthropic para ativá-lo.");
    }

    // Rate limiting: 30 mensagens do usuário por 24 horas.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("stylist_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "user")
      .gte("created_at", since);

    if ((count ?? 0) >= DAILY_LIMIT) {
      throw new Error(`${RATE_LIMIT_CODE}: Limite diário de mensagens atingido`);
    }

    const userText = (data.text ?? "").trim();
    const blocks: ContentBlock[] = [];

    // Pedido de "criar look": usa as peças reais do guarda-roupa.
    if (data.createLook) {
      const { data: items } = await supabase
        .from("wardrobe_items")
        .select("id, categoria, subcategoria, cor, material, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!items || items.length === 0) {
        throw new Error(`${EMPTY_WARDROBE_CODE}: Guarda-roupa vazio`);
      }

      const list = items
        .map((item, index) => {
          const parts = [
            item.categoria,
            item.subcategoria,
            item.cor ? `cor ${item.cor}` : null,
            item.material ? `material ${item.material}` : null,
          ].filter(Boolean);
          return `${index + 1}. ${parts.join(", ") || "peça sem detalhes registrados"}`;
        })
        .join("\n");

      blocks.push({
        type: "text",
        text: `Peças reais do meu guarda-roupa:\n${list}\n\n${
          userText || "Monte de 1 a 3 combinações usando apenas essas peças e explique a escolha de cada uma."
        }\nSe alguma peça tiver poucos detalhes registrados, diga isso em vez de supor.`,
      });
    }

    if (data.imageDataUrl?.startsWith("data:")) {
      const parsed = splitDataUrl(data.imageDataUrl);
      if (parsed) {
        blocks.push({
          type: "image",
          source: { type: "base64", media_type: parsed.mediaType, data: parsed.base64 },
        });
        blocks.push({
          type: "text",
          text:
            userText ||
            "Analise este look e identifique as peças visíveis (categoria, cor, material aparente, padrão e silhueta). Não invente marca, tecido não visível, loja ou link.",
        });
      }
    }

    if (blocks.length === 0 && userText) {
      blocks.push({ type: "text", text: userText });
    }

    // Histórico recente para dar contexto ao modelo.
    const { data: history } = await supabase
      .from("stylist_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const priorMessages = (history ?? [])
      .slice()
      .reverse()
      .map((row) => ({
        role: row.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: [{ type: "text" as const, text: row.content }],
      }))
      .filter((m) => m.content[0]!.text.length > 0);

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env["ANTHROPIC_MODEL"] ?? DEFAULT_MODEL,
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: [...priorMessages, { role: "user", content: blocks }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[stylist-chat] Anthropic falhou", response.status, detail);
      throw new Error("Não conseguimos falar com o estilista agora. Tente novamente.");
    }

    const payload = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const reply = (payload.content ?? [])
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text!)
      .join("\n")
      .trim();

    if (!reply) throw new Error("Não conseguimos falar com o estilista agora. Tente novamente.");

    await supabase.from("stylist_messages").insert([
      {
        user_id: userId,
        role: "user",
        content: userText || (data.createLook ? "Criar look com meu guarda-roupa" : "Foto de look"),
        has_image: Boolean(data.imageDataUrl),
      },
      { user_id: userId, role: "assistant", content: reply, has_image: false },
    ]);

    return { reply };
  });
