import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Coins,
  Lock,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
const PAYWALL_STEP = 7;

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Veste" },
      { name: "description", content: "Ajustes da sua conta na Veste." },
      { property: "og:title", content: "Configurações — Veste" },
      { property: "og:description", content: "Ajustes da sua conta na Veste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsScreen,
});

function Row({
  icon,
  label,
  trailing,
  onClick,
  danger,
}: {
  icon?: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-between border-b border-border px-1 last:border-b-0"
    >
      <span
        className={`flex items-center gap-3 text-base font-medium ${
          danger ? "text-destructive" : "text-foreground"
        }`}
      >
        {icon}
        {label}
      </span>
      {trailing ?? (
        <ChevronRight size={18} className="text-muted-foreground" />
      )}
    </button>
  );
}

function SettingsScreen() {
  const navigate = useNavigate();
  const soon = () => toast("Em breve por aqui");

  async function signOut() {
    try {
      await lovable.auth.signOut();
      navigate({ to: "/" });
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Voltar"
          onClick={() => navigate({ to: "/app/perfil" })}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Configurações
        </h1>
      </div>

      {/* Conta e créditos */}
      <div className="mt-6 rounded-3xl border border-border bg-card px-5">
        <Row
          icon={<Coins size={18} className="text-muted-foreground" />}
          label="Créditos"
          trailing={
            <span className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">120</span>
              <Link
                to="/onboarding"
                search={{ step: PAYWALL_STEP }}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Fazer upgrade
              </Link>
            </span>
          }
        />
        <Row
          icon={<Share2 size={18} className="text-muted-foreground" />}
          label="Convidar um amigo"
          onClick={soon}
        />
        <Row
          icon={<Calendar size={18} className="text-muted-foreground" />}
          label="Calendário"
          trailing={
            <button
              type="button"
              onClick={soon}
              className="text-sm font-semibold text-primary"
            >
              Conectar
            </button>
          }
        />
        <Row
          icon={<Lock size={18} className="text-muted-foreground" />}
          label="Itens bloqueados"
          onClick={() => navigate({ to: "/onboarding", search: { step: PAYWALL_STEP } })}
        />
      </div>

      {/* Suporte */}
      <div className="mt-4 rounded-3xl border border-border bg-card px-5">
        <Row
          icon={<MessageCircle size={18} className="text-muted-foreground" />}
          label="Enviar feedback"
          onClick={soon}
        />
        <Row
          icon={<Mail size={18} className="text-muted-foreground" />}
          label="Fale com a gente"
          onClick={soon}
        />
      </div>

      {/* Redes sociais */}
      <div className="mt-4 flex items-center justify-center gap-3">
        {["Instagram", "TikTok", "Discord"].map((network) => (
          <button
            key={network}
            type="button"
            onClick={soon}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
          >
            {network}
          </button>
        ))}
      </div>

      {/* Contas vinculadas */}
      <div className="mt-4 rounded-3xl border border-border bg-card px-5">
        <Row label="Vincular com a Apple" onClick={soon} />
        <Row
          label="Conta Google conectada"
          trailing={
            <span className="text-sm text-muted-foreground">voce@gmail.com</span>
          }
        />
      </div>

      {/* Zona de perigo */}
      <div className="mt-4 rounded-3xl border border-border bg-card px-5">
        <Row label="Sair" danger onClick={signOut} trailing={<span />} />
        <Row
          label="Excluir conta"
          danger
          onClick={soon}
          trailing={<span />}
        />
      </div>
    </main>
  );
}
