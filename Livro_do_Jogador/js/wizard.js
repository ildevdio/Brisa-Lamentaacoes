/* =====================================================================
   Brisa e Lamentações - Assistente de Criação de Personagem (Wizard)
   Criação guiada em 7 etapas, inspirada no processo do Daggerheart.

   Etapas:
     1. Identidade      -> nome, nível
     2. Raça            -> cards selecionáveis + bônus
     3. Classe & Caminho-> cards + paths (+ features/impulse)
     4. Atributos       -> point-buy (pool) + bônus racial + perfil da classe
     5. Equipamento     -> arma, armadura, consumível (tier 1) por tipo
     6. Poderes         -> magias/técnicas da classe + particularidades + experiences
     7. Revisão         -> resumo + recursos calculados + salvar

   Dependências (definidas em app.js): mechRaces, mechClasses, mechItems,
     mechSpells, mechTechs, mechParticularities, MECH, PCS, savePcs,
     renderPersonagens, viewChar, closeModal, escapeHtml, uid, showToast,
     numOrCalc, autofillChar.
   ===================================================================== */

/* ---------- Constantes ---------- */
const ATTR_KEYS = ["forca","agilidade","precisao","instinto","presenca","inteligencia"];
const ATTR_LABELS = {forca:"Força",agilidade:"Agilidade",precisao:"Precisão",instinto:"Instinto",presenca:"Presença",inteligencia:"Inteligência"};
const POOL_TOTAL = 15;   // pontos livres para distribuir

function wizardState(existing){
  return {
    editing: !!existing,
    id: existing ? existing.id : null,
    name: existing ? (existing.name||"") : "",
    level: existing ? (existing.level||1) : 1,
    race:  existing ? (existing.race||"") : "",
    cls:   existing ? (existing.class||"") : "",
    path:  existing ? (existing.path||"") : "",
    attrs: {forca:0,agilidade:0,precisao:0,instinto:0,presenca:0,inteligencia:0},
    weapon:   existing ? "" : "",
    armor:    existing ? "" : "",
    consumable: existing ? "" : "",
    spells:       existing ? (existing.spells||[]) : [],
    techs:        existing ? (existing.techs||[]) : [],
    particularities: existing ? (existing.particularities||[]) : [],
    experiences:  existing ? (existing.experiences||[]) : [],
    step: 0
  };
}

/* =====================================================================
   ABERTURA
   ===================================================================== */
function openCharWizard(id){
  const existing = id ? PCS.find(x=>x.id===id) : null;
  const W = window.__wz = wizardState(existing);
  if(existing){
    W.name = existing.name||"";
    W.level = existing.level||1;
    W.race = existing.race||"";
    W.cls = existing.class||"";
    W.path = existing.path||"";
    W.attrs = {forca:existing.attributes.forca||0,agilidade:existing.attributes.agilidade||0,
      precisao:existing.attributes.precisao||0,instinto:existing.attributes.instinto||0,
      presenca:existing.attributes.presenca||0,inteligencia:existing.attributes.inteligencia||0};
    W.experiences = existing.experiences||[];
    W.spells = existing.spells||[];
    W.techs = existing.techs||[];
    W.particularities = existing.particularities||[];
    const equip = existing.equipment||"";
    if(equip && !equip.includes("\n")){
      const parts = equip.split(",").map(s=>s.trim()).filter(Boolean);
      W.weapon = parts[0]||""; W.armor = parts[1]||""; W.consumable = parts[2]||"";
    }
  }
  renderWizard();
}

/* ---------- Helpers de dados ---------- */
function raceFor(n){ return mechRaces().find(r=>r.name===n)||null; }
function classFor(n){ return mechClasses().find(c=>c.name===n)||null; }
function hasDownOrCustom(r){ return /à escolha|definido na criação/i.test(r.bonus||""); }

