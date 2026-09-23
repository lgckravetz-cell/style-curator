import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Image, Loader2, Plus, Shirt, X } from "lucide-react";
import { toast } from "sonner";
import {
  addWardrobePiece,
  loadMoreWardrobe,
  useWardrobeHasMore,
  useWardrobePieces,
} from "@/lib/wardrobe";
import { compressImage, IMAGE_READ_ERROR } from "@/lib/image-compress";

export const Route = createFileRoute("/app/guarda-roupa")({
  head: () => ({
    meta: [
      { title: "Guarda-roupa — Cabidy" },
      {
        name: "description",
        content:
          "Organize as fotos das suas roupas e monte looks com o que você já tem.",
      },
      { property: "og:title", content: "Guarda-roupa — Cabidy" },
      {
        property: "og:description",
        content:
          "Organize as fotos das suas roupas e monte looks com o que você já tem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WardrobeScreen,
});

function WardrobeScreen() {
  const pieces = useWardrobePieces();
  const hasMore = useWardrobeHasMore();
  const [showSourceModal, setShowSourceModal] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showSourceModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSourceModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSourceModal]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    let dataUrl: string;
    try {
      dataUrl = await compressImage(file);
    } catch {
      toast.error(IMAGE_READ_ERROR);
      return;
    }
    // A peça aparece imediatamente com spinner enquanto a foto é enviada
    // e a peça é gravada no guarda-roupa.
    const id = await addWardrobePiece(dataUrl);
    if (!id) {
      toast.error("Não foi possível processar essa foto. Tente outra imagem.");
    }
  }

  function simulateError() {
    toast.error("Não foi possível processar essa foto. Tente outra imagem.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
        Guarda-roupa
      </h1>

      {/* Card de destaque: Adicionar peça */}
      <button
        type="button"
        onClick={() => setShowSourceModal(true)}
        className="mt-6 flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left active:scale-[0.98] transition-transform duration-150"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Camera size={22} />
        </span>
        <span>
          <span className="block text-base font-semibold text-foreground">
            Adicionar peça
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            Adicione fotos das suas roupas para começar
          </span>
        </span>
        <Plus size={20} className="ml-auto shrink-0 text-muted-foreground" />
      </button>

      {pieces.length === 0 ? (
        /* Estado vazio */
        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
            <Shirt size={48} className="text-muted-foreground/60" strokeWidth={1.25} />
          </div>
          <p className="mt-5 text-base font-medium text-foreground">
            Seu guarda-roupa está vazio
          </p>
          <button
            type="button"
            onClick={() => setShowSourceModal(true)}
            className="mt-6 flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground active:scale-[0.98] transition-transform duration-150"
          >
            <Plus size={20} />
            Adicionar peça
          </button>
        </div>
      ) : (
        /* Grade de peças */
        <div className="mt-6 grid grid-cols-3 gap-3">
          {pieces.map((piece) => (
            <div key={piece.id} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                <img
                  src={piece.src}
                  alt="Peça do guarda-roupa"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {piece.processing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                    <Loader2 size={28} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              {!piece.processing && (
                <Link
                  to="/app/provador"
                  search={{ peca: piece.id }}
                  className="flex min-h-[36px] items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-foreground"
                >
                  Provar
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => void loadMoreWardrobe()}
          className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full border border-border bg-card text-base font-semibold text-foreground active:scale-[0.98] transition-transform duration-150"
        >
          Carregar mais
        </button>
      )}

      {/* Botão de teste escondido (só para desenvolvimento) */}
      <button
        type="button"
        onClick={simulateError}
        aria-label="Simular erro de upload"
        className="fixed bottom-24 right-3 z-30 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground/50 active:scale-[0.98] transition-transform duration-150"
      >
        Simular erro
      </button>

      {/* Inputs de arquivo escondidos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* Modal: escolher origem da foto */}
      {showSourceModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40"
          onClick={() => setShowSourceModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wardrobe-source-title"
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl bg-background px-6 pb-10 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="wardrobe-source-title" className="sr-only">
              Adicionar foto da peça
            </h2>
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-muted" />
            <button
              type="button"
              onClick={() => setShowSourceModal(false)}
              aria-label="Fechar"
              className="absolute right-5 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-[0.98] transition-transform duration-150"
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
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground active:scale-[0.98] transition-transform duration-150"
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
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-base font-semibold text-foreground active:scale-[0.98] transition-transform duration-150"
              >
                <Image size={20} />
                Fotos
              </button>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="mt-1 text-sm font-medium text-muted-foreground active:scale-[0.98] transition-transform duration-150"
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
