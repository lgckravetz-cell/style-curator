import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veste — Seu guarda-roupa inteligente" },
      {
        name: "description",
        content:
          "Entre na Veste com Apple ou Google e descubra looks, organize seu guarda-roupa e receba conselhos de estilo com IA.",
      },
      { property: "og:title", content: "Veste — Seu guarda-roupa inteligente" },
      {
        property: "og:description",
        content:
          "Entre na Veste com Apple ou Google e descubra looks, organize seu guarda-roupa e receba conselhos de estilo com IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginScreen,
});

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.86 3.24-.77 1.58.13 2.77.75 3.55 1.9-3.27 1.96-2.5 6.27.53 7.47-.57 1.48-1.3 2.94-2.4 3.57ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function LoginScreen() {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);

  async function signIn(provider: "apple" | "google") {
    setLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar. Tente novamente.");
      }
      // result.redirected: o navegador segue para o provedor; nada mais a fazer.
    } catch {
      toast.error("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background px-6 pb-10 pt-24">
      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-display text-6xl font-extrabold tracking-tight text-foreground">
          Veste
        </h1>
        <p className="mt-4 max-w-[260px] text-base leading-relaxed text-muted-foreground">
          Seu guarda-roupa e estilo pessoal, com IA.
        </p>
      </div>

      {/* Ações */}
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => signIn("apple")}
            disabled={loading !== null}
            className="btn-pill bg-foreground text-background"
          >
            <AppleIcon />
            {loading === "apple" ? "Entrando…" : "Entrar com a Apple"}
          </button>

          <button
            type="button"
            onClick={() => signIn("google")}
            disabled={loading !== null}
            className="btn-pill border border-border bg-card text-foreground"
          >
            <GoogleIcon />
            {loading === "google" ? "Entrando…" : "Entrar com o Google"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Ao entrar, você concorda com nossos{" "}
          <a href="/termos" className="underline underline-offset-2">
            Termos
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="underline underline-offset-2">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </main>
  );
}
