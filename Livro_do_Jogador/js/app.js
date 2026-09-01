/* =====================================================================
   Brisa e Lamentações - Livro do Jogador
   Módulo: js/app.js
   Lógica da aplicação: estado, persistência, navegação, CRUD e fichas.
   Depende de: js/data.js (carregado antes).
   Funções exportadas globalmente para uso em atributos onclick.
   ===================================================================== */

/* =====================================================================
   ESTADO / PERSISTÊNCIA
   ===================================================================== */
const STORAGE_KEY = "bel_livro_jogador_v1";
let DATA = loadData();

function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      // garante que todas as coleções existem mesmo se o backup for parcial
      return Object.assign(structuredCloneSafe(DEFAULT_DATA), parsed);
    }
  }catch(e){ console.warn("Falha ao carregar dados salvos, usando padrão.", e); }
  return structuredCloneSafe(DEFAULT_DATA);
}
function structuredCloneSafe(obj){ return JSON.parse(JSON.stringify(obj)); }
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA)); }
function uid(prefix){ return prefix + "_" + Math.random().toString(36).slice(2,9); }

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 2200);
}

/* =====================================================================
   NAVEGAÇÃO POR ABAS
   ===================================================================== */
document.getElementById("tabNav").addEventListener("click",(e)=>{
  const btn = e.target.closest(".tab-btn");
  if(!btn) return;
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById("tab-"+btn.dataset.tab).classList.add("active");
});

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
document.getElementById("modalOverlay").addEventListener("click",(e)=>{ if(e.target.id==="modalOverlay") closeModal(); });
document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeModal(); });

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
  // "Nome: Descrição" por linha -> [{name,desc}]
  return String(text||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{
    const idx = l.indexOf(":");
    if(idx===-1) return {name:l, desc:""};
    return {name:l.slice(0,idx).trim(), desc:l.slice(idx+1).trim()};
  });
}
function traitsToLines(traits){ return (traits||[]).map(t=>`${t.name}: ${t.desc}`).join("\n"); }

/* =====================================================================
   RAÇAS
   ===================================================================== */
function renderRacas(){
  const q = (document.getElementById("searchRacas").value||"").toLowerCase();
  const wrap = document.getElementById("gridRacas");
  const list = DATA.races.filter(r=>r.name.toLowerCase().includes(q) || (r.identity||"").toLowerCase().includes(q));
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma raça encontrada.", "openRaceForm()"); updateStats(); return; }
  wrap.innerHTML = list.map(r=>`
    <div class="card">
      <div class="card-top">
        <div class="card-title">${r.name}</div>
        <div class="card-tag ${r.custom?"tag-custom":""}">${r.custom?"Personalizada":"Base"}</div>
      </div>
      <div class="card-meta"><span>Bônus: <b>${r.bonus||"—"}</b></span></div>
      <div class="card-body">${r.identity||""}${r.appearance?`<br><span style="color:var(--text-faint)">${r.appearance}</span>`:""}</div>
      <ul class="trait-list">${(r.traits||[]).map(t=>`<li><b>${t.name}</b>${t.desc?": "+t.desc:""}</li>`).join("")}</ul>
      <div class="card-foot">
        <button class="btn btn-sm" onclick="openRaceForm('${r.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEntity('races','${r.id}','raça')">Remover</button>
      </div>
    </div>`).join("");
  updateStats();
}
function openRaceForm(id){
  const r = id ? DATA.races.find(x=>x.id===id) : null;
  const body = `<div class="form-grid">
    ${field("Nome","name",r?.name,{required:true})}
    ${field("Bônus Simples","bonus",r?.bonus)}
    ${field("Aparência / expectativa de vida","appearance",r?.appearance,{full:true})}
    ${field("Identidade","identity",r?.identity,{textarea:true,full:true})}
    ${field("Traços Marcantes","traits",traitsToLines(r?.traits),{textarea:true,full:true,hint:"Um traço por linha, no formato: Nome: Descrição"})}
  </div>`;
  openModal(id?"Editar raça":"Nova raça", body, (fd)=>{
    const obj = {
      id: id || uid("r"),
      name: fd.get("name").trim(),
      bonus: fd.get("bonus").trim(),
      appearance: fd.get("appearance").trim(),
      identity: fd.get("identity").trim(),
      traits: parseLines(fd.get("traits")),
      custom: id ? (r?.custom||false) : true
    };
    if(id){ const i = DATA.races.findIndex(x=>x.id===id); DATA.races[i]=obj; }
    else DATA.races.push(obj);
    persist(); closeModal(); renderRacas(); showToast(id?"Raça atualizada.":"Raça criada.");
  });
}

