(async()=>{
'use strict';

const E=globalThis.EasyFa;
const C=E.Config;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const permissionPatterns=host=>[`*://${host}/*`,`*://*.${host}/*`];
const validSmartHost=host=>!!host&&(host.includes('.')||host==='localhost');
const viewMeta={
  sites:['تنظیمات سایت‌ها','برای هر سرویس فونت، جهت و خوانایی را مستقل تنظیم کن.'],
  global:['تنظیمات کلی','یک پروفایل مرکزی بساز و آن را با کنترل کامل روی گروه‌های دلخواه اعمال کن.'],
  smart:['فونت‌سازی هوشمند','منوی راست‌کلیک Easy-fa و پیش‌فرض سایت‌ها و صفحه‌های جدید را مدیریت کن.'],
  custom:['سایت‌های اختصاصی','دامنه‌های دلخواه را جدا از سرویس‌های اصلی اضافه، ویرایش یا حذف کن.']
};
const siteGlyphs={
  kick:'K',youtube:'▶',youtubeLive:'●',twitch:'T',whatsapp:'W',telegram:'✈',discord:'D',
  chatgpt:'✦',gemini:'G',claude:'C',claudeCode:'⌘',gmail:'M',google:'G',github:'⌘'
};

let state=await E.Storage.load();
let active=state.active;
let activeView='sites';
let filter='';
let fontSignature='';
let saveTimer=0;

function setSaveState(mode='done',text='همه تغییرات خودکار ذخیره می‌شوند'){
  const el=$('#saveState');
  if(!el)return;
  el.classList.remove('saving','done');
  el.classList.add(mode);
  el.querySelector('span').textContent=text;
  clearTimeout(saveTimer);
  if(mode==='saving') saveTimer=setTimeout(()=>setSaveState('done'),900);
}
function saving(){setSaveState('saving','در حال ذخیره…')}
function saved(text='ذخیره شد'){setSaveState('done',text);clearTimeout(saveTimer);saveTimer=setTimeout(()=>setSaveState('done','همه تغییرات خودکار ذخیره می‌شوند'),1300)}

function applyTheme(){
  document.documentElement.dataset.theme=state.theme==='light'?'light':'dark';
  const b=$('#themeToggle');
  const light=state.theme==='light';
  b.textContent=light?'🌙 تم تیره':'☀️ تم روشن';
  b.setAttribute('aria-pressed',String(light));
}

function setView(view){
  activeView=viewMeta[view]?view:'sites';
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===activeView));
  $$('[data-view-panel]').forEach(p=>p.classList.toggle('active',p.dataset.viewPanel===activeView));
  $('#viewTitle').textContent=viewMeta[activeView][0];
  $('#viewSubtitle').textContent=viewMeta[activeView][1];
  if(activeView==='global')renderGlobalSettings();
  if(activeView==='smart')renderSmartSettings();
  if(activeView==='custom')renderCustomList();
  window.scrollTo({top:0,behavior:'smooth'});
}

function customId(){return String(active||'').startsWith('custom:')?active.slice(7):null}
function custom(){const id=customId();return id?state.customSites.find(x=>x.id===id):null}
function prof(){return custom()?.profile||state.profiles[active]}
function meta(){const c=custom();return c?{name:c.name||c.host,accent:c.profile.accent||'#22d3ee',custom:true,host:c.host}:C.platforms[active]}

async function ensureHostPermission(host){
  const origins=permissionPatterns(host);
  try{if(await chrome.permissions.contains({origins}))return true}catch{}
  try{return await chrome.permissions.request({origins})}catch{return false}
}

async function releaseHostIfUnused(host){
  state=await E.Storage.load();
  if(E.Storage.hostInUse(state,host))return;
  try{await chrome.permissions.remove({origins:permissionPatterns(host)})}catch{}
}

async function loadSystemFonts(){
  if(!chrome.fontSettings?.getFontList)return;
  try{
    const list=await new Promise((resolve,reject)=>chrome.fontSettings.getFontList(x=>chrome.runtime.lastError?reject(chrome.runtime.lastError):resolve(x||[])));
    const known=new Set(C.fonts.map(f=>f.id));
    for(const item of list){
      const name=String(item.displayName||item.fontId||'').trim();
      const id='system:'+encodeURIComponent(String(item.fontId||name));
      if(!name||known.has(id))continue;
      C.fonts.push({id,name:`${name} (System)`,family:`"${String(item.fontId||name).replace(/["\\]/g,'\\$&')}"`,system:true,dynamic:true,installed:true});
      known.add(id);
    }
  }catch(e){console.warn('Easy-Fa system font list unavailable',e)}
}

