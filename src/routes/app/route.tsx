import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Layers, Shirt, Sparkles, User, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

const NAV_ITEMS = [
  { to: "/app/inspo", label: "Inspo", icon: Sparkles },
  { to: "/app/looks", label: "Looks", icon: Layers },
  { to: "/app/guarda-roupa", label: "Guarda-roupa", icon: Shirt },
  { to: "/app/estilista", label: "Estilista", icon: Wand2 },
  { to: "/app/perfil", label: "Perfil", icon: User },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/", replace: true });
        return;
      }
      setChecking(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: "/", replace: true });
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </div>

      {/* Navegação inferior fixa */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 [&[aria-current=page]_svg]:fill-current [&[aria-current=page]_svg]:stroke-2"
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              activeOptions={{ exact: true }}
            >
              <Icon
                size={22}
                strokeWidth={1.5}
                className="fill-transparent transition-[fill,stroke] duration-150"
              />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
