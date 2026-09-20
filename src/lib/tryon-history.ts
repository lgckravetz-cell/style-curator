import { useSyncExternalStore } from "react";

// Histórico de provas do Provador Virtual (simulação local, sem backend ainda).

export interface TryOnEntry {
  id: string;
  pieceSrc: string;
  createdAt: number;
}

const STORAGE_KEY = "veste_tryon_history";
const EMPTY: TryOnEntry[] = [];

let entries: TryOnEntry[] | null = null;
const listeners = new Set<() => void>();

function load(): TryOnEntry[] {
  if (entries) return entries;
  if (typeof window === "undefined") return EMPTY;
  try {
    entries = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    entries = [];
  }
  return entries!;
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries ?? []));
  } catch {
    // Ignora falhas de quota.
  }
}

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
  return load();
}

export function useTryOnHistory(): TryOnEntry[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function addTryOn(pieceSrc: string) {
  entries = [
    { id: crypto.randomUUID(), pieceSrc, createdAt: Date.now() },
    ...load(),
  ];
  persist();
  notify();
}
