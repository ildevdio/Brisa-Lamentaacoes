/* =====================================================================
   Brisa e Lamentações - Livro do Jogador
   Módulo: js/app.js
   Lógica da aplicação.

   ARQUITETURA:
   - Mecânicas (raças, classes, magias, técnicas, itens, particularidades,
     mecânicas de regra e reações): carregadas do SERVIDOR via game-data.json
     (github.io raw), com cache local para servir com rapidez e funcionar offline.
   - Personagens: salvos LOCALMENTE no navegador/celular de cada jogador
     (chave bel_personagens). São do jogador, nunca sobrescritos pelas mecânicas.

   NOTA sobre versionamento das mecânicas:
   - O campo version em game-data.json identifica a versão das regras base.
   - 'mecBaseline' guarda a versão das mecânicas ativas no momento; ao detectar
     mudança, revalida se os personagens locais continuam coerentes.

   Funções são expostas globalmente para uso em atributos onclick.
   ===================================================================== */

/* =====================================================================
   CONFIG
   ===================================================================== */
// URLs dos dados de mecânica. Em GitHub Pages o raw aponta para o branch main.
const GAME_DATA_URL = "game-data.json";              // relativo (mesma origem do app)
const GAME_DATA_FALLBACK_URL = "https://raw.githubusercontent.com/ildevdio/Brisa-Lamentaacoes/main/game-data.json";

const CACHE_MECH_KEY = "bel_mecanicas_cache_v1";     // espelho das mecânicas baixadas
const CHARS_KEY      = "bel_personagens_v1";         // personagens do jogador (LOCAL)

/* =====================================================================
   ESTADO
   ===================================================================== */
// MECÂNICAS ativas (carregadas do servidor; em memória e cacheadas)
let MECH = null;                 // { data, mechanics, reactions, version, metadata }
let MECH_READY = false;          // true quando as mecânicas já foram aplicadas

// PERSONAGENS locais do jogador (sempre do localStorage)
let PCS = loadPcs();

function loadPcs(){
  try{
    const raw = localStorage.getItem(CHARS_KEY);
    if(raw){
      const arr = JSON.parse(raw);
      if(Array.isArray(arr)) return arr;
    }
  }catch(e){ console.warn("Falha ao ler personagens locais.", e); }
  return [];
}
function savePcs(){ localStorage.setItem(CHARS_KEY, JSON.stringify(PCS)); }

function uid(prefix){ return prefix + "_" + Math.random().toString(36).slice(2,9); }
function structuredCloneSafe(obj){ return JSON.parse(JSON.stringify(obj)); }

/* =====================================================================
   TOAST
   ===================================================================== */
let __toastTimer = null;
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(__toastTimer);
  __toastTimer = setTimeout(()=>t.classList.remove("show"), 2200);
}

/* =====================================================================
   CARREGAMENTO DAS MECÂNICAS DO SERVIDOR
   ===================================================================== */
async function boot(){
  const status = document.createElement("div");
  status.id = "bootStatus";
  status.style.cssText = "position:fixed;top:10px;right:10px;z-index:300;font-size:12px;border-radius:8px;padding:8px 12px;border:1px solid var(--border);background:var(--panel);color:var(--text-dim);max-width:260px;";
  document.body.appendChild(status);
  const setStatus = (txt)=>status.textContent = txt;
  setStatus("Carregando mecânicas...");
  try{
    const loaded = await loadMechanics();
    if(loaded){ setStatus("Mecânicas atualizadas ✓"); applyAll(); }
    else throw new Error("falha ao carregar mecânicas");
  }catch(err){
    const fallback = tryCache();
    if(fallback){ setStatus("Modo offline (versão em cache)"); applyAll(); }
    else {
      setStatus("Erro ao carregar mecânicas");
      showToast("Não foi possível carregar as mecânicas do servidor.");
    }
  }
  // mesmo sem mecânicas, renderiza as telas a partir do estado existente
  applyAll();
}

