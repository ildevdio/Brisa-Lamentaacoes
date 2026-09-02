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

## Sugestões da Comunidade (magias/técnicas/ferramentas)

Além das mecânicas oficiais, o app permite que **jogadores proponham** novas magias, técnicas e ferramentas e que o Mestre **aprove/rejeite** — tudo definido em `Livro_do_Jogador/js/community.js`.

**Fluxo**
- O jogador clica em **"+ Adicionar magia/técnica/ferramenta"**, preenche e digita a **senha de contribuidor**. O item entra como *pendente* numa fila compartilhada (um Gist público).
- Todos veem as *pendentes* na aba **Sugestões**. O Mestre clica **Aprovar/Rejeitar** (com a **senha de admin**).
- Itens **aprovados** somem das pendências e passam a aparecer nos catálogos de **todos** os jogadores (marcados como da comunidade). Personagens continuam 100% locais.

**Configuração única (dono) — necessária para funcionar:**
1. Crie um **Gist PÚBLICO** com um arquivo chamado `catalog-contrib.json` contendo exatamente:
   ```json
   { "pending": [], "approved": [] }
   ```
2. Copie o **ID do gist** (a parte de `gist.github.com/<seu-usuario>/`) para `COMMUNITY.GIST_ID` em `js/community.js`.
3. Gere no GitHub um **Personal Access Token (classic)** com escopo **apenas `gist`** e cole em `COMMUNITY.GIST_TOKEN`.
4. Ajuste as senhas `PASSWORD_CONTRIB` (jogadores) e `PASSWORD_ADMIN` (você) e o arquivo `FILE_NAME`.

> **Atenção à segurança:** o token fica **visível no código do app** (é o custo de permitir escrita direta no Gist). Use um token com escopo **só de gist**, nunca um token de repositório. Isso é aceitável para um grupo pequeno e de confiança; não é seguro para uso público aberto.

> Se o Gist ainda não estiver configurado (IDs ainda com `COLE_...`), o app funciona normalmente só com as mecânicas oficiais — a aba de sugestões apenas fica vazia/sem escrita.