# Polimento do design system e navegação

## Alterações
- Criar `design.md` na raiz com os tokens semânticos de cor existentes, tipografia, escala de cantos e regras de consistência visual.
- Ajustar os cinco ícones da navegação inferior para traço fino quando inativos e preenchimento na cor de destaque quando ativos.
- Preservar textos, destinos, estados, ações e demais comportamentos atuais.

## Validação
- Conferir a navegação em uma tela principal e garantir que apenas o ícone ativo apareça preenchido.
- Confirmar que o projeto continua compilando sem erros.

## Detalhes técnicos
- O preenchimento ativo usará `currentColor`, herdando o token semântico `primary`; o estado inativo continuará usando `muted-foreground`.
- A documentação refletirá somente os valores já definidos em `src/styles.css`, sem criar ou alterar tokens.
