(() => {'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{},C=E.Config,faceCache=new Map(),byteCache=new Map();
const quote=s=>'"'+String(s).replace(/["\\]/g,'\\$&')+'"';
const get=id=>{if(String(id||'').startsWith('system:')){const name=decodeURIComponent(String(id).slice(7));return{id,name,family:quote(name),system:true,dynamic:true}}return C.fonts.find(f=>f.id===id)||C.fonts[0]};
const near=(files,w)=>Object.keys(files||{}).map(Number).sort((a,b)=>Math.abs(a-w)-Math.abs(b-w))[0]||400;
async function bytes(path){if(byteCache.has(path))return byteCache.get(path);const promise=(async()=>{const url=/^https?:/.test(path)?path:chrome.runtime.getURL(path);const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),3500);try{const r=await fetch(url,{cache:'force-cache',credentials:'omit',signal:ctl.signal});if(!r.ok)throw Error(`font ${r.status}`);return await r.arrayBuffer()}finally{clearTimeout(timer)}})();byteCache.set(path,promise);try{return await promise}catch(e){byteCache.delete(path);throw e}}
async function make(key,family,path,fa,size){if(faceCache.has(key))return faceCache.get(key);const p=(async()=>{const d={weight:'100 900',style:'normal',display:'swap'};if(fa)d.unicodeRange=C.ARABIC_RANGE;if(size!==100)d.sizeAdjust=`${size}%`;const f=new FontFace(family,await bytes(path),d);await f.load();document.fonts.add(f);return family})();faceCache.set(key,p);try{return await p}catch(e){faceCache.delete(key);throw e}}
async function makeLocal(key,family,sourceName,fa){if(faceCache.has(key))return faceCache.get(key);const p=(async()=>{const d={weight:'100 900',style:'normal',display:'swap'};if(fa)d.unicodeRange=C.ARABIC_RANGE;const src=`local(${quote(sourceName)})`;const f=new FontFace(family,src,d);await f.load();document.fonts.add(f);return family})();faceCache.set(key,p);try{return await p}catch(e){faceCache.delete(key);throw e}}
async function bundledFallback(p,scale){const fallback=get('noto-sans-arabic'),fw=near(fallback.files,p.fontWeight),fp=fallback.files[fw];return{family:await make(`fallback:all:${fw}`,`EF_fallback_all_${fw}`,fp,false,100),faFamily:await make(`fallback:fa:${fw}:${scale}`,`EF_fallback_fa_${fw}_${scale}`,fp,true,scale)}}
async function faceFor(p){
  const f=get(p.fontId);
  if(f.system&&!f.dynamic)return{family:f.family,faFamily:f.family};
  if(f.dynamic||f.local){
    const raw=f.dynamic?decodeURIComponent(String(p.fontId).slice(7)):String(f.family).replace(/^\"|\"$/g,'');
    try{const safe=String(p.fontId).replace(/\W/g,'').slice(0,60)||'system';return{family:await makeLocal(`local:${p.fontId}:all`,`EF_local_${safe}_all`,raw,false),faFamily:await makeLocal(`local:${p.fontId}:fa`,`EF_local_${safe}_fa`,raw,true)}}catch{return{family:f.family,faFamily:f.family}}
  }
  const w=near(f.files,p.fontWeight),path=f.files[w],safe=f.id.replace(/\W/g,'');
  const scale=p.sizeScope==='fa'?Math.max(70,Math.min(175,Math.round((p.fontSize/16)*100))):100;
  try{return{family:await make(`${f.id}:all:${w}`,`EF_${safe}_all_${w}`,path,false,100),faFamily:await make(`${f.id}:fa:${w}:${scale}`,`EF_${safe}_fa_${w}_${scale}`,path,true,scale)}}catch{return bundledFallback(p,scale)}
}
E.FontLoader={font:get,faceFor};
})();
