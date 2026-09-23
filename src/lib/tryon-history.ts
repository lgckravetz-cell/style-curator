import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

// Histórico de provas real: registros da tabela tryon_history do usuário logado,
// com as imagens no bucket privado "tryon".

export interface TryOnEntry {
  id: string;
  pieceSrc: string;
  createdAt: number;
}

const BUCKET = "tryon";
const PAGE_SIZE = 30;
const EMPTY: TryOnEntry[] = [];

let entries: TryOnEntry[] = EMPTY;
let hasMore = false;
let loadingMore = false;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function snapshot(): TryOnEntry[] {
  return entries;
}

async function fetchPage(from: number): Promise<TryOnEntry[] | null> {
  const { data, error } = await supabase
    .from("tryon_history")
    .select("id, result_image_url, created_at, status")
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error || !data) return null;

  const paths = data.map((row) => row.result_image_url);
  const urls = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 3600);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
    }
  }

  return data.map((row) => ({
    id: row.id,
    pieceSrc: urls.get(row.result_image_url) ?? "",
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function loadTryOnHistory(): Promise<void> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) {
    entries = EMPTY;
    hasMore = false;
    notify();
    return;
  }
  const page = await fetchPage(0);
  if (!page) return;
  entries = page;
  hasMore = page.length === PAGE_SIZE;
  notify();
}

/** Carrega as próximas 30 provas. */
export async function loadMoreTryOnHistory(): Promise<void> {
  if (!hasMore || loadingMore) return;
  loadingMore = true;
  try {
    const page = await fetchPage(entries.length);
    if (!page) return;
    const known = new Set(entries.map((e) => e.id));
    entries = [...entries, ...page.filter((e) => !known.has(e.id))];
    hasMore = page.length === PAGE_SIZE;
    notify();
  } finally {
    loadingMore = false;
  }
}

export function useTryOnHistory(): TryOnEntry[] {
  const value = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    void loadTryOnHistory();
  }, []);
  return value;
}

/** Indica se ainda há provas para carregar. */
export function useTryOnHistoryHasMore(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasMore,
    () => false,
  );
}

/** Recarrega o histórico depois de uma prova nova. */
export function refreshTryOnHistory(): void {
  loaded = true;
  void loadTryOnHistory();
}
