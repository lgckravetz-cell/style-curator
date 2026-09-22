import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { ComingSoon } from "./inspo";

export const Route = createFileRoute("/app/looks")({
  head: () => ({
    meta: [
      { title: "Looks — Cabidy" },
      { name: "description", content: "Looks criados com o seu guarda-roupa." },
      { property: "og:title", content: "Looks — Cabidy" },
      { property: "og:description", content: "Looks criados com o seu guarda-roupa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Looks" icon={<Layers size={48} strokeWidth={1.25} className="text-muted-foreground/60" />} />,
});
