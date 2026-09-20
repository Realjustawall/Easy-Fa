(() => {'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{},C=E.Config;
const cleanHost=v=>String(v||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/^www\./,'');
const cleanPageUrl=v=>{try{const u=new URL(String(v||''));if(!/^https?:$/.test(u.protocol))return'';u.hash='';return u.href}catch{return''}};
const hostFrom=v=>{try{return cleanHost(typeof v==='string'?new URL(v).hostname:v?.hostname)}catch{return cleanHost(v?.hostname||'')}};
const urlFrom=v=>{if(typeof v==='string')return cleanPageUrl(v);try{return cleanPageUrl(v?.href||'')}catch{return''}};
const validFont=id=>C.fonts.some(f=>f.id===id)||String(id||'').startsWith('system:');
const safeSelector=v=>String(v||'').trim().slice(0,500);
const COMMON_KEYS=['direction','fontId','fontScope','sizeScope','fontSize','fontWeight','lineHeight','composer'];
const norm=(p,id)=>{
  const x={...C.base(id),...(p||{})};
  x.enabled=x.enabled!==false;
  x.direction=['smart','rtl','ltr','site'].includes(x.direction)?x.direction:'smart';
  x.fontScope=x.fontScope==='all'?'all':'fa';
  x.sizeScope=x.sizeScope==='all'?'all':'fa';
  x.fontSize=Math.max(10,Math.min(36,+x.fontSize||16));
  x.fontWeight=[400,500,600,700].includes(+x.fontWeight)?+x.fontWeight:500;
  x.lineHeight=Math.max(1.2,Math.min(2.4,+x.lineHeight||1.75));
  x.composer=!!x.composer;
  if(!validFont(x.fontId))x.fontId=C.base(id).fontId;
  if(id==='chatgpt')x.sidebar=x.sidebar!==false;
  if(id==='youtube'){
    const d=C.youtubeTargets();
    x.targets={title:x.targets?.title!==false,description:x.targets?.description!==false,comments:x.targets?.comments!==false,home:x.targets?.home!==false,subtitles:x.targets?.subtitles!==false};
    for(const k of Object.keys(d))if(!(k in x.targets))x.targets[k]=d[k];
  }
  if(id==='custom'){
    x.customMode=['smart','all'].includes(x.customMode)?x.customMode:'smart';
    x.messageSelector=safeSelector(x.messageSelector);
    x.composerSelector=safeSelector(x.composerSelector);
  }
  return x
};
const commonProfile=p=>Object.fromEntries(COMMON_KEYS.map(k=>[k,p?.[k]]));
function customNorm(s){const host=cleanHost(s?.host);return {id:String(s?.id||crypto.randomUUID()),name:String(s?.name||host||'Custom Site').slice(0,80),host,profile:norm(s?.profile,'custom')}}
function smartSiteNorm(s,defaults){const host=cleanHost(s?.host);return {id:String(s?.id||crypto.randomUUID()),name:String(s?.name||host||'Active Site').slice(0,80),host,profile:norm(s?.profile||defaults,'custom')}}
function smartPageNorm(s,defaults){const url=cleanPageUrl(s?.url),host=hostFrom(url);return {id:String(s?.id||crypto.randomUUID()),name:String(s?.name||host||'Active Page').slice(0,100),url,host,profile:norm(s?.profile||defaults,'custom')}}
function smartNorm(v){const defaults=norm(v?.defaults,'custom');return {enabled:!!v?.enabled,defaults,sites:(v?.sites||[]).map(x=>smartSiteNorm(x,defaults)).filter(x=>x.host),pages:(v?.pages||[]).map(x=>smartPageNorm(x,defaults)).filter(x=>x.url&&x.host)}}
async function load(){
  const r=(await chrome.storage.local.get(C.KEY))[C.KEY]||{};
  const customSites=(r.customSites||[]).map(customNorm).filter(x=>x.host);
  const smart=smartNorm(r.smart||C.defaults.smart);
  const active=(C.platforms[r.active]||String(r.active||'').startsWith('custom:'))?r.active:'kick';
  const theme=['dark','light'].includes(r.theme)?r.theme:'dark';
  const applyMode=r.applyMode==='delayed'?'delayed':'instant';
  const globalDefaults=norm(r.globalDefaults||C.defaults.globalDefaults||C.base('custom'),'custom');
  const s={version:C.VERSION,theme,applyMode,active,globalDefaults,profiles:{},customSites,smart};
  for(const id of Object.keys(C.platforms))s.profiles[id]=norm(r.profiles?.[id],id);
  if(active.startsWith('custom:')&&!customSites.some(x=>'custom:'+x.id===active))s.active='kick';
  return s
}
async function save(s){s.version=C.VERSION;await chrome.storage.local.set({[C.KEY]:s});return s}
async function patch(id,p){const s=await load();s.profiles[id]=norm({...s.profiles[id],...p},id);await save(s);return s.profiles[id]}
async function patchCustom(id,p){const s=await load(),i=s.customSites.findIndex(x=>x.id===id);if(i<0)throw Error('Custom site not found');s.customSites[i].profile=norm({...s.customSites[i].profile,...p},'custom');await save(s);return s.customSites[i].profile}
async function addCustom({host,name,profile}){const s=await load(),h=cleanHost(host);if(!h||!h.includes('.'))throw Error('Enter a valid domain');const old=s.customSites.find(x=>x.host===h);if(old)return old;const item=customNorm({host:h,name:name||h,profile:profile||s.globalDefaults});s.customSites.push(item);s.active='custom:'+item.id;await save(s);return item}
async function removeCustom(id){const s=await load();s.customSites=s.customSites.filter(x=>x.id!==id);if(s.active==='custom:'+id)s.active='kick';await save(s);return s}
function matchCustom(s,loc=globalThis.location){const h=hostFrom(loc);return s.customSites.find(x=>h===x.host||h.endsWith('.'+x.host))||null}
async function patchGlobalDefaults(p){const s=await load();s.globalDefaults=norm({...s.globalDefaults,...p},'custom');await save(s);return s.globalDefaults}
async function applyGlobalDefaults({builtin=true,custom=true,smart=true}={}){
  const s=await load(),patch=commonProfile(s.globalDefaults);
  if(builtin){for(const id of Object.keys(C.platforms))s.profiles[id]=norm({...s.profiles[id],...patch},id)}
  if(custom){for(const item of s.customSites)item.profile=norm({...item.profile,...patch},'custom')}
  if(smart){
    s.smart.defaults=norm({...s.smart.defaults,...patch},'custom');
    for(const item of s.smart.sites)item.profile=norm({...item.profile,...patch},'custom');
    for(const item of s.smart.pages)item.profile=norm({...item.profile,...patch},'custom');
  }
  await save(s);return s
}
async function setSmartEnabled(enabled){const s=await load();s.smart.enabled=!!enabled;await save(s);return s.smart}
async function patchSmartDefaults(p){const s=await load();s.smart.defaults=norm({...s.smart.defaults,...p},'custom');await save(s);return s.smart.defaults}
async function copyGlobalToSmart(){const s=await load();s.smart.defaults=norm({...s.smart.defaults,...commonProfile(s.globalDefaults)},'custom');await save(s);return s.smart.defaults}
async function applySmartDefaultsToRules(){const s=await load(),patch=commonProfile(s.smart.defaults);for(const item of s.smart.sites)item.profile=norm({...item.profile,...patch},'custom');for(const item of s.smart.pages)item.profile=norm({...item.profile,...patch},'custom');await save(s);return s}
async function addSmartSite({host,name,profile}){const s=await load(),h=cleanHost(host);if(!h||(!h.includes('.')&&h!=='localhost'))throw Error('Enter a valid domain');let item=s.smart.sites.find(x=>x.host===h);if(item)return item;item=smartSiteNorm({host:h,name:name||h,profile:profile||s.smart.defaults},s.smart.defaults);s.smart.sites.push(item);await save(s);return item}
async function addSmartPage({url,name,profile}){const s=await load(),u=cleanPageUrl(url);if(!u)throw Error('Enter a valid page URL');let item=s.smart.pages.find(x=>x.url===u);if(item)return item;item=smartPageNorm({url:u,name:name||hostFrom(u),profile:profile||s.smart.defaults},s.smart.defaults);s.smart.pages.push(item);await save(s);return item}
async function removeSmartSite(id){const s=await load();s.smart.sites=s.smart.sites.filter(x=>x.id!==id);await save(s);return s}
async function removeSmartPage(id){const s=await load();s.smart.pages=s.smart.pages.filter(x=>x.id!==id);await save(s);return s}
async function removeSmartForUrl(url){const s=await load(),u=cleanPageUrl(url),h=hostFrom(u);s.smart.pages=s.smart.pages.filter(x=>x.url!==u);s.smart.sites=s.smart.sites.filter(x=>!(h===x.host||h.endsWith('.'+x.host)));await save(s);return s}
function matchSmartSite(s,loc=globalThis.location){const h=hostFrom(loc);return s.smart?.sites?.find(x=>h===x.host||h.endsWith('.'+x.host))||null}
function matchSmartPage(s,loc=globalThis.location){const u=urlFrom(loc);return s.smart?.pages?.find(x=>x.url===u)||null}
function hostInUse(s,host){const h=cleanHost(host);if(!h)return false;return s.customSites.some(x=>x.host===h)||s.smart?.sites?.some(x=>x.host===h)||s.smart?.pages?.some(x=>x.host===h)}
E.Storage={load,save,patch,patchCustom,addCustom,removeCustom,matchCustom,normalizeProfile:norm,cleanHost,cleanPageUrl,patchGlobalDefaults,applyGlobalDefaults,setSmartEnabled,patchSmartDefaults,copyGlobalToSmart,applySmartDefaultsToRules,addSmartSite,addSmartPage,removeSmartSite,removeSmartPage,removeSmartForUrl,matchSmartSite,matchSmartPage,hostInUse};
})();
