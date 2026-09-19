(() => {'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{},C=E.Config;
const cleanHost=v=>String(v||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/^www\./,'');
const validFont=id=>C.fonts.some(f=>f.id===id)||String(id||'').startsWith('system:');
const safeSelector=v=>String(v||'').trim().slice(0,500);
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
    x.targets={
      title:x.targets?.title!==false,
      description:x.targets?.description!==false,
      comments:x.targets?.comments!==false,
      home:x.targets?.home!==false,
      subtitles:x.targets?.subtitles!==false
    };
    for(const k of Object.keys(d))if(!(k in x.targets))x.targets[k]=d[k];
  }
  if(id==='custom'){
    x.customMode=['smart','all'].includes(x.customMode)?x.customMode:'smart';
    x.messageSelector=safeSelector(x.messageSelector);
    x.composerSelector=safeSelector(x.composerSelector);
  }
  return x
};
function customNorm(s){const host=cleanHost(s?.host);return {id:String(s?.id||crypto.randomUUID()),name:String(s?.name||host||'Custom Site').slice(0,50),host,profile:norm(s?.profile,'custom')}}
async function load(){const r=(await chrome.storage.local.get(C.KEY))[C.KEY]||{};const customSites=(r.customSites||[]).map(customNorm).filter(x=>x.host);const active=(C.platforms[r.active]||String(r.active||'').startsWith('custom:'))?r.active:'kick';const theme=['dark','light'].includes(r.theme)?r.theme:'dark';const applyMode=r.applyMode==='delayed'?'delayed':'instant';const s={version:C.VERSION,theme,applyMode,active,profiles:{},customSites};for(const id of Object.keys(C.platforms))s.profiles[id]=norm(r.profiles?.[id],id);if(active.startsWith('custom:')&&!customSites.some(x=>'custom:'+x.id===active))s.active='kick';return s}
async function save(s){s.version=C.VERSION;await chrome.storage.local.set({[C.KEY]:s});return s}
async function patch(id,p){const s=await load();s.profiles[id]=norm({...s.profiles[id],...p},id);await save(s);return s.profiles[id]}
async function patchCustom(id,p){const s=await load(),i=s.customSites.findIndex(x=>x.id===id);if(i<0)throw Error('Custom site not found');s.customSites[i].profile=norm({...s.customSites[i].profile,...p},'custom');await save(s);return s.customSites[i].profile}
async function addCustom({host,name}){const s=await load(),h=cleanHost(host);if(!h||!h.includes('.'))throw Error('Enter a valid domain');const old=s.customSites.find(x=>x.host===h);if(old)return old;const item=customNorm({host:h,name:name||h});s.customSites.push(item);s.active='custom:'+item.id;await save(s);return item}
async function removeCustom(id){const s=await load();s.customSites=s.customSites.filter(x=>x.id!==id);if(s.active==='custom:'+id)s.active='kick';await save(s);return s}
function matchCustom(s,loc=location){const h=cleanHost(loc.hostname);return s.customSites.find(x=>h===x.host||h.endsWith('.'+x.host))||null}
E.Storage={load,save,patch,patchCustom,addCustom,removeCustom,matchCustom,normalizeProfile:norm,cleanHost};})();
