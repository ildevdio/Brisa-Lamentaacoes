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