async function loadUiFont(){
  try{
    const f=await E.FontLoader.faceFor({fontId:'vazirmatn',fontWeight:500,fontSize:16,sizeScope:'all'},16);
    document.documentElement.style.setProperty('--easyfa-ui-font',`${f.family},Vazirmatn,Tahoma,system-ui,sans-serif`);
  }catch{
    document.documentElement.style.setProperty('--easyfa-ui-font','Vazirmatn,Tahoma,system-ui,sans-serif');
  }
}

async function persistActive(){state.active=active;await E.Storage.save(state)}
function seg(id,val){$$(`#${id} button`).forEach(b=>b.classList.toggle('active',b.dataset.value===val))}

async function updateSite(patch){
  saving();
  const id=customId();
  if(id){
    const p=await E.Storage.patchCustom(id,patch);
    const c=state.customSites.find(x=>x.id===id);
    if(c)c.profile=p;
  }else{
    state.profiles[active]=await E.Storage.patch(active,patch);
  }
  renderSite(false);
  if(Object.prototype.hasOwnProperty.call(patch,'enabled'))renderSites();
  if(Object.prototype.hasOwnProperty.call(patch,'fontId'))await renderFonts();
  saved();
}

async function localAvailable(f){
  if(f.installed||f.dynamic)return true;
  if(!f.local)return true;
  try{return document.fonts.check(`16px ${f.family}`)}catch{return false}
}

async function renderFonts(){
  const box=$('#fonts');
  if(!box)return;
  box.innerHTML='';
  const p=prof();
  if(!p)return;
  const q=filter.trim().toLowerCase();
  let count=0;
  for(const f of C.fonts){
    if(q&&!`${f.name} ${f.id}`.toLowerCase().includes(q))continue;
    const ok=await localAvailable(f);
    const b=document.createElement('button');
    b.type='button';
    b.className='font-card'+(p.fontId===f.id?' active':'')+(!ok?' local-missing':'');
    b.disabled=!ok;
    const title=document.createElement('b');title.textContent=f.name;
    const sample=document.createElement('span');sample.textContent='سلام دنیا · Hello 123';
    b.append(title,sample);
    if(ok){
      try{const face=await E.FontLoader.faceFor({...p,fontId:f.id,sizeScope:'all'},16);sample.style.fontFamily=`${face.family},Tahoma,sans-serif`}catch{}
      b.onclick=()=>updateSite({fontId:f.id,enabled:true});
    }
    box.appendChild(b);count++;
  }
  $('#fontCount').textContent=`${count} فونت`;
}

async function preview(){
  const p=prof();if(!p)return;
  document.documentElement.style.setProperty('--accent',p.accent||meta()?.accent||'#53fc18');
  for(const id of ['previewFa','previewEn']){
    const el=$('#'+id),orig='Inter,system-ui,sans-serif';
    try{const face=await E.FontLoader.faceFor(p,16);el.style.fontFamily=p.fontScope==='fa'?`${face.faFamily},${orig}`:`${face.family},${orig}`}catch{el.style.fontFamily=orig}
    if(p.sizeScope==='all'){el.style.fontSize=p.fontSize+'px';el.style.fontWeight=p.fontWeight;el.style.lineHeight=p.lineHeight}else{el.style.fontSize='16px';el.style.fontWeight=400;el.style.lineHeight=1.7}
    if(p.direction==='smart'){el.dir='auto';el.style.direction='';el.style.textAlign='start';el.style.unicodeBidi='plaintext'}
    else if(p.direction==='site'){el.removeAttribute('dir');el.style.direction='';el.style.textAlign='';el.style.unicodeBidi=''}
    else{el.dir=p.direction;el.style.direction=p.direction;el.style.textAlign=p.direction==='rtl'?'right':'left';el.style.unicodeBidi='isolate'}
  }
}