/* =====================================================================
   CLASSES
   ===================================================================== */
let classTypeFilter = "";
document.getElementById("filterClassType").addEventListener("click",(e)=>{
  const c = e.target.closest(".chip"); if(!c) return;
  document.querySelectorAll("#filterClassType .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active"); classTypeFilter = c.dataset.val; renderClasses();
});
function renderClasses(){
  const q = (document.getElementById("searchClasses").value||"").toLowerCase();
  const wrap = document.getElementById("gridClasses");
  let list = DATA.classes.filter(c=>c.name.toLowerCase().includes(q));
  if(classTypeFilter) list = list.filter(c=>c.type===classTypeFilter);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma classe encontrada.", "openClassForm()"); updateStats(); return; }
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
      <div class="card-foot">
        <button class="btn btn-sm" onclick="openClassForm('${c.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEntity('classes','${c.id}','classe')">Remover</button>
      </div>
    </div>`).join("");
  updateStats();
}
function featuresToLines(list){ return (list||[]).map(f=>`${f.name}: ${f.desc}`).join("\n"); }
function pathsToLines(list){ return (list||[]).map(p=>`${p.name} | ${p.focus} | ${p.areas}`).join("\n"); }
function parsePaths(text){
  return String(text||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{
    const parts = l.split("|").map(x=>x.trim());
    return {name:parts[0]||"", focus:parts[1]||"", areas:parts[2]||""};
  });
}
function openClassForm(id){
  const c = id ? DATA.classes.find(x=>x.id===id) : null;
  const body = `<div class="form-grid">
    ${field("Nome","name",c?.name,{required:true})}
    ${field("Tipo","type",c?.type||"Física",{select:["Física","Mágica"]})}
    ${field("Recurso principal","resource",c?.resource||"Prana",{select:["Prana","Mana"]})}
    ${field("Máximo do recurso","resourceMax",c?.resourceMax,{number:true})}
    ${field("Lucidez máxima inicial","lucidityMax",c?.lucidityMax||80,{number:true})}
    ${field("Atributos predominantes","attrs",c?.attrs,{full:true})}
    ${field("Identidade","identity",c?.identity,{textarea:true,full:true})}
    ${field("Características de Classe","features",featuresToLines(c?.features),{textarea:true,full:true,hint:"Uma por linha: Nome: Descrição"})}
    ${field("Impulso (nome)","impulseName",c?.impulse?.name)}
    ${field("Impulso (efeito)","impulseDesc",c?.impulse?.desc)}
    ${field("Caminhos","paths",pathsToLines(c?.paths),{textarea:true,full:true,hint:"Um por linha: Nome do Caminho | Foco | Áreas da árvore (separadas por vírgula)"})}
  </div>`;
  openModal(id?"Editar classe":"Nova classe", body, (fd)=>{
    const obj = {
      id: id || uid("c"),
      name: fd.get("name").trim(),
      type: fd.get("type"),
      resource: fd.get("resource"),
      resourceMax: Number(fd.get("resourceMax"))||0,
      lucidityMax: Number(fd.get("lucidityMax"))||80,
      attrs: fd.get("attrs").trim(),
      identity: fd.get("identity").trim(),
      features: parseLines(fd.get("features")),
      impulse: { name: fd.get("impulseName").trim(), desc: fd.get("impulseDesc").trim() },
      paths: parsePaths(fd.get("paths")),
      custom: id ? (c?.custom||false) : true
    };
    if(id){ const i = DATA.classes.findIndex(x=>x.id===id); DATA.classes[i]=obj; }
    else DATA.classes.push(obj);
    persist(); closeModal(); renderClasses(); populateClassSelects(); renderCharForms&&null; showToast(id?"Classe atualizada.":"Classe criada.");
  });
}

/* =====================================================================
   MAGIAS
   ===================================================================== */
function populateClassSelects(){
  const classNames = DATA.classes.filter(c=>c.type==="Mágica").map(c=>c.name);
  const allClassNames = DATA.classes.map(c=>c.name);
  const selMagia = document.getElementById("filterMagiaClasse");
  selMagia.innerHTML = `<option value="">Todas as classes</option>` + [...new Set([...classNames, ...DATA.spells.map(s=>s.class)])].map(n=>`<option value="${n}">${n}</option>`).join("");
  const selTec = document.getElementById("filterTecClasse");
  selTec.innerHTML = `<option value="">Todas as classes</option>` + [...new Set([...DATA.classes.filter(c=>c.type==="Física").map(c=>c.name), ...DATA.techniques.map(t=>t.class)])].map(n=>`<option value="${n}">${n}</option>`).join("");
}
function renderSpells(){
  const q = (document.getElementById("searchMagias").value||"").toLowerCase();
  const cls = document.getElementById("filterMagiaClasse").value;
  const wrap = document.getElementById("gridMagias");
  let list = DATA.spells.filter(s=>s.name.toLowerCase().includes(q));
  if(cls) list = list.filter(s=>s.class===cls);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma magia encontrada.", "openSpellForm()"); updateStats(); return; }
  wrap.innerHTML = list.map(s=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${s.name}</div><div class="card-tag tag-magica">Círculo ${s.circle}</div></div>
      <div class="card-meta"><span>Classe: <b>${s.class}</b></span><span>Nv. mín.: <b>${s.levelMin}</b></span></div>
      <div class="card-meta"><span>Custo: <b>${s.mana} Mana</b></span><span>Atributo: <b>${s.attr}</b></span><span>Alcance: <b>${s.range}</b></span></div>
      ${s.damage?`<div class="card-meta"><span>Dano: <b>${s.damage}</b></span></div>`:""}
      <div class="card-body">${s.effect||""}</div>
      <div class="card-foot">
        <button class="btn btn-sm" onclick="openSpellForm('${s.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEntity('spells','${s.id}','magia')">Remover</button>
      </div>
    </div>`).join("");
  updateStats();
}
function openSpellForm(id){
  const s = id ? DATA.spells.find(x=>x.id===id) : null;
  const classOptions = DATA.classes.map(c=>c.name);
  const body = `<div class="form-grid">
    ${field("Nome","name",s?.name,{required:true})}
    ${field("Classe","class",s?.class||classOptions[0],{select:classOptions})}
    ${field("Círculo (1-7)","circle",s?.circle||1,{number:true})}
    ${field("Nível mínimo","levelMin",s?.levelMin||1,{number:true})}
    ${field("Custo de Mana","mana",s?.mana||10,{number:true})}
    ${field("Atributo","attr",s?.attr)}
    ${field("Alcance","range",s?.range||"Perto",{select:["Melee","Muito Perto","Perto","Longe","Muito Longe"]})}
    ${field("Dano (opcional)","damage",s?.damage)}
    ${field("Efeito","effect",s?.effect,{textarea:true,full:true})}
  </div>`;
  openModal(id?"Editar magia":"Nova magia", body, (fd)=>{
    const obj = {
      id: id||uid("s"), name: fd.get("name").trim(), class: fd.get("class"),
      circle: Number(fd.get("circle"))||1, levelMin: Number(fd.get("levelMin"))||1,
      mana: Number(fd.get("mana"))||0, attr: fd.get("attr").trim(),
      range: fd.get("range"), damage: fd.get("damage").trim(), effect: fd.get("effect").trim()
    };
    if(id){ const i=DATA.spells.findIndex(x=>x.id===id); DATA.spells[i]=obj; } else DATA.spells.push(obj);
    persist(); closeModal(); populateClassSelects(); renderSpells(); showToast(id?"Magia atualizada.":"Magia criada.");
  });
}

