import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  ChevronRight,
  History,
  Lock,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
const PAYWALL_STEP = 7;

export const Route = createFileRoute("/app/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Sartoria" },
      { name: "description", content: "Sua conta e preferências na Sartoria." },
      { property: "og:title", content: "Perfil — Sartoria" },
      { property: "og:description", content: "Sua conta e preferências na Sartoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileScreen,
});

const BRANDS = ["Zara", "Renner", "C&A", "Farm", "Le Lis"];

function ProfileScreen() {
  async function shareInvite() {
    const url = `${window.location.origin}`;
    const text = "Baixe a Sartoria e monte looks com o que você já tem!";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sartoria", text, url });
      } catch {
        // usuário cancelou o compartilhamento
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copiado para compartilhar");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-8">
      {/* Header com engrenagem */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Perfil
        </h1>
        <Link
          to="/app/configuracoes"
          aria-label="Configurações"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
        >
          <Settings size={20} />
        </Link>
      </div>

      {/* Nome de usuário */}
      <button
        type="button"
        onClick={() => toast("Em breve você poderá escolher seu nome de usuário")}
        className="mt-6 flex min-h-[52px] w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left active:scale-[0.98] transition-transform duration-150"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Camera size={22} className="text-muted-foreground" />
        </span>
        <span>
          <span className="block text-base font-semibold text-foreground">
            Escolher nome de usuário
          </span>
          <span className="block text-sm text-muted-foreground">
            Toque para adicionar foto e nome
          </span>
        </span>
      </button>

      {/* Informações */}
      <div className="mt-4 rounded-3xl border border-border bg-card px-5">
        <div className="flex min-h-[52px] items-center justify-between border-b border-border">
          <span className="text-base text-foreground">Coloração pessoal</span>
          <button
            type="button"
            onClick={() => toast("Em breve: análise de coloração pessoal")}
            className="text-sm font-semibold text-primary active:scale-[0.98] transition-transform duration-150"
          >
            Descobrir coloração pessoal
          </button>
        </div>
        <div className="flex min-h-[52px] items-center justify-between">
          <span className="text-base text-foreground">Estilo</span>
          <span className="text-sm font-medium text-muted-foreground">Boho</span>
        </div>
      </div>

      {/* Assinar o Pro */}
      <Link
        to="/onboarding"
        search={{ step: PAYWALL_STEP }}
        className="mt-4 flex items-center justify-between rounded-3xl bg-primary p-5 text-primary-foreground"
      >
        <span className="flex items-center gap-3">
          <Sparkles size={22} />
          <span>
            <span className="block text-base font-bold">Assinar o Pro</span>
            <span className="block text-sm opacity-80">
              Looks ilimitados no seu avatar
            </span>
          </span>
        </span>
        <span className="rounded-full bg-primary-foreground px-3 py-1 text-xs font-extrabold tracking-wide text-primary">
          PRO
        </span>
      </Link>

      {/* Marcas */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">
          Marcas que mais combinam
        </h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {BRANDS.map((brand) => (
            <div
              key={brand}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-card"
            >
              <span className="text-xs font-bold text-muted-foreground">{brand}</span>
            </div>
          ))}
          <Link
            to="/onboarding"
            search={{ step: PAYWALL_STEP }}
            aria-label="Desbloquear mais marcas"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-muted"
          >
            <Lock size={18} className="text-muted-foreground" />
          </Link>
        </div>
      </section>

      {/* Convidar um amigo */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-5">
        <p className="text-base font-semibold text-foreground">Convidar um amigo</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Compartilhe seu link — vocês dois ganham créditos bônus
        </p>
        <button
          type="button"
          onClick={shareInvite}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground active:scale-[0.98] transition-transform duration-150"
        >
          <Share2 size={18} />
          Compartilhar
        </button>
      </div>

      {/* Histórico */}
      <Link
        to="/app/historico"
        className="mt-4 flex min-h-[52px] w-full items-center justify-between rounded-full border border-border bg-card px-6 text-base font-medium text-foreground"
      >
        <span className="flex items-center gap-3">
          <History size={18} className="text-muted-foreground" />
          Histórico de provas
        </span>
        <ChevronRight size={18} className="text-muted-foreground" />
      </Link>
    </main>
  );
}