function buildSiteTab({id,name,accent,enabled,isCustom=false,host=''}){
  const b=document.createElement('button');
  b.type='button';
  b.className='site-tab'+(id===active?' active':'')+(isCustom?' custom-edit':'');
  b.title=host||name;
  b.style.setProperty('--site-accent',accent||'#22d3ee');

  const mark=document.createElement('span');
  mark.className='site-mark';
  mark.textContent=isCustom?'＋':(siteGlyphs[id]||String(name||'?').slice(0,1).toUpperCase());

  const copy=document.createElement('span');
  copy.className='site-tab-copy';
  const title=document.createElement('b');title.textContent=name;
  const sub=document.createElement('small');
  sub.textContent=isCustom?(host||'سایت اختصاصی'):(enabled?'فعال':'غیرفعال');
  copy.append(title,sub);

  const stateDot=document.createElement('span');
  stateDot.className='site-state-dot'+(enabled?' on':'');
  stateDot.setAttribute('aria-hidden','true');
  b.append(mark,copy,stateDot);
  return b;
}

function renderSites(){
  const nav=$('#sites');nav.innerHTML='';
  for(const [id,m] of Object.entries(C.platforms)){
    const p=state.profiles[id]||{};
    const b=buildSiteTab({id,name:m.name,accent:m.accent,enabled:!!p.enabled});
    b.onclick=async()=>{active=id;await persistActive();renderSite(true)};
    nav.appendChild(b);
  }
  const c=custom();
  if(c){
    const b=buildSiteTab({id:active,name:c.name||c.host,accent:c.profile?.accent||'#22d3ee',enabled:c.profile?.enabled!==false,isCustom:true,host:c.host});
    nav.appendChild(b);
  }
}

function renderChatgptOptions(p){const box=$('#chatgptOptions');box.hidden=active!=='chatgpt';if(!box.hidden)$('#chatgptSidebar').checked=p.sidebar!==false}
function renderYoutubeTargets(p){const box=$('#youtubeTargets');box.hidden=active!=='youtube';if(box.hidden)return;box.querySelectorAll('input[data-target]').forEach(i=>{i.checked=p.targets?.[i.dataset.target]!==false})}
function renderCustomAdvanced(p){
  const box=$('#customAdvanced'),c=custom();box.hidden=!c;if(!c)return;
  $('#customMode').value=p.customMode||'smart';
  if(document.activeElement!==$('#customMessageSelector'))$('#customMessageSelector').value=p.messageSelector||'';
  if(document.activeElement!==$('#customComposerSelector'))$('#customComposerSelector').value=p.composerSelector||'';
}

function renderSite(full=true){
  const p=prof(),m=meta();
  if(!p||!m){active='kick';state.active='kick';return renderSite(true)}
  $('#siteName').textContent=m.name;
  $('#siteDescription').textContent=m.custom?`تنظیمات اختصاصی برای ${m.host}`:'Easy-Fa را برای این سایت روشن یا خاموش کن.';
  $('#enabled').checked=p.enabled;
  $('#fontSize').value=p.fontSize;$('#fontSizeOut').value=p.fontSize+'px';
  $('#fontWeight').value=p.fontWeight;
  $('#lineHeight').value=p.lineHeight;$('#lineHeightOut').value=Number(p.lineHeight).toFixed(2);
  $('#composer').checked=p.composer;
  seg('directions',p.direction);seg('fontScope',p.fontScope);seg('sizeScope',p.sizeScope);
  renderChatgptOptions(p);renderYoutubeTargets(p);renderCustomAdvanced(p);
  if(full){renderSites();renderFonts()}
  preview();
}

function fillFontSelect(selectId){
  const sel=$(selectId);if(!sel)return;
  const sig=C.fonts.map(f=>f.id).join('|');
  if(fontSignature===sig&&sel.options.length)return;
  sel.innerHTML='';
  for(const f of C.fonts){const o=document.createElement('option');o.value=f.id;o.textContent=f.name;sel.appendChild(o)}
}
function fillFontSelects(){
  const sig=C.fonts.map(f=>f.id).join('|');
  if(sig!==fontSignature){fontSignature='';fillFontSelect('#globalFont');fontSignature='';fillFontSelect('#smartDefaultFont');fontSignature=sig}
  else{fillFontSelect('#globalFont');fillFontSelect('#smartDefaultFont')}
}

