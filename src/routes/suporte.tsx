import { createFileRoute } from "@tanstack/react-router";
import { Bullets, LegalLayout, P, Section } from "@/components/legal-layout";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte — Cabidy" },
      {
        name: "description",
        content:
          "Precisa de ajuda? Fale com a gente. Respondemos pessoalmente.",
      },
      { property: "og:title", content: "Suporte — Cabidy" },
      {
        property: "og:description",
        content:
          "Precisa de ajuda? Fale com a gente. Respondemos pessoalmente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <LegalLayout title="Suporte Cabidy" updatedAt="22/09/2026">
      <Section heading="Fale com a gente">
        <P>Precisa de ajuda? Fale com a gente. Respondemos pessoalmente.</P>
        <P>
          <a
            href="mailto:krrvtz@gmail.com"
            className="font-semibold text-primary underline underline-offset-4 active:scale-[0.98] transition-transform duration-150"
          >
            krrvtz@gmail.com
          </a>
        </P>
      </Section>

      <Section heading="Perguntas frequentes">
        <Bullets
          items={[
            <>
              <strong className="font-display">Como cancelo minha assinatura?</strong>{" "}
              Pelos Ajustes do iPhone, em Assinaturas, ou pela App Store.
            </>,
            <>
              <strong className="font-display">Como restauro uma compra?</strong>{" "}
              Em Configurações {">"} Restaurar compras, dentro do app.
            </>,
            <>
              <strong className="font-display">
                Como excluo minha conta e meus dados?
              </strong>{" "}
              Em Configurações {">"} Excluir conta. A exclusão é definitiva.
            </>,
            <>
              <strong className="font-display">
                Minhas fotos são usadas para treinar inteligência artificial?
              </strong>{" "}
              Não.
            </>,
          ]}
        />
      </Section>

      <Section heading="Documentos">
        <P>
          Consulte também a{" "}
          <a
            href="/privacidade"
            className="font-semibold text-primary underline underline-offset-4 active:scale-[0.98] transition-transform duration-150"
          >
            Política de Privacidade
          </a>{" "}
          e os{" "}
          <a
            href="/termos"
            className="font-semibold text-primary underline underline-offset-4 active:scale-[0.98] transition-transform duration-150"
          >
            Termos de Uso
          </a>
          .
        </P>
      </Section>
    </LegalLayout>
  );
}
