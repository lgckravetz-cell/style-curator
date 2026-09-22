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
const EMPTY: TryOnEntry[] = [];

let entries: TryOnEntry[] = EMPTY;
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

export async function loadTryOnHistory(): Promise<void> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) {
    entries = EMPTY;
    notify();
    return;
  }

  const { data, error } = await supabase
    .from("tryon_history")
    .select("id, result_image_url, created_at, status")
    .eq("status", "success")
    .order("created_at", { ascending: false });
  if (error || !data) return;

  entries = await Promise.all(
    data.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.result_image_url, 3600);
      return {
        id: row.id,
        pieceSrc: signed?.signedUrl ?? "",
        createdAt: new Date(row.created_at).getTime(),
      };
    }),
  );
  notify();
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

/** Recarrega o histórico depois de uma prova nova. */
export function refreshTryOnHistory(): void {
  loaded = true;
  void loadTryOnHistory();
}
