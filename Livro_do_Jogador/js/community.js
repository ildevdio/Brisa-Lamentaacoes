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
  const data = DATA;
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

async function communityAdd(type, data, password, playerName){
  if(password!==COMMUNITY.PASSWORD_CONTRIB) throw new Error("Senha de contribuidor incorreta.");
  const item = { id: commNewId(type), type:type, data:data,
    submittedBy:String(playerName||"").trim(), submittedAt:new Date().toISOString(), status:"pending" };
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
  // Distribuição de Nome (full), que aparece antes dos demais campos em todos os formulários.
  const nameField = field("Nome","name","",{required:true});
  const playerNameField = `<div class="field full"><label>Seu nome (opcional)</label><input class="input" name="playerName" placeholder="Como o admin saberá quem enviou"></div>`;
  const passField = `<div class="field full"><label>Senha de contribuidor</label><input class="input" type="password" name="password" placeholder="Digite a senha (solicitar)" required></div>`;
  const hintField = `<div class="hint full" style="grid-column:1/-1;">O item entra como <b>pendente</b>. O admin aprovará para todos verem.</div>`;

  // Listas de opções padronizadas (mesmo vocabulário do livro).
  const classOptions = mechClasses().map(c=>c.name);
  const rangeSel = ["Melee","Muito Perto","Perto","Longe","Muito Longe"];

  const forms = {
    raca:()=>`<div class="form-grid">${nameField}${playerNameField}
      ${field("Bônus Simples","bonus","")}
      ${field("Aparência / expectativa de vida","appearance","",{full:true})}
      ${field("Identidade","identity","",{textarea:true,full:true,required:true})}
      ${field("Traços Marcantes","traits","",{textarea:true,full:true,hint:"Um traço por linha, no formato: Nome: Descrição"})}
      ${passField}${hintField}</div>`,

    classe:()=>`<div class="form-grid">${nameField}${playerNameField}
      ${field("Tipo","type","Mágica",{select:["Física","Mágica"]})}
      ${field("Recurso principal","resource","Mana",{select:["Prana","Mana"]})}
      ${field("Máximo do recurso","resourceMax","",{number:true})}
      ${field("Lucidez máxima inicial","lucidityMax","80",{number:true})}
      ${field("Atributos predominantes","attrs","",{full:true})}
      ${field("Identidade","identity","",{textarea:true,full:true,required:true})}
      ${field("Características de Classe","features","",{textarea:true,full:true,hint:"Uma por linha: Nome: Descrição"})}
      ${field("Impulso (nome)","impulseName","")}
      ${field("Impulso (efeito)","impulseDesc","")}
      ${field("Caminhos","paths","",{textarea:true,full:true,hint:"Um por linha: Nome do Caminho | Foco | Áreas da árvore (separadas por vírgula)"})}
      ${passField}${hintField}</div>`,

    magia:()=>`<div class="form-grid">${nameField}${playerNameField}
      ${field("Classe","class",classOptions[0]||"",{select:classOptions})}
      ${field("Círculo (1-7)","circle","1",{number:true})}
      ${field("Nível mínimo","levelMin","1",{number:true})}
      ${field("Custo de Mana","mana","10",{number:true})}
      ${field("Atributo","attr","")}
      ${field("Alcance","range","Perto",{select:rangeSel})}
      ${field("Dano (opcional)","damage","")}
      ${field("Efeito","effect","",{textarea:true,full:true,required:true})}
      ${passField}${hintField}</div>`,

    tecnica:()=>`<div class="form-grid">${nameField}${playerNameField}
      ${field("Classe","class",classOptions[0]||"",{select:classOptions})}
      ${field("Grau (1-7)","grade","1",{number:true})}
      ${field("Nível mínimo","levelMin","1",{number:true})}
      ${field("Custo de Prana","prana","5",{number:true})}
      ${field("Atributo","attr","")}
      ${field("Tipo","type","Impacto",{select:["Impacto","Sequência","Defesa","Mobilidade","Resistência","Precisão","Utilidade"]})}
      ${field("Efeito","effect","",{textarea:true,full:true,required:true})}
      ${field("Ferramenta recomendada","tool","",{textarea:true,full:true})}
      ${passField}${hintField}</div>`,

    ferramenta:()=>`<div class="form-grid">${nameField}${playerNameField}
      ${field("Categoria","category","Arma",{select:["Arma","Armadura","Ferramenta Mágica","Item Mágico","Consumível"]})}
      ${field("Tier (1-7)","tier","1",{number:true})}
      ${field("Traço/Atributo","attr","")}
      ${field("Alcance","range","",{select:["",...rangeSel]})}
      ${field("Dado de Dano","damage","")}
      ${field("Tipo de Dano","dtype","",{select:["","PHY","MAG"]})}
      ${field("Burden (mãos)","burden","")}
      ${field("Feature","feature","",{textarea:true,full:true})}
      ${field("Descrição","desc","",{textarea:true,full:true,required:true})}
      ${passField}${hintField}</div>`,

    particularidade:()=>`<div class="form-grid">${nameField}${playerNameField}
      ${field("Categoria","category","Geral",{select:["Geral","Comportamento","Treinamento","Profissão","Característica Física","Equipamento"]})}
      ${field("Descrição","description","",{textarea:true,full:true,required:true})}
      ${field("Efeito","effect","",{textarea:true,full:true,required:true})}
      ${field("Gatilho","trigger","",{textarea:true,full:true})}
      ${field("Limitação","limitation","",{textarea:true,full:true})}
      ${field("Hiperfoco / efeito adicional","hyperfocus","",{textarea:true,full:true})}
      ${field("Abstinência / consequência adicional","abstinence","",{textarea:true,full:true})}
      ${passField}${hintField}</div>`
  };
  const titles = { raca:"Nova raça", classe:"Nova classe", magia:"Nova magia",
                   tecnica:"Nova técnica", ferramenta:"Nova ferramenta/item", particularidade:"Nova particularidade" };
  if(!forms[type]) return;

  openModal(titles[type], forms[type](), async (fd)=>{
    try{
      const password = fd.get("password");
      const base = buildCommData(type, fd);
      await communityAdd(type, base, password, fd.get("playerName"));
      closeModal(); await refreshCommunity();
      showToast("Sugestão enviada! Aguardando aprovação.");
    }catch(err){ showToast(err.message); }
  });
}

