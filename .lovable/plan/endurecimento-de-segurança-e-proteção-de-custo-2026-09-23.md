# Endurecimento de segurança e proteção de custo

## Implementação
- Criar e aplicar uma migração para `usage_reservations`, com grants apenas ao `service_role`, RLS sem políticas, índices de contagem, `reserve_usage` com trava transacional e os limites atuais, além do backfill dos históricos existentes.
- Trocar as contagens em `tryon.functions.ts` e `stylist.functions.ts` pela reserva atômica via servidor; remover a reserva quando o provedor falhar, preservando as mensagens atuais de limite e erro.
- Validar no Estilista textos de até 1.000 caracteres e somente imagens JPEG, PNG ou WebP até o limite informado.
- Validar a URL, o tipo e o tamanho máximo da imagem retornada pela Fal.ai antes de salvá-la.
- Aplicar os quatro cabeçalhos de segurança em todas as respostas do servidor, sem CSP e sem X-Frame-Options.

## Buckets de imagens
A alteração dos buckets não será executada nesta etapa. Hoje, guarda-roupa, selfie e Estilista usam seletores `image/*`, leem o arquivo sem conversão e preservam seu MIME; portanto, uma imagem HEIC do iPhone pode chegar ao fluxo. Restringir agora os buckets a JPEG/PNG/WebP quebraria esse caminho, e o pedido determina interromper o item 6 nesse caso.

## Validação
- Conferir erros de compilação e tipos após as alterações.
- Exercitar as validações e os cabeçalhos no preview.
- Consultar a migração aplicada e confirmar tabela, privilégios, função e backfill.
- Informar exatamente todos os arquivos e a migração criados ou alterados, deixando explícito que o “antes/depois” dos buckets não foi executado por segurança.

## Detalhes técnicos
- Os códigos lançados pela função serão `PAYWALL_REQUIRED` para o gratuito e `RATE_LIMIT` para os tetos Pro.
- As reservas serão feitas pelo cliente administrativo somente após autenticação do usuário; a exclusão da reserva será limitada ao ID recém-criado.
- O download da Fal.ai aceitará apenas HTTPS em `fal.media`, subdomínios de `fal.media` ou subdomínios de `fal.run`, com limite de 15 MB e extensão definida por mapa fixo de MIME.