function tryCache(){
  try{
    const raw = localStorage.getItem(CACHE_MECH_KEY);
    if(raw){ const o = JSON.parse(raw); if(o && o.data) return normalizeMechanics(o); }
  }catch(e){ console.warn("cache inválido", e); }
  return null;
}

async function loadMechanics(){
  const urls = await resolveUrls();
  let parsed = null;
  for(const url of urls){
    try{
      const res = await fetch(url, { cache: "no-store" });
      if(!res.ok) continue;
      parsed = await res.json();
      break;
    }catch(e){ continue; }
  }
  if(!parsed) return false;
  const norm = normalizeMechanics(parsed);
  persistCache(norm);
  return true;
}

async function resolveUrls(){
  const urls = [GAME_DATA_URL];
  // evita usar o raw do github quando já estamos servidos de lá (evita loop/duplicado)
  if(location.protocol.startsWith("http") && location.hostname && location.hostname !== "raw.githubusercontent.com"){
    urls.push(GAME_DATA_FALLBACK_URL);
  }
  return urls;
}

function normalizeMechanics(o){
  const data = o.data || o;
  if(!(data && (data.races||data.classes||data.spells))){
    throw new Error("game-data.json inválido: falta campo data");
  }
  return {
    version: o.version || "0.0.0",
    metadata: o.metadata || {},
    data: data,
    mechanics: o.mechanics || [],
    reactions: o.reactions || []
  };
}

function persistCache(norm){
  try{ localStorage.setItem(CACHE_MECH_KEY, JSON.stringify(norm)); }
  catch(e){ console.warn("Não foi possível salvar cache de mecânicas.", e); }
}

// aplica as mecânicas ao estado global usado pelos renderers
function applyMechanics(norm){
  MECH = norm;
  MECH_READY = true;
}

function applyAll(){
  applyMechanics(MECH || tryCache());
  setupEventHandlers();
  renderAll();
}

/* =====================================================================
   CONVENIÊNCIAS DE ACESSO ÀS MECÂNICAS
   ===================================================================== */
function mechData(){ return (MECH && MECH.data) ? MECH.data : { races:[], classes:[], spells:[], techniques:[], items:[], particularities:[] }; }
function mechRaces(){ return mechData().races||[]; }
function mechClasses(){ return mechData().classes||[]; }
function mechSpells(){ return mechData().spells||[]; }
function mechTechs(){ return mechData().techniques||[]; }
function mechItems(){ return mechData().items||[]; }
function mechParticularities(){ return mechData().particularities||[]; }
function mechStats(){ return (MECH && MECH.mechanics)||[]; }
function mechReactions(){ return (MECH && MECH.reactions)||[]; }

/* =====================================================================
   NAVEGAÇÃO POR ABAS
   ===================================================================== */
function setupEventHandlers(){
  if(setupEventHandlers.__done) return;
  setupEventHandlers.__done = true;

  document.getElementById("tabNav").addEventListener("click",(e)=>{
    const btn = e.target.closest(".tab-btn");
    if(!btn) return;
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
    document.getElementById("tab-"+btn.dataset.tab).classList.add("active");
  });

  document.getElementById("modalOverlay").addEventListener("click",(e)=>{ if(e.target.id==="modalOverlay") closeModal(); });
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeModal(); });

  document.getElementById("filterClassType").addEventListener("click",(e)=>{
    const c = e.target.closest(".chip"); if(!c) return;
    document.querySelectorAll("#filterClassType .chip").forEach(x=>x.classList.remove("active"));
    c.classList.add("active"); classTypeFilter = c.dataset.val; renderClasses();
  });
  document.getElementById("filterItemCat").addEventListener("click",(e)=>{
    const c = e.target.closest(".chip"); if(!c) return;
    document.querySelectorAll("#filterItemCat .chip").forEach(x=>x.classList.remove("active"));
    c.classList.add("active"); itemCatFilter = c.dataset.val; renderItems();
  });
  document.getElementById("btnExport").addEventListener("click",exportPcs);
  document.getElementById("btnImport").addEventListener("click",()=>document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change",importPcsFile);
  document.getElementById("btnReset").addEventListener("click",resetPcs);
}

