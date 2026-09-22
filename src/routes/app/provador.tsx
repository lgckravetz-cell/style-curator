import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, History, RotateCcw, User } from "lucide-react";
import { refreshTryOnHistory } from "@/lib/tryon-history";
import { runTryOn } from "@/lib/tryon.functions";

export const Route = createFileRoute("/app/provador")({
  validateSearch: (search: Record<string, unknown>) => ({
    peca: typeof search["peca"] === "string" ? (search["peca"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Provador Virtual — Sartoria" },
      {
        name: "description",
        content: "Veja como as peças do seu guarda-roupa ficam em você.",
      },
      { property: "og:title", content: "Provador Virtual — Sartoria" },
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

const GENERIC_ERROR = "Não conseguimos gerar essa prova agora. Tente novamente.";
const LIMIT_ERROR = "Limite diário de provas atingido";

function TryOnScreen() {
  const navigate = useNavigate();
  const { peca } = Route.useSearch();
  const tryOn = useServerFn(runTryOn);

  const [status, setStatus] = useState<Status>("loading");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR);
  const [attempt, setAttempt] = useState(0);

  const start = useCallback(async () => {
    if (!peca) {
      setErrorMessage(GENERIC_ERROR);
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const result = await tryOn({
        data: { wardrobeItemId: peca, avatarDataUrl: getSelfie() ?? undefined },
      });
      setResultUrl(result.imageUrl);
      setStatus("done");
      refreshTryOnHistory();
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";
      setErrorMessage(raw.includes("RATE_LIMIT") ? LIMIT_ERROR : raw || GENERIC_ERROR);
      setStatus("error");
    }
  }, [peca, tryOn]);

  useEffect(() => {
    void start();
  }, [start, attempt]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/app/guarda-roupa" })}
          aria-label="Voltar"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground active:scale-[0.98] transition-transform duration-150"
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
              <p className="text-base font-medium text-foreground">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground active:scale-[0.98] transition-transform duration-150"
              >
                <RotateCcw size={18} />
                Tentar novamente
              </button>
            </div>
          ) : resultUrl ? (
            <img
              src={resultUrl}
              alt="Resultado da prova"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={120} className="text-muted-foreground/50" strokeWidth={1} />
            </div>
          )}
        </div>
      </div>

      {/* Botões */}
      {status === "done" && (
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <Link
            to="/app/historico"
            className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
          >
            Ver no histórico
          </Link>
          <button
            type="button"
            onClick={() => navigate({ to: "/app/guarda-roupa" })}
            className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-border bg-card text-base font-semibold text-foreground active:scale-[0.98] transition-transform duration-150"
          >
            Provar outra peça
          </button>
        </div>
      )}
    </main>
  );
}