/* =====================================================================
   TÉCNICAS
   ===================================================================== */
function renderTechs(){
  const q = (document.getElementById("searchTecnicas").value||"").toLowerCase();
  const cls = document.getElementById("filterTecClasse").value;
  const wrap = document.getElementById("gridTecnicas");
  let list = DATA.techniques.filter(t=>t.name.toLowerCase().includes(q));
  if(cls) list = list.filter(t=>t.class===cls);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhuma técnica encontrada.", "openTechForm()"); updateStats(); return; }
  wrap.innerHTML = list.map(t=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${t.name}</div><div class="card-tag tag-fisica">Grau ${t.grade}</div></div>
      <div class="card-meta"><span>Classe: <b>${t.class}</b></span><span>Nv. mín.: <b>${t.levelMin}</b></span></div>
      <div class="card-meta"><span>Custo: <b>${t.prana} Prana</b></span><span>Atributo: <b>${t.attr}</b></span><span>Tipo: <b>${t.type}</b></span></div>
      <div class="card-body">${t.effect||""}${t.tool?`<br><span style="color:var(--text-faint)">${t.tool}</span>`:""}</div>
      <div class="card-foot">
        <button class="btn btn-sm" onclick="openTechForm('${t.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEntity('techniques','${t.id}','técnica')">Remover</button>
      </div>
    </div>`).join("");
  updateStats();
}
function openTechForm(id){
  const t = id ? DATA.techniques.find(x=>x.id===id) : null;
  const classOptions = DATA.classes.map(c=>c.name);
  const body = `<div class="form-grid">
    ${field("Nome","name",t?.name,{required:true})}
    ${field("Classe","class",t?.class||classOptions[0],{select:classOptions})}
    ${field("Grau (1-7)","grade",t?.grade||1,{number:true})}
    ${field("Nível mínimo","levelMin",t?.levelMin||1,{number:true})}
    ${field("Custo de Prana","prana",t?.prana||5,{number:true})}
    ${field("Atributo","attr",t?.attr)}
    ${field("Tipo","type",t?.type||"Impacto",{select:["Impacto","Sequência","Defesa","Mobilidade","Resistência","Precisão","Utilidade"]})}
    ${field("Efeito","effect",t?.effect,{textarea:true,full:true})}
    ${field("Ferramenta recomendada","tool",t?.tool,{textarea:true,full:true})}
  </div>`;
  openModal(id?"Editar técnica":"Nova técnica", body, (fd)=>{
    const obj = {
      id: id||uid("t"), name: fd.get("name").trim(), class: fd.get("class"),
      grade: Number(fd.get("grade"))||1, levelMin: Number(fd.get("levelMin"))||1,
      prana: Number(fd.get("prana"))||0, attr: fd.get("attr").trim(), type: fd.get("type"),
      effect: fd.get("effect").trim(), tool: fd.get("tool").trim()
    };
    if(id){ const i=DATA.techniques.findIndex(x=>x.id===id); DATA.techniques[i]=obj; } else DATA.techniques.push(obj);
    persist(); closeModal(); populateClassSelects(); renderTechs(); showToast(id?"Técnica atualizada.":"Técnica criada.");
  });
}

/* =====================================================================
   ITENS / EQUIPAMENTOS
   ===================================================================== */
let itemCatFilter = "";
document.getElementById("filterItemCat").addEventListener("click",(e)=>{
  const c = e.target.closest(".chip"); if(!c) return;
  document.querySelectorAll("#filterItemCat .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active"); itemCatFilter = c.dataset.val; renderItems();
});
function renderItems(){
  const q = (document.getElementById("searchItens").value||"").toLowerCase();
  const wrap = document.getElementById("gridItens");
  let list = DATA.items.filter(i=>i.name.toLowerCase().includes(q));
  if(itemCatFilter) list = list.filter(i=>i.category===itemCatFilter);
  if(list.length===0){ wrap.innerHTML = emptyState("Nenhum item encontrado.", "openItemForm()"); updateStats(); return; }
  wrap.innerHTML = list.map(i=>`
    <div class="card">
      <div class="card-top"><div class="card-title">${i.name}</div><div class="card-tag">Tier ${i.tier}</div></div>
      <div class="card-meta"><span><b>${i.category}</b></span>
        ${i.attr?`<span>Traço: <b>${i.attr}</b></span>`:""}
        ${i.range?`<span>Alcance: <b>${i.range}</b></span>`:""}
      </div>
      ${i.damage?`<div class="card-meta"><span>Dano: <b>${i.damage} ${i.dtype||""}</b></span>${i.burden?`<span>Burden: <b>${i.burden}</b></span>`:""}</div>`:""}
      <div class="card-body">${i.desc||""}${i.feature?`<br><b style="color:var(--text)">Feature:</b> ${i.feature}`:""}</div>
      <div class="card-foot">
        <button class="btn btn-sm" onclick="openItemForm('${i.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEntity('items','${i.id}','item')">Remover</button>
      </div>
    </div>`).join("");
  updateStats();
}
function openItemForm(id){
  const i = id ? DATA.items.find(x=>x.id===id) : null;
  const body = `<div class="form-grid">
    ${field("Nome","name",i?.name,{required:true})}
    ${field("Categoria","category",i?.category||"Arma",{select:["Arma","Armadura","Ferramenta Mágica","Item Mágico","Consumível"]})}
    ${field("Tier (1-7)","tier",i?.tier||1,{number:true})}
    ${field("Traço/Atributo","attr",i?.attr)}
    ${field("Alcance","range",i?.range||"",{select:["","Melee","Muito Perto","Perto","Longe","Muito Longe"]})}
    ${field("Dado de Dano","damage",i?.damage)}
    ${field("Tipo de Dano","dtype",i?.dtype||"",{select:["","PHY","MAG"]})}
    ${field("Burden (mãos)","burden",i?.burden)}
    ${field("Feature","feature",i?.feature,{textarea:true,full:true})}
    ${field("Descrição","desc",i?.desc,{textarea:true,full:true})}
  </div>`;
  openModal(id?"Editar item":"Novo item", body, (fd)=>{
    const obj = {
      id: id||uid("i"), name: fd.get("name").trim(), category: fd.get("category"),
      tier: Number(fd.get("tier"))||1, attr: fd.get("attr").trim(), range: fd.get("range"),
      damage: fd.get("damage").trim(), dtype: fd.get("dtype"), burden: fd.get("burden").trim(),
      feature: fd.get("feature").trim(), desc: fd.get("desc").trim()
    };
    if(id){ const idx=DATA.items.findIndex(x=>x.id===id); DATA.items[idx]=obj; } else DATA.items.push(obj);
    persist(); closeModal(); renderItems(); showToast(id?"Item atualizado.":"Item criado.");
  });
}

/* =====================================================================
   PARTICULARIDADES
   ===================================================================== */
function particularityField(selected){
  const names = selected || [];
  const options = (DATA.particularities||[]).map(x=>`<label class="check-option"><input type="checkbox" name="particularities" value="${x.name}" ${names.includes(x.name)?"checked":""}> <span>${x.name}</span></label>`).join("");
  return `<div class="field full"><label>Particularidades</label><div class="check-grid">${options||'<span class="hint">Nenhuma particularidade cadastrada.</span>'}</div><div class="hint">Você pode selecionar várias. Elas representam características mecânicas do personagem, não apenas bônus de teste.</div></div>`;
}

function renderParticularidades(){
  const wrap=document.getElementById("gridParticularidades"); if(!wrap) return;
  const q=(document.getElementById("searchParticularidades")?.value||"").toLowerCase();
  const list=(DATA.particularities||[]).filter(x=>(x.name+" "+x.category+" "+x.description).toLowerCase().includes(q));
  if(!list.length){wrap.innerHTML=emptyState("Nenhuma particularidade encontrada.","openParticularidadeForm()");return;}
  wrap.innerHTML=list.map(x=>`<div class="card"><div class="card-top"><div><h3>${x.name}</h3><div class="sub">${x.category||"Geral"}</div></div><div class="card-actions"><button class="btn btn-sm" onclick="openParticularidadeForm('${x.id}')">Editar</button><button class="btn btn-sm btn-danger" onclick="deleteParticularidade('${x.id}')">Remover</button></div></div><p>${x.description||""}</p><div class="notes-box"><b>Efeito:</b> ${x.effect||"Não definido."}${x.trigger?`<br><br><b>Gatilho:</b> ${x.trigger}`:""}${x.limitation?`<br><br><b>Limitação:</b> ${x.limitation}`:""}${x.hyperfocus?`<br><br><b>Hiperfoco:</b> ${x.hyperfocus}`:""}${x.abstinence?`<br><br><b>Abstinência:</b> ${x.abstinence}`:""}</div></div>`).join("");
}
function openParticularidadeForm(id){
  const p=id?(DATA.particularities||[]).find(x=>x.id===id):null;
  const body=`<div class="form-grid">
    ${field("Nome","name",p?.name,{required:true,full:true})}
    ${field("Categoria","category",p?.category||"Geral")}
    ${field("Descrição","description",p?.description,{textarea:true,full:true})}
    ${field("Efeito","effect",p?.effect,{textarea:true,full:true})}
    ${field("Gatilho","trigger",p?.trigger,{textarea:true,full:true})}
    ${field("Limitação","limitation",p?.limitation,{textarea:true,full:true})}
    ${field("Hiperfoco / efeito adicional","hyperfocus",p?.hyperfocus,{textarea:true,full:true})}
    ${field("Abstinência / consequência adicional","abstinence",p?.abstinence,{textarea:true,full:true})}
  </div>`;
  openModal(id?"Editar particularidade":"Nova particularidade",body,fd=>{
    const obj={id:id||uid("pt"),name:fd.get("name").trim(),category:fd.get("category").trim()||"Geral",description:fd.get("description").trim(),effect:fd.get("effect").trim(),trigger:fd.get("trigger").trim(),limitation:fd.get("limitation").trim(),hyperfocus:fd.get("hyperfocus").trim(),abstinence:fd.get("abstinence").trim()};
    if(id){const i=DATA.particularities.findIndex(x=>x.id===id);DATA.particularities[i]=obj;}else DATA.particularities.push(obj);
    persist();closeModal();renderParticularidades();showToast(id?"Particularidade atualizada.":"Particularidade criada.");
  });
}
function deleteParticularidade(id){
  const p=(DATA.particularities||[]).find(x=>x.id===id); if(!p)return;
  if(!confirm(`Remover a particularidade "${p.name}"?`))return;
  DATA.particularities=DATA.particularities.filter(x=>x.id!==id);
  DATA.characters.forEach(c=>{c.particularities=(c.particularities||[]).filter(x=>x!==p.name);});
  persist();renderParticularidades();renderPersonagens();showToast("Particularidade removida.");
}

/* =====================================================================
   PERSONAGENS
   ===================================================================== */
let currentCharId = null;

function renderPersonagens(){
  const wrap = document.getElementById("gridPersonagens");
  document.getElementById("charSheetWrap").innerHTML = "";
  if(DATA.characters.length===0){ wrap.innerHTML = emptyState("Nenhum personagem criado ainda.", "openCharForm()"); updateStats(); return; }
  wrap.innerHTML = DATA.characters.map(p=>`
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

function openCharForm(id){
  const p = id ? DATA.characters.find(x=>x.id===id) : null;
  const raceOptions = DATA.races.map(r=>r.name);
  const classOptions = DATA.classes.map(c=>c.name);
  const body = `<div class="form-grid">
    ${field("Nome do personagem","name",p?.name,{required:true,full:true})}
    ${field("Raça","race",p?.race||raceOptions[0],{select:raceOptions})}
    ${field("Classe","class",p?.class||classOptions[0],{select:classOptions})}
    ${field("Caminho","path",p?.path)}
    ${field("Nível","level",p?.level||1,{number:true})}
    ${field("Força","forca",p?.attributes?.forca||0,{number:true})}
    ${field("Agilidade","agilidade",p?.attributes?.agilidade||0,{number:true})}
    ${field("Precisão","precisao",p?.attributes?.precisao||0,{number:true})}
    ${field("Instinto","instinto",p?.attributes?.instinto||0,{number:true})}
    ${field("Presença","presenca",p?.attributes?.presenca||0,{number:true})}
    ${field("Inteligência","inteligencia",p?.attributes?.inteligencia||0,{number:true})}
    ${field("Vida atual","vida",p?.vida,{number:true})}
    ${field("Vida máxima","vidaMax",p?.vidaMax,{number:true})}
    ${field("Recurso atual (Mana/Prana)","recurso",p?.recurso,{number:true})}
    ${field("Recurso máximo","recursoMax",p?.recursoMax,{number:true})}
    ${field("Lucidez atual","lucidez",p?.lucidez,{number:true})}
    ${field("Lucidez máxima","lucidezMax",p?.lucidezMax,{number:true})}
    ${field("Evasão","evasao",p?.evasao,{number:true})}
    ${field("Experiences","experiences",(p?.experiences||[]).join("\n"),{textarea:true,full:true,hint:"Uma por linha"})}
    ${particularityField(p?.particularities||[])}
    ${field("Equipamento (arma, armadura, itens)","equipment",p?.equipment,{textarea:true,full:true})}
    ${field("Traços / Características / Impulso","traits",p?.traits,{textarea:true,full:true})}
    ${field("Anotações da identidade / história","notes",p?.notes,{textarea:true,full:true})}
  </div>
  <div class="hint" style="margin-top:10px;">Dica: deixe Vida/Recurso/Lucidez em branco e clique em "Salvar" - depois use o botão "Recalcular por Raça/Classe" na ficha para preencher automaticamente.</div>`;
  openModal(id?"Editar personagem":"Novo personagem", body, (fd)=>{
    const obj = {
      id: id || uid("p"),
      name: fd.get("name").trim(), race: fd.get("race"), class: fd.get("class"),
      path: fd.get("path").trim(), level: Number(fd.get("level"))||1,
      attributes:{
        forca:Number(fd.get("forca"))||0, agilidade:Number(fd.get("agilidade"))||0, precisao:Number(fd.get("precisao"))||0,
        instinto:Number(fd.get("instinto"))||0, presenca:Number(fd.get("presenca"))||0, inteligencia:Number(fd.get("inteligencia"))||0
      },
      vida: numOrCalc(fd.get("vida")), vidaMax: numOrCalc(fd.get("vidaMax")),
      recurso: numOrCalc(fd.get("recurso")), recursoMax: numOrCalc(fd.get("recursoMax")),
      lucidez: numOrCalc(fd.get("lucidez")), lucidezMax: numOrCalc(fd.get("lucidezMax")),
      evasao: numOrCalc(fd.get("evasao")),
      experiences: String(fd.get("experiences")||"").split("\n").map(s=>s.trim()).filter(Boolean),
      particularities: fd.getAll("particularities"),
      equipment: fd.get("equipment").trim(),
      traits: fd.get("traits").trim(),
      notes: fd.get("notes").trim()
    };
    const cls = DATA.classes.find(c=>c.name===obj.class);
    obj.resourceName = cls?cls.resource:"Recurso";
    // preenche automaticamente o que ficou vazio
    autofillChar(obj, cls);
    if(id){ const i=DATA.characters.findIndex(x=>x.id===id); DATA.characters[i]=obj; } else DATA.characters.push(obj);
    persist(); closeModal(); renderPersonagens();
    if(id) viewChar(id); else viewChar(obj.id);
    showToast(id?"Personagem atualizado.":"Personagem criado.");
  });
}
function numOrCalc(v){ return (v===""||v===null||v===undefined) ? null : Number(v); }
function autofillChar(obj, cls){
  const isPhysical = cls ? cls.type==="Física" : true;
  if(obj.vidaMax===null) obj.vidaMax = isPhysical?7:6;
  if(obj.vida===null) obj.vida = obj.vidaMax;
  if(obj.recursoMax===null) obj.recursoMax = cls?cls.resourceMax:20;
  if(obj.recurso===null) obj.recurso = obj.recursoMax;
  if(obj.lucidezMax===null) obj.lucidezMax = cls?cls.lucidityMax:(isPhysical?80:100);
  if(obj.lucidez===null) obj.lucidez = obj.lucidezMax;
  if(obj.evasao===null) obj.evasao = 10 + (Number(obj.attributes.agilidade)||0);
}
function recalcChar(id){
  const p = DATA.characters.find(x=>x.id===id); if(!p) return;
  const cls = DATA.classes.find(c=>c.name===p.class);
  const isPhysical = cls ? cls.type==="Física" : true;
  p.vidaMax = isPhysical?7:6; p.vida = Math.min(p.vida??p.vidaMax, p.vidaMax);
  p.recursoMax = cls?cls.resourceMax:20; p.recurso = p.recursoMax;
  p.lucidezMax = cls?cls.lucidityMax:(isPhysical?80:100); p.lucidez = p.lucidezMax;
  p.evasao = 10 + (Number(p.attributes.agilidade)||0);
  p.resourceName = cls?cls.resource:"Recurso";
  persist(); viewChar(id); renderPersonagens(); showToast("Recursos recalculados a partir da Classe.");
}

function viewChar(id){
  currentCharId = id;
  const p = DATA.characters.find(x=>x.id===id); if(!p) return;
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
          <button class="btn btn-sm" onclick="openCharForm('${p.id}')">Editar</button>
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
            <div class="tag-row"><span class="tagpill">Evasão ${p.evasao}</span></div>
          </div>
          <div class="res-block"><h4>EXPERIENCES</h4>
            <div class="tag-row">${(p.experiences||[]).map(e=>`<span class="tagpill">${e}</span>`).join("")||'<span class="tagpill">—</span>'}</div>
          </div>
          <div class="res-block"><h4>PARTICULARIDADES</h4>
            <div class="tag-row">${(p.particularities||[]).map(name=>`<span class="tagpill">${name}</span>`).join("")||'<span class="tagpill">—</span>'}</div>
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
  DATA.characters = DATA.characters.filter(x=>x.id!==id);
  currentCharId=null;
  persist(); renderPersonagens();
  showToast("Personagem removido.");
}

/* =====================================================================
   UTILITÁRIOS COMUNS
   ===================================================================== */
function emptyState(msg, addFnCall){
  return `<div class="empty-state" style="grid-column:1/-1;">${msg}<br><button class="btn btn-primary" onclick="${addFnCall}">+ Adicionar</button></div>`;
}
function deleteEntity(collection, id, label){
  if(!confirm(`Remover ${label==="item"?"este":"esta"} ${label}? Essa ação não pode ser desfeita.`)) return;
  DATA[collection] = DATA[collection].filter(x=>x.id!==id);
  persist();
  const renderers = {races:renderRacas, classes:renderClasses, spells:renderSpells, techniques:renderTechs, items:renderItems};
  if(collection==="classes"){ populateClassSelects(); }
  renderers[collection]();
  showToast(label.charAt(0).toUpperCase()+label.slice(1)+" removida.");
}
function updateStats(){
  document.getElementById("statRacas").textContent = DATA.races.length;
  document.getElementById("statClasses").textContent = DATA.classes.length;
  document.getElementById("statMagias").textContent = DATA.spells.length;
  document.getElementById("statTecnicas").textContent = DATA.techniques.length;
  document.getElementById("statItens").textContent = DATA.items.length;
  document.getElementById("statPersonagens").textContent = DATA.characters.length;
}

/* =====================================================================
   REAÇÕES (render estático)
   ===================================================================== */
function renderReacoes(){
  const wrap=document.getElementById("gridReacoes"); if(!wrap) return;
  wrap.innerHTML=REACTIONS.map(r=>`
    <div class="card">
      <div class="card-top"><div><h3>${r.icon} ${r.name}</h3><div class="sub">${r.type}</div></div></div>
      <p><b>Gatilho:</b> ${r.trigger}</p>
      <div class="notes-box"><b>Efeito:</b> ${r.effect}${r.results.length?`<br><br>${r.results.map(x=>`<b>${x[0]}:</b> ${x[1]}`).join("<br>")}`:""}</div>
      ${r.interactions.length?`<div class="notes-box" style="margin-top:10px"><b>Interações:</b><ul style="margin:8px 0 0 18px">${r.interactions.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}
    </div>`).join("");
}

/* =====================================================================
   MECÂNICAS (render estático)
   ===================================================================== */
function renderMechanics(){
  const wrap = document.getElementById("mecanicasGrid");
  wrap.innerHTML = MECHANICS.map(m=>`
    <div class="ref-card">
      <h3>${m.title}</h3>
      ${m.body?`<p>${m.body}</p>`:""}
      ${m.table?`<table><tbody>${m.table.map(row=>`<tr><td class="k">${row[0]}</td><td>${row[1]}</td></tr>`).join("")}</tbody></table>`:""}
    </div>`).join("");
}

/* =====================================================================
   EXPORTAR / IMPORTAR / RESET
   ===================================================================== */
document.getElementById("btnExport").addEventListener("click",()=>{
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "brisa-e-lamentacoes-dados.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Dados exportados.");
});
document.getElementById("btnImport").addEventListener("click",()=>document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change",(e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result);
      DATA = Object.assign(structuredCloneSafe(DEFAULT_DATA), parsed);
      persist(); renderAll();
      showToast("Dados importados com sucesso.");
    }catch(err){ alert("Arquivo inválido: "+err.message); }
  };
  reader.readAsText(file);
  e.target.value = "";
});
document.getElementById("btnReset").addEventListener("click",()=>{
  if(!confirm("Isso vai apagar tudo que você editou/adicionou e restaurar o conteúdo original do livro. Personagens criados também serão perdidos. Continuar?")) return;
  DATA = structuredCloneSafe(DEFAULT_DATA);
  persist(); renderAll();
  showToast("Restaurado ao conteúdo original.");
});

/* =====================================================================
   INIT
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
renderAll();