// Raça com bônus FIXO ("+1 Força") -> retorna a chave do atributo bonificado.
function fixedRaceBonusKey(raceName){
  const r=raceFor(raceName); if(!r||hasDownOrCustom(r)||/ou/i.test(r.bonus||"")) return null;
  const map={forca:"Força",agilidade:"Agilidade",precisao:"Precisão",instinto:"Instinto",presenca:"Presença",inteligencia:"Inteligência"};
  return ATTR_KEYS.find(k=>r.bonus.includes(map[k]))||null;
}
// Raça com escolha (="ou" ou "à escolha") -> concede 1 ponto livre no pool.
function raceFreePoints(raceName){
  const r=raceFor(raceName); if(!r) return 0;
  return (hasDownOrCustom(r)||/ou/i.test(r.bonus||"")) ? 1 : 0;
}
function classAttrKeys(clsName){
  const c = classFor(clsName); if(!c) return [];
  const map = {forca:"Força",agilidade:"Agilidade",precisao:"Precisão",instinto:"Instinto",presenca:"Presença",inteligencia:"Inteligência"};
  const raw = c.attrs||"";
  return [...new Set(ATTR_KEYS.filter(k=>raw.includes(map[k])))];
}
function guideFor(clsName){
  const c = classFor(clsName);
  return {
    primary: classAttrKeys(clsName),
    resource: c?c.resource:"Recurso",
    resourceMax: c?c.resourceMax:20,
    lucidityMax: c?c.lucidityMax:80,
    isPhysical: c?c.type==="Física":true
  };
}
function availableSpells(clsName){ return mechSpells().filter(s=>!s.class || s.class===clsName); }
function availableTechs(clsName){ return mechTechs().filter(t=>!t.class || t.class===clsName); }
function powerMaxFor(key){ return key==="spells"?2:(key==="techs"?3:99); }

// Pool = 15 + pontos livres da raça ("ou"/"à escolha"). O bônus fixo (+1 num
// atributo) vira piso grátis e não consome pontos do pool.
function poolRemaining(W){
  const freePts = raceFreePoints(W.race);
  const fixedKey = fixedRaceBonusKey(W.race) ? 1 : 0;
  const assigned = Object.values(W.attrs).reduce((a,b)=>a+(Number(b)||0),0);
  return (POOL_TOTAL + freePts) - (assigned - fixedKey);
}
// Piso de um atributo = 1 se a raça tem bônus fixo nesse atributo (grátis), senão 0.
function attrFloor(W,key){
  return fixedRaceBonusKey(W.race)===key ? 1 : 0;
}

/* =====================================================================
   RENDER PRINCIPAL
   ===================================================================== */
function renderWizard(){
  const W = window.__wz;
  const overlay = document.getElementById("modalOverlay");
  const box = document.getElementById("modalBox");
  const title = W.editing ? "Editar personagem" : "Criar personagem";
  const steps = ["Identidade","Raça","Classe","Atributos","Equipamento","Poderes","Revisão"];

  const progress = steps.map((s,i)=>`
    <button class="wz-step ${i<W.step?'done':''} ${i===W.step?'active':''}" ${i<W.step?'':'disabled'} data-step="${i}">
      <span class="wz-step-num">${i+1}</span><span class="wz-step-label">${s}</span>
    </button>`).join("");

  box.innerHTML = `
    <div class="modal-head">
      <h2>${escapeHtml(title)}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="wz-progress">${progress}</div>
    <div class="wz-body">${wzStepHTML(W.step)}</div>
    <div class="modal-foot wz-foot">
      <div class="wz-foot-left">
        ${W.step>0?`<button type="button" class="btn btn-ghost" onclick="wzNav(${W.step-1})">← Voltar</button>`:""}
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      </div>
      <div class="wz-foot-right">
        ${W.step<6?`<button type="button" class="btn btn-primary" onclick="wzNext()">Continuar →</button>`
                  :`<button type="button" class="btn btn-primary" onclick="wzSave()">${W.editing?"Salvar alterações":"Criar personagem"}</button>`}
      </div>
    </div>`;
  overlay.classList.remove("hidden");
}

function wzStepHTML(i){
  switch(i){
    case 0: return stepIdentity();
    case 1: return stepRace();
    case 2: return stepClass();
    case 3: return stepAttributes();
    case 4: return stepEquipment();
    case 5: return stepPowers();
    case 6: return stepReview();
  }
}

/* =====================================================================
   ETAPA 1 - IDENTIDADE
   ===================================================================== */
function stepIdentity(){
  const W = window.__wz;
  return `<div class="wz-page">
    <p class="wz-intro">Comece pelo básico: quem é esse personagem e em qual nível começa.</p>
    <div class="form-grid">
      <div class="field full"><label>Nome do personagem</label>
        <input class="input" id="wz_name" value="${escapeHtml(W.name)}" placeholder="Ex.: Kira Stormwind"></div>
      <div class="field"><label>Nível inicial</label>
        <input class="input" type="number" id="wz_level" min="1" max="20" value="${W.level}"></div>
    </div>
    ${!W.editing?`<div class="hint">Nas próximas etapas você escolhe raça, classe, atributos, equipamento e poderes.</div>`:""}
  </div>`;
}