/* =====================================================================
   MODAL genérico
   ===================================================================== */
function openModal(title, bodyHtml, onSubmit){
  const overlay = document.getElementById("modalOverlay");
  const box = document.getElementById("modalBox");
  box.innerHTML = `
    <div class="modal-head"><h2>${title}</h2><button class="modal-close" onclick="closeModal()">×</button></div>
    <form id="modalForm">${bodyHtml}
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar</button>
      </div>
    </form>`;
  overlay.classList.remove("hidden");
  document.getElementById("modalForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    onSubmit(new FormData(e.target));
  });
}
function closeModal(){ document.getElementById("modalOverlay").classList.add("hidden"); }

function field(label, name, value, opts={}){
  const full = opts.full ? "full" : "";
  value = value===undefined||value===null? "" : value;
  if(opts.textarea){
    return `<div class="field ${full}"><label>${label}</label><textarea class="input" name="${name}">${escapeHtml(value)}</textarea>${opts.hint?`<div class="hint">${opts.hint}</div>`:""}</div>`;
  }
  if(opts.select){
    const opsHtml = opts.select.map(o=>`<option value="${o}" ${o==value?"selected":""}>${o}</option>`).join("");
    return `<div class="field ${full}"><label>${label}</label><select class="input" name="${name}">${opsHtml}</select></div>`;
  }
  const type = opts.number ? "number" : "text";
  return `<div class="field ${full}"><label>${label}</label><input class="input" type="${type}" name="${name}" value="${escapeHtml(value)}" ${opts.required?"required":""}>${opts.hint?`<div class="hint">${opts.hint}</div>`:""}</div>`;
}
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function parseLines(text){
  return String(text||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{
    const idx = l.indexOf(":");
    if(idx===-1) return {name:l, desc:""};
    return {name:l.slice(0,idx).trim(), desc:l.slice(idx+1).trim()};
  });
}
function traitsToLines(traits){ return (traits||[]).map(t=>`${t.name}: ${t.desc}`).join("\n"); }

/* =====================================================================
   RAÇAS (somente leitura - mecânicas vêm do servidor)
   ===================================================================== */