function renderGlobalSettings(){
  const p=state.globalDefaults||C.base('custom');
  fillFontSelects();
  seg('applyMode',state.applyMode||'instant');
  $('#globalFont').value=p.fontId;
  $('#globalDirection').value=p.direction;
  $('#globalFontScope').value=p.fontScope;
  $('#globalSizeScope').value=p.sizeScope;
  $('#globalFontSize').value=p.fontSize;$('#globalFontSizeOut').value=p.fontSize+'px';
  $('#globalWeight').value=p.fontWeight;
  $('#globalLineHeight').value=p.lineHeight;$('#globalLineHeightOut').value=Number(p.lineHeight).toFixed(2);
  $('#globalComposer').checked=!!p.composer;
  $('#builtinCount').textContent=Object.keys(C.platforms).length;
  $('#customCount').textContent=state.customSites.length;
  $('#smartCount').textContent=(state.smart?.sites?.length||0)+(state.smart?.pages?.length||0);
}

async function updateGlobalDefaults(patch){
  saving();state.globalDefaults=await E.Storage.patchGlobalDefaults(patch);renderGlobalSettings();saved();
}

function smartRuleRow(item,type){
  const row=document.createElement('div');row.className='rule-row';
  const info=document.createElement('div');info.className='rule-main';
  const title=document.createElement('b');title.textContent=item.name||item.host;
  const sub=document.createElement('span');sub.textContent=type==='page'?item.url:item.host;sub.title=sub.textContent;
  const tag=document.createElement('em');tag.className='rule-tag';tag.textContent=type==='page'?'صفحه':'سایت';
  const del=document.createElement('button');del.type='button';del.className='danger-btn';del.textContent='حذف';
  info.append(title,sub);row.append(info,tag,del);
  del.onclick=async()=>{
    saving();
    if(type==='page')state=await E.Storage.removeSmartPage(item.id);else state=await E.Storage.removeSmartSite(item.id);
    await releaseHostIfUnused(item.host);state=await E.Storage.load();renderSmartSettings();renderGlobalSettings();saved('Rule حذف شد');
  };
  return row;
}

function renderSmartActiveList(){
  const box=$('#smartActiveList');box.innerHTML='';
  for(const item of state.smart?.sites||[])box.appendChild(smartRuleRow(item,'site'));
  for(const item of state.smart?.pages||[])box.appendChild(smartRuleRow(item,'page'));
  const count=(state.smart?.sites?.length||0)+(state.smart?.pages?.length||0);
  $('#smartRuleCount').textContent=`${count} Rule`;
  if(!count){const empty=document.createElement('div');empty.className='empty-state';empty.textContent='هنوز سایتی با فونت‌سازی هوشمند فعال نشده. از راست‌کلیک یا کادر بالا استفاده کن.';box.appendChild(empty)}
}

function renderSmartSettings(){
  state.smart=state.smart||{enabled:false,defaults:C.base('custom'),sites:[],pages:[]};
  const p=state.smart.defaults;
  fillFontSelects();
  $('#smartEnabled').checked=!!state.smart.enabled;
  const status=$('#smartMenuStatus');status.textContent=state.smart.enabled?'فعال':'غیرفعال';status.className='status-pill '+(state.smart.enabled?'on':'off');
  $('#smartDefaultFont').value=p.fontId;
  $('#smartDefaultDirection').value=p.direction;
  $('#smartDefaultFontScope').value=p.fontScope;
  $('#smartDefaultSizeScope').value=p.sizeScope;
  $('#smartDefaultFontSize').value=p.fontSize;$('#smartDefaultFontSizeOut').value=p.fontSize+'px';
  $('#smartDefaultWeight').value=p.fontWeight;
  $('#smartDefaultLineHeight').value=p.lineHeight;$('#smartDefaultLineHeightOut').value=Number(p.lineHeight).toFixed(2);
  $('#smartDefaultComposer').checked=!!p.composer;
  renderSmartActiveList();
}

async function updateSmartDefaults(patch){
  saving();state.smart.defaults=await E.Storage.patchSmartDefaults(patch);renderSmartSettings();saved();
}

