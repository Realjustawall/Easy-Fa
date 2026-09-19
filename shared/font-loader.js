(() => {'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{},C=E.Config,faceCache=new Map(),byteCache=new Map(),familyCache=new Map();
const quote=s=>'"'+String(s).replace(/["\\]/g,'\\$&')+'"';
const get=id=>{if(String(id||'').startsWith('system:')){const name=decodeURIComponent(String(id).slice(7));return{id,name,family:quote(name),system:true,dynamic:true}}return C.fonts.find(f=>f.id===id)||C.fonts[0]};
const weights=files=>Object.keys(files||{}).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
const near=(files,w)=>weights(files).sort((a,b)=>Math.abs(a-w)-Math.abs(b-w))[0]||400;
async function bytes(path){if(byteCache.has(path))return byteCache.get(path);const promise=(async()=>{const url=/^https?:/.test(path)?path:chrome.runtime.getURL(path);const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),2800);try{const r=await fetch(url,{cache:'force-cache',credentials:'omit',signal:ctl.signal});if(!r.ok)throw Error(`font ${r.status}`);return await r.arrayBuffer()}finally{clearTimeout(timer)}})();byteCache.set(path,promise);try{return await promise}catch(e){byteCache.delete(path);throw e}}
async function addFace(key,family,path,weight,fa,size,rangeWeight=null){if(faceCache.has(key))return faceCache.get(key);const p=(async()=>{const d={weight:rangeWeight||String(weight),style:'normal',display:'swap'};if(fa)d.unicodeRange=C.ARABIC_RANGE;if(size!==100)d.sizeAdjust=`${size}%`;const f=new FontFace(family,await bytes(path),d);await f.load();document.fonts.add(f);return family})();faceCache.set(key,p);try{return await p}catch(e){faceCache.delete(key);throw e}}
async function addLocal(key,family,sourceName,fa,size=100,weight=400){if(faceCache.has(key))return faceCache.get(key);const p=(async()=>{const d={weight:String(weight),style:'normal',display:'swap'};if(fa)d.unicodeRange=C.ARABIC_RANGE;if(size!==100)d.sizeAdjust=`${size}%`;const f=new FontFace(family,`local(${quote(sourceName)})`,d);await f.load();document.fonts.add(f);return family})();faceCache.set(key,p);try{return await p}catch(e){faceCache.delete(key);throw e}}
async function registerAllFaces(f,family,fa,size){const key=`allfaces:${f.id}:${family}:${fa?1:0}:${size}`;if(familyCache.has(key))return familyCache.get(key);const p=(async()=>{const ws=weights(f.files);if(!ws.length)throw Error('No font files');await Promise.all(ws.map(w=>addFace(`${key}:${w}`,family,f.files[w],w,fa,size)));return family})();familyCache.set(key,p);try{return await p}catch(e){familyCache.delete(key);throw e}}
async function registerPersianSemanticFaces(f,family,requested,size){const key=`fafaces:${f.id}:${family}:${requested}:${size}`;if(familyCache.has(key))return familyCache.get(key);const p=(async()=>{const baseW=near(f.files,requested),boldW=near(f.files,Math.max(700,requested)),base=f.files[baseW],bold=f.files[boldW]||base;await addFace(`${key}:base`,family,base,baseW,true,size,'100 599');await addFace(`${key}:bold`,family,bold,boldW,true,size,'600 900');return family})();familyCache.set(key,p);try{return await p}catch(e){familyCache.delete(key);throw e}}
async function bundledFallback(p,scale){const f=get('noto-sans-arabic'),safe='fallback',allFamily=`EF_${safe}_all`,faFamily=`EF_${safe}_fa_${p.fontWeight}_${scale}`;await Promise.all([registerAllFaces(f,allFamily,false,100),registerPersianSemanticFaces(f,faFamily,p.fontWeight,scale)]);return{family:allFamily,faFamily}}
async function faceFor(p,px=16){
  const f=get(p.fontId);
  if(f.system&&!f.dynamic)return{family:f.family,faFamily:f.family};
  /* Persian-only sizing must be stable across virtualized/recycled DOM nodes.
     Tying size-adjust to each element's current computed px caused YouTube card
     titles to grow/shrink when the same node was reused during scrolling. */
  const scale=p.sizeScope==='fa'?Math.max(70,Math.min(175,Math.round(p.fontSize/16*100))):100;
  if(f.dynamic||f.local){
    const raw=f.dynamic?decodeURIComponent(String(p.fontId).slice(7)):String(f.family).replace(/^"|"$/g,''),safe=String(p.fontId).replace(/\W/g,'').slice(0,60)||'system';
    /* For whole-text system fonts, keep the browser's native family so its real
       Regular/Bold faces remain available. Persian-only mode needs a unicode-
       ranged wrapper; advertise only the requested base weight so the browser
       can synthesize/resolve emphasis instead of flattening every weight. */
    if(p.fontScope==='all')return{family:f.family,faFamily:f.family};
    const faFamily=`EF_local_${safe}_fa_${p.fontWeight}_${scale}`;
    try{await addLocal(`local:${p.fontId}:fa:${p.fontWeight}:${scale}`,faFamily,raw,true,scale,p.fontWeight);return{family:f.family,faFamily}}catch{return{family:f.family,faFamily:f.family}}
  }
  const safe=f.id.replace(/\W/g,''),allFamily=`EF_${safe}_all`,faFamily=`EF_${safe}_fa_${p.fontWeight}_${scale}`;
  try{await Promise.all([registerAllFaces(f,allFamily,false,100),registerPersianSemanticFaces(f,faFamily,p.fontWeight,scale)]);return{family:allFamily,faFamily}}catch(e){return bundledFallback(p,scale)}
}
E.FontLoader={font:get,faceFor};
})();
