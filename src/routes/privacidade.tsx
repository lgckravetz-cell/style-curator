import { createFileRoute } from "@tanstack/react-router";
import {
  Bullets,
  LegalLayout,
  Muted,
  P,
  Section,
  Table,
} from "@/components/legal-layout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Cabidy" },
      {
        name: "description",
        content:
          "Como o Cabidy coleta, usa e protege seus dados, conforme a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — Cabidy" },
      {
        property: "og:description",
        content:
          "Como o Cabidy coleta, usa e protege seus dados, conforme a LGPD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt="22/09/2026">
      <Section heading="1. Quem trata seus dados">
        <P>
          O Cabidy é operado por Luis Gustavo C. Kravetz, pessoa física, com
          contato para assuntos de privacidade em krrvtz@gmail.com. Para efeitos
          da Lei Geral de Proteção de Dados (LGPD), essa pessoa é a Controladora
          dos dados tratados por este aplicativo.
        </P>
      </Section>

      <Section heading="2. Quais dados coletamos">
        <Table
          headers={["Categoria", "O que inclui", "Quando é coletado"]}
          rows={[
            [
              "Dados de conta",
              "Nome, e-mail, foto de perfil (conforme fornecidos pela Apple ou Google no login)",
              "No cadastro/login",
            ],
            [
              "Preferências de estilo",
              "Respostas do questionário de onboarding (gênero de guarda-roupa, faixa etária, onde costuma comprar, preferências de look)",
              "Durante o onboarding",
            ],
            [
              "Foto/selfie de avatar",
              "Imagem enviada voluntariamente para criação do avatar de prova virtual",
              "Quando o usuário opta por enviar (etapa sempre opcional)",
            ],
            [
              "Fotos de guarda-roupa",
              "Imagens de peças de roupa adicionadas manualmente pelo usuário",
              "Ao usar a função Guarda-roupa",
            ],
            [
              "Conteúdo de conversa com o Estilista",
              "Mensagens de texto e imagens enviadas ao assistente de IA",
              "Ao usar a função Estilista",
            ],
            [
              "Dados de uso e técnicos",
              "Eventos de navegação no app, identificador de sessão pseudonimizado, informações de erro técnico",
              "Automaticamente, durante o uso",
            ],
            [
              "Dados de assinatura",
              "Status do plano (gratuito/pago), histórico de transação (processado pelo provedor de pagamento, não armazenado por nós)",
              "Ao assinar",
            ],
          ]}
        />
        <P>
          <span className="font-semibold">O que nunca coletamos:</span> número
          de cartão de crédito (o pagamento é processado inteiramente pela Apple
          App Store/Google Play), CPF, ou qualquer documento de identificação.
        </P>
      </Section>

      <Section heading="3. Para que usamos seus dados">
        <Bullets
          items={[
            <>
              <span className="font-semibold">Prestar o serviço central:</span>{" "}
              identificar peças de roupa nas fotos enviadas, gerar sugestões de
              look, gerar a prova de roupa virtual, manter seu guarda-roupa
              organizado.
            </>,
            <>
              <span className="font-semibold">Personalização:</span> adaptar
              sugestões ao seu perfil de estilo declarado.
            </>,
            <>
              <span className="font-semibold">
                Processamento por inteligência artificial:
              </span>{" "}
              suas fotos de guarda-roupa e mensagens ao Estilista são enviadas a
              provedores de IA (ver seção 5) exclusivamente para gerar a
              resposta solicitada por você naquele momento.
            </>,
            <>
              <span className="font-semibold">
                Cobrança e gestão de assinatura:
              </span>{" "}
              processada pela Apple/Google e por nosso provedor de gestão de
              assinatura (RevenueCat).
            </>,
            <>
              <span className="font-semibold">
                Segurança e prevenção de abuso:
              </span>{" "}
              aplicamos limites de uso diário nas funções de inteligência
              artificial para proteger o serviço contra uso automatizado
              indevido.
            </>,
            <>
              <span className="font-semibold">Melhoria do produto:</span>{" "}
              métricas de uso agregadas e anônimas (via PostHog, hospedado na
              União Europeia) para entender quais telas funcionam bem.
            </>,
            <>
              <span className="font-semibold">Diagnóstico de erro:</span>{" "}
              registros técnicos de falha (via Sentry, hospedado na União
              Europeia), sem conteúdo de suas fotos ou conversas.
            </>,
          ]}
        />
      </Section>

      <Section heading="4. Base legal (LGPD)">
        <Bullets
          items={[
            <>
              <span className="font-semibold">Execução de contrato:</span> dados
              necessários para o funcionamento das funcionalidades que você
              solicita (guarda-roupa, prova de roupa, Estilista).
            </>,
            <>
              <span className="font-semibold">Consentimento:</span> para o envio
              de selfie/avatar (etapa sempre opcional e revogável) e para
              qualquer processamento de imagem por inteligência artificial.
            </>,
            <>
              <span className="font-semibold">Legítimo interesse:</span> para
              métricas de uso agregadas e prevenção de abuso técnico, sempre de
              forma proporcional e sem impacto individual desproporcional a
              você.
            </>,
          ]}
        />
      </Section>

      <Section heading="5. Com quem compartilhamos dados">
        <P>
          Usamos os seguintes prestadores de serviço (subprocessadores), cada um
          recebendo apenas o dado estritamente necessário à sua função:
        </P>
        <Table
          headers={["Prestador", "Função", "Dado recebido"]}
          rows={[
            [
              "Supabase",
              "Banco de dados e autenticação",
              "Todos os dados de conta e conteúdo do app",
            ],
            [
              "Fal.ai",
              "Geração da prova de roupa virtual",
              "Imagem do avatar e da peça de roupa selecionada",
            ],
            [
              "Anthropic",
              "Processamento das conversas do Estilista",
              "Texto e imagem enviados ao Estilista",
            ],
            [
              "RevenueCat / Apple / Google",
              "Gestão e cobrança de assinatura",
              "Status de assinatura, identificador de compra",
            ],
            [
              "PostHog",
              "Métricas de uso agregadas",
              "Eventos de navegação, sem conteúdo de foto/conversa",
            ],
            [
              "Sentry",
              "Diagnóstico de erro técnico",
              "Identificador de usuário, descrição técnica do erro",
            ],
            ["Resend", "Envio de e-mail transacional", "Endereço de e-mail"],
          ]}
        />
        <P>
          <span className="font-semibold">Transferência internacional:</span>{" "}
          Fal.ai e Anthropic são empresas americanas; o processamento de sua
          imagem e conversa pode ocorrer fora do Brasil, estritamente para gerar
          a resposta solicitada, sem retenção para outras finalidades por parte
          desses provedores além do processamento da sua requisição.
        </P>
        <P>
          Não vendemos seus dados a terceiros, nem compartilhamos com
          anunciantes.
        </P>
      </Section>

      <Section heading="6. Uso de imagens para treinamento de modelo de IA">
        <P>
          Suas fotos de guarda-roupa, selfie/avatar e conversas com o Estilista
          não são usadas para treinar modelos de inteligência artificial, por
          padrão, salvo se uma nova funcionalidade futura solicitar seu
          consentimento explícito e específico para essa finalidade — o que
          seria comunicado antes de qualquer coleta com esse propósito.
        </P>
        <P>
          Não realizamos reconhecimento facial nem criamos ou armazenamos
          identificador biométrico a partir das suas fotos. As imagens enviadas
          são usadas exclusivamente para identificar peças de roupa e gerar a
          prova de roupa virtual.
        </P>
        <P>
          Não usamos decisão automatizada que produza efeito legal ou que afete
          você de forma significativa. As sugestões geradas por inteligência
          artificial têm finalidade exclusivamente informativa e de estilo, sem
          qualquer relação com decisões de crédito, emprego, seguro ou
          similares.
        </P>
        <P>
          Para gerenciar sua assinatura, nosso provedor de pagamento
          (RevenueCat) gera um identificador anônimo para vincular sua compra à
          sua conta, sem conter dado pessoal legível diretamente nesse
          identificador.
        </P>
      </Section>

      <Section heading="7. Por quanto tempo guardamos seus dados">
        <P>
          Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua
          conta (Configurações → Excluir conta), removemos seus dados pessoais,
          fotos e histórico de conversa de nossos sistemas dentro de um prazo
          razoável, exceto quando a retenção for exigida por obrigação legal
          (ex: registro fiscal de transação, quando aplicável).
        </P>
      </Section>

      <Section heading="8. Seus direitos como titular de dados">
        <P>Conforme a LGPD, você pode, a qualquer momento:</P>
        <Bullets
          items={[
            "Confirmar a existência de tratamento e acessar seus dados",
            "Corrigir dados incompletos, inexatos ou desatualizados",
            "Solicitar a exclusão de seus dados (também disponível diretamente em Configurações → Excluir conta)",
            "Solicitar a portabilidade de seus dados a outro fornecedor",
            "Revogar o consentimento dado (por exemplo, removendo sua selfie/avatar a qualquer momento)",
            "Obter informação sobre com quem compartilhamos seus dados",
          ]}
        />
        <P>
          Para exercer qualquer desses direitos, entre em contato pelo canal
          descrito na seção 10.
        </P>
      </Section>

      <Section heading="9. Segurança">
        <P>
          Adotamos medidas técnicas para proteger seus dados: criptografia em
          trânsito (HTTPS/TLS) e em repouso, controle de acesso restrito por
          usuário no banco de dados (Row Level Security), chaves de acesso a
          serviços de terceiros mantidas exclusivamente em ambiente de servidor,
          e limite de uso para prevenir abuso automatizado.
        </P>
      </Section>

      <Section heading="10. Contato">
        <P>
          Para dúvidas, solicitações relacionadas a seus dados, ou exercício de
          qualquer direito previsto na LGPD:
        </P>
        <P>
          <a
            href="mailto:krrvtz@gmail.com"
            className="font-semibold underline underline-offset-2"
          >
            krrvtz@gmail.com
          </a>
        </P>
      </Section>

      <Section heading="11. Menores de idade">
        <P>
          O Cabidy não é direcionado a menores de 18 anos e não coletamos
          intencionalmente dados de crianças ou adolescentes. Se você acredita
          que uma criança nos forneceu dados, entre em contato pelo canal acima
          para que possamos removê-los.
        </P>
      </Section>

      <Section heading="12. Alterações a esta política">
        <P>
          Podemos atualizar esta política periodicamente. Alterações relevantes
          serão comunicadas dentro do aplicativo antes de entrarem em vigor.
        </P>
        <Muted>
          Para consultar os Termos de Uso, acesse a página de Termos no
          aplicativo.
        </Muted>
      </Section>
    </LegalLayout>
  );
}