function renderCustomList(){
  const box=$('#customList');box.innerHTML='';
  $('#customListCount').textContent=`${state.customSites.length} سایت`;
  if(!state.customSites.length){const empty=document.createElement('div');empty.className='empty-state';empty.textContent='هنوز سایت اختصاصی اضافه نشده. دامنه را از کارت کناری اضافه کن.';box.appendChild(empty);return}
  for(const c of state.customSites){
    const row=document.createElement('div');row.className='custom-site-row';
    const info=document.createElement('div');info.className='custom-site-main';
    const title=document.createElement('b');title.textContent=c.name||c.host;
    const host=document.createElement('span');host.textContent=c.host;host.title=c.host;
    const actions=document.createElement('div');actions.className='row-actions';
    const edit=document.createElement('button');edit.type='button';edit.className='edit-btn';edit.textContent='ویرایش تنظیمات';
    const del=document.createElement('button');del.type='button';del.className='danger-btn';del.textContent='حذف';
    info.append(title,host);actions.append(edit,del);row.append(info,actions);box.appendChild(row);
    edit.onclick=async()=>{active='custom:'+c.id;await persistActive();setView('sites');renderSite(true)};
    del.onclick=async()=>{saving();state=await E.Storage.removeCustom(c.id);active=state.active;await releaseHostIfUnused(c.host);state=await E.Storage.load();renderCustomList();renderGlobalSettings();renderSite(true);saved('سایت اختصاصی حذف شد')};
  }
}

async function saveCustomSelector(input,key){
  if(!customId())return;
  const value=input.value.trim();
  try{if(value)document.querySelector(value)}catch{return alert('Selector معتبر نیست. لطفاً CSS selector درست وارد کن.')}
  await updateSite({[key]:value});
}

// Main navigation
$$('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#themeToggle').onclick=async()=>{saving();state.theme=state.theme==='light'?'dark':'light';await E.Storage.save(state);applyTheme();saved()};

// Per-site settings
$('#enabled').onchange=e=>updateSite({enabled:e.target.checked});
$('#fontSize').oninput=e=>updateSite({fontSize:+e.target.value});
$('#fontWeight').onchange=e=>updateSite({fontWeight:+e.target.value});
$('#lineHeight').oninput=e=>updateSite({lineHeight:+e.target.value});
$('#composer').onchange=e=>updateSite({composer:e.target.checked});
$('#chatgptSidebar').onchange=e=>{if(active==='chatgpt')updateSite({sidebar:e.target.checked})};
for(const id of ['directions','fontScope','sizeScope'])$('#'+id).onclick=e=>{const b=e.target.closest('button');if(!b)return;updateSite({[id==='directions'?'direction':id]:b.dataset.value})};
$('#fontSearch').oninput=e=>{filter=e.target.value;renderFonts()};
$('#youtubeTargets').onchange=e=>{const i=e.target.closest('input[data-target]');if(!i||active!=='youtube')return;const p=prof(),targets={...(p.targets||C.youtubeTargets()),[i.dataset.target]:i.checked};updateSite({targets})};
$('#customMode').onchange=e=>{if(customId())updateSite({customMode:e.target.value})};
for(const [id,key] of [['customMessageSelector','messageSelector'],['customComposerSelector','composerSelector']]){
  const input=$('#'+id);input.addEventListener('change',()=>saveCustomSelector(input,key));input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();input.blur()}});
}

// Global settings
$('#applyMode').onclick=async e=>{const b=e.target.closest('button');if(!b)return;saving();state.applyMode=b.dataset.value==='delayed'?'delayed':'instant';await E.Storage.save(state);seg('applyMode',state.applyMode);saved()};
$('#globalFont').onchange=e=>updateGlobalDefaults({fontId:e.target.value});
$('#globalDirection').onchange=e=>updateGlobalDefaults({direction:e.target.value});
$('#globalFontScope').onchange=e=>updateGlobalDefaults({fontScope:e.target.value});
$('#globalSizeScope').onchange=e=>updateGlobalDefaults({sizeScope:e.target.value});
$('#globalFontSize').oninput=e=>updateGlobalDefaults({fontSize:+e.target.value});
$('#globalWeight').onchange=e=>updateGlobalDefaults({fontWeight:+e.target.value});
$('#globalLineHeight').oninput=e=>updateGlobalDefaults({lineHeight:+e.target.value});
$('#globalComposer').onchange=e=>updateGlobalDefaults({composer:e.target.checked});
$('#applyGlobalSettings').onclick=async()=>{
  const builtin=$('#applyBuiltin').checked,custom=$('#applyCustom').checked,smart=$('#applySmart').checked;
  if(!builtin&&!custom&&!smart)return alert('حداقل یک گروه را برای اعمال تنظیمات انتخاب کن.');
  saving();state=await E.Storage.applyGlobalDefaults({builtin,custom,smart});active=state.active;renderSite(true);renderGlobalSettings();renderSmartSettings();renderCustomList();
  const labels=[builtin&&'سایت‌های اصلی',custom&&'سایت‌های اختصاصی',smart&&'Ruleهای هوشمند'].filter(Boolean).join('، ');
  $('#globalApplyResult').textContent=`اعمال شد روی: ${labels}`;saved('تنظیمات کلی اعمال شد');
  setTimeout(()=>{$('#globalApplyResult').textContent=''},3500);
};

