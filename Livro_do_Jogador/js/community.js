/* =====================================================================
   Brisa e Lamentações - Catálogo compartilhado (Comunidade)

   Permite que qualquer jogador (com a senha de contribuidor) ADICIONE
   novas magias, técnicas e ferramentas, e que o admin (senha de admin)
   aprove/rejeite. Tudo fica num GIST PÚBLICO do GitHub.

   IMPORTANTE: este arquivo contém o TOKEN de gist e as SENHAS em código.
   O token tem escopo APENAS de gist e fica visível na página — aceito
   para um grupo pequeno (conforme decisão). Não use um token de repo.

   Como funciona:
   - O app baixa o Gist (raw, sem autenticação) junto com game-data.json.
   - "approved": itens são MESCLADOS nos catálogos de magias/técnicas/
     ferramentas (todos veem). "pending": aparece na aba Sugestões.
   - Contribuidor envia para "pending" (requer senha de contribuidor).
   - Admin muda "pending" -> "approved" ou remove (requer senha de admin).
   - Personagens continuam 100% locais.

   CONFIGURAÇÃO NECESSÁRIA (você/dono):
     1) Crie um GIST PÚBLICO com um arquivo chamado "catalog-contrib.json"
        contendo:  { "pending": [], "approved": [] }
        Copie o ID do gist (a parte após gist.github.com/<user>/ ) para GIST_ID.
     2) Gere no GitHub um Personal Access Token (classic) com escopo gist
        apenas, e cole em GIST_TOKEN.
   ===================================================================== */

const COMMUNITY = {
  GIST_ID         : "97517951a2eadc824fe54fc81868acd8",
  GIST_TOKEN      : "GIST_TOKEN_PLACEHOLDER", // trocado pelo GitHub Actions (secret GIST_TOKEN)
  FILE_NAME       : "catalog-contrib.json",
  PASSWORD_CONTRIB: "solicitar",       // senha que o jogador usa para sugerir
  PASSWORD_ADMIN  : "aprovado",     // senha para aprovar/rejeitar
  CACHE_KEY       : "bel_comunidade_cache_v1"
};

// Estado da fila compartilhada em memória.
let COMM = { pending:[], approved:[] };

function commPending(){ return COMM.pending||[]; }
function commApproved(){ return COMM.approved||[]; }

/* =====================================================================
   LEITURA: baixa a fila do Gist (raw público).
   ===================================================================== */
async function loadCommunity(){
  try{
    const id = COMMUNITY.GIST_ID;
    if(!id || id.startsWith("COLE")) return false;
    const url = "https://gist.githubusercontent.com/raw/" + encodeURIComponent(id) + "/" + encodeURIComponent(COMMUNITY.FILE_NAME);
    const res = await fetch(url, { cache:"no-store" });
    if(!res.ok) throw new Error("HTTP "+res.status);
    const data = await res.json();
    if(data && Array.isArray(data.pending)) COMM = {
      pending: data.pending||[], approved: data.approved||[]
    };
    persistCommunity(COMM);
    return true;
  }catch(e){
    const c = communityCache();
    if(c){ COMM = c; }
    return false;
  }
}
function communityCache(){
  try{
    const raw = localStorage.getItem(COMMUNITY.CACHE_KEY);
    if(raw){ const o=JSON.parse(raw); if(o&&Array.isArray(o.pending)) return o; }
  }catch(e){}
  return null;
}
function persistCommunity(c){ try{ localStorage.setItem(COMMUNITY.CACHE_KEY, JSON.stringify(c)); }catch(e){} }

/* =====================================================================
   MESCLA itens aprovados nos catálogos (só adiciona; base vem fresca a cada boot)
   ===================================================================== */
function commApply(){
  const data = MECH && MECH.data;
  if(!data) return;
  const target = {
    magia:(it)=>{ if(!data.spells) data.spells=[]; it.forEach(x=>{ if(!data.spells.some(s=>s.id===x.id)) data.spells.push(x); }); },
    tecnica:(it)=>{ if(!data.techniques) data.techniques=[]; it.forEach(x=>{ if(!data.techniques.some(s=>s.id===x.id)) data.techniques.push(x); }); },
    ferramenta:(it)=>{ if(!data.items) data.items=[]; it.forEach(x=>{ if(!data.items.some(s=>s.id===x.id)) data.items.push(x); }); },
    raca:(it)=>{ if(!data.races) data.races=[]; it.forEach(x=>{ if(!data.races.some(s=>s.id===x.id)) data.races.push(x); }); },
    classe:(it)=>{ if(!data.classes) data.classes=[]; it.forEach(x=>{ if(!data.classes.some(s=>s.id===x.id)) data.classes.push(x); }); },
    particularidade:(it)=>{ if(!data.particularidades) data.particularidades=[]; it.forEach(x=>{ if(!data.particularidades.some(s=>s.id===x.id)) data.particularidades.push(x); }); }
  };
  for(const a of commApproved()){
    if(target[a.type]) target[a.type]([a.data]);
  }
}

