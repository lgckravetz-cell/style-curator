import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { ComingSoon } from "./inspo";

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
  component: () => <ComingSoon title="Perfil" icon={<User size={48} strokeWidth={1.25} className="text-muted-foreground/60" />} />,
});
