# Brisa e Lamentações — Livro do Jogador

Sistema de RPG híbrido: estrutura de D&D (Atributos, Classes, Raças, Níveis) + motor narrativo do Daggerheart (Duality Dice, Hope/Fear), com recursos próprios (Mana, Prana, Lucidez, Caminhos, Particularidades).

## Como os jogadores acessam

Após o deploy do GitHub Pages, o app fica disponível em:

```
https://ildevdio.github.io/Brisa-Lamentaacoes/
```

## Estrutura

```
├── Livro_do_Jogador/     → o aplicativo web
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── build/data.js         → FONTE das mecânicas (raças, classes, magias...)
├── game-data.json        → MECÂNICAS geradas (o app baixa do servidor)
├── Referências/          → documentos originais do sistema
└── .github/workflows/    → deploy automático p/ GitHub Pages
```

## Como funciona (atualização automática das mecânicas)

- **Mecânicas** (raças, classes, magias, técnicas, itens, particularidades, regras, reações) vêm do **servidor** via `game-data.json`.
- **Personagens** ficam salvos **localmente** no navegador/celular de cada jogador (`localStorage`) — cada jogador tem suas próprias fichas.

Logo, quando você muda as mecânicas e faz push, os jogadores recebem as regras atualizadas ao recarregar a página, sem perder as fichas locais.

## Como atualizar as mecânicas (fluxo do Mestre)

1. Edite `build/data.js` (dados) ou o conteúdo de `MECHANICS`/`REACTIONS`.
2. Regere o JSON:
   ```
   node build/build.js
   ```
3. Suba para o GitHub:
   ```
   git add -A
   git commit -m "atualiza mecânicas"
   git push origin main
   ```
O GitHub Actions publica o novo `game-data.json` e o app automaticamente. Os jogadores recebem no próximo acesso.

## Ativando o GitHub Pages (apenas na primeira vez)

1. No repositório, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Feito uma vez, todo push novo faz o deploy automático.

---

## Sugestões da Comunidade (novas classes, raças, magias, técnicas, ferramentas e particularidades)

Quando um jogador cria um item novo (botões **"+ Nova raça", "+ Nova classe", "+ Nova magia", "+ Nova técnica", "+ Novo item"** e **"+ Nova particularidade"**), ele não é salvo direto no catálogo: vira uma **solicitação** que só aparece depois que o Mestre aprovar. Personagens continuam **100% locais** — cada jogador tem as próprias fichas, sem passar por aprovação.

**Fluxo**
- O jogador clica em **"+ Adicionar..."**, preenche e digita a **senha de contribuidor** (opcional: o próprio nome para o admin saber quem pediu). O item entra como *pendente* numa fila compartilhada (um Gist público).
- Todos veem as pendentes na aba **Sugestões**. O Mestre clica **Aprovar/Rejeitar** (com a **senha de admin**) — ao aprovar, o item é publicado nos catálogos de **todos** os jogadores.
- A aba **Sugestões** também funciona como a "caixa de entrada" das solicitações para o Mestre confirmar.

**Configuração única (dono) — necessária para funcionar:**
1. Crie um **Gist PÚBLICO** com um arquivo chamado `catalog-contrib.json` contendo exatamente:
   ```json
   { "pending": [], "approved": [] }
   ```
2. Copie o **ID do gist** (a parte de `gist.github.com/<seu-usuario>/`) para `COMMUNITY.GIST_ID` em `js/community.js`.
3. **Token via secret do GitHub Actions** (o token NUNCA fica no repositório):
   - Gere no GitHub um **Personal Access Token (classic)** com escopo **apenas `gist`**.
   - Adicione-o como um **secret** do repositório: `Settings → Secrets and variables → Actions → New repository secret`, nome `GIST_TOKEN`, valor = o token.
   - O workflow `.github/workflows/pages.yml` injeta esse secret no lugar de `GIST_TOKEN_PLACEHOLDER` em `js/community.js` **só na hora do deploy**.
4. Ajuste as senhas `PASSWORD_CONTRIB` (jogadores) e `PASSWORD_ADMIN` (você) e o arquivo `FILE_NAME`.

> **Sobre segurança:** com esse esquema o token some do código e do histórico do git — vive apenas como secret. Porém, como o app é um site **estático**, quem abrir a página publicada ainda consegue ver o token injetado (é inevitável sem um servidor). Use um token com escopo **só de gist** e revogue/renove pelo secret se vazar. Para uso público aberto, o correto seria um intermediário de servidor (fora do escopo atual).

> Se o token ainda não estiver configurado, o app funciona normalmente só com as mecânicas oficiais — a aba de sugestões apenas fica vazia/sem escrita em produção até o deploy injetar o secret.