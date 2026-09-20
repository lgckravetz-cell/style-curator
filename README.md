# Style Curator

Estou construindo um app mobile (iOS) de guarda-roupa e estilo pessoal com IA, para o mercado

brasileiro/europeu. É um app de assinatura, categoria lifestyle/moda.

DESIGN SYSTEM (aplicar em todas as telas do projeto, de forma consistente):

- Cor de fundo base: #F0EAE0 (bege claro, neutro)

- Cor de destaque/CTA primário: #6B5B3E (marrom-oliva escuro)

- Texto principal: #3A3A3A / Texto secundário: #7A7A7A

- Cor de erro: #B84A3E / Cor de sucesso: #4A7A5E

- Tipografia: sans-serif de peso forte para títulos, regular para corpo

- Botões: totalmente arredondados (pill-shaped), altura mínima 52px

- Espaçamento generoso, uma ação principal por tela, evitar excesso de texto

- Navegação inferior (usar a partir da tela principal): 5 itens — Inspo, Looks, Guarda-roupa,

  Estilista, Perfil

Comece pela primeira tela: abertura/login.

Fundo bege claro. Logo centralizado, tipografia forte. Abaixo, dois botões pill-shaped

empilhados: "Entrar com a Apple" (fundo escuro, ícone Apple, texto branco) e "Entrar com o

Google" (fundo claro, ícone Google, texto escuro). Abaixo dos botões, texto pequeno cinza:

"Ao entrar, você concorda com nossos Termos e Política de Privacidade" com os termos como

links. Se o login falhar, mostrar um toast "Não foi possível entrar. Tente novamente." sem

travar a tela.

Configure autenticação via Supabase (Apple + Google) para essa tela.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/beeaf275-191d-421c-8269-dc9a313c6bf8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
