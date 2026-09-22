import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
import { askStylist } from "@/lib/stylist.functions";

export const Route = createFileRoute("/app/estilista")({
  head: () => ({
    meta: [
      { title: "Estilista — Sartoria" },
      { name: "description", content: "Seu estilista pessoal com IA." },
      { property: "og:title", content: "Estilista — Sartoria" },
      { property: "og:description", content: "Seu estilista pessoal com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StylistScreen,
});

const WELCOME =
  "Boas-vindas! Envie a foto de um look e eu descrevo as peças que consigo identificar. Também posso montar combinações com as peças do seu guarda-roupa.";

const GENERIC_ERROR =
  "Não conseguimos falar com o estilista agora. Tente novamente.";
const LIMIT_ERROR =
  "Você atingiu o limite de 30 mensagens nas últimas 24 horas. Tente novamente amanhã.";

type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "user"; kind: "photo"; src: string }
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "empty-wardrobe" };

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "welcome", role: "assistant", kind: "text", text: WELCOME },
];

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

function StylistScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const stylist = useServerFn(askStylist);

  function push(msg: DistributiveOmit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() } as ChatMessage]);
  }

  async function ask(input: {
    text?: string;
    imageDataUrl?: string;
    createLook?: boolean;
  }) {
    setTyping(true);
    try {
      const result = await stylist({ data: input });
      push({ role: "assistant", kind: "text", text: result.reply });
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";
      if (raw.includes("EMPTY_WARDROBE")) {
        push({ role: "assistant", kind: "empty-wardrobe" });
      } else if (raw.includes("RATE_LIMIT")) {
        push({ role: "assistant", kind: "text", text: LIMIT_ERROR });
      } else {
        push({ role: "assistant", kind: "text", text: raw || GENERIC_ERROR });
      }
    } finally {
      setTyping(false);
    }
  }

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim();
    if (!text) return;
    push({ role: "user", kind: "text", text });
    void ask({ text });
  }

  function handleScanFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      push({ role: "user", kind: "photo", src });
      void ask({ imageDataUrl: src });
    };
    reader.readAsDataURL(file);
  }

  function handleCreateLook() {
    push({ role: "user", kind: "text", text: "Criar look com meu guarda-roupa" });
    void ask({ createLook: true });
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
            {...(typing ? { status: "submitted" as const } : {})}
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