// Convertores de linhas (mesmo formato do catálogo oficial).
function commFeatures(text){ return parseLines(text); }
function commPaths(text){
  return String(text||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{
    const parts = l.split("|").map(x=>x.trim());
    return {name:parts[0]||"", focus:parts[1]||"", areas:parts[2]||""};
  });
}

// Monta o objeto a ser gravado (campos idênticos ao arquivo de referência).
function buildCommData(type, fd){
  switch(type){
    case "raca": return {
      id:commNewId(type), name:fd.get("name").trim(), bonus:(fd.get("bonus")||"").trim(),
      appearance:(fd.get("appearance")||"").trim(), identity:fd.get("identity").trim(),
      traits:parseLines(fd.get("traits")) };
    case "classe": return {
      id:commNewId(type), name:fd.get("name").trim(), type:fd.get("type"),
      resource:fd.get("resource"), resourceMax:Number(fd.get("resourceMax"))||0,
      lucidityMax:Number(fd.get("lucidityMax"))||80, attrs:(fd.get("attrs")||"").trim(),
      identity:fd.get("identity").trim(), features:commFeatures(fd.get("features")),
      impulse:{ name:(fd.get("impulseName")||"").trim(), desc:(fd.get("impulseDesc")||"").trim() },
      paths:commPaths(fd.get("paths")) };
    case "magia": return {
      id:commNewId(type), name:fd.get("name").trim(), class:fd.get("class"),
      circle:Number(fd.get("circle"))||1, levelMin:Number(fd.get("levelMin"))||1,
      mana:Number(fd.get("mana"))||10, attr:(fd.get("attr")||"").trim(),
      range:fd.get("range")||"", damage:(fd.get("damage")||"").trim(), effect:fd.get("effect").trim() };
    case "tecnica": return {
      id:commNewId(type), name:fd.get("name").trim(), class:fd.get("class"),
      grade:Number(fd.get("grade"))||1, levelMin:Number(fd.get("levelMin"))||1,
      prana:Number(fd.get("prana"))||5, attr:(fd.get("attr")||"").trim(), type:fd.get("type"),
      effect:fd.get("effect").trim(), tool:(fd.get("tool")||"").trim() };
    case "ferramenta": return {
      id:commNewId(type), category:fd.get("category"), tier:Number(fd.get("tier"))||1,
      name:fd.get("name").trim(), attr:(fd.get("attr")||"").trim(), range:fd.get("range")||"",
      damage:(fd.get("damage")||"").trim(), dtype:fd.get("dtype")||"",
      burden:(fd.get("burden")||"").trim(), feature:(fd.get("feature")||"").trim(),
      desc:fd.get("desc").trim() };
    case "particularidade": return {
      id:commNewId(type), name:fd.get("name").trim(), category:(fd.get("category")||"").trim()||"Geral",
      description:fd.get("description").trim(), effect:fd.get("effect").trim(),
      trigger:(fd.get("trigger")||"").trim(), limitation:(fd.get("limitation")||"").trim(),
      hyperfocus:(fd.get("hyperfocus")||"").trim(), abstinence:(fd.get("abstinence")||"").trim() };
  }
}