// Smart settings / context menu
$('#smartEnabled').onchange=async e=>{saving();state.smart=await E.Storage.setSmartEnabled(e.target.checked);renderSmartSettings();saved(e.target.checked?'منوی راست‌کلیک فعال شد':'منوی راست‌کلیک غیرفعال شد')};
$('#smartDefaultFont').onchange=e=>updateSmartDefaults({fontId:e.target.value});
$('#smartDefaultDirection').onchange=e=>updateSmartDefaults({direction:e.target.value});
$('#smartDefaultFontScope').onchange=e=>updateSmartDefaults({fontScope:e.target.value});
$('#smartDefaultSizeScope').onchange=e=>updateSmartDefaults({sizeScope:e.target.value});
$('#smartDefaultFontSize').oninput=e=>updateSmartDefaults({fontSize:+e.target.value});
$('#smartDefaultWeight').onchange=e=>updateSmartDefaults({fontWeight:+e.target.value});
$('#smartDefaultLineHeight').oninput=e=>updateSmartDefaults({lineHeight:+e.target.value});
$('#smartDefaultComposer').onchange=e=>updateSmartDefaults({composer:e.target.checked});
$('#copyGlobalToSmart').onclick=async()=>{saving();state.smart.defaults=await E.Storage.copyGlobalToSmart();renderSmartSettings();saved('تنظیمات کلی به پیش‌فرض هوشمند کپی شد')};
$('#applySmartDefaultsExisting').onclick=async()=>{saving();state=await E.Storage.applySmartDefaultsToRules();renderSmartSettings();renderGlobalSettings();saved('پیش‌فرض روی Ruleهای فعال اعمال شد')};
$('#addSmartSite').onclick=async()=>{
  const host=E.Storage.cleanHost($('#smartHost').value);
  if(!validSmartHost(host))return alert('دامنه معتبر وارد کن؛ مثلا example.com');
  const granted=await ensureHostPermission(host);if(!granted)return alert('برای فعال شدن این سایت باید دسترسی همان دامنه را تأیید کنی.');
  saving();await E.Storage.addSmartSite({host,name:host,profile:state.smart.defaults});state=await E.Storage.load();$('#smartHost').value='';renderSmartSettings();renderGlobalSettings();saved('سایت به Ruleهای هوشمند اضافه شد');
};
$('#smartHost').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#addSmartSite').click()}});

// Custom sites – completely separate section
$('#addCustom').onclick=async()=>{
  const host=E.Storage.cleanHost($('#customHost').value),name=$('#customName').value.trim();
  if(!host||!host.includes('.'))return alert('دامنه معتبر وارد کن؛ مثلا example.com');
  const granted=await ensureHostPermission(host);if(!granted)return alert('برای فعال شدن سایت اختصاصی باید دسترسی همان دامنه را تأیید کنی.');
  saving();const item=await E.Storage.addCustom({host,name,profile:state.globalDefaults});state=await E.Storage.load();active='custom:'+item.id;$('#customHost').value='';$('#customName').value='';renderCustomList();renderGlobalSettings();saved('سایت اختصاصی اضافه شد');
};
$('#customHost').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#addCustom').click()}});

applyTheme();
await Promise.allSettled([loadSystemFonts(),loadUiFont()]);
state=await E.Storage.load();active=state.active;
renderSite(true);renderGlobalSettings();renderSmartSettings();renderCustomList();setView('sites');
})();
