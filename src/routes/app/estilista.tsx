import { createFileRoute } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { ComingSoon } from "./inspo";

export const Route = createFileRoute("/app/estilista")({
  head: () => ({
    meta: [
      { title: "Estilista — Veste" },
      { name: "description", content: "Seu estilista pessoal com IA." },
      { property: "og:title", content: "Estilista — Veste" },
      { property: "og:description", content: "Seu estilista pessoal com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Estilista" icon={<Wand2 size={48} strokeWidth={1.25} className="text-muted-foreground/60" />} />,
});