function renderRacas(){
  const q = (document.getElementById("searchRacas").value||"").toLowerCase();
  const wrap = document.getElementById("gridRacas");
  const list = mechRaces().filter(r=>r.name.toLowerCase().includes(q) || (r.identity||"").toLowerCase().includes(q));
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma raça encontrada."); updateStats(); return; }
  wrap.innerHTML = list.map(r=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${r.name}</div><div class="card-tag">Raça</div></div>
      <div class="card-meta"><span>Bônus: <b>${r.bonus||"—"}</b></span></div>
      <div class="card-body">${r.identity||""}${r.appearance?`<br><span style="color:var(--text-faint)">${r.appearance}</span>`:""}</div>
      <ul class="trait-list">${(r.traits||[]).map(t=>`<li><b>${t.name}</b>${t.desc?": "+t.desc:""}</li>`).join("")}</ul>
    </div>`).join("");
  updateStats();
}

/* =====================================================================
   CLASSES (somente leitura)
   ===================================================================== */
let classTypeFilter = "";
function renderClasses(){
  const q = (document.getElementById("searchClasses").value||"").toLowerCase();
  const wrap = document.getElementById("gridClasses");
  let list = mechClasses().filter(c=>c.name.toLowerCase().includes(q));
  if(classTypeFilter) list = list.filter(c=>c.type===classTypeFilter);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma classe encontrada."); updateStats(); return; }
  wrap.innerHTML = list.map(c=>`
    <div class="card">
      <div class="card-top">
        <div class="card-title">${c.name}</div>
        <div class="card-tag ${c.type==='Física'?'tag-fisica':'tag-magica'}">${c.type}</div>
      </div>
      <div class="card-meta"><span>Recurso: <b>${c.resource} ${c.resourceMax}</b></span><span>Lucidez: <b>${c.lucidityMax}</b></span></div>
      <div class="card-meta"><span>Atributos: <b>${c.attrs||"—"}</b></span></div>
      <div class="card-body">${c.identity||""}</div>
      <ul class="trait-list">
        ${(c.features||[]).map(f=>`<li><b>${f.name}</b>${f.desc?": "+f.desc:""}</li>`).join("")}
        ${c.impulse?`<li><b>Impulso - ${c.impulse.name}</b>: ${c.impulse.desc}</li>`:""}
        ${(c.paths||[]).map(p=>`<li><b>Caminho: ${p.name}</b> (${p.focus||""}) - ${p.areas||""}</li>`).join("")}
      </ul>
    </div>`).join("");
  updateStats();
}

/* =====================================================================
   MAGIAS (somente leitura)
   ===================================================================== */
function populateClassSelects(){
  const selMagia = document.getElementById("filterMagiaClasse");
  const mNames = mechClasses().filter(c=>c.type==="Mágica").map(c=>c.name);
  selMagia.innerHTML = `<option value="">Todas as classes</option>` + [...new Set([...mNames, ...mechSpells().map(s=>s.class)])].map(n=>`<option value="${n}">${n}</option>`).join("");
  const selTec = document.getElementById("filterTecClasse");
  const fNames = mechClasses().filter(c=>c.type==="Física").map(c=>c.name);
  selTec.innerHTML = `<option value="">Todas as classes</option>` + [...new Set([...fNames, ...mechTechs().map(t=>t.class)])].map(n=>`<option value="${n}">${n}</option>`).join("");
}
function renderSpells(){
  const q = (document.getElementById("searchMagias").value||"").toLowerCase();
  const cls = document.getElementById("filterMagiaClasse").value;
  const wrap = document.getElementById("gridMagias");
  let list = mechSpells().filter(s=>s.name.toLowerCase().includes(q));
  if(cls) list = list.filter(s=>s.class===cls);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma magia encontrada."); updateStats(); return; }
  wrap.innerHTML = list.map(s=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${s.name}</div><div class="card-tag tag-magica">Círculo ${s.circle}</div></div>
      <div class="card-meta"><span>Classe: <b>${s.class}</b></span><span>Nv. mín.: <b>${s.levelMin}</b></span></div>
      <div class="card-meta"><span>Custo: <b>${s.mana} Mana</b></span><span>Atributo: <b>${s.attr}</b></span><span>Alcance: <b>${s.range}</b></span></div>
      ${s.damage?`<div class="card-meta"><span>Dano: <b>${s.damage}</b></span></div>`:""}
      <div class="card-body">${s.effect||""}</div>
    </div>`).join("");
  updateStats();
}

/* =====================================================================
   TÉCNICAS (somente leitura)
   ===================================================================== */
function renderTechs(){
  const q = (document.getElementById("searchTecnicas").value||"").toLowerCase();
  const cls = document.getElementById("filterTecClasse").value;
  const wrap = document.getElementById("gridTecnicas");
  let list = mechTechs().filter(t=>t.name.toLowerCase().includes(q));
  if(cls) list = list.filter(t=>t.class===cls);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma técnica encontrada."); updateStats(); return; }
  wrap.innerHTML = list.map(t=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${t.name}</div><div class="card-tag tag-fisica">Grau ${t.grade}</div></div>
      <div class="card-meta"><span>Classe: <b>${t.class}</b></span><span>Nv. mín.: <b>${t.levelMin}</b></span></div>
      <div class="card-meta"><span>Custo: <b>${t.prana} Prana</b></span><span>Atributo: <b>${t.attr}</b></span><span>Tipo: <b>${t.type}</b></span></div>
      <div class="card-body">${t.effect||""}${t.tool?`<br><span style="color:var(--text-faint)">${t.tool}</span>`:""}</div>
    </div>`).join("");
  updateStats();
}

/* =====================================================================
   ITENS / EQUIPAMENTOS (somente leitura)
   ===================================================================== */
let itemCatFilter = "";
function renderItems(){
  const q = (document.getElementById("searchItens").value||"").toLowerCase();
  const wrap = document.getElementById("gridItens");
  let list = mechItems().filter(i=>i.name.toLowerCase().includes(q));
  if(itemCatFilter) list = list.filter(i=>i.category===itemCatFilter);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhum item encontrado."); updateStats(); return; }
  wrap.innerHTML = list.map(i=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${i.name}</div><div class="card-tag">Tier ${i.tier}</div></div>
      <div class="card-meta"><span><b>${i.category}</b></span>
        ${i.attr?`<span>Traço: <b>${i.attr}</b></span>`:""}
        ${i.range?`<span>Alcance: <b>${i.range}</b></span>`:""}
      </div>
      ${i.damage?`<div class="card-meta"><span>Dano: <b>${i.damage} ${i.dtype||""}</b></span>${i.burden?`<span>Burden: <b>${i.burden}</b></span>`:""}</div>`:""}
      <div class="card-body">${i.desc||""}${i.feature?`<br><b style="color:var(--text)">Feature:</b> ${i.feature}`:""}</div>
    </div>`).join("");
  updateStats();
}

