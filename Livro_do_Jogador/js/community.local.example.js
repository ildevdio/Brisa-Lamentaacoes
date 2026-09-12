/* =====================================================================
   TOKEN LOCAL DE DESENVOLVIMENTO (opcional)

   Para testar a escrita no Gist LOCALMENTE (fora do deploy), copie este
   arquivo para "community.local.js" na mesma pasta e cole seu token:

     cp community.local.example.js community.local.js

   - community.local.js está no .gitignore e NUNCA será versionado/deployado.
   - Em produção o token é injetado pelo GitHub Actions (secret GIST_TOKEN)
     no lugar de GIST_TOKEN_PLACEHOLDER dentro de js/community.js.
   - Se você não criar community.local.js, o app funciona normalmente;
     a aba Sugestões apenas fica sem escrita local (deploy injeta o token).
   ===================================================================== */

if (typeof COMMUNITY !== "undefined") {
  COMMUNITY.GIST_TOKEN = "";
}