/* =====================================================================
   ETAPA 2 - RAÇA
   ===================================================================== */
function stepRace(){
  const W = window.__wz;
  const cards = mechRaces().map(r=>{
    const sel = r.name===W.race?' selected':'';
    return `<div class="wz-card ${sel}" onclick="wzPickRace('${escapeHtml(r.name)}')" data-name="${escapeHtml(r.name)}">
      <div class="wz-card-top"><b>${escapeHtml(r.name)}</b><span class="tagpill">${escapeHtml(r.bonus||"")}</span></div>
      <p class="wz-card-desc">${escapeHtml(r.identity||"")}</p>
    </div>`;
  }).join("");
  return `<div class="wz-page">
    <p class="wz-intro">Escolha sua <b>Raça</b>. Ela define sua origem, bônus de atributos e traços marcantes.</p>
    <div class="wz-choose-list">${cards||emptyState("Nenhuma raça carregada.")}</div>
  </div>`;
}

/* =====================================================================
   ETAPA 3 - CLASSE & CAMINHO
   ===================================================================== */
function stepClass(){
  const W = window.__wz;
  const cards = mechClasses().map(c=>{
    const sel = c.name===W.cls?' selected':'';
    const feats = (c.features||[]).map(f=>`<div class="wz-feat"><b>${escapeHtml(f.name)}</b> — ${escapeHtml(f.desc)}</div>`).join("");
    const paths = c.paths&&c.paths.length ? c.paths.map(p=>{
        const ps = p.name===W.path?' selected':'';
        return `<button type="button" class="wz-path ${ps}" onclick="wzPickPath('${escapeHtml(p.name)}')" data-path="${escapeHtml(p.name)}">
          <b>${escapeHtml(p.name)}</b><span>${escapeHtml(p.focus||"")}</span></button>`;
      }).join("")
      : '<span class="hint">—</span>';
    return `<div class="wz-card ${sel}" onclick="wzPickClass('${escapeHtml(c.name)}')" data-name="${escapeHtml(c.name)}">
      <div class="wz-card-top"><b>${escapeHtml(c.name)}</b>
        <span class="tagpill ${c.type==='Física'?'tag-fisica':'tag-magica'}">${escapeHtml(c.type)}</span></div>
      <p class="wz-card-desc">${escapeHtml(c.identity||"")}</p>
      <div class="wz-attr-hint"><b>Atributos:</b> ${escapeHtml(c.attrs||"—")}</div>
      ${feats?`<div class="wz-feats">${feats}</div>`:""}
      ${c.impulse?`<div class="wz-impulse"><b>Impulso:</b> ${escapeHtml(c.impulse.name)} — ${escapeHtml(c.impulse.desc)}</div>`:""}
      <div class="wz-path-wrap"><div class="wz-path-title">Caminho</div>${paths}</div>
    </div>`;
  }).join("");
  return `<div class="wz-page">
    <p class="wz-intro">Escolha sua <b>Classe</b> e o <b>Caminho</b> que define seu estilo de jogo.</p>
    <div class="wz-choose-list">${cards||emptyState("Nenhuma classe carregada.")}</div>
  </div>`;
}

/* =====================================================================
   ETAPA 4 - ATRIBUTOS (point-buy)
   ===================================================================== */
