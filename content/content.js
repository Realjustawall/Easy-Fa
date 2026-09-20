(() => {
'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{};
let originals=new WeakMap(),applied=new WeakMap();
let state=null,pid=null,current=null,observer=null,observedRoot=null,rootHostObserver=null,sidebarObserver=null,observedSidebarRoot=null,sidebarPoll=null,healthTimer=null,epoch=0,fullQueued=false,incrementalQueued=false,sidebarQueued=false,watching=false,lastPageUrl='';
const pendingRoots=new Set();
const VARS=['--easyfa-font-family','--easyfa-font-size','--easyfa-font-weight','--easyfa-line-height'];
const RICH_PLATFORMS=new Set(['chatgpt','gemini','claude','claudeCode','github']);
const LEGACY_PLATFORMS=new Set(['kick','twitch','telegram','whatsapp','discord','youtubeLive','gmail']);
const LEGACY_CHILD_FONTS=new Set(['kick','twitch','telegram','whatsapp','discord','youtubeLive']);
const TOP_ONLY_FRAMES=new Set(['chatgpt','gemini','claude','claudeCode','google','github']);
const RICH_MARKUP='h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,pre,table,hr,strong,b,em,i,code';
const DIR_TARGETS='ul,ol,p,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,dd,dt,summary';
const FONT_NODES='span,p,div,strong,b,em,i,u,s,blockquote,code,pre';
const MANAGED='[data-easyfa-message="1"],[data-easyfa-composer="1"],[data-easyfa-sidebar="1"],[data-easyfa-font-node="1"],[data-easyfa-block-dir]';
const CHUNK=24;
function profile(){return current}
function remember(el){if(!originals.has(el))originals.set(el,{dir:el.getAttribute('dir'),easyDir:null})}
function setVar(el,k,v){if(v==null)el.style.removeProperty(k);else if(el.style.getPropertyValue(k)!==v)el.style.setProperty(k,v)}
function restore(el){
  const s=originals.get(el);
  VARS.forEach(k=>el.style.removeProperty(k));
  if(s?.easyDir&&el.getAttribute('dir')===s.easyDir){if(s.dir==null)el.removeAttribute('dir');else el.setAttribute('dir',s.dir)}
  delete el.dataset.easyfaMessage;delete el.dataset.easyfaComposer;delete el.dataset.easyfaSidebar;delete el.dataset.easyfaFontNode;delete el.dataset.easyfaDir;delete el.dataset.easyfaBlockDir;delete el.dataset.easyfaMetrics;delete el.dataset.easyfaRich;delete el.dataset.easyfaPlatform;
  applied.delete(el);originals.delete(el)
}
function clear(){
  try{document.querySelectorAll(MANAGED).forEach(restore)}catch{}
  applied=new WeakMap();originals=new WeakMap()
}
function text(el){return String(el?.textContent||'').trim()}
function setManagedDir(el,value,kind){
  if(!el?.isConnected)return;remember(el);const s=originals.get(el);
  if(value==null){if(s?.easyDir&&el.getAttribute('dir')===s.easyDir){if(s.dir==null)el.removeAttribute('dir');else el.setAttribute('dir',s.dir)}if(s)s.easyDir=null;delete el.dataset[kind];return}
  if(el.getAttribute('dir')!==value)el.setAttribute('dir',value);
  if(s)s.easyDir=value;el.dataset[kind]=value==='auto'?'smart':value
}
function richContent(el,composer,kind){
  if(kind==='sidebar')return false;
  if(composer)return true;
  if(RICH_PLATFORMS.has(pid))return true;
  if(pid==='custom'&&(el.matches?.('.markdown,.prose,article,[role="article"]')||el.querySelector?.(RICH_MARKUP)))return true;
  return!!el.querySelector?.(RICH_MARKUP)
}
function syncSmartNode(n){
  if(!n?.isConnected||!n.matches?.(DIR_TARGETS)||E.Detector.protectedEl(n,pid)||n.closest('pre,code,kbd,samp'))return;
  setManagedDir(n,'auto','easyfaBlockDir')
}
function syncSmartSubtree(node){
  const el=node?.nodeType===1?node:node?.parentElement;if(!el?.isConnected)return;
  syncSmartNode(el);try{el.querySelectorAll(DIR_TARGETS).forEach(syncSmartNode)}catch{}
}
function direction(el,mode,rich=false){
  delete el.dataset.easyfaDir;
  if(mode==='site'){setManagedDir(el,null,'easyfaDir');return}
  if(mode==='smart'){setManagedDir(el,'auto','easyfaDir');if(rich)syncSmartSubtree(el);return}
  setManagedDir(el,mode==='ltr'?'ltr':'rtl','easyfaDir')
}
function applyTypography(el,p,ff,original,rich=false){
  remember(el);const family=p.fontScope==='all'?ff.family:ff.faFamily;setVar(el,'--easyfa-font-family',`${family}, ${original}`);
  const semantic=el.matches?.('strong,b,h1,h2,h3,h4,h5,h6,code,pre,kbd,samp');
  if(p.sizeScope==='all'&&!semantic){
    setVar(el,'--easyfa-font-size',`${p.fontSize}px`);setVar(el,'--easyfa-font-weight',String(p.fontWeight));setVar(el,'--easyfa-line-height',rich?null:String(p.lineHeight));el.dataset.easyfaMetrics=rich?'rich':'full'
  }else{
    setVar(el,'--easyfa-font-size',null);setVar(el,'--easyfa-font-weight',null);setVar(el,'--easyfa-line-height',null);delete el.dataset.easyfaMetrics
  }
  if(rich)el.dataset.easyfaRich='1';else delete el.dataset.easyfaRich
}
function forceLegacyChildren(el,p,ff){
  if(!LEGACY_CHILD_FONTS.has(pid))return;
  const family=p.fontScope==='all'?ff.family:ff.faFamily;
  for(const n of el.querySelectorAll(FONT_NODES)){
    if(!n.isConnected||E.Detector.protectedEl(n,pid)||n.closest('[data-easyfa-composer="1"]'))continue;
    /* Keep semantic emphasis and the site's layout. Only force the selected
       family on the real text leaves/wrappers that legacy chat apps style with
       their own nested font-family. */
    remember(n);const cs=getComputedStyle(n),original=cs.fontFamily||'system-ui,sans-serif';
    setVar(n,'--easyfa-font-family',`${family}, ${original}`);n.dataset.easyfaFontNode='1';n.dataset.easyfaPlatform=pid
  }
}
function markKind(el,kind){
  delete el.dataset.easyfaMessage;delete el.dataset.easyfaComposer;delete el.dataset.easyfaSidebar;
  if(kind==='composer')el.dataset.easyfaComposer='1';else if(kind==='sidebar')el.dataset.easyfaSidebar='1';else el.dataset.easyfaMessage='1'
}
async function apply(el,p,composer,token,kind=composer?'composer':'message'){
  if(!el?.isConnected||applied.has(el))return;
  if(kind!=='sidebar'&&E.Detector.protectedEl(el,pid))return;
  if(!text(el)&&!composer)return;
  const rich=richContent(el,composer,kind);
  remember(el);markKind(el,kind);el.dataset.easyfaPlatform=pid;if(rich)el.dataset.easyfaRich='1';
  direction(el,p.direction,rich);applied.set(el,{composer:!!composer,kind});
  let cs,basePx,original;
  try{cs=getComputedStyle(el);original=cs.fontFamily||'system-ui,sans-serif';basePx=parseFloat(cs.fontSize)||16}catch{return}
  let ff;try{ff=await E.FontLoader.faceFor(p,basePx)}catch{ff={family:'Tahoma',faFamily:'Tahoma'}}
  if(token!==epoch||!el.isConnected||!applied.has(el))return;
  applyTypography(el,p,ff,original,rich);forceLegacyChildren(el,p,ff)
}
function reapplyManaged(el){
  if(!el?.isConnected||!current?.enabled)return;
  const meta=applied.get(el);if(!meta)return;
  for(const k of VARS)el.style.removeProperty(k);applied.delete(el);
  void apply(el,current,meta.composer,epoch,meta.kind)
}
function repairStyle(el){
  if(!el?.isConnected)return;
  if(el.dataset.easyfaFontNode==='1'&&!el.style.getPropertyValue('--easyfa-font-family')){
    const owner=el.closest?.('[data-easyfa-message="1"]');if(owner){reapplyManaged(owner);return}
  }
  if(!applied.has(el))return;
  if(!el.style.getPropertyValue('--easyfa-font-family'))reapplyManaged(el)
}
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
async function applyList(list,p,composer,token,kind=composer?'composer':'message'){
  for(let i=0;i<list.length;i+=CHUNK){
    if(token!==epoch)return;const slice=list.slice(i,i+CHUNK);
    await Promise.allSettled(slice.map(el=>apply(el,p,composer,token,kind)));
    if(i+CHUNK<list.length)await nextFrame()
  }
}
async function processSidebar(r,token){
  const p=profile();if(pid!=='chatgpt'||!p?.enabled||!p.sidebar||token!==epoch)return;
  await applyList(E.Detector.sidebars(r||document,pid,p),p,false,token,'sidebar')
}
async function processRoot(r,token,withComposer=false,composerRoot=r){
  const p=profile();if(!p?.enabled||!r?.isConnected)return;
  await applyList(E.Detector.messages(r,pid,p),p,false,token,'message');
  if(withComposer&&p.composer&&token===epoch){const scope=composerRoot?.isConnected?composerRoot:r;await applyList(E.Detector.composers(scope,pid,p),p,true,token,'composer')}
}
function scheduleNowOrLater(fn,delay=180){
  if(state?.applyMode==='delayed')setTimeout(fn,delay);else queueMicrotask(fn)
}
async function fullScan(){
  fullQueued=false;const p=profile();if(!p?.enabled)return;const r=E.Detector.root(pid);if(!r)return;
  if(watching&&r!==observedRoot)connectObserver(r);await processRoot(r,epoch,true,document.documentElement||r);await processSidebar(E.Detector.sidebarRoot(pid)||document,epoch)
}
function scheduleFull(){if(!current?.enabled||fullQueued)return;fullQueued=true;const token=epoch;scheduleNowOrLater(()=>{if(token!==epoch){fullQueued=false;return}void fullScan()})}
async function incrementalScan(){
  incrementalQueued=false;const p=profile();if(!p?.enabled){pendingRoots.clear();return}
  const token=epoch,roots=[...pendingRoots];pendingRoots.clear();for(const r of roots){if(token!==epoch)break;await processRoot(r,token,false,r)}
}
function queueRoot(el){
  for(const old of [...pendingRoots]){if(old===el||old.contains(el))return;if(el.contains(old))pendingRoots.delete(old)}
  pendingRoots.add(el);if(incrementalQueued)return;incrementalQueued=true;const token=epoch;scheduleNowOrLater(()=>{if(token!==epoch){incrementalQueued=false;return}void incrementalScan()})
}
function scheduleRoot(node){
  const el=node?.nodeType===1?node:node?.parentElement;if(!el?.isConnected)return;
  const composerOwner=el.closest?.('[data-easyfa-composer="1"]');if(composerOwner)return;
  const messageOwner=el.closest?.('[data-easyfa-message="1"]');
  if(messageOwner){
    if(pid==='youtube'){const kind=E.Detector.youtubeKind?.(messageOwner);if(kind==='title'||kind==='home'){reapplyManaged(messageOwner);return}if(kind==='subtitles'){repairStyle(messageOwner);return}}
    if(messageOwner.dataset.easyfaRich==='1'&&messageOwner.dataset.easyfaDir==='smart')syncSmartSubtree(el);return
  }
  queueRoot(el)
}
function youtubeTextMutation(target){
  const e=target?.parentElement;if(!e)return false;const owner=e.closest?.('[data-easyfa-message="1"]');
  if(owner){
    const kind=E.Detector.youtubeKind?.(owner);
    if(kind==='title'||kind==='home')reapplyManaged(owner);else if(kind==='subtitles')repairStyle(owner);
    return true
  }
  const k=E.Detector.youtubeKind?.(e);if(k)scheduleRoot(e);return!!k
}
function onLegacyMutations(ms){
  for(const m of ms){
    const target=m.target?.nodeType===1?m.target:m.target?.parentElement;
    const owner=target?.closest?.('[data-easyfa-message="1"]');
    if(pid==='telegram'&&owner){reapplyManaged(owner);continue}
    if(m.type==='childList'&&m.addedNodes?.length){for(const n of m.addedNodes)queueRoot(n)}
    else if(m.type==='characterData'&&target)queueRoot(target)
  }
}
function onMutations(ms){
  if(LEGACY_PLATFORMS.has(pid)){onLegacyMutations(ms);return}
  if(observedRoot===document.body||observedRoot===document.documentElement||observedRoot?.tagName==='MAIN'){const better=E.Detector.root(pid);if(better&&better!==observedRoot)connectObserver(better)}
  for(const m of ms){
    if(m.type==='childList'&&m.addedNodes?.length){for(const n of m.addedNodes)scheduleRoot(n);continue}
    if(m.type==='characterData'&&pid==='youtube')youtubeTextMutation(m.target)
  }
}
function scheduleSidebar(){if(sidebarQueued||pid!=='chatgpt'||!current?.sidebar)return;sidebarQueued=true;const token=epoch;scheduleNowOrLater(async()=>{sidebarQueued=false;if(token!==epoch)return;await processSidebar(observedSidebarRoot||E.Detector.sidebarRoot(pid)||document,epoch)})}
function onSidebarMutations(ms){for(const m of ms){if(m.type==='childList'&&m.addedNodes?.length){scheduleSidebar();break}}}
function onComposerFocus(e){const p=profile();if(!p?.enabled||!p.composer)return;const el=E.Detector.closestComposer(e.target,pid,p);if(el)apply(el,p,true,epoch,'composer')}
function onPageSignal(){const u=E.Storage.cleanPageUrl(location.href);if(lastPageUrl&&u!==lastPageUrl){void reload();return}scheduleFull();scheduleSidebar()}
function onVisibility(){if(!document.hidden)onPageSignal()}
function connectRootHostObserver(root){
  rootHostObserver?.disconnect();rootHostObserver=null;const host=root?.parentNode;if(!host)return;
  rootHostObserver=new MutationObserver(()=>{
    if(!current?.enabled)return;const better=E.Detector.root(pid);
    if(!observedRoot?.isConnected||(better&&better!==observedRoot)){if(better)connectObserver(better);scheduleFull()}
  });
  try{rootHostObserver.observe(host,{childList:true})}catch{rootHostObserver=null}
}
function connectObserver(root){observer?.disconnect();observedRoot=root||null;connectRootHostObserver(observedRoot);if(!observedRoot)return;observer=new MutationObserver(onMutations);observer.observe(observedRoot,{subtree:true,childList:true,characterData:pid==='youtube'||LEGACY_PLATFORMS.has(pid)})}
function connectSidebarObserver(root){
  sidebarObserver?.disconnect();sidebarObserver=null;observedSidebarRoot=root||null;if(!observedSidebarRoot)return;
  sidebarObserver=new MutationObserver(onSidebarMutations);sidebarObserver.observe(observedSidebarRoot,{subtree:true,childList:true});scheduleSidebar()
}
function maintainSidebarObserver(){
  if(pid!=='chatgpt'||!current?.sidebar)return;const r=E.Detector.sidebarRoot(pid);if(r&&r!==observedSidebarRoot)connectSidebarObserver(r);else if(!r&&observedSidebarRoot)connectSidebarObserver(null)
}
function maintainMainObserver(){
  if(!current?.enabled)return;const better=E.Detector.root(pid);
  if(!better)return;if(!observedRoot?.isConnected||better!==observedRoot){connectObserver(better);scheduleFull()}
}
function healthSweep(){
  const u=E.Storage.cleanPageUrl(location.href);if(lastPageUrl&&u!==lastPageUrl){void reload();return}
  if(!current?.enabled)return;maintainMainObserver();
  const seen=new Set,scan=scope=>{if(!scope?.isConnected)return;try{if(scope.matches?.('[data-easyfa-message="1"],[data-easyfa-composer="1"],[data-easyfa-sidebar="1"],[data-easyfa-font-node="1"]'))seen.add(scope);scope.querySelectorAll('[data-easyfa-message="1"],[data-easyfa-composer="1"],[data-easyfa-sidebar="1"],[data-easyfa-font-node="1"]').forEach(x=>seen.add(x))}catch{}};
  scan(observedRoot);scan(observedSidebarRoot);
  try{document.querySelectorAll('[data-easyfa-composer="1"]').forEach(x=>seen.add(x))}catch{}
  seen.forEach(repairStyle)
}
function stopWatch(){
  observer?.disconnect();observer=null;observedRoot=null;rootHostObserver?.disconnect();rootHostObserver=null;sidebarObserver?.disconnect();sidebarObserver=null;observedSidebarRoot=null;if(sidebarPoll){clearInterval(sidebarPoll);sidebarPoll=null}if(healthTimer){clearInterval(healthTimer);healthTimer=null}
  if(!watching)return;watching=false;document.removeEventListener('focusin',onComposerFocus,true);document.removeEventListener('yt-navigate-finish',onPageSignal,true);document.removeEventListener('turbo:load',onPageSignal,true);document.removeEventListener('turbo:render',onPageSignal,true);document.removeEventListener('DOMContentLoaded',onPageSignal,true);document.removeEventListener('visibilitychange',onVisibility,true);removeEventListener('pageshow',onPageSignal);removeEventListener('popstate',onPageSignal);removeEventListener('hashchange',onPageSignal)
}
function startWatch(){
  stopWatch();if(!current?.enabled)return;connectObserver(E.Detector.root(pid));document.addEventListener('focusin',onComposerFocus,true);document.addEventListener('yt-navigate-finish',onPageSignal,true);document.addEventListener('turbo:load',onPageSignal,true);document.addEventListener('turbo:render',onPageSignal,true);document.addEventListener('DOMContentLoaded',onPageSignal,true);document.addEventListener('visibilitychange',onVisibility,true);addEventListener('pageshow',onPageSignal);addEventListener('popstate',onPageSignal);addEventListener('hashchange',onPageSignal);watching=true;
  healthTimer=setInterval(healthSweep,1600);
  if(pid==='chatgpt'&&current.sidebar){maintainSidebarObserver();sidebarPoll=setInterval(maintainSidebarObserver,1800)}
}
async function reload(){
  epoch++;fullQueued=false;incrementalQueued=false;sidebarQueued=false;pendingRoots.clear();stopWatch();clear();state=await E.Storage.load();lastPageUrl=E.Storage.cleanPageUrl(location.href);pid=E.Detector.platform();
  const smart=E.Storage.matchSmartPage(state,location)||E.Storage.matchSmartSite(state,location);
  if(smart)current=smart.profile;else if(pid==='custom'){const x=E.Storage.matchCustom(state);current=x?.profile||null}else current=state.profiles?.[pid]||null;
  if(self!==top&&TOP_ONLY_FRAMES.has(pid))current=null;if(!current?.enabled)return;E.FontLoader.faceFor(current,16).catch(()=>{});startWatch();scheduleFull()
}
chrome.storage.onChanged.addListener((c,a)=>{if(a==='local'&&c[E.Config.KEY])reload()});
chrome.runtime.onMessage.addListener(m=>{if(m?.type==='easyfa:reload'){reload();return Promise.resolve({ok:true})}});reload();
})();
