# Design system — Cabidy

Este documento registra o sistema visual atualmente definido em `src/styles.css`. Os nomes abaixo são semânticos: telas e componentes devem usar o papel visual do token, não seu valor de cor diretamente.

## Cores

### Base e conteúdo

| Token semântico | Papel |
| --- | --- |
| `background` | Fundo bege-claro principal do aplicativo (`#F0EAE0`). |
| `foreground` | Texto principal e ícones de alto contraste (`#3A3A3A`). |
| `card` | Superfície levemente elevada para cards. |
| `card-foreground` | Texto e ícones sobre cards. |
| `popover` | Superfície de menus, painéis e conteúdos flutuantes. |
| `popover-foreground` | Texto e ícones sobre conteúdos flutuantes. |

### Ações e hierarquia

| Token semântico | Papel |
| --- | --- |
| `primary` | Destaque marrom-oliva, CTA principal e estado ativo (`#6B5B3E`). |
| `primary-foreground` | Texto e ícones sobre o destaque principal. |
| `secondary` | Fundo de ações secundárias e superfícies discretas. |
| `secondary-foreground` | Conteúdo de ações secundárias. |
| `muted` | Fundo de elementos neutros, desabilitados ou de baixa ênfase. |
| `muted-foreground` | Texto e ícones secundários (`#7A7A7A`). |
| `accent` | Realce sutil em interações e seleções secundárias. |
| `accent-foreground` | Conteúdo sobre o realce sutil. |
| `ring` | Contorno de foco, usando a cor principal. |
| `ring-offset-background` | Cor de separação entre o foco e o fundo. |

### Estados e estrutura

| Token semântico | Papel |
| --- | --- |
| `destructive` | Erros e ações destrutivas (`#B84A3E`). |
| `destructive-foreground` | Conteúdo sobre o estado destrutivo. |
| `success` | Confirmações e estados concluídos (`#4A7A5E`). |
| `success-foreground` | Conteúdo sobre o estado de sucesso. |
| `border` | Divisórias e contornos neutros. |
| `input` | Contorno de campos e controles de entrada. |

### Gráficos

| Token semântico | Papel |
| --- | --- |
| `chart-1` | Série principal, marrom-oliva. |
| `chart-2` | Série de sucesso, verde. |
| `chart-3` | Série de alerta ou erro, vermelho. |
| `chart-4` | Série auxiliar quente. |
| `chart-5` | Série auxiliar terrosa. |

### Navegação lateral

Os tokens `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border` e `sidebar-ring` repetem os papéis de fundo, conteúdo, seleção, realce, borda e foco para uma eventual navegação lateral. A navegação inferior atual usa os tokens gerais `background`, `border`, `primary` e `muted-foreground`.

## Tipografia

- **Família:** Archivo, com fallback para `system-ui` e `sans-serif`, tanto em títulos quanto no corpo.
- **Títulos (`h1`–`h4`):** peso 800, com hierarquia forte e compacta.
- **Corpo:** peso regular por padrão; peso 600 para ações e botões.
- **Botões principais:** tamanho base de `1rem`, peso 600.

## Escala de border-radius

O raio-base é `1rem` (16px).

| Token | Valor |
| --- | --- |
| `radius-sm` | 12px |
| `radius-md` | 14px |
| `radius-lg` | 16px |
| `radius-xl` | 20px |
| `radius-2xl` | 24px |
| `radius-3xl` | 28px |
| `radius-4xl` | 32px |
| Botão pill | Raio máximo (`9999px`) e altura mínima de 52px |

## Regras de consistência

1. **Sempre** usar tokens semânticos; **nunca** hardcodear cores fora de `src/styles.css`.
2. **Sempre** usar ícones de traço único da `lucide-react`; **nunca** substituir controles ou navegação por emoji.
3. **Sempre** manter uma ação principal clara por tela, com botão pill de no mínimo 52px; **nunca** competir com várias ações de igual destaque.
4. **Sempre** preservar espaçamento generoso e hierarquia curta; **nunca** concentrar texto ou encaixar cards dentro de outros cards.
5. **Sempre** usar `primary` para seleção e CTA, `destructive` para erro e `success` para conclusão; **nunca** trocar esses significados entre telas.