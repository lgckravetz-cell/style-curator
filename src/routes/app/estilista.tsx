import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Paperclip, Send, Shirt, X } from "lucide-react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useWardrobePieces } from "@/lib/wardrobe";

export const Route = createFileRoute("/app/estilista")({
  head: () => ({
    meta: [
      { title: "Estilista — Veste" },
      { name: "description", content: "Seu estilista pessoal com IA." },
      { property: "og:title", content: "Estilista — Veste" },
      { property: "og:description", content: "Seu estilista pessoal com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StylistScreen,
});

// ---- Dados de exemplo (serão substituídos pela IA real na fase de integração) ----

const WELCOME =
  "👋 Boas-vindas! Envie a foto de um look e eu encontro as peças com imagens e links de compra.";

const SAMPLE_PRODUCTS = [
  { store: "Zara", name: "Blazer de linho", price: "R$ 299,90", emoji: "🧥" },
  { store: "Bershka", name: "Calça wide leg", price: "R$ 179,90", emoji: "👖" },
  { store: "Renner", name: "Camiseta básica", price: "R$ 49,90", emoji: "👕" },
];

type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "user"; kind: "photo"; src: string }
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "products" }
  | { id: string; role: "assistant"; kind: "empty-wardrobe" };

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "welcome", role: "assistant", kind: "text", text: WELCOME },
];

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

function StylistScreen() {
  const wardrobe = useWardrobePieces();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(msg: DistributiveOmit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() } as ChatMessage]);
  }

  function simulateProductsReply() {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      push({ role: "assistant", kind: "products" });
    }, 1500);
  }

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim();
    if (!text) return;
    push({ role: "user", kind: "text", text });
    simulateProductsReply();
  }

  function handleScanFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      push({ role: "user", kind: "photo", src: reader.result as string });
      simulateProductsReply();
    };
    reader.readAsDataURL(file);
  }

  function handleCreateLook() {
    if (wardrobe.length === 0) {
      push({ role: "assistant", kind: "empty-wardrobe" });
      return;
    }
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      push({
        role: "assistant",
        kind: "text",
        text: "Ainda estou aprendendo a montar looks com suas peças — em breve te mostro combinações por aqui! ✨",
      });
    }, 1500);
  }

  return (
    <main
      className="mx-auto flex w-full max-w-md flex-col px-6 pt-8"
      style={{ height: "calc(100dvh - 92px)" }}
    >
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
        Estilista
      </h1>

      {/* Conversa */}
      <Conversation className="mt-2">
        <ConversationContent className="gap-4 px-0 py-4">
          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent className="group-[.is-user]:rounded-3xl group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                {msg.kind === "text" && msg.role === "assistant" ? (
                  <MessageResponse>{msg.text}</MessageResponse>
                ) : msg.kind === "text" ? (
                  <p>{msg.text}</p>
                ) : msg.kind === "photo" ? (
                  <img
                    src={msg.src}
                    alt="Look enviado"
                    className="max-h-56 w-auto rounded-2xl object-cover"
                  />
                ) : msg.kind === "products" ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-foreground">
                      Encontrei estas peças parecidas:
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {SAMPLE_PRODUCTS.map((p) => (
                        <div
                          key={p.name}
                          className="w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
                        >
                          <div className="flex h-24 items-center justify-center bg-muted text-4xl">
                            {p.emoji}
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-foreground">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.store}</p>
                            <p className="mt-1 text-xs font-bold text-foreground">
                              {p.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-foreground">
                      Você ainda não tem peças no guarda-roupa — adicione algumas
                      primeiro.
                    </p>
                    <Link
                      to="/app/guarda-roupa"
                      className="flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
                    >
                      Ir para o Guarda-roupa
                    </Link>
                  </div>
                )}
              </MessageContent>
            </Message>
          ))}
          {typing && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer className="text-sm">Digitando...</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
      </Conversation>

      {/* Ações rápidas */}
      <div className="flex gap-2 pb-2">
        <button
          type="button"
          onClick={() => setShowSourceModal(true)}
          className="flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-medium text-foreground"
        >
          <Camera size={16} />
          Escanear look
        </button>
        <button
          type="button"
          onClick={handleCreateLook}
          className="flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-medium text-foreground"
        >
          <Shirt size={16} />
          Criar look
        </button>
      </div>

      {/* Campo de texto */}
      <PromptInput
        onSubmit={handleSubmit}
        className="mb-3 rounded-3xl border-border bg-card"
      >
        <PromptInputTextarea
          placeholder="Escreva para o estilista"
          className="min-h-[48px] text-sm"
        />
        <PromptInputFooter className="items-center justify-between">
          <button
            type="button"
            aria-label="Anexar imagem"
            onClick={() => setShowSourceModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <Paperclip size={18} />
          </button>
          <PromptInputSubmit
            aria-label="Enviar mensagem"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send size={16} />
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>

      {/* Inputs de arquivo escondidos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleScanFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleScanFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* Modal: escolher origem da foto (mesmo do Guarda-roupa) */}
      {showSourceModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40"
          onClick={() => setShowSourceModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl bg-background px-6 pb-10 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-muted" />
            <button
              type="button"
              onClick={() => setShowSourceModal(false)}
              aria-label="Fechar"
              className="absolute right-5 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSourceModal(false);
                  cameraInputRef.current?.click();
                }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground"
              >
                <Camera size={20} />
                Câmera
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSourceModal(false);
                  galleryInputRef.current?.click();
                }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-base font-semibold text-foreground"
              >
                <ImageIcon size={20} />
                Fotos
              </button>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="mt-1 text-sm font-medium text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