/* =====================================================================
   PARTICULARIDADES (somente leitura)
   ===================================================================== */
function renderParticularidades(){
  const wrap=document.getElementById("gridParticularidades"); if(!wrap) return;
  const q=(document.getElementById("searchParticularidades")?.value||"").toLowerCase();
  const list=mechParticularities().filter(x=>(x.name+" "+x.category+" "+x.description).toLowerCase().includes(q));
  if(!list.length){wrap.innerHTML=emptyState("Nenhuma particularidade encontrada.");return;}
  wrap.innerHTML=list.map(x=>`<div class="card"><div class="card-top"><div><h3>${x.name}</h3><div class="sub">${x.category||"Geral"}</div></div></div><p>${x.description||""}</p><div class="notes-box"><b>Efeito:</b> ${x.effect||"Não definido."}${x.trigger?`<br><br><b>Gatilho:</b> ${x.trigger}`:""}${x.limitation?`<br><br><b>Limitação:</b> ${x.limitation}`:""}${x.hyperfocus?`<br><br><b>Hiperfoco:</b> ${x.hyperfocus}`:""}${x.abstinence?`<br><br><b>Abstinência:</b> ${x.abstinence}`:""}</div></div>`).join("");
}

/* =====================================================================
   PERSONAGENS (LOCAIS - do jogador)
   ===================================================================== */
let currentCharId = null;

function renderPersonagens(){
  const wrap = document.getElementById("gridPersonagens");
  document.getElementById("charSheetWrap").innerHTML = "";
  if(PCS.length===0){ wrap.innerHTML = emptyState("Nenhum personagem criado ainda.", "openCharWizard()"); updateStats(); return; }
  wrap.innerHTML = PCS.map(p=>`
    <div class="char-card" onclick="viewChar('${p.id}')">
      <h3>${p.name||"Sem nome"}</h3>
      <div class="sub">${p.race||"—"} · ${p.class||"—"} ${p.path?("· "+p.path):""} · Nível ${p.level||1}</div>
      ${barRow("Vida", p.vida, p.vidaMax, "vida")}
      ${barRow(p.resourceName||"Recurso", p.recurso, p.recursoMax, "recurso")}
      ${barRow("Lucidez", p.lucidez, p.lucidezMax, "lucidez")}
    </div>`).join("");
  updateStats();
}
function barRow(label, val, max, cls){
  val = Number(val)||0; max = Number(max)||1;
  const pct = Math.max(0, Math.min(100, (val/max)*100));
  return `<div class="bar-row"><span class="label">${label}</span><div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div><span class="bar-val">${val}/${max}</span></div>`;
}

