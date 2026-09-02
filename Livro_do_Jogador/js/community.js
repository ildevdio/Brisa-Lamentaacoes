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
  GIST_ID         : "COLE_AQUI_O_ID_DO_GIST",
  GIST_TOKEN      : "COLE_AQUI_O_TOKEN_DE_GIST",
  FILE_NAME       : "catalog-contrib.json",
  PASSWORD_CONTRIB: "brisa",       // senha que o jogador usa para sugerir
  PASSWORD_ADMIN  : "lamenca",     // senha para aprovar/rejeitar
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
    spells:(it)=>{ if(!data.spells) data.spells=[]; it.forEach(x=>{ if(!data.spells.some(s=>s.id===x.id)) data.spells.push(x); }); },
    techs:(it)=>{ if(!data.techniques) data.techniques=[]; it.forEach(x=>{ if(!data.techniques.some(s=>s.id===x.id)) data.techniques.push(x); }); },
    items:(it)=>{ if(!data.items) data.items=[]; it.forEach(x=>{ if(!data.items.some(s=>s.id===x.id)) data.items.push(x); }); }
  };
  for(const a of commApproved()){
    if(a.type==="magia" && target.spells) target.spells([a.data]);
    else if(a.type==="tecnica" && target.techs) target.techs([a.data]);
    else if(a.type==="ferramenta" && target.items) target.items([a.data]);
  }
}

/* =====================================================================
   ESCRITA: PATCH no Gist para adicionar/mover/remover itens.
   Requer token. Devolve true/false.
   ===================================================================== */
async function commWrite(newComm){
  const id=COMMUNITY.GIST_ID, tok=COMMUNITY.GIST_TOKEN;
  if(!id||!tok||id.startsWith("COLE")||tok.startsWith("COLE")) throw new Error("Gist não configurado.");
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
  const meta = {
    magia:    {title:"Nova Magia", clsKey:"class", label:"Classe", resource:"mana", resourceLabel:"Custo (Mana)", circle:true},
    tecnica:  {title:"Nova Técnica", clsKey:"class", label:"Classe", resource:"prana", resourceLabel:"Custo (Prana)", grade:true},
    ferramenta:{title:"Nova Ferramenta/Item", clsKey:"category", label:"Categoria", item:true}
  }[type];
  const fields = `
    ${field("Nome","name","",{full:true,required:true})}
    ${type==="ferramenta"
      ? `<div class="field"><label>${meta.label}</label><select class="input" name="category">
           <option>Arma</option><option>Armadura</option><option>Ferramenta Mágica</option>
           <option>Item Mágico</option><option>Consumível</option></select></div>
         <div class="field"><label>Tier</label><input class="input" type="number" name="tier" value="1" min="1" max="7"></div>
         <div class="field"><label>Traço/Atributo</label><input class="input" name="attr"></div>
         <div class="field"><label>Alcance</label><input class="input" name="range"></div>`
      : `<div class="field"><label>${meta.label}</label><input class="input" name="${meta.clsKey}" required></div>
         <div class="field"><label>Atributo</label><input class="input" name="attr" required></div>
         <div class="field"><label>${meta.resourceLabel}</label><input class="input" type="number" name="${meta.resource}" value="10"></div>
         <div class="field"><label>${type==="magia"?"Círculo":"Grau"}</label><input class="input" type="number" name="${type==="magia"?"circle":"grade"}" value="1" min="1" max="7"></div>
         <div class="field"><label>Alcance</label><input class="input" name="range"></div>`
    }
    <div class="field full"><label>Dano (ex: d6 MAG)</label><input class="input" name="damage"></div>
    <div class="field full"><label>Efeito / Descrição</label><textarea class="input" name="effect" required></textarea></div>
    <div class="field full"><label>Senha de contribuidor</label><input class="input" type="password" name="password" required></div>
    <div class="hint full" style="grid-column:1/-1;">O item entra como <b>pendente</b>. O admin aprovará para todos verem.</div>`;
  openModal(meta.title, fields, async (fd)=>{
    try{
      const password = fd.get("password");
      const base = type==="magia" ? { id:commNewId(type), class:fd.get("class"), circle:Number(fd.get("circle"))||1, levelMin:1, mana:Number(fd.get("mana"))||10 } :
                   type==="tecnica" ? { id:commNewId(type), class:fd.get("class"), grade:Number(fd.get("grade"))||1, levelMin:1, prana:Number(fd.get("prana"))||5, type:"Impacto" } :
                   { id:commNewId(type), category:fd.get("category"), tier:Number(fd.get("tier"))||1, attr:fd.get("attr"), range:fd.get("range") };
      Object.assign(base,{ name:fd.get("name").trim(), attr:fd.get("attr")||"", range:fd.get("range")||"",
        damage:fd.get("damage")||"", effect:fd.get("effect").trim(), desc:fd.get("effect").trim() });
      await communityAdd(type, base, password);
      closeModal(); await refreshCommunity();
      showToast("Sugestão enviada! Aguardando aprovação.");
    }catch(err){ showToast(err.message); }
  });
}

function renderSuggestions(){
  const wrap=document.getElementById("gridSugestoes"); if(!wrap) return;
  const p=commPending();
  if(!p.length){ wrap.innerHTML=emptyState("Nenhuma sugestão aguardando aprovação."); return; }
  const card=(s)=>{
    const d=s.data||{};
    const info = s.type==="magia" ? `Magia · ${d.class||"—"} · Círculo ${d.circle||1}` :
                 s.type==="tecnica" ? `Técnica · ${d.class||"—"} · Grau ${d.grade||1}` :
                 `Ferramenta · ${d.category||"—"} · Tier ${d.tier||1}`;
    const meta = s.type==="magia"?`${d.mana} Mana`: (s.type==="tecnica"?`${d.prana} Prana`:"");
    return `<div class="card">
      <div class="card-top"><div class="card-title">${escapeHtml(d.name||"Sem nome")}</div><div class="card-tag tag-magica">${s.status||"pending"}</div></div>
      <div class="card-meta"><span>${info}</span>${meta?`<span><b>${meta}</b></span>`:""}${(s.submittedAt?`<span>${new Date(s.submittedAt).toLocaleString("pt-BR")}</span>`:"")}</div>
      <div class="card-body">${escapeHtml(d.effect||d.desc||"")}</div>
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