const SCRIPT_ID='easy-fa-custom-sites-v10';
const KEY='easyFaV10';
const builtin=new Set(['kick.com','youtube.com','twitch.tv','web.whatsapp.com','web.telegram.org','discord.com','chatgpt.com','chat.openai.com','gemini.google.com','claude.ai','mail.google.com']);
const clean=v=>String(v||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/^www\./,'');
const patterns=h=>[`*://${h}/*`,`*://*.${h}/*`];
async function wantedMatches(){const raw=(await chrome.storage.local.get(KEY))[KEY]||{},out=[];for(const x of raw.customSites||[]){const h=clean(x.host);if(!h||builtin.has(h))continue;for(const origin of patterns(h)){try{if(await chrome.permissions.contains({origins:[origin]}))out.push(origin)}catch{}}}return[...new Set(out)].sort()}
function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
async function syncCustom(){
  try{
    const old=await chrome.scripting.getRegisteredContentScripts({ids:[SCRIPT_ID]}),matches=await wantedMatches();
    const current=(old[0]?.matches||[]).slice().sort();
    if(old.length&&same(current,matches))return;
    if(old.length)await chrome.scripting.unregisterContentScripts({ids:[SCRIPT_ID]});
    if(!matches.length)return;
    await chrome.scripting.registerContentScripts([{id:SCRIPT_ID,matches,allFrames:false,matchOriginAsFallback:false,runAt:'document_idle',css:['content/styles.css'],js:['shared/config.js','shared/storage.js','shared/font-loader.js','content/detector.js','content/content.js'],persistAcrossSessions:true}])
  }catch(e){console.warn('Easy-Fa custom-site sync failed',e)}
}
chrome.runtime.onInstalled.addListener(syncCustom);chrome.runtime.onStartup.addListener(syncCustom);
chrome.storage.onChanged.addListener((c,a)=>{if(a==='local'&&c[KEY])syncCustom()});
chrome.permissions.onAdded.addListener(syncCustom);chrome.permissions.onRemoved.addListener(syncCustom);
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