function recalcChar(id){
  const p = PCS.find(x=>x.id===id); if(!p) return;
  const cls = mechClasses().find(c=>c.name===p.class);
  const isPhysical = cls ? cls.type==="Física" : true;
  p.vidaMax = isPhysical?7:6; p.vida = Math.min(p.vida??p.vidaMax, p.vidaMax);
  p.recursoMax = cls?cls.resourceMax:20; p.recurso = p.recursoMax;
  p.lucidezMax = cls?cls.lucidityMax:(isPhysical?80:100); p.lucidez = p.lucidezMax;
  p.evasao = 10 + (Number(p.attributes.agilidade)||0);
  p.resourceName = cls?cls.resource:"Recurso";
  p.mecBaseline = MECH ? MECH.version : p.mecBaseline;
  savePcs(); viewChar(id); renderPersonagens(); showToast("Recursos recalculados a partir da Classe.");
}

function viewChar(id){
  currentCharId = id;
  const p = PCS.find(x=>x.id===id); if(!p) return;
  const a = p.attributes||{};
  const attrDisplay = (label,val)=>`<div class="attr-box"><div class="name">${label}</div><div class="val ${val>0?'pos':(val<0?'neg':'')}">${val>=0?"+":""}${val}</div></div>`;
  const html = `
    <div class="sheet">
      <div class="sheet-head">
        <div>
          <h2>${p.name}</h2>
          <div class="sub">${p.race} · ${p.class}${p.path?" · "+p.path:""} · Nível ${p.level} </div>
        </div>
        <div class="section-actions">
          <button class="btn btn-sm" onclick="recalcChar('${p.id}')">↻ Recalcular por Raça/Classe</button>
          <button class="btn btn-sm" onclick="openCharWizard('${p.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteChar('${p.id}')">Remover</button>
        </div>
      </div>
      <div class="sheet-cols">
        <div>
          <div class="res-block"><h4>ATRIBUTOS</h4>
            <div class="attr-grid">
              ${attrDisplay("Força",a.forca)}${attrDisplay("Agilidade",a.agilidade)}${attrDisplay("Precisão",a.precisao)}
              ${attrDisplay("Instinto",a.instinto)}${attrDisplay("Presença",a.presenca)}${attrDisplay("Inteligência",a.inteligencia)}
            </div>
          </div>
          <div class="res-block"><h4>RECURSOS</h4>
            ${barRow("Vida", p.vida, p.vidaMax, "vida")}
            ${barRow(p.resourceName||"Recurso", p.recurso, p.recursoMax, "recurso")}
            ${barRow("Lucidez", p.lucidez, p.lucidezMax, "lucidez")}
            <div class="tag-row"><span class="tagpill">Evasão ${p.evasao}</span> ${(MECH&&p.mecBaseline!==MECH.version)?'<span class="tagpill" style="border-color:var(--hope-dim);color:var(--hope)">⚑ Novas regras disponíveis</span>':''}</div>
          </div>
          <div class="res-block"><h4>EXPERIENCES</h4>
            <div class="tag-row">${(p.experiences||[]).map(e=>`<span class="tagpill">${e}</span>`).join("")||'<span class="tagpill">—</span>'}</div>
          </div>
          <div class="res-block"><h4>PARTICULARIDADES</h4>
            <div class="tag-row">${(p.particularities||[]).map(name=>`<span class="tagpill">${name}</span>`).join("")||'<span class="tagpill">—</span>'}</div>
          </div>
          <div class="res-block"><h4>PODERES</h4>
            <div class="tag-row">${((p.spells||[]).concat(p.techs||[]).map(name=>`<span class="tagpill">${name}</span>`)).join("")||'<span class="tagpill">—</span>'}</div>
          </div>
        </div>
        <div>
          <div class="res-block"><h4>EQUIPAMENTO</h4><div class="notes-box">${p.equipment||"—"}</div></div>
          <div class="res-block"><h4>TRAÇOS &amp; CARACTERÍSTICAS</h4><div class="notes-box">${p.traits||"—"}</div></div>
          <div class="res-block"><h4>IDENTIDADE / ANOTAÇÕES</h4><div class="notes-box">${p.notes||"—"}</div></div>
        </div>
      </div>
    </div>`;
  document.getElementById("charSheetWrap").innerHTML = html;
  document.getElementById("charSheetWrap").scrollIntoView({behavior:"smooth", block:"start"});
}
function deleteChar(id){
  if(!confirm("Remover este personagem? Essa ação não pode ser desfeita.")) return;
  PCS = PCS.filter(x=>x.id!==id);
  currentCharId=null;
  savePcs(); renderPersonagens();
  showToast("Personagem removido.");
}

