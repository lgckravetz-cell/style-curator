import { useSyncExternalStore } from "react";

// Store local do guarda-roupa (simulação, sem backend ainda).
// Compartilhado entre a tela Guarda-roupa e a tela Estilista.

export interface WardrobePiece {
  id: string;
  src: string;
  processing: boolean;
}

const STORAGE_KEY = "veste_wardrobe";
const EMPTY: WardrobePiece[] = [];

let pieces: WardrobePiece[] | null = null;
const listeners = new Set<() => void>();

function load(): WardrobePiece[] {
  if (pieces) return pieces;
  if (typeof window === "undefined") return EMPTY;
  try {
    pieces = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    pieces = [];
  }
  return pieces!;
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pieces ?? []));
  } catch {
    // Fotos grandes podem estourar a quota do sessionStorage — ignora.
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

function snapshot(): WardrobePiece[] {
  return load();
}

export function useWardrobePieces(): WardrobePiece[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function addWardrobePiece(src: string): string {
  const id = crypto.randomUUID();
  pieces = [...load(), { id, src, processing: true }];
  persist();
  notify();
  return id;
}

export function markWardrobeProcessed(id: string) {
  pieces = load().map((p) => (p.id === id ? { ...p, processing: false } : p));
  persist();
  notify();
}
