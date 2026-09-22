import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

// Guarda-roupa real: peças gravadas na tabela wardrobe_items e imagens no
// bucket privado "wardrobe" (uma pasta por usuário).

export interface WardrobePiece {
  id: string;
  src: string;
  processing: boolean;
}

const BUCKET = "wardrobe";
const EMPTY: WardrobePiece[] = [];

let pieces: WardrobePiece[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function setPieces(next: WardrobePiece[]) {
  pieces = next;
  notify();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function snapshot(): WardrobePiece[] {
  return pieces;
}

async function signedUrl(path: string): Promise<string> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? "";
}

export async function loadWardrobe(): Promise<void> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) {
    setPieces(EMPTY);
    return;
  }
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("id, image_url")
    .order("created_at", { ascending: true });
  if (error || !data) return;

  const next = await Promise.all(
    data.map(async (row) => ({
      id: row.id,
      src: await signedUrl(row.image_url),
      processing: false,
    })),
  );
  setPieces(next);
}

/** Carrega as peças do banco na primeira montagem e devolve a lista atual. */
export function useWardrobePieces(): WardrobePiece[] {
  const value = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    void loadWardrobe();
  }, []);
  return value;
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(base64 ?? ""), (c) => c.charCodeAt(0));
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return { blob: new Blob([bytes], { type: mime }), ext };
}

/**
 * Envia a foto para o Storage e grava a peça no banco.
 * A peça aparece na hora com spinner (processing) e é confirmada depois.
 */
export async function addWardrobePiece(dataUrl: string): Promise<string | null> {
  const tempId = crypto.randomUUID();
  setPieces([...pieces, { id: tempId, src: dataUrl, processing: true }]);

  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) {
    setPieces(pieces.filter((p) => p.id !== tempId));
    return null;
  }

  try {
    const { blob, ext } = dataUrlToBlob(dataUrl);
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: inserted, error: insertError } = await supabase
      .from("wardrobe_items")
      .insert({ user_id: userId, image_url: path, categoria: "indefinido" })
      .select("id")
      .single();
    if (insertError || !inserted) throw insertError;

    const url = (await signedUrl(path)) || dataUrl;
    setPieces(
      pieces.map((p) =>
        p.id === tempId ? { id: inserted.id, src: url, processing: false } : p,
      ),
    );
    return inserted.id;
  } catch {
    setPieces(pieces.filter((p) => p.id !== tempId));
    return null;
  }
}

export async function removeWardrobePiece(id: string): Promise<void> {
  const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
  if (!error) setPieces(pieces.filter((p) => p.id !== id));
}