function stepAttributes(){
  const W = window.__wz;
  const fixedKey = fixedRaceBonusKey(W.race);
  const freePts = raceFreePoints(W.race);
  const primary = guideFor(W.cls).primary;
  const pool = poolRemaining(W);
  const poolCls = pool<0?'neg':'';

  const rows = ATTR_KEYS.map(k=>{
    const val = W.attrs[k]||0;
    const isRace = fixedKey===k;
    const isPrimary = primary.includes(k);
    return `<div class="wz-attr-row">
      <div class="wz-attr-label">
        <b>${ATTR_LABELS[k]}</b>
        ${isPrimary?'<span class="tagpill" style="border-color:var(--brisa-dim);color:var(--brisa)">perfil</span>':''}
        ${isRace?'<span class="tagpill">raça</span>':''}
      </div>
      <div class="wz-attr-stepper">
        <button type="button" class="btn btn-sm" onclick="wzAttr('${k}',-1)">−</button>
        <span class="wz-attr-val">${val>=0?"+":""}${val}</span>
        <button type="button" class="btn btn-sm" onclick="wzAttr('${k}',1)">+</button>
      </div>
    </div>`;
  }).join("");

  const totPool = POOL_TOTAL + freePts;
  return `<div class="wz-page">
    <p class="wz-intro">Distribua <b>${totPool} pontos</b> livremente. ${fixedKey?'O +1 fixo da raça em <b>'+ATTR_LABELS[fixedKey]+'</b> já está aplicado.':''} O perfil da sua classe é só uma sugestão.</p>
    <div class="wz-attr-pool"><b>Pontos restantes:</b> <span class="pool-num ${poolCls}">${pool===0?"0":pool}</span></div>
    ${pool<0?`<div class="hint" style="color:var(--fear)">Você excedeu o limite — reduza um atributo.</div>`:""}
    <div class="wz-attr-list">${rows}</div>
    <div class="hint" style="margin-top:8px;"><b>Raça:</b> ${raceFor(W.race)?escapeHtml(raceFor(W.race).bonus||""):"escolha-a na etapa anterior"}${freePts? " (ponto livre já somado ao total)":""}</div>
    <div class="hint" style="margin-top:4px;"><b>Classe (perfil):</b> ${classFor(W.cls)?escapeHtml(classFor(W.cls).attrs||""):"escolha-a na etapa anterior"}</div>
  </div>`;
}

/* =====================================================================
   ETAPA 5 - EQUIPAMENTO
   ===================================================================== */
function stepEquipment(){
  const W = window.__wz;
  const groups = {
    weapon: {label:"Arma inicial",   list: mechItems().filter(i=>i.category==="Arma")},
    armor:  {label:"Armadura inicial", list: mechItems().filter(i=>i.category==="Armadura")},
    consumable:{label:"Consumível",  list: mechItems().filter(i=>i.category==="Consumível")}
  };
  const picks = Object.entries(groups).map(([key,g])=>{
    const opts = g.list.map(it=>`<option value="${escapeHtml(it.name)}" ${it.name===W[key]?'selected':''}>${escapeHtml(it.name)}${it.tier?` (T${it.tier})`:""} — ${escapeHtml(it.desc||"")}</option>`).join("");
    return `<div class="field full"><label>${g.label}</label>
      <select class="input" onchange="wzSetEquip('${key}',this.value)">
        <option value="">— Nenhum —</option>${opts}
      </select></div>`;
  }).join("");
  return `<div class="wz-page">
    <p class="wz-intro">Escolha o equipamento inicial. Armas usam o atributo indicado; armaduras alteram a Evasão e a proteção.</p>
    <div class="form-grid">${picks}</div>
    <div class="hint" style="margin-top:8px;">Itens de Tier 1 são os disponíveis para um personagem de nível 1.</div>
  </div>`;
}

/* =====================================================================
   ETAPA 6 - PODERES
   ===================================================================== */
function stepPowers(){
  const W = window.__wz;
  const isMagical = !guideFor(W.cls).isPhysical;
  const key = isMagical ? "spells" : "techs";
  const label = isMagical ? "Magias" : "Técnicas";
  const list = isMagical ? availableSpells(W.cls) : availableTechs(W.cls);
  const max = powerMaxFor(key);

  const picks = list.map(p=>{
    const on = W[key].includes(p.name);
    return `<button type="button" class="wz-pick ${on?'selected':''}" onclick="wzToggle('${key}','${escapeHtml(p.name)}')">
      <b>${escapeHtml(p.name)}</b>
      ${p.mana?`<span class="tagpill">${p.mana} Mana</span>`:""}
      ${p.prana?`<span class="tagpill">${p.prana} Prana</span>`:""}
      ${p.circle?`<span class="tagpill">Círculo ${p.circle}</span>`:""}
      ${p.grade?`<span class="tagpill">Grau ${p.grade}</span>`:""}
      <span class="wz-pick-desc">${escapeHtml(p.effect||p.desc||"")}</span>
    </button>`;
  }).join("");

  const partic = mechParticularities().map(p=>{
    const on = W.particularities.includes(p.name);
    return `<button type="button" class="wz-pick ${on?'selected':''}" onclick="wzToggle('particularities','${escapeHtml(p.name)}')">
      <b>${escapeHtml(p.name)}</b><span class="wz-pick-desc">${escapeHtml(p.description||p.desc||"")}</span></button>`;
  }).join("");

  return `<div class="wz-page">
    <p class="wz-intro">Selecione os poderes iniciais e defina as <b>Experiences</b> (frases formativas).</p>
    ${list.length?`<div class="wz-section"><h4>${label} da sua ${escapeHtml(W.cls)}</h4>
      <p class="hint">Escolha até ${max}.</p><div class="wz-pick-list">${picks}</div></div>`:""}
    <div class="wz-section"><h4>Particularidades</h4>
      <div class="wz-pick-list">${partic||'<span class="hint">Nenhuma particularidade carregada.</span>'}</div></div>
    <div class="wz-section"><h4>Experiences</h4>
      <p class="hint">Uma por linha. Frases formativas que se tornam bônus em rolagens. Fonte de experiência adicional para Humanos.</p>
      <textarea class="input" id="wz_experiences" style="min-height:84px" oninput="wzCaptureExperiences()">${escapeHtml(W.experiences.join("\n"))}</textarea></div>
  </div>`;
}

