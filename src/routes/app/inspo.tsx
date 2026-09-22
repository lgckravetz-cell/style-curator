import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/inspo")({
  head: () => ({
    meta: [
      { title: "Inspo — Sartoria" },
      { name: "description", content: "Inspirações de estilo selecionadas para você." },
      { property: "og:title", content: "Inspo — Sartoria" },
      { property: "og:description", content: "Inspirações de estilo selecionadas para você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Inspo" icon={<Sparkles size={48} strokeWidth={1.25} className="text-muted-foreground/60" />} />,
});

export function ComingSoon({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <p className="mt-5 text-base font-medium text-foreground">Em breve</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Estamos preparando essa área para você.
        </p>
      </div>
    </main>
  );
}
