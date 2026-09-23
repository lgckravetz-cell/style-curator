import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, History } from "lucide-react";
import {
  loadMoreTryOnHistory,
  useTryOnHistory,
  useTryOnHistoryHasMore,
} from "@/lib/tryon-history";

export const Route = createFileRoute("/app/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de provas — Cabidy" },
      {
        name: "description",
        content: "Todas as provas que você salvou no Provador Virtual.",
      },
      { property: "og:title", content: "Histórico de provas — Cabidy" },
      {
        property: "og:description",
        content: "Todas as provas que você salvou no Provador Virtual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TryOnHistoryScreen,
});

function TryOnHistoryScreen() {
  const navigate = useNavigate();
  const entries = useTryOnHistory();
  const hasMore = useTryOnHistoryHasMore();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/app/guarda-roupa" })}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground active:scale-[0.98] transition-transform duration-150"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Histórico de provas
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
            <History size={48} className="text-muted-foreground/60" strokeWidth={1.25} />
          </div>
          <p className="mt-5 text-base font-medium text-foreground">
            Nenhuma prova ainda
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prove uma peça no Provador Virtual e salve aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
              >
                <img
                  src={entry.pieceSrc}
                  alt="Prova salva"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => void loadMoreTryOnHistory()}
              className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full border border-border bg-card text-base font-semibold text-foreground active:scale-[0.98] transition-transform duration-150"
            >
              Carregar mais
            </button>
          )}
        </>
      )}
    </main>
  );
}