/* =====================================================================
   ETAPA 7 - REVISÃO
   ===================================================================== */
function stepReview(){
  const W = window.__wz;
  const g = guideFor(W.cls);
  const vidaMax = g.isPhysical?7:6;
  const evasao = 10 + (Number(W.attrs.agilidade)||0);
  const attrRows = ATTR_KEYS.map(k=>`${ATTR_LABELS[k]}: ${W.attrs[k]>=0?"+":""}${W.attrs[k]}`).join(" · ");
  const equip = [W.weapon,W.armor,W.consumable].filter(Boolean).join(", ") || "—";
  const powers = W.spells.concat(W.techs);

  return `<div class="wz-page">
    <p class="wz-intro">Revise seu personagem antes de salvar.</p>
    <div class="wz-review">
      <div class="wz-review-row"><b>Nome</b><span>${escapeHtml(W.name||"—")}</span></div>
      <div class="wz-review-row"><b>Nível</b><span>${W.level}</span></div>
      <div class="wz-review-row"><b>Raça</b><span>${escapeHtml(W.race||"—")}</span></div>
      <div class="wz-review-row"><b>Classe</b><span>${escapeHtml(W.cls||"—")}${W.path?" · "+escapeHtml(W.path):""}</span></div>
      <div class="wz-review-row"><b>Atributos</b><span>${attrRows}</span></div>
      <div class="wz-review-row"><b>Recursos</b><span>Vida ${vidaMax} · ${escapeHtml(g.resource)} ${g.resourceMax} · Lucidez ${g.lucidezMax} · Evasão ${evasao}</span></div>
      <div class="wz-review-row"><b>Equipamento</b><span>${escapeHtml(equip)}</span></div>
      <div class="wz-review-row"><b>Poderes</b><span>${escapeHtml(powers.join(", ")||"—")}</span></div>
      <div class="wz-review-row"><b>Particularidades</b><span>${escapeHtml(W.particularities.join(", ")||"—")}</span></div>
      <div class="wz-review-row"><b>Experiences</b><span>${escapeHtml(W.experiences.join("; ")||"—")}</span></div>
    </div>
  </div>`;
}

/* =====================================================================
   NAVEGAÇÃO E AÇÕES
   ===================================================================== */
function wzCaptureIdentity(){
  const W=window.__wz;
  const n=document.getElementById("wz_name");  if(n) W.name=n.value.trim();
  const l=document.getElementById("wz_level"); if(l) W.level=Math.max(1,Number(l.value)||1);
}
function wzCaptureExperiences(){
  const e=document.getElementById("wz_experiences");
  if(e && window.__wz) window.__wz.experiences = String(e.value||"").split("\n").map(s=>s.trim()).filter(Boolean);
}
function wzToggle(key,name){
  const W=window.__wz;
  const arr=W[key];
  const max=powerMaxFor(key);
  if(arr.includes(name)){ W[key]=arr.filter(x=>x!==name); }
  else{
    if(key!=="particularities" && arr.length>=max){ showToast("Limite de "+max+" atingido."); return; }
    W[key]=arr.concat([name]);
  }
  // re-render mantendo experiences
  renderWizard();
}
function wzNav(i){
  const W=window.__wz; wzCaptureIdentity(); wzCaptureExperiences();
  W.step=Math.max(0,Math.min(6,i));
  renderWizard();
}
function wzNext(){
  const W=window.__wz; wzCaptureIdentity(); wzCaptureExperiences();
  let msg="";
  if(W.step===1 && !W.race) msg="Escolha uma raça.";
  if(W.step===2 && !W.cls) msg="Escolha uma classe.";
  if(W.step===3 && poolRemaining(W)!==0) msg="Distribua todos os "+POOL_TOTAL+" pontos.";
  if(msg){ showToast(msg); return; }
  W.step++;
  renderWizard();
}

