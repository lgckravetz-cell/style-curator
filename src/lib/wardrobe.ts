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
const PAGE_SIZE = 60;
const EMPTY: WardrobePiece[] = [];

let pieces: WardrobePiece[] = EMPTY;
let hasMore = false;
let offset = 0;
let loadingMore = false;
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

/** Gera todos os links assinados de uma vez e devolve um mapa path -> url. */
async function signedUrlMap(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) map.set(entry.path, entry.signedUrl);
  }
  return map;
}

async function fetchPage(from: number): Promise<WardrobePiece[] | null> {
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("id, image_url")
    .order("created_at", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (error || !data) return null;
  const urls = await signedUrlMap(data.map((row) => row.image_url));
  return data.map((row) => ({
    id: row.id,
    src: urls.get(row.image_url) ?? "",
    processing: false,
  }));
}

export async function loadWardrobe(): Promise<void> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) {
    hasMore = false;
    offset = 0;
    setPieces(EMPTY);
    return;
  }
  const page = await fetchPage(0);
  if (!page) return;
  offset = page.length;
  hasMore = page.length === PAGE_SIZE;
  setPieces(page);
}

/** Carrega as próximas 60 peças. */
export async function loadMoreWardrobe(): Promise<void> {
  if (!hasMore || loadingMore) return;
  loadingMore = true;
  try {
    const page = await fetchPage(offset);
    if (!page) return;
    offset += page.length;
    hasMore = page.length === PAGE_SIZE;
    const known = new Set(pieces.map((p) => p.id));
    setPieces([...pieces, ...page.filter((p) => !known.has(p.id))]);
  } finally {
    loadingMore = false;
  }
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

/** Indica se ainda há peças para carregar. */
export function useWardrobeHasMore(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasMore,
    () => false,
  );
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [, base64] = dataUrl.split(",");
  const bytes = Uint8Array.from(atob(base64 ?? ""), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/jpeg" });
}

/**
 * Envia a foto (já comprimida em JPEG) para o Storage e grava a peça no banco.
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
    const blob = dataUrlToBlob(dataUrl);
    const path = `${userId}/${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw uploadError;

    const { data: inserted, error: insertError } = await supabase
      .from("wardrobe_items")
      .insert({ user_id: userId, image_url: path, categoria: "indefinido" })
      .select("id")
      .single();
    if (insertError || !inserted) throw insertError;

    offset += 1;
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
  if (!error) {
    offset = Math.max(0, offset - 1);
    setPieces(pieces.filter((p) => p.id !== id));
  }
}
