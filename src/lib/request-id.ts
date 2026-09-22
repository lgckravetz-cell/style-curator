// Identificador curto por requisição, usado só para correlacionar logs de erro.
export function newRequestId(): string {
  try {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}
