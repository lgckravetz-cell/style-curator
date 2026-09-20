import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, History, User } from "lucide-react";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Veste" },
      { name: "description", content: "Sua conta e preferências na Veste." },
      { property: "og:title", content: "Perfil — Veste" },
      { property: "og:description", content: "Sua conta e preferências na Veste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
        Perfil
      </h1>

      {/* Avatar placeholder */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User size={28} className="text-muted-foreground/60" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Sua conta</p>
          <p className="text-sm text-muted-foreground">Em breve mais opções por aqui</p>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-8 flex flex-col gap-3">
        <Link
          to="/app/historico"
          className="flex min-h-[52px] w-full items-center justify-between rounded-full border border-border bg-card px-6 text-base font-medium text-foreground"
        >
          <span className="flex items-center gap-3">
            <History size={18} className="text-muted-foreground" />
            Histórico de provas
          </span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </div>
    </main>
  );
}