function renderSuggestions(){
  const wrap=document.getElementById("gridSugestoes"); if(!wrap) return;
  const p=commPending();
  if(!p.length){ wrap.innerHTML=`<div class="empty-state">Nenhuma sugestão aguardando aprovação. Itens criados pelos jogadores (botões "+ Nova ...") aparecem aqui para você aprovar.</div>`; return; }
  const card=(s)=>{
    const d=s.data||{};
    let inner = "";
    if(s.type==="raca"){
      inner = `
        <div class="card-meta"><span>Bônus: <b>${escapeHtml(d.bonus||"—")}</b></span></div>
        <div class="card-body">${escapeHtml(d.identity||"")}${d.appearance?`<br><span style="color:var(--text-faint)">${escapeHtml(d.appearance)}</span>`:""}</div>
        <ul class="trait-list">${(d.traits||[]).map(t=>`<li><b>${escapeHtml(t.name)}</b>${t.desc?": "+escapeHtml(t.desc):""}</li>`).join("")}</ul>`;
    } else if(s.type==="classe"){
      inner = `
        <div class="card-meta"><span>Recurso: <b>${escapeHtml(d.resource)} ${Number(d.resourceMax)||0}</b></span><span>Lucidez: <b>${Number(d.lucidityMax)||0}</b></span></div>
        <div class="card-meta"><span>Atributos: <b>${escapeHtml(d.attrs||"—")}</b></span></div>
        <div class="card-body">${escapeHtml(d.identity||"")}</div>
        <ul class="trait-list">
          ${(d.features||[]).map(f=>`<li><b>${escapeHtml(f.name)}</b>${f.desc?": "+escapeHtml(f.desc):""}</li>`).join("")}
          ${d.impulse?`<li><b>Impulso - ${escapeHtml(d.impulse.name||"")}</b>: ${escapeHtml(d.impulse.desc||"")}</li>`:""}
          ${(d.paths||[]).map(p=>`<li><b>Caminho: ${escapeHtml(p.name)}</b> (${escapeHtml(p.focus||"")}) - ${escapeHtml(p.areas||"")}</li>`).join("")}
        </ul>`;
    } else if(s.type==="magia"){
      inner = `
        <div class="card-meta"><span>Classe: <b>${escapeHtml(d.class||"—")}</b></span><span>Nv. mín.: <b>${Number(d.levelMin)||1}</b></span></div>
        <div class="card-meta"><span>Custo: <b>${Number(d.mana)||0} Mana</b></span><span>Atributo: <b>${escapeHtml(d.attr||"—")}</b></span><span>Alcance: <b>${escapeHtml(d.range||"—")}</b></span></div>
        ${d.damage?`<div class="card-meta"><span>Dano: <b>${escapeHtml(d.damage)}</b></span></div>`:""}
        <div class="card-body">${escapeHtml(d.effect||"")}</div>`;
    } else if(s.type==="tecnica"){
      inner = `
        <div class="card-meta"><span>Classe: <b>${escapeHtml(d.class||"—")}</b></span><span>Nv. mín.: <b>${Number(d.levelMin)||1}</b></span></div>
        <div class="card-meta"><span>Custo: <b>${Number(d.prana)||0} Prana</b></span><span>Atributo: <b>${escapeHtml(d.attr||"—")}</b></span><span>Tipo: <b>${escapeHtml(d.type||"—")}</b></span></div>
        <div class="card-body">${escapeHtml(d.effect||"")}${d.tool?`<br><span style="color:var(--text-faint)">${escapeHtml(d.tool)}</span>`:""}</div>`;
    } else if(s.type==="ferramenta"){
      inner = `
        <div class="card-meta"><span><b>${escapeHtml(d.category||"—")}</b></span>
          ${d.attr?`<span>Traço: <b>${escapeHtml(d.attr)}</b></span>`:""}
          ${d.range?`<span>Alcance: <b>${escapeHtml(d.range)}</b></span>`:""}
        </div>
        ${d.damage?`<div class="card-meta"><span>Dano: <b>${escapeHtml(d.damage)} ${escapeHtml(d.dtype||"")}</b></span>${d.burden?`<span>Burden: <b>${escapeHtml(d.burden)}</b></span>`:""}</div>`:""}
        <div class="card-body">${escapeHtml(d.desc||"")}${d.feature?`<br><b style="color:var(--text)">Feature:</b> ${escapeHtml(d.feature)}`:""}</div>`;
    } else { // particularidade
      inner = `
        <div class="card-body">${escapeHtml(d.description||"")}</div>
        <div class="notes-box"><b>Efeito:</b> ${escapeHtml(d.effect||"Não definido.")}
          ${d.trigger?`<br><br><b>Gatilho:</b> ${escapeHtml(d.trigger)}`:""}
          ${d.limitation?`<br><br><b>Limitação:</b> ${escapeHtml(d.limitation)}`:""}
          ${d.hyperfocus?`<br><br><b>Hiperfoco:</b> ${escapeHtml(d.hyperfocus)}`:""}
          ${d.abstinence?`<br><br><b>Abstinência:</b> ${escapeHtml(d.abstinence)}`:""}
        </div>`;
    }
    return `<div class="card">
      <div class="card-top"><div class="card-title">${escapeHtml(d.name||"Sem nome")}</div><div class="card-tag tag-magica">${s.status||"pending"}</div></div>
      ${inner}
      ${(s.submittedBy||s.submittedAt)?`<div class="card-meta">${s.submittedBy?`<span>Por: <b>${escapeHtml(s.submittedBy)}</b></span>`:""}${s.submittedAt?`<span>${escapeHtml(new Date(s.submittedAt).toLocaleString("pt-BR"))}</span>`:""}</div>`:""}
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
  if(typeof persist==="function") persist();
  renderAll();
  if(document.getElementById("gridSugestoes")) renderSuggestions();
}