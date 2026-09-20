(() => {
'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{};
const platforms={
  kick:{name:'Kick',accent:'#53fc18'},
  youtube:{name:'YouTube',accent:'#ff0033'},
  youtubeLive:{name:'YouTube Live',accent:'#ff0033'},
  twitch:{name:'Twitch',accent:'#9147ff'},
  whatsapp:{name:'WhatsApp Web',accent:'#25d366'},
  telegram:{name:'Telegram Web',accent:'#229ed9'},
  discord:{name:'Discord Web',accent:'#5865f2'},
  chatgpt:{name:'ChatGPT',accent:'#10a37f'},
  gemini:{name:'Gemini',accent:'#4e82ee'},
  claude:{name:'Claude Chat',accent:'#d97757'},
  claudeCode:{name:'Claude Code',accent:'#d97757'},
  gmail:{name:'Gmail',accent:'#ea4335'},
  google:{name:'Google Search',accent:'#4285f4'},
  github:{name:'GitHub',accent:'#8b949e'}
};
const remote=(id,name,family,base,regular,bold=regular)=>({id,name,family,remote:true,recommended:true,files:{400:base+regular,700:base+bold}});
const fonts=[
remote('vazirmatn','Vazirmatn','EasyFa Vazirmatn','https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/fonts/webfonts/','Vazirmatn-Regular.woff2','Vazirmatn-Bold.woff2'),
remote('shabnam','Shabnam','EasyFa Shabnam','https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@master/dist/','Shabnam.woff2','Shabnam-Bold.woff2'),
remote('sahel','Sahel','EasyFa Sahel','https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@master/dist/','Sahel.woff2','Sahel-Bold.woff2'),
remote('samim','Samim','EasyFa Samim','https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@master/dist/','Samim.woff2','Samim-Bold.woff2'),
remote('parastoo','Parastoo','EasyFa Parastoo','https://cdn.jsdelivr.net/gh/rastikerdar/parastoo-font@master/dist/','Parastoo.woff2','Parastoo-Bold.woff2'),
remote('tanha','Tanha','EasyFa Tanha','https://cdn.jsdelivr.net/gh/rastikerdar/tanha-font@master/dist/','Tanha.woff','Tanha.woff'),
remote('gandom','Gandom','EasyFa Gandom','https://cdn.jsdelivr.net/gh/rastikerdar/gandom-font@master/dist/','Gandom.woff','Gandom.woff'),
{id:'noto-sans-arabic',name:'Noto Sans Arabic',family:'EasyFa Noto Sans Arabic',recommended:true,files:{400:'assets/fonts/NotoSansArabic-Regular.woff2',500:'assets/fonts/NotoSansArabic-Medium.woff2',700:'assets/fonts/NotoSansArabic-Bold.woff2'}},
{id:'noto-naskh',name:'Noto Naskh Arabic',family:'EasyFa Noto Naskh',files:{400:'assets/fonts/NotoNaskhArabic-Regular.woff2',700:'assets/fonts/NotoNaskhArabic-Bold.woff2'}},
{id:'noto-kufi',name:'Noto Kufi Arabic',family:'EasyFa Noto Kufi',files:{400:'assets/fonts/NotoKufiArabic-Regular.woff2',700:'assets/fonts/NotoKufiArabic-Bold.woff2'}},
{id:'amiri',name:'Amiri',family:'EasyFa Amiri',files:{400:'assets/fonts/Amiri-Regular.woff2',700:'assets/fonts/Amiri-Bold.woff2'}},
{id:'nastaliq',name:'Noto Nastaliq Urdu',family:'EasyFa Nastaliq',files:{400:'assets/fonts/NotoNastaliqUrdu-Regular.woff2',700:'assets/fonts/NotoNastaliqUrdu-Bold.woff2'}},
{id:'noto-sans-ui',name:'Noto Sans Arabic UI',family:'EasyFa Noto Sans Arabic UI',files:{400:'assets/fonts/NotoSansArabicUI-Regular.woff2',700:'assets/fonts/NotoSansArabicUI-Bold.woff2'}},
{id:'noto-naskh-ui',name:'Noto Naskh Arabic UI',family:'EasyFa Noto Naskh UI',files:{400:'assets/fonts/NotoNaskhArabicUI-Regular.woff2',700:'assets/fonts/NotoNaskhArabicUI-Bold.woff2'}},
{id:'dejavu',name:'DejaVu Sans Persian',family:'EasyFa DejaVu Sans',files:{400:'assets/fonts/DejaVuSans-Regular.woff2',700:'assets/fonts/DejaVuSans-Bold.woff2'}},
{id:'free-sans',name:'FreeSans Persian',family:'EasyFa FreeSans',files:{400:'assets/fonts/FreeSans-Regular.woff2',700:'assets/fonts/FreeSans-Bold.woff2'}},
{id:'inter',name:'Inter',family:'EasyFa Inter',latin:true,files:{400:'assets/fonts/Inter-Regular.woff2',700:'assets/fonts/Inter-Bold.woff2'}},
{id:'system',name:'System UI',system:true,family:'system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif'},
{id:'tahoma',name:'Tahoma',system:true,family:'Tahoma,Arial,sans-serif'},
{id:'b-nazanin',name:'B Nazanin (Local)',local:true,family:'"B Nazanin"'},
{id:'b-koodak',name:'B Koodak (Local)',local:true,family:'"B Koodak"'},
{id:'b-yekan',name:'B Yekan (Local)',local:true,family:'"B Yekan"'},
{id:'iran-nastaliq',name:'IranNastaliq (Local)',local:true,family:'IranNastaliq'}
];
const youtubeTargets=()=>({title:true,description:true,comments:true,home:true,subtitles:true});
const base=p=>({
  enabled:true,
  direction:'smart',
  fontId:'vazirmatn',
  fontScope:p==='google'?'all':'fa',
  sizeScope:'fa',
  fontSize:16,
  fontWeight:500,
  lineHeight:1.75,
  composer:['whatsapp','telegram','discord','youtube','chatgpt','gemini','claude','claudeCode'].includes(p),
  accent:platforms[p]?.accent||'#22c55e',
  ...(p==='youtube'?{targets:youtubeTargets()}:{}),
  ...(p==='chatgpt'?{sidebar:true}:{}),
  ...(p==='custom'?{customMode:'smart',messageSelector:'',composerSelector:''}:{})
});
E.Config=Object.freeze({
  KEY:'easyFaV10',
  VERSION:12.0,
  ARABIC_RANGE:'U+0600-06FF,U+0750-077F,U+0870-089F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF',
  platforms,fonts,base,youtubeTargets,
  defaults:{version:12.0,theme:'dark',applyMode:'instant',active:'kick',globalDefaults:base('custom'),profiles:Object.fromEntries(Object.keys(platforms).map(p=>[p,base(p)])),customSites:[],smart:{enabled:false,defaults:base('custom'),sites:[],pages:[]}}
});
})();
