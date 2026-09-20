import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, History, RotateCcw, User } from "lucide-react";
import { toast } from "sonner";
import { useWardrobePieces } from "@/lib/wardrobe";
import { addTryOn } from "@/lib/tryon-history";

export const Route = createFileRoute("/app/provador")({
  validateSearch: (search: Record<string, unknown>) => ({
    peca: typeof search["peca"] === "string" ? (search["peca"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Provador Virtual — Veste" },
      {
        name: "description",
        content: "Veja como as peças do seu guarda-roupa ficam em você.",
      },
      { property: "og:title", content: "Provador Virtual — Veste" },
      {
        property: "og:description",
        content: "Veja como as peças do seu guarda-roupa ficam em você.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TryOnScreen,
});

function getSelfie(): string | null {
  try {
    const answers = JSON.parse(
      sessionStorage.getItem("veste_onboarding_answers") ?? "{}",
    );
    const selfie = answers["selfie"];
    return typeof selfie === "string" && selfie.startsWith("data:")
      ? selfie
      : null;
  } catch {
    return null;
  }
}

type Status = "loading" | "done" | "error";

function TryOnScreen() {
  const navigate = useNavigate();
  const { peca } = Route.useSearch();
  const pieces = useWardrobePieces();
  const piece = pieces.find((p) => p.id === peca) ?? null;
  const selfie = getSelfie();

  const [status, setStatus] = useState<Status>("loading");
  const [saved, setSaved] = useState(false);

  // Simula o processamento da IA (2-3s) antes de revelar o resultado.
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => setStatus("done"), 2500);
    return () => clearTimeout(t);
  }, [status]);

  function retry() {
    setStatus("loading");
  }

  function saveToHistory() {
    if (!piece) return;
    addTryOn(piece.src);
    setSaved(true);
    toast.success("Prova salva no histórico");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/app/guarda-roupa" })}
          aria-label="Voltar"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Provador Virtual
        </h1>
        <Link
          to="/app/historico"
          aria-label="Histórico de provas"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
        >
          <History size={20} />
        </Link>
      </div>

      {/* Área do avatar */}
      <div className="mt-6 flex justify-center">
        <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-3xl bg-muted">
          {status === "loading" ? (
            <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-3">
              <User size={72} className="text-muted-foreground/40" strokeWidth={1.25} />
              <p className="text-sm font-medium text-muted-foreground">
                Provando...
              </p>
            </div>
          ) : status === "error" ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
              <p className="text-base font-medium text-foreground">
                Não conseguimos gerar essa prova agora. Tente novamente.
              </p>
              <button
                type="button"
                onClick={retry}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground"
              >
                <RotateCcw size={18} />
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {/* Avatar (selfie do onboarding ou silhueta placeholder) */}
              {selfie ? (
                <img
                  src={selfie}
                  alt="Seu avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User size={120} className="text-muted-foreground/50" strokeWidth={1} />
                </div>
              )}
              {/* Peça sobreposta (composição placeholder) */}
              {piece && (
                <img
                  src={piece.src}
                  alt="Peça sendo provada"
                  className="absolute inset-x-8 bottom-6 top-1/3 m-auto rounded-2xl object-cover opacity-95 shadow-xl"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Botões */}
      {status === "done" && (
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <button
            type="button"
            onClick={saveToHistory}
            disabled={saved}
            className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saved ? "Salvo no histórico" : "Salvar no histórico"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/app/guarda-roupa" })}
            className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-border bg-card text-base font-semibold text-foreground"
          >
            Provar outra peça
          </button>
        </div>
      )}

      {/* Botão de teste escondido (só para desenvolvimento) */}
      <button
        type="button"
        onClick={() => setStatus("error")}
        aria-label="Simular erro de prova"
        className="fixed bottom-24 right-3 z-30 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground/50"
      >
        Simular erro
      </button>
    </main>
  );
}