/* =====================================================================
   UTILITÁRIOS COMUNS
   ===================================================================== */
function emptyState(msg, addFnCall){
  const btn = addFnCall ? `<br><button class="btn btn-primary" onclick="${addFnCall}">+ Adicionar</button>` : "";
  return `<div class="empty-state" style="grid-column:1/-1;">${msg}${btn}</div>`;
}
function updateStats(){
  document.getElementById("statRacas").textContent = mechRaces().length;
  document.getElementById("statClasses").textContent = mechClasses().length;
  document.getElementById("statMagias").textContent = mechSpells().length;
  document.getElementById("statTecnicas").textContent = mechTechs().length;
  document.getElementById("statItens").textContent = mechItems().length;
  document.getElementById("statPersonagens").textContent = PCS.length;
}

/* =====================================================================
   REAÇÕES (render estático - vem do servidor)
   ===================================================================== */
function renderReacoes(){
  const wrap=document.getElementById("gridReacoes"); if(!wrap) return;
  const list = mechReactions();
  if(!list.length){ wrap.innerHTML = emptyState("Nenhuma reação carregada."); return; }
  wrap.innerHTML=list.map(r=>`
    <div class="card">
      <div class="card-top"><div><h3>${r.icon} ${r.name}</h3><div class="sub">${r.type}</div></div></div>
      <p><b>Gatilho:</b> ${r.trigger}</p>
      <div class="notes-box"><b>Efeito:</b> ${r.effect}${r.results.length?`<br><br>${r.results.map(x=>`<b>${x[0]}:</b> ${x[1]}`).join("<br>")}`:""}</div>
      ${r.interactions.length?`<div class="notes-box" style="margin-top:10px"><b>Interações:</b><ul style="margin:8px 0 0 18px">${r.interactions.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}
    </div>`).join("");
}

/* =====================================================================
   MECÂNICAS (render estático - vem do servidor)
   ===================================================================== */
function renderMechanics(){
  const wrap = document.getElementById("mecanicasGrid");
  const list = mechStats();
  wrap.innerHTML = list.map(m=>`
    <div class="ref-card">
      <h3>${m.title}</h3>
      ${m.body?`<p>${m.body}</p>`:""}
      ${m.table?`<table><tbody>${m.table.map(row=>`<tr><td class="k">${row[0]}</td><td>${row[1]}</td></tr>`).join("")}</tbody></table>`:""}
    </div>`).join("");
}

/* =====================================================================
   EXPORTAR / IMPORTAR / RESET (somente PERSONAGENS locais)
   ===================================================================== */
function exportPcs(){
  const blob = new Blob([JSON.stringify(PCS, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "meus-personagens.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Fichas exportadas.");
}
function importPcsFile(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const arr = JSON.parse(reader.result);
      if(!Array.isArray(arr)) throw new Error("O arquivo deve ser uma lista de fichas.");
      PCS = arr;
      savePcs(); renderPersonagens(); showToast("Fichas importadas.");
    }catch(err){ alert("Arquivo inválido: "+err.message); }
  };
  reader.readAsText(file);
  e.target.value = "";
}
function resetPcs(){
  if(!confirm("Apagar TODAS as fichas de personagem salvas neste aparelho? Essa ação não pode ser desfeita.")) return;
  PCS = []; savePcs(); renderPersonagens(); showToast("Fichas apagadas.");
}

/* =====================================================================
   RENDER GERAL
   ===================================================================== */
function renderAll(){
  populateClassSelects();
  renderMechanics();
  renderRacas();
  renderClasses();
  renderSpells();
  renderTechs();
  renderItems();
  renderParticularidades();
  renderReacoes();
  renderPersonagens();
  updateStats();
}

/* =====================================================================
   INIT
   ===================================================================== */
boot();