/* =====================================================================
   ESCRITA: PATCH no Gist para adicionar/mover/remover itens.
   Requer token. Devolve true/false.
   ===================================================================== */
async function commWrite(newComm){
  const id=COMMUNITY.GIST_ID, tok=COMMUNITY.GIST_TOKEN;
  if(!id||!tok||id.startsWith("COLE")||tok.startsWith("COLE")||tok==="GIST_TOKEN_PLACEHOLDER") throw new Error("Gist não configurado.");
  const payload = {
    description: "Brisa e Lamentações - catálogo compartilhado",
    files: { [COMMUNITY.FILE_NAME]: { content: JSON.stringify(newComm, null, 2) } }
  };
  const res = await fetch("https://api.github.com/gists/"+encodeURIComponent(id), {
    method:"PATCH",
    headers:{ "Accept":"application/vnd.github+json","Authorization":"Bearer "+tok,"Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  if(!res.ok){ const e=await res.text().catch(()=>""); throw new Error("Falha ao salvar (HTTP "+res.status+") "+e); }
  COMM = newComm;
  persistCommunity(COMM);
  return true;
}

/* =====================================================================
   AÇÕES
   ===================================================================== */
function commNewId(type){ return "comm_"+type+"_"+Math.random().toString(36).slice(2,9); }

async function communityAdd(type, data, password){
  if(password!==COMMUNITY.PASSWORD_CONTRIB) throw new Error("Senha de contribuidor incorreta.");
  const item = { id: commNewId(type), type:type, data:data,
    submittedBy:"", submittedAt:new Date().toISOString(), status:"pending" };
  const next = { pending: commPending().concat([item]), approved: commApproved() };
  await commWrite(next);
  return item;
}
async function communityApprove(id, password){
  if(password!==COMMUNITY.PASSWORD_ADMIN) throw new Error("Senha de admin incorreta.");
  const p=commPending(), it=p.find(x=>x.id===id); if(!it) throw new Error("Item não encontrado.");
  it.status="approved"; it.approvedAt=new Date().toISOString(); it.approvedBy="";
  await commWrite({ pending: p.filter(x=>x.id!==id), approved: commApproved().concat([it]) });
}
async function communityReject(id, password){
  if(password!==COMMUNITY.PASSWORD_ADMIN) throw new Error("Senha de admin incorreta.");
  await commWrite({ pending: commPending().filter(x=>x.id!==id), approved: commApproved() });
}

/* =====================================================================
   ABAS: adicionar (contribuidor) e Sugestões (admin)
   ===================================================================== */
function commAddForm(type){
  // Campos comuns: Nome + Senha de contribuidor.
  const common = `
    ${field("Nome","name","",{full:true,required:true})}
    <div class="field full"><label>Senha de contribuidor</label><input class="input" type="password" name="password" placeholder="Digite a senha (solicitar)" required></div>
    <div class="hint full" style="grid-column:1/-1;">O item entra como <b>pendente</b>. O admin aprovará para todos verem.</div>`;

  const parts = {
    magia:()=>[`Nova Magia`,
      `${field("Classe","class","",{required:true})}
       ${field("Círculo","circle","1",{number:true})}
       ${field("Custo (Mana)","mana","10",{number:true})}
       ${field("Atributo","attr","",{required:true})}
       ${field("Alcance","range","")}]
       ${field("Dano (ex: d6 MAG)","damage","")}
       ${field("Efeito / Descrição","effect","",{textarea:true,required:true})}`,common],
    tecnica:()=>[`Nova Técnica`,
      `${field("Classe","class","",{required:true})}
       ${field("Grau","grade","1",{number:true})}
       ${field("Custo (Prana)","prana","5",{number:true})}
       ${field("Atributo","attr","",{required:true})}
       ${field("Tipo (Impacto/Defesa/Sequência...)","type","Impacto")}
       ${field("Alcance","range","")}
       ${field("Efeito / Descrição","effect","",{textarea:true,required:true})}`,common],
    ferramenta:()=>[`Nova Ferramenta/Item`,
      `${field("Categoria","category","Arma",{select:["Arma","Armadura","Ferramenta Mágica","Item Mágico","Consumível"]})}
       ${field("Tier","tier","1",{number:true})}
       ${field("Atributo","attr","")}
       ${field("Alcance","range","")}
       ${field("Dano (ex: d8+3 PHY)","damage","")}
       ${field("Descrição","effect","",{textarea:true,required:true})}`,common],
    raca:()=>[`Nova Raça`,
      `${field("Bônus Simples (ex: +1 Força)","bonus","",{required:true})}
       ${field("Aparência","appearance","")}
       ${field("Identidade","identity","",{textarea:true,required:true})}
       ${field("Traço 1 (nome)","trait1","")},${field("Traço 1 (descrição)","trait1d","",{full:true,textarea:true})}
       ${field("Traço 2 (nome)","trait2","")},${field("Traço 2 (descrição)","trait2d","",{full:true,textarea:true})}
       ${field("Traço 3 (nome)","trait3","")},${field("Traço 3 (descrição)","trait3d","",{full:true,textarea:true})}`,common],
    classe:()=>[`Nova Classe`,
      `${field("Tipo","type","Mágica",{select:["Mágica","Física"]})}
       ${field("Recurso","resource","")},${field("Recurso Máximo","resourceMax","",{number:true})}
       ${field("Lucidez Máxima","lucidityMax","",{number:true})}
       ${field("Atributos (ex: Inteligência e Instinto)","attrs","",{required:true})}
       ${field("Identidade","identity","",{textarea:true,required:true})}
       ${field("Características (uma por linha)","features","",{textarea:true})}
       ${field("Impulso","impulse","--","",{textarea:true})}`,common],
    particularidade:()=>[`Nova Particularidade`,
      `${field("Categoria","category","Comportamento",{select:["Comportamento","Treinamento","Profissão","Característica Física","Equipamento"]})}
       ${field("Descrição","description","",{textarea:true,required:true})}
       ${field("Efeito","effect","",{textarea:true,required:true})}
       ${field("Gatilho","trigger","",{textarea:true})}
       ${field("Limitação","limitation","",{textarea:true})}
       ${field("Hiperfoco","hyperfocus","",{textarea:true})}
       ${field("Abstinência","abstinence","",{textarea:true})}`,common]
  }[type];
  if(!parts) return;

  const title = parts()[0], fields = parts()[1];
  openModal(title, fields, async (fd)=>{
    try{
      const password = fd.get("password");
      const base = buildCommData(type, fd);
      await communityAdd(type, base, password);
      closeModal(); await refreshCommunity();
      showToast("Sugestão enviada! Aguardando aprovação.");
    }catch(err){ showToast(err.message); }
  });
}

// Monta o objeto a ser gravado, no mesmo formato do catálogo oficial.
function buildCommData(type, fd){
  const lines = (v)=>(v||"").split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>({desc:s}));
  switch(type){
    case "magia": return {
      id:commNewId(type), name:fd.get("name").trim(), class:fd.get("class"), circle:Number(fd.get("circle"))||1,
      levelMin:1, mana:Number(fd.get("mana"))||10, attr:fd.get("attr")||"", range:fd.get("range")||"",
      damage:fd.get("damage")||"", effect:fd.get("effect").trim() };
    case "tecnica": return {
      id:commNewId(type), name:fd.get("name").trim(), class:fd.get("class"), grade:Number(fd.get("grade"))||1,
      levelMin:1, prana:Number(fd.get("prana"))||5, attr:fd.get("attr")||"", type:fd.get("type")||"Impacto",
      range:fd.get("range")||"", effect:fd.get("effect").trim() };
    case "ferramenta": return {
      id:commNewId(type), category:fd.get("category")||"Arma", tier:Number(fd.get("tier"))||1,
      name:fd.get("name").trim(), attr:fd.get("attr")||"", range:fd.get("range")||"",
      damage:fd.get("damage")||"", desc:fd.get("effect").trim() };
    case "raca": {
      const out={ id:commNewId(type), name:fd.get("name").trim(), bonus:fd.get("bonus")||"",
        appearance:fd.get("appearance")||"", identity:fd.get("identity").trim(), traits:[] };
      for(let i=1;i<=3;i++){ const n=fd.get("trait"+i); if(n) out.traits.push({name:n,desc:fd.get("trait"+i+"d")||""}); }
      return out;
    }
    case "classe": {
      const fInfo = lines(fd.get("features"));
      const imp = (fd.get("impulse")||"").trim();
      return { id:commNewId(type), name:fd.get("name").trim(), type:fd.get("type")||"Mágica",
        resource:fd.get("resource")||(fd.get("type")==="Mágica"?"Mana":"Prana"),
        resourceMax:Number(fd.get("resourceMax"))||0, lucidityMax:Number(fd.get("lucidityMax"))||80,
        attrs:fd.get("attrs")||"", identity:fd.get("identity").trim(), features:fInfo,
        impulse: { name:"Impulso", desc: imp } };
    }
    case "particularidade": return {
      id:commNewId(type), name:fd.get("name").trim(), category:fd.get("category")||"Comportamento",
      description:fd.get("description").trim(), effect:fd.get("effect").trim(),
      trigger:fd.get("trigger")||"", limitation:fd.get("limitation")||"",
      hyperfocus:fd.get("hyperfocus")||"", abstinence:fd.get("abstinence")||"" };
  }
}

function renderSuggestions(){
  const wrap=document.getElementById("gridSugestoes"); if(!wrap) return;
  const p=commPending();
  if(!p.length){ wrap.innerHTML=emptyState("Nenhuma sugestão aguardando aprovação."); return; }
  const card=(s)=>{
    const d=s.data||{};
    const info =
      s.type==="magia"            ? `Magia · ${d.class||"—"} · Círculo ${d.circle||1}` :
      s.type==="tecnica"          ? `Técnica · ${d.class||"—"} · Grau ${d.grade||1}` :
      s.type==="ferramenta"       ? `Ferramenta · ${d.category||"—"} · Tier ${d.tier||1}` :
      s.type==="raca"             ? `Raça · Bônus: ${d.bonus||"—"}` :
      s.type==="classe"           ? `Classe · ${d.type||"—"} · Recurso ${d.resourceMax||0}` :
      s.type==="particularidade"  ? `Particularidade · ${d.category||"—"}` : "";
    const meta =
      s.type==="magia" ? `${d.mana} Mana` :
      s.type==="tecnica" ? `${d.prana} Prana` :
      s.type==="classe" ? `${d.resourceMax||0}` : "";
    const body =
      s.type==="raca" ? (d.identity||"") :
      s.type==="classe" ? (d.identity||"") :
      s.type==="particularidade" ? (d.effect||"") :
      (d.effect||d.desc||"");
    return `<div class="card">
      <div class="card-top"><div class="card-title">${escapeHtml(d.name||"Sem nome")}</div><div class="card-tag tag-magica">${s.status||"pending"}</div></div>
      <div class="card-meta"><span>${info}</span>${meta?`<span><b>${meta}</b></span>`:""}${(s.submittedAt?`<span>${new Date(s.submittedAt).toLocaleString("pt-BR")}</span>`:"")}</div>
      <div class="card-body">${escapeHtml(body)}</div>
      <div class="card-foot">
        <button class="btn btn-sm btn-danger" onclick="commPromptReject('${s.id}')">Rejeitar</button>
        <button class="btn btn-sm btn-primary" onclick="commPromptApprove('${s.id}')">Aprovar</button>
      </div>
    </div>`;
  };
  wrap.innerHTML = p.map(card).join("");
}

function commPromptApprove(id){
  const pw=prompt("Senha de admin para aprovar:");
  (async()=>{ try{ await communityApprove(id, pw||""); await refreshCommunity(); showToast("Aprovado e publicado para todos."); }
    catch(e){ showToast(e.message); } })();
}
function commPromptReject(id){
  if(!confirm("Rejeitar esta sugestão?")) return;
  const pw=prompt("Senha de admin para rejeitar:");
  (async()=>{ try{ await communityReject(id, pw||""); await refreshCommunity(); showToast("Sugestão rejeitada."); }
    catch(e){ showToast(e.message); } })();
}

// Recarrega a fila, re-aplica o merge e atualiza as telas.
async function refreshCommunity(){
  await loadCommunity();
  commApply();
  renderAll();
  if(document.getElementById("gridSugestoes")) renderSuggestions();
}