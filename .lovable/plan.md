# Correções legais e de conformidade

## Implementação
- Trocar a alegação numérica da tela de revelação pelo texto fornecido e confirmar que não restam estatísticas ou depoimentos no app.
- Tornar o aviso de cobrança do paywall dependente do plano selecionado e adicionar os links internos de Termos e Privacidade ao rodapé.
- Adicionar “Gerenciar assinatura” em Configurações, abrindo a página de assinaturas da Apple em nova aba.
- Paginar a remoção dos arquivos dos dois espaços privados durante a exclusão de conta, em lotes de 100 e preservando os logs atuais.
- Acrescentar integralmente as regras de segurança e bem-estar ao fim das instruções do Estilista.

## Verificação
- Conferir os textos e links renderizados, validar o comportamento da seleção de plano e confirmar que o aplicativo continua compilando sem erros.

## Arquivos previstos
- `src/routes/onboarding.tsx`
- `src/routes/app/configuracoes.tsx`
- `src/lib/account.functions.ts`
- `src/lib/stylist.functions.ts`
- `roadmap.md` (acompanhamento da solicitação)
