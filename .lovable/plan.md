# Plano — Sentry em produção

## Objetivo
Configurar captura de erros e logs estruturados no cliente e no servidor, com correlação por Request ID e identificação segura do usuário autenticado.

## Implementação
- Inicializar `@sentry/react` no app, com captura de erros React, erros globais e rejeições não tratadas.
- Inicializar `@sentry/cloudflare` no servidor com `SENTRY_DSN`, Logs habilitados e filtros para remover dados sensíveis.
- Criar utilitários separados para cliente e servidor que:
  - incluam `request_id` em tags e atributos estruturados;
  - associem somente o ID do usuário autenticado;
  - nunca enviem imagens, mensagens do Estilista, tokens, cabeçalhos ou corpos de requisição.
- Envolver `try-on` e `stylist-chat` para capturar falhas com mensagens sanitizadas, área da função, Request ID e ID do usuário.
- Associar e remover o usuário do contexto do Sentry conforme a sessão de login mudar.
- Adicionar em Configurações um botão “Testar Sentry”, renderizado apenas em desenvolvimento, que gera um erro proposital capturável.
- Registrar `SENTRY_DSN` na verificação automática de variáveis obrigatórias.

## Validação
- Conferir o build automático e os tipos.
- Testar no preview que o botão aparece em desenvolvimento e dispara a captura sem expor conteúdo sensível.
- Verificar que a interface e os fluxos existentes permanecem inalterados.