/* ---------- Seleção Raça/Classe/Caminho ---------- */
function wzPickRace(name){
  const W=window.__wz; W.race=name;
  document.querySelectorAll("#modalBox .wz-card").forEach(c=>c.classList.toggle('selected',c.dataset.name===name));
}
function wzPickClass(name){
  const W=window.__wz; if(W.cls!==name){ W.cls=name; W.path=""; }
  document.querySelectorAll("#modalBox .wz-card").forEach(c=>c.classList.toggle('selected',c.dataset.name===name));
}
function wzPickPath(name){
  const W=window.__wz; W.path=name;
  document.querySelectorAll("#modalBox .wz-path").forEach(p=>p.classList.toggle('selected',p.dataset.path===name));
}

/* ---------- Atributos ---------- */
function wzAttr(key,delta){
  const W=window.__wz;
  const floor=attrFloor(W,key);
  let v=(W.attrs[key]||0);
  v=Math.max(floor,Math.min(10,v+delta));
  W.attrs[key]=v;
  renderWizard();
}

/* ---------- Equipamento ---------- */
function wzSetEquip(key,val){ window.__wz[key]=val; }

/* =====================================================================
   SALVAR
   ===================================================================== */
function wzSave(){
  const W=window.__wz; wzCaptureIdentity(); wzCaptureExperiences();
  if(!W.name.trim()){ showToast("Informe o nome do personagem."); wzNav(0); return; }
  if(!W.race){ showToast("Escolha uma raça."); wzNav(1); return; }
  if(!W.cls){ showToast("Escolha uma classe."); wzNav(2); return; }
  if(poolRemaining(W)!==0){ showToast("Distribua todos os "+POOL_TOTAL+" pontos de atributos."); wzNav(3); return; }
  if(!W.path) W.path="";

  const g=guideFor(W.cls);
  const isPhysical=g.isPhysical;
  const vidaMax=7;
  const rMax=W.cls? g.resourceMax :20;
  const lucMax=g.lucidityMax;
  const evasao=10+(Number(W.attrs.agilidade)||0);

  const obj={
    id: W.id||uid("p"),
    name:W.name.trim(), race:W.race, class:W.cls, path:W.path, level:W.level,
    attributes:{forca:W.attrs.forca,agilidade:W.attrs.agilidade,precisao:W.attrs.precisao,
      instinto:W.attrs.instinto,presenca:W.attrs.presenca,inteligencia:W.attrs.inteligencia},
    vida:null, vidaMax:null, recurso:null, recursoMax:null, lucidez:null, lucidezMax:null,
    evasao:evasao,
    experiences:W.experiences,
    particularities:W.particularities,
    spells:W.spells, techs:W.techs,
    equipment:[W.weapon,W.armor,W.consumable].filter(Boolean).join(", "),
    traits:"", notes:"",
    mecBaseline: MECH?MECH.version:null
  };

  // Auto-cálculo de recursos usando a classe (mesma regra de autofillChar/recalcChar).
  const cls=classFor(W.cls);
  obj.vida= vidaMax; obj.vidaMax= vidaMax;
  obj.recurso= rMax; obj.recursoMax= rMax;
  obj.lucidez= lucMax; obj.lucidezMax= lucMax;
  obj.resourceName= cls?cls.resource:"Recurso";

  // Monta traits a partir de features/impulso do caminho e classe, p/ exibir na ficha.
  const traitLines=[];
  if(cls){ (cls.features||[]).forEach(f=>traitLines.push(f.name+": "+f.desc)); if(cls.impulse) traitLines.push("Impulso — "+cls.impulse.name+": "+cls.impulse.desc); }
  const pathObj= cls.paths.find(p=>p.name===W.path); if(pathObj) traitLines.push("Caminho: "+pathObj.name+" ("+pathObj.focus+")");
  obj.traits= traitLines.join("\n");

  if(W.editing){ const i=PCS.findIndex(x=>x.id===W.id); if(i>=0) PCS[i]=obj; }
  else PCS.push(obj);
  savePcs(); closeModal(); renderPersonagens();
  viewChar(obj.id);
  showToast(W.editing?"Personagem atualizado.":"Personagem criado.");
}