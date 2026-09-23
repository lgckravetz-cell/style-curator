// Compressão de fotos no aparelho antes do upload: redimensiona para no máximo
// 1600 px no maior lado e exporta sempre como JPEG (qualidade 0.85).
// Também converte HEIC (iPhone) em JPEG quando o navegador consegue lê-lo.

export const IMAGE_READ_ERROR = "Não conseguimos ler essa foto. Tente outra.";

const MAX_SIDE = 1600;
const QUALITY = 0.85;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

/** Devolve um data URL image/jpeg comprimido. Lança erro se não conseguir ler. */
export async function compressImage(file: File): Promise<string> {
  const img = await loadImage(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) throw new Error("empty image");
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  if (!dataUrl.startsWith("data:image/jpeg")) throw new Error("export failed");
  return dataUrl;
}

/** Verdadeiro quando o sistema pede movimento reduzido. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}
