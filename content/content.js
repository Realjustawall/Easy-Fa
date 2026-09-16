(() => {
'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{};
const touched=new Map();let state=null,pid=null,current=null,observer=null,queued=false,epoch=0,inputBound=false;
const VARS=['--easyfa-font-family','--easyfa-font-size','--easyfa-font-weight','--easyfa-line-height'];
const FONT_NODES='span,p,div,strong,b,em,i,u,s,blockquote,code,pre';
function profile(){return current}
function remember(el){if(!touched.has(el))touched.set(el,{dir:el.getAttribute('dir'),easyDir:null})}
function setVar(el,k,v){if(v==null)el.style.removeProperty(k);else el.style.setProperty(k,v)}
function restore(el){const s=touched.get(el);if(!s)return;VARS.forEach(k=>el.style.removeProperty(k));if(s.easyDir&&el.getAttribute('dir')===s.easyDir){if(s.dir==null)el.removeAttribute('dir');else el.setAttribute('dir',s.dir)}delete el.dataset.easyfaMessage;delete el.dataset.easyfaComposer;delete el.dataset.easyfaFontNode;delete el.dataset.easyfaDir;touched.delete(el)}
function clear(){for(const el of [...touched.keys()])el.isConnected?restore(el):touched.delete(el)}
function text(el){return String(el?.innerText||el?.textContent||'').trim()}
function direction(el,mode){const s=touched.get(el);delete el.dataset.easyfaDir;if(mode==='site'){if(s?.easyDir&&el.getAttribute('dir')===s.easyDir){if(s.dir==null)el.removeAttribute('dir');else el.setAttribute('dir',s.dir)}if(s)s.easyDir=null;return}if(mode==='smart'){el.setAttribute('dir','auto');if(s)s.easyDir='auto';el.dataset.easyfaDir='smart';return}const d=mode==='ltr'?'ltr':'rtl';el.setAttribute('dir',d);if(s)s.easyDir=d;el.dataset.easyfaDir=d}
function applyTypography(el,p,ff,original){remember(el);const family=p.fontScope==='all'?ff.family:ff.faFamily;setVar(el,'--easyfa-font-family',`${family}, ${original}`);if(p.sizeScope==='all'){setVar(el,'--easyfa-font-size',`${p.fontSize}px`);setVar(el,'--easyfa-font-weight',String(p.fontWeight));setVar(el,'--easyfa-line-height',String(p.lineHeight))}else{setVar(el,'--easyfa-font-size',null);setVar(el,'--easyfa-font-weight',null);setVar(el,'--easyfa-line-height',null)}}
function forceTelegramChildren(el,p,ff){if(pid!=='telegram')return;for(const n of el.querySelectorAll(FONT_NODES)){if(!n.isConnected||E.Detector.protectedEl(n,pid)||n.closest('[data-easyfa-composer="1"]'))continue;const cs=getComputedStyle(n),original=cs.fontFamily||'system-ui,sans-serif';applyTypography(n,p,ff,original);n.dataset.easyfaFontNode='1'}}
async function apply(el,p,composer,token){if(!el?.isConnected||E.Detector.protectedEl(el,pid))return;if(!text(el)&&!composer)return;const cs=getComputedStyle(el),original=cs.fontFamily||'system-ui,sans-serif',basePx=parseFloat(cs.fontSize)||16;let ff;try{ff=await E.FontLoader.faceFor(p,basePx)}catch{return}if(token!==epoch||!el.isConnected)return;applyTypography(el,p,ff,original);el.dataset[composer?'easyfaComposer':'easyfaMessage']='1';if(pid==='telegram')forceTelegramChildren(el,p,ff);direction(el,p.direction)}
async function scan(){queued=false;const p=profile();if(!p)return;if(!p.enabled){clear();return}const r=E.Detector.root(pid);if(!r)return;const token=epoch,list=E.Detector.messages(r,pid);await Promise.allSettled(list.map(el=>apply(el,p,false,token)));if(p.composer)await Promise.allSettled(E.Detector.composers(r,pid).map(el=>apply(el,p,true,token)))}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(scan)}
function watch(){observer?.disconnect();observer=new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList'||m.type==='characterData'){schedule();break}}});observer.observe(document.documentElement||document,{subtree:true,childList:true,characterData:true});if(!inputBound){document.addEventListener('input',e=>{if(profile()?.composer&&e.target?.closest?.('[contenteditable="true"],textarea,input'))schedule()},true);inputBound=true}}
async function reload(){epoch++;clear();state=await E.Storage.load();pid=E.Detector.platform();if(pid==='custom'){const x=E.Storage.matchCustom(state);current=x?.profile||null}else current=state.profiles?.[pid]||null;if(!current)return;schedule()}
chrome.storage.onChanged.addListener((c,a)=>{if(a==='local'&&c[E.Config.KEY])reload()});addEventListener('pageshow',schedule);addEventListener('popstate',schedule);addEventListener('hashchange',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});reload().then(watch);
})();
