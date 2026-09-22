import { createFileRoute } from "@tanstack/react-router";
import { Bullets, LegalLayout, P, Section } from "@/components/legal-layout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Cabidy" },
      {
        name: "description",
        content:
          "Regras de uso do Cabidy: conta, assinatura, conteúdo enviado e limitações do serviço.",
      },
      { property: "og:title", content: "Termos de Uso — Cabidy" },
      {
        property: "og:description",
        content:
          "Regras de uso do Cabidy: conta, assinatura, conteúdo enviado e limitações do serviço.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="22/09/2026">
      <Section heading="1. Aceitação dos termos">
        <P>
          Ao criar uma conta ou usar o Cabidy, você concorda com estes Termos de
          Uso e com a Política de Privacidade.
        </P>
      </Section>

      <Section heading="2. Descrição do serviço">
        <P>
          O Cabidy é um aplicativo de estilo pessoal e organização de
          guarda-roupa com inteligência artificial, oferecendo catalogação de
          peças de roupa, sugestão de combinações, prova de roupa virtual, e um
          assistente conversacional de estilo.
        </P>
      </Section>

      <Section heading="3. Cadastro e conta">
        <P>
          Você deve fornecer informações precisas ao se cadastrar (via Apple ou
          Google) e é responsável por manter a confidencialidade do acesso à sua
          conta.
        </P>
      </Section>

      <Section heading="4. Assinatura e pagamento">
        <P>
          Algumas funcionalidades exigem assinatura paga, processada
          integralmente pela Apple App Store ou Google Play, sujeita aos termos
          dessas plataformas quanto a cobrança, renovação automática e
          cancelamento. Você pode cancelar a qualquer momento através das
          configurações da sua conta Apple ou Google.
        </P>
      </Section>

      <Section heading="5. Uso aceitável">
        <P>Você concorda em não:</P>
        <Bullets
          items={[
            "Enviar conteúdo ilegal, ofensivo ou que viole direitos de terceiros",
            "Tentar contornar os limites de uso das funcionalidades de inteligência artificial",
            "Utilizar o aplicativo para fins diferentes de uso pessoal de organização de guarda-roupa e estilo",
          ]}
        />
      </Section>

      <Section heading="6. Conteúdo enviado por você">
        <P>
          Você mantém a titularidade sobre as fotos e conteúdo que envia. Ao
          enviá-los, você nos concede a licença necessária para processá-los
          exclusivamente com a finalidade de fornecer a funcionalidade
          solicitada (identificação de peça, geração de prova de roupa, resposta
          do Estilista).
        </P>
      </Section>

      <Section heading="7. Limitações do serviço">
        <P>
          As sugestões e identificações geradas por inteligência artificial podem
          conter imprecisões. O Cabidy não garante que as identificações de
          marca, material ou correspondência de produto sejam sempre exatas, e
          informará explicitamente quando não puder determinar uma informação
          com confiança.
        </P>
      </Section>

      <Section heading="8. Propriedade intelectual">
        <P>
          O aplicativo, sua marca, design e código são de propriedade de Luis
          Gustavo C. Kravetz, exceto pelo conteúdo enviado por você.
        </P>
      </Section>

      <Section heading="9. Encerramento de conta">
        <P>
          Você pode encerrar sua conta a qualquer momento pelas Configurações.
          Reservamo-nos o direito de suspender contas que violem estes termos.
        </P>
      </Section>

      <Section heading="10. Alterações aos termos">
        <P>
          Alterações relevantes serão comunicadas dentro do aplicativo antes de
          entrarem em vigor.
        </P>
      </Section>

      <Section heading="11. Contato">
        <P>
          <a
            href="mailto:krrvtz@gmail.com"
            className="font-semibold underline underline-offset-2"
          >
            krrvtz@gmail.com
          </a>
        </P>
      </Section>
    </LegalLayout>
  );
}
