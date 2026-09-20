(() => {'use strict';
const E=globalThis.EasyFa=globalThis.EasyFa||{};
const host=()=>{
  let h=String(location.hostname||'').replace(/^www\./,'').toLowerCase();
  if(h)return h;
  try{for(const origin of [...(location.ancestorOrigins||[])]){const x=new URL(origin).hostname.replace(/^www\./,'').toLowerCase();if(x)return x}}catch{}
  try{const x=new URL(document.referrer||'').hostname.replace(/^www\./,'').toLowerCase();if(x)return x}catch{}
  return''
};
const platform=()=>{
  const h=host(),path=location.pathname||'/';
  if(h==='kick.com')return'kick';
  if(h.endsWith('youtube.com')){
    if(path.startsWith('/live_chat')||document.querySelector('yt-live-chat-renderer,yt-live-chat-item-list-renderer'))return'youtubeLive';
    return'youtube';
  }
  if(h==='twitch.tv')return'twitch';
  if(h==='web.whatsapp.com')return'whatsapp';
  if(h==='web.telegram.org')return'telegram';
  if(h==='discord.com')return'discord';
  if(h==='chatgpt.com'||h==='chat.openai.com')return'chatgpt';
  if(h==='gemini.google.com')return'gemini';
  if(h==='claude.ai'&&/^\/code(?:\/|$)/.test(path))return'claudeCode';
  if(h==='claude.ai')return'claude';
  if(h==='mail.google.com')return'gmail';
  if(h==='google.com')return'google';
  if(h==='github.com')return'github';
  return'custom'
};
const D={
 kick:{roots:['#channel-chatroom','[data-testid="chatroom-messages"]','#chatroom-messages','[data-testid="chatroom"]','main','body'],rows:['[data-index]','[data-message-id]','[data-chat-entry]'],messages:['[data-testid="chat-message-content"]','[data-chat-message-content]','[data-testid*="chat-message" i] [data-testid*="message-content" i]','[data-testid*="chat-message" i] [class*="message-content" i]','[data-chat-message] [data-chat-message-content]','[class*="chat-message" i] [class*="message-content" i]'],protect:['[data-testid*="username" i]','[data-username]','[data-testid*="badge" i]','[class*="username" i]','[class*="badge" i]','time','button','a'],compose:['textarea[placeholder*="chat" i]','textarea[aria-label*="chat" i]','[contenteditable="true"][role="textbox"]']},
 youtube:{
   roots:['ytd-app','#page-manager','main','body'],
   groups:{
     title:[
       'ytd-watch-metadata h1 yt-formatted-string','ytd-watch-metadata h1 yt-attributed-string','ytd-watch-metadata h1 .yt-core-attributed-string','ytd-watch-metadata h1',
       '#above-the-fold #title h1 yt-formatted-string','#above-the-fold #title h1 yt-attributed-string','#above-the-fold #title h1',
       'ytd-video-primary-info-renderer h1 yt-formatted-string','ytd-video-primary-info-renderer h1',
       'ytd-reel-video-renderer[is-active] .metadata-container #description',
       'ytd-reel-video-renderer[is-active] ytd-reel-player-overlay-renderer #description',
       'ytd-reel-video-renderer.is-active .metadata-container #description',
       'ytd-reel-video-renderer .metadata-container #description'
     ],
     description:[
       'ytd-watch-metadata #description-inline-expander #description','ytd-watch-metadata #description-inline-expander yt-attributed-string','ytd-watch-metadata #description-inline-expander .yt-core-attributed-string',
       'ytd-watch-metadata ytd-text-inline-expander#description-inline-expander','ytd-video-secondary-info-renderer #description yt-formatted-string','ytd-video-secondary-info-renderer #description yt-attributed-string'
     ],
     comments:[
       'ytd-comment-view-model #content-text','ytd-comment-renderer #content-text','ytd-comment-view-model yt-attributed-string#content-text','ytd-comment-renderer yt-formatted-string#content-text',
       'ytd-comment-view-model #content-text .yt-core-attributed-string','ytd-comment-renderer #content-text .yt-core-attributed-string'
     ],
     home:[
       'ytd-rich-grid-media #video-title','ytd-rich-item-renderer #video-title','ytd-video-renderer #video-title','ytd-grid-video-renderer #video-title','ytd-compact-video-renderer #video-title',
       'ytd-playlist-video-renderer #video-title','ytd-reel-item-renderer #video-title','a#video-title','yt-formatted-string#video-title','span#video-title',
       '#video-title-link yt-formatted-string','#video-title-link yt-attributed-string','#video-title-link .yt-core-attributed-string',
       'yt-lockup-metadata-view-model a.yt-lockup-metadata-view-model__title','yt-lockup-metadata-view-model .yt-lockup-metadata-view-model__title','yt-lockup-metadata-view-model h3',
       'yt-lockup-view-model [class*="title" i][role="heading"]','yt-lockup-view-model [class*="metadata" i] [class*="title" i]',
       'ytm-shorts-lockup-view-model h3.shortsLockupViewModelHostMetadataTitle',
       'ytm-shorts-lockup-view-model-v2 h3.shortsLockupViewModelHostMetadataTitle'
     ],
     subtitles:['.ytp-caption-segment','.ytp-caption-window-container .caption-visual-line','.ytp-caption-window-container .captions-text','.caption-window .caption-visual-line']
   },
   protect:['#channel-name','#owner','#upload-info','#author-text','#author-thumbnail','ytd-author-comment-badge-renderer','button','time','yt-icon','[role="button"]'],
   compose:[
     'ytd-comment-simplebox-renderer #contenteditable-root[contenteditable="true"]','ytd-comment-simplebox-renderer [contenteditable="true"][role="textbox"]',
     'ytd-commentbox #contenteditable-root[contenteditable="true"]','ytd-commentbox [contenteditable="true"][role="textbox"]','ytd-comment-dialog-renderer [contenteditable="true"][role="textbox"]',
     'ytd-comments-header-renderer [contenteditable="true"][role="textbox"]','ytd-comment-view-model [contenteditable="true"][role="textbox"]','ytd-comments [contenteditable="true"][role="textbox"]','[contenteditable="true"][aria-label*="comment" i]'
   ]
 },
 youtubeLive:{roots:['yt-live-chat-renderer','yt-live-chat-item-list-renderer','#items.yt-live-chat-item-list-renderer','body'],messages:['yt-live-chat-text-message-renderer #message','#items yt-live-chat-text-message-renderer #message','yt-live-chat-paid-message-renderer #message','yt-live-chat-membership-item-renderer #message','yt-live-chat-legacy-paid-message-renderer #message'],protect:['#author-name','#timestamp','#author-badges','yt-live-chat-author-badge-renderer','a','button'],compose:['#input[contenteditable="true"]','yt-live-chat-text-input-field-renderer #input','yt-live-chat-text-input-field-renderer [contenteditable="true"]','[contenteditable="true"][role="textbox"]']},
 twitch:{roots:['[data-a-target="chat-room-component-layout"]','.chat-scrollable-area__message-container','[role="log"]','main','body'],messages:['[data-a-target="chat-line-message-body"]','[data-a-target="chat-message-text"]','[data-test-selector="chat-message-text"]'],fragments:['[data-a-target="chat-line-message-body"] .text-fragment','.text-fragment'],protect:['[data-a-target="chat-message-username"]','[data-test-selector="message-username"]','[data-a-target*="badge" i]','[class*="username" i]','time','a','button'],compose:['[data-a-target="chat-input"]','textarea[data-a-target*="chat" i]','[contenteditable="true"][role="textbox"]']},
 whatsapp:{roots:['#main','[data-testid="conversation-panel-wrapper"]','main'],messages:['[data-testid="msg-container"] span.selectable-text','[data-testid="msg-container"] [data-lexical-text="true"]','[data-testid="msg-container"] [data-testid="msg-text"]','.message-in span.selectable-text','.message-out span.selectable-text'],protect:['[data-pre-plain-text]','time','a','button'],compose:['[data-testid="conversation-compose-box-input"]','footer [contenteditable="true"][role="textbox"]','footer [contenteditable="true"][data-lexical-editor="true"]','footer [contenteditable="true"]','[contenteditable="true"][role="textbox"]']},
 telegram:{roots:['#column-center','.MiddleColumn','.MessageList','.bubbles-inner','.messages-container','.chat-container','.chat','main','body'],messages:['.bubble:not(.service):not(.is-date) .message','.bubble:not(.service):not(.is-date) .text-content','.bubble:not(.service):not(.is-date) .translatable-message','.bubble:not(.service):not(.is-date) .media-caption','.MessageList .Message:not(.ActionMessage) .text-content','.MessageList .Message:not(.ActionMessage) .message-text','.MessageList .Message:not(.ActionMessage) .media-caption','.Message:not(.ActionMessage) .text-content','.message-content','.translatable-message','[class*="message-content"] [class*="text-content"]'],protect:['.peer-title','.sender-title','.message-title','.message-time','.time','.date','.avatar','.reactions','.reaction','.reply-title','.forwarded-title','time','a','button','[role="button"]'],compose:['.input-message-input[contenteditable="true"]','.input-message-input[contenteditable]','#editable-message-text[contenteditable="true"]','#editable-message-text[contenteditable]','.composer [contenteditable="true"]','.input-field-input[contenteditable="true"]','[contenteditable="true"][role="textbox"]']},
 discord:{roots:['[data-list-id="chat-messages"]','ol[data-list-id="chat-messages"]','main[aria-label]','main'],messages:['[id^="message-content-"]','[data-testid="message-content"]'],protect:['[id^="message-username-"]','[id^="message-timestamp-"]','[class*="username"]','time','a','button'],compose:['[role="textbox"][data-slate-editor="true"]','[data-slate-editor="true"][contenteditable="true"]','[data-lexical-editor="true"][contenteditable="true"]','div[role="textbox"][contenteditable="true"]','[contenteditable="true"][aria-multiline="true"]']},
 chatgpt:{
   roots:['main','[role="main"]','body'],
   turns:['article[data-testid^="conversation-turn-"]','[data-testid^="conversation-turn-"]','[data-message-author-role="assistant"]','[data-message-author-role="user"]','[data-role="assistant"]','[data-role="user"]','[data-message-author="assistant"]','[data-message-author="user"]','.agent-turn','.user-turn'],
   content:['[data-message-author-role] .markdown','[data-message-author-role] .prose','[data-message-author-role] [class*="whitespace-pre-wrap"]','article[data-testid^="conversation-turn-"] .markdown','article[data-testid^="conversation-turn-"] .prose','article[data-testid^="conversation-turn-"] [class*="whitespace-pre-wrap"]','[data-testid="conversation-turn-content"]','.markdown.prose','.markdown','.prose'],
   messages:['[data-message-author-role] .markdown','[data-message-author-role] .prose','[data-message-author-role] [class*="whitespace-pre-wrap"]','[data-testid="conversation-turn-content"]'],
   protect:['button','a','nav','aside','header','[role="toolbar"]','[data-testid*="action" i]'],
   compose:['#prompt-textarea','textarea[name="prompt-textarea"]','[data-testid="prompt-textarea"]','form .ProseMirror[contenteditable="true"]','form [contenteditable="true"][role="textbox"]','form textarea[placeholder]']
 },
 gemini:{
   roots:['chat-window','.conversation-container','main','[role="main"]','body'],
   turns:['user-query','user-query-content','model-response','[data-message-author="user"]','[data-message-author="model"]','.user-query','.model-response','[data-test-id*="response" i]'],
   content:['user-query-content .query-text','user-query .query-text','user-query-content','.query-text','model-response message-content','model-response .markdown-main-panel','model-response .model-response-text','model-response .response-content','message-content','.model-response-text','.response-content','.markdown-main-panel','.markdown','.prose','[class*="markdown" i]','[class*="response-text" i]'],
   messages:['user-query-content .query-text','user-query .query-text','user-query-content','model-response message-content','model-response .markdown-main-panel','model-response .model-response-text','model-response .response-content','message-content'],
   protect:['button','a','nav','aside','header','[role="toolbar"]','[class*="avatar" i]','[class*="actions" i]'],
   compose:['rich-textarea .ql-editor[contenteditable="true"]','div.ql-editor[contenteditable="true"]','rich-textarea div[contenteditable="true"]','rich-textarea [role="textbox"]','.ql-editor[contenteditable="true"][data-placeholder]','[contenteditable="true"][aria-label*="prompt" i]','[contenteditable="true"][aria-label*="Gemini" i]','textarea[aria-label*="prompt" i]']
 },
 claude:{
   roots:['main','[role="main"]','body'],
   turns:['[data-testid*="conversation-turn" i]','[data-testid*="message-row" i]'],
   content:['[data-testid="user-message"]','[data-testid="human-message"]','[data-user-message-bubble="true"]','.font-claude-response-body','.font-claude-response','[data-testid="ai-message"]','[data-testid="message-assistant"]','.prose','.markdown'],
   messages:['[data-testid="user-message"]','[data-testid="human-message"]','[data-user-message-bubble="true"]','.font-claude-response-body','.font-claude-response','[data-testid="ai-message"]','[data-testid="message-assistant"]'],
   protect:['button','a','nav','aside','header','[role="toolbar"]','[data-message-action-bar]'],
   compose:['[data-testid="chat-input"][contenteditable="true"]','[data-testid="chat-input"] [contenteditable="true"]','[data-testid*="composer" i] [contenteditable="true"]','div.ProseMirror[contenteditable="true"]','div[contenteditable="true"][role="textbox"]','textarea[placeholder]','[contenteditable="true"][aria-multiline="true"]']
 },
 claudeCode:{
   roots:['main','[role="main"]','body'],
   turns:['[data-testid*="message" i]','[data-testid*="transcript" i]','[data-testid*="turn" i]','[class*="message-row" i]'],
   content:['.prose','.markdown','[class*="markdown" i]','[class*="message-content" i]','[class*="message-text" i]','[data-testid*="message-content" i]','[data-testid*="prompt" i]'],
   messages:['[data-testid*="message-content" i]','[class*="message-content" i]','.prose','.markdown'],
   protect:['button','a','nav','aside','header','[role="toolbar"]','[data-testid*="action" i]','[class*="toolbar" i]'],
   compose:['textarea[placeholder*="task" i]','textarea[placeholder*="prompt" i]','textarea[placeholder*="describe" i]','[data-testid*="composer" i] textarea','[data-testid*="composer" i] [contenteditable="true"]','[data-testid*="prompt" i] textarea','[data-testid*="prompt" i] [contenteditable="true"]','form textarea','form [contenteditable="true"][role="textbox"]','div.ProseMirror[contenteditable="true"]']
 },
 gmail:{roots:['div[role="main"]','main'],messages:['.a3s'],protect:['span[email]','[email]','time','a','button'],compose:['div[aria-label="Message Body"]','div[role="textbox"][contenteditable="true"]']},
 google:{roots:['#main','main','#search','#rso','body'],messages:['#search h3','#search h2','#search p','#search .VwiC3b','#search .IsZvec','#search .MUxGbd','#search .hgKElc','#search .kno-rdesc','#rhs h2','#rhs h3','#rhs .kno-rdesc'],protect:['nav','form','button','input','textarea','select','option','svg','img','[role="button"]','[role="navigation"]'],compose:[]},
 github:{roots:['main','#js-repo-pjax-container','.application-main','body'],messages:['.markdown-body','.comment-body','.js-comment-body','[data-testid="issue-body"]','[data-testid="comment-body"]','.gh-header-title .js-issue-title','.repo-description','[data-testid="issue-title"]'],protect:['pre','code','kbd','samp','.blob-code','.react-code-lines','.js-file-line','button','input','textarea','select','nav','header','[role="button"]'],compose:['textarea[name="comment[body]"]','textarea[name="issue[body]"]','textarea[aria-label*="comment" i]','textarea[placeholder*="comment" i]','[contenteditable="true"][role="textbox"]']},
 custom:{roots:['main','[role="main"]','body'],messages:[],protect:['nav','header','footer','button','time','[role="button"]'],compose:['textarea','[contenteditable="true"][role="textbox"]','[contenteditable="true"][aria-multiline="true"]']}
};
const AI=new Set(['chatgpt','gemini','claude','claudeCode']);
const matches=(el,s)=>{try{return el?.nodeType===1&&el.matches(s)}catch{return false}};
/* One combined query is dramatically cheaper than one querySelectorAll per
   selector. Fall back to individual selectors only if a user/custom selector
   makes the combined query invalid. */
function many(r,a){
  if(!r||!a?.length)return[];
  const selectors=[...new Set(a.filter(Boolean))],z=new Set,joined=selectors.join(',');
  try{
    if(matches(r,joined))z.add(r);
    r.querySelectorAll(joined).forEach(n=>z.add(n));
    return[...z]
  }catch{
    for(const s of selectors){try{if(matches(r,s))z.add(r);r.querySelectorAll(s).forEach(n=>z.add(n))}catch{}}
    return[...z]
  }
}
function root(p){for(const s of D[p]?.roots||[]){const n=document.querySelector(s);if(n)return n}return document.body||document.documentElement}
function protectedEl(el,p){return(D[p]?.protect||[]).some(s=>{try{return!!el.closest(s)}catch{return false}})}
function youtubeSelectors(pf){const g=D.youtube.groups,t=pf?.targets||{},out=[];for(const k of Object.keys(g))if(t[k]!==false)out.push(...g[k]);return out}
/* Generic chat selectors normally want the deepest message leaf. */
function pruneToLeaves(list){const uniq=[...new Set(list.filter(Boolean))],set=new Set(uniq),drop=new Set;for(const el of uniq){let p=el.parentElement;while(p){if(set.has(p)){drop.add(p);break}p=p.parentElement}}return uniq.filter(el=>!drop.has(el))}
/* Rich AI/custom content wants the outer rich container so Markdown semantics,
   headings, lists and blockquotes share one bidi/font scope. */
function pruneToContainers(list){const uniq=[...new Set(list.filter(Boolean))],set=new Set(uniq);return uniq.filter(el=>{let p=el.parentElement;while(p){if(set.has(p))return false;p=p.parentElement}return true})}
function turnMessages(r,p){
  const d=D[p];
  if(p==='gemini'){
    const user=many(r,['user-query-content .query-text','user-query .query-text','.user-query .query-text','[data-message-author="user"] .query-text','[data-message-author="user"] [class*="query" i]'])
      .filter(x=>!protectedEl(x,p)&&!x.isContentEditable&&!x.closest?.('form'));
    const model=many(r,['model-response message-content','model-response .markdown-main-panel','model-response .model-response-text','model-response .response-content','message-content','.model-response-text','.response-content','.markdown-main-panel'])
      .filter(x=>!protectedEl(x,p)&&!x.isContentEditable&&!x.closest?.('form'));
    const mixed=[...pruneToLeaves(user),...pruneToContainers(model)];if(mixed.length)return[...new Set(mixed)]
  }
  const contents=many(r,[...(d.content||[]),...(d.messages||[])]).filter(x=>!protectedEl(x,p)&&!x.isContentEditable&&!x.closest?.('form'));
  if(contents.length)return pruneToContainers(contents);
  /* No N×querySelectorAll loop per turn: if a site's markup changed, use the
     turn nodes themselves as a last cheap fallback. */
  return pruneToContainers(many(r,d.turns||[]).filter(x=>!protectedEl(x,p)&&!x.isContentEditable&&!x.closest?.('form')))
}
function googleResults(r){
  const base=r?.nodeType===1?r:(document.querySelector('#main')||document.querySelector('main')||document.body||document.documentElement),out=[];
  let scopes=[];try{const own=base.closest?.('#search,#rhs');if(own)scopes=[base];else scopes=many(base,['#search','#rhs'])}catch{}
  if(!scopes.length)scopes=[base];
  const candidates=['h1','h2','h3','h4','p','span','cite','div[role="heading"]','.VwiC3b','.IsZvec','.MUxGbd','.hgKElc','.kno-rdesc'];
  for(const scope of scopes)for(const e of many(scope,candidates)){
    if(out.length>=850)break;if(!e||protectedEl(e,'google')||e.closest?.('#foot,#botstuff,[role="navigation"]'))continue;
    const t=(e.textContent||'').replace(/\s+/g,' ').trim();if(!t||t.length>1200)continue;
    if(e.tagName==='SPAN'||e.tagName==='DIV'){const childText=[...e.children].some(c=>!/^(SVG|PATH|IMG)$/i.test(c.tagName)&&(c.textContent||'').trim());if(childText)continue}
    out.push(e)
  }
  return pruneToLeaves(out)
}
function customExplicit(r,pf){
  const exact=String(pf?.messageSelector||'').trim();
  if(exact)return many(r,[exact]).filter(x=>!protectedEl(x,'custom'));
  const common=['[data-message-author-role] .markdown','[data-message-author-role] .prose','[data-testid*="message" i] [class*="content" i]','[class*="message-content" i]','[class*="comment-content" i]','.message-text','.comment-text','.markdown','.prose','article p','[role="article"] p'];
  return pruneToContainers(many(r,common).filter(x=>!protectedEl(x,'custom')).slice(0,300))
}
function explicitMessages(r,p,pf){
  if(p==='google')return googleResults(r);
  if(p==='custom')return customExplicit(r,pf);
  const set=new Set;
  if(AI.has(p))turnMessages(r,p).forEach(x=>set.add(x));
  else{
    const selectors=p==='youtube'?youtubeSelectors(pf):D[p]?.messages;
    many(r,selectors).forEach(x=>set.add(x))
  }
  if(p==='twitch'&&!set.size){for(const f of many(r,D[p]?.fragments)){const el=f.closest('[data-a-target="chat-line-message"]')?f.parentElement:f;if(el&&!protectedEl(el,p))set.add(el)}}
  const filtered=[...set].filter(x=>x&&!protectedEl(x,p));
  if(p==='youtube')return pruneToLeaves(filtered);
  if(p==='github')return pruneToContainers(filtered);
  if(['kick','twitch','telegram','whatsapp','discord','youtubeLive','gmail'].includes(p))return filtered;
  return AI.has(p)?pruneToContainers(filtered):pruneToLeaves(filtered)
}
function classicChatFallback(r,p,pf,limitOverride){
  /* Compatibility path intentionally mirrors the original 0.3.1 detector.
     It is restricted to the actual chat root, so it keeps the old reliability
     without bringing back the document-wide TreeWalker performance problem. */
  const out=new Set(),AR=/[\u0600-\u06FF\u0750-\u077F\u0870-\u089F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
    allText=pf?.fontScope==='all',limit=limitOverride||420;
  let w;try{w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,{acceptNode(n){
    const t=(n.nodeValue||'').trim();if(!t||(!allText&&!AR.test(t)))return NodeFilter.FILTER_REJECT;
    const e=n.parentElement;if(!e||e===r||protectedEl(e,p)||e.closest('script,style,noscript,button,a,[role="button"],input,textarea')||e.isContentEditable)return NodeFilter.FILTER_REJECT;
    const meta=`${e.id||''} ${typeof e.className==='string'?e.className:''} ${e.getAttribute?.('data-testid')||''} ${e.getAttribute?.('data-a-target')||''} ${e.getAttribute?.('aria-label')||''}`;
    if(/user(name)?|author|sender|badge|timestamp|avatar|reaction|status|menu|tooltip|moderator|\btime\b/i.test(meta))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT
  }})}catch{return[]}
  let n,count=0;while((n=w.nextNode())&&count<limit){let el=n.parentElement;if(!el)continue;
    while(el.parentElement&&el.parentElement!==r&&el.parentElement.childElementCount<=1&&!protectedEl(el.parentElement,p)&&!el.parentElement.matches('li,[role="listitem"],#chatroom-messages,[data-testid="chatroom-messages"],[role="log"],#items,yt-live-chat-item-list-renderer'))el=el.parentElement;
    if(el!==r){out.add(el);count++}
  }
  return[...out]
}
function fallbackMessages(r,p,pf,limitOverride){
  /* Performance-safe fallback: native selector matching over text blocks only.
     Never TreeWalk an entire SPA document. Exact site selectors remain the
     primary path; this fallback only keeps Persian/plain text usable if a site
     changes its message markup. */
  const AR=/[\u0600-\u06FF\u0750-\u077F\u0870-\u089F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
    allText=p==='custom'&&pf?.customMode==='all',
    candidates=['p','li','blockquote','h1','h2','h3','h4','h5','h6','figcaption','dd','dt','[role="article"]','[role="listitem"]','[class*="message-text" i]','[class*="message-content" i]','[class*="comment-text" i]','[class*="comment-content" i]','[data-message-author-role]'],
    limit=limitOverride||(allText?220:180),out=[];
  for(const e of many(r,candidates)){
    if(out.length>=limit)break;
    if(!e||e===r||e.isContentEditable||protectedEl(e,p)||e.closest('script,style,noscript,button,a,[role="button"],input,textarea,select,option'))continue;
    const t=(e.textContent||'').trim();if(!t||(!allText&&!AR.test(t)))continue;
    const meta=`${e.id||''} ${typeof e.className==='string'?e.className:''} ${e.getAttribute?.('data-testid')||''} ${e.getAttribute?.('aria-label')||''}`;
    if(/user(name)?|author|sender|badge|timestamp|avatar|reaction|status|menu|tooltip|sidebar|navigation|breadcrumb|\btime\b/i.test(meta))continue;
    out.push(e)
  }
  return pruneToLeaves(out)
}
function messages(r,p,pf){
  const found=explicitMessages(r,p,pf);
  /* Known AI sites intentionally never TreeWalk the whole conversation. Their
     explicit selectors + turn fallback are bounded and prevent ChatGPT/Gemini
     streaming from turning each token into a document-wide text scan. */
  if(AI.has(p))return found;
  if(p==='custom'){
    if(found.length)return found;
    return pruneToContainers(fallbackMessages(r,p,pf))
  }
  if(p==='telegram'){
    const all=new Set(found);classicChatFallback(r,p,pf,260).forEach(x=>all.add(x));return[...all]
  }
  if(p==='kick'&&!found.length){
    const rowText=[];for(const row of many(r,D.kick.rows||[]))classicChatFallback(row,p,pf,24).forEach(x=>rowText.push(x));
    if(rowText.length)return pruneToLeaves(rowText)
  }
  if(['kick','twitch','youtubeLive'].includes(p))return found.length?found:classicChatFallback(r,p,pf,420);
  return found.length?found:fallbackMessages(r,p,pf,180)
}
function youtubeKind(el){
  if(!el?.closest)return null;
  const g=D.youtube.groups;
  for(const k of ['subtitles','title','home','description','comments']){
    const sels=g[k]||[];
    for(const sel of sels){try{if(el.matches?.(sel)||el.closest(sel))return k}catch{}}
  }
  return null
}
function sidebarRoot(p){
  if(p!=='chatgpt')return null;
  return document.querySelector('#history,nav[aria-label="Chat history"],[data-testid="history"]')
}
function hasOwnReadableText(el){
  if(!el||/^(BUTTON|SVG|PATH|IMG|INPUT)$/i.test(el.tagName))return false;
  const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(!t||t.length>180)return false;
  const childText=[...el.children].some(c=>!/^(SVG|PATH|IMG)$/i.test(c.tagName)&&(c.textContent||'').trim());
  return !childText
}
function sidebars(r,p,pf){
  if(p!=='chatgpt'||pf?.sidebar===false)return[];
  const root=(r&&r.nodeType===1&&(r.matches?.('#history,nav[aria-label="Chat history"],[data-testid="history"]')||r.closest?.('#history,nav[aria-label="Chat history"],[data-testid="history"]')))?(r.matches?.('#history,nav[aria-label="Chat history"],[data-testid="history"]')?r:r.closest('#history,nav[aria-label="Chat history"],[data-testid="history"]')):sidebarRoot(p);
  if(!root)return[];const out=new Set;
  for(const a of many(root,['a[href*="/c/"]','a[data-testid*="history" i]','[role="link"][data-testid*="history" i]'])){
    const leaf=[...a.querySelectorAll('span,div')].find(hasOwnReadableText);out.add(leaf||a)
  }
  for(const opt of many(root,['button[data-testid^="history-item-"][data-testid$="-options"]','button[aria-label^="Open conversation options" i]'])){
    let row=opt.parentElement;for(let i=0;row&&i<3;i++,row=row.parentElement){
      const candidates=[...row.querySelectorAll('span,div,a,[role="link"]')].filter(x=>x!==opt&&!x.closest('button')&&hasOwnReadableText(x));
      if(candidates.length){const best=candidates.sort((a,b)=>(b.textContent||'').trim().length-(a.textContent||'').trim().length)[0];if(best)out.add(best);break}
    }
  }
  /* 2026 ChatGPT variants may render history titles as bare divs. Limit this
     fallback to leaf text nodes inside #history so controls/icons stay untouched. */
  if(!out.size){
    for(const el of many(root,['div','span'])){
      if(out.size>=120)break;if(!hasOwnReadableText(el)||el.closest('button,input,[role="menu"],[role="dialog"]'))continue;
      const t=(el.textContent||'').trim();if(t&&t.length<=180)out.add(el)
    }
  }
  return[...out]
}
function editorLike(el){return!!el&&(/^(TEXTAREA)$/i.test(el.tagName)||el.isContentEditable||el.getAttribute?.('role')==='textbox'||matches(el,'.ProseMirror,.ql-editor'))}
function composerMeta(el){let s='',n=el;for(let i=0;n&&i<4;i++,n=n.parentElement)s+=` ${n.id||''} ${typeof n.className==='string'?n.className:''} ${n.getAttribute?.('name')||''} ${n.getAttribute?.('placeholder')||''} ${n.getAttribute?.('aria-label')||''} ${n.getAttribute?.('data-testid')||''}`;return s.toLowerCase()}
function aiComposerCandidate(el,p){
  if(!editorLike(el)||protectedEl(el,p)||el.matches?.('[disabled],[readonly],[aria-disabled="true"]'))return false;
  if(el.closest?.('nav,aside,header,[role="dialog"] [data-testid*="search" i]'))return false;
  const meta=composerMeta(el);
  if(/search|filter|find in|rename|email|password|feedback|title field/.test(meta))return false;
  if(/prompt|message|chat|composer|ask|reply|send|task|instruction|describe|claude|gemini|what can|how can|type a/.test(meta))return true;
  return!!el.closest?.('form,main,[role="main"]')&&(el.tagName==='TEXTAREA'||el.isContentEditable||el.getAttribute?.('role')==='textbox')
}
function composers(r,p,pf){
  const exact=p==='custom'?String(pf?.composerSelector||'').trim():'',selectors=exact?[exact]:D[p]?.compose||[],out=new Set(many(r,selectors));
  /* Exact selectors cover the normal AI composer. Only if they find nothing do
     we run the broader editor candidate scan. */
  if(AI.has(p)&&!out.size)many(r,['textarea','[contenteditable="true"]','[role="textbox"]','.ProseMirror[contenteditable="true"]','.ql-editor[contenteditable="true"]']).forEach(x=>{if(aiComposerCandidate(x,p))out.add(x)});
  return[...out].filter(x=>!protectedEl(x,p))
}
function closestComposer(el,p,pf){
  if(!el?.closest)return null;
  const exact=p==='custom'?String(pf?.composerSelector||'').trim():'';
  for(const s of exact?[exact]:(D[p]?.compose||[])){try{const n=el.closest(s);if(n&&!protectedEl(n,p))return n}catch{}}
  if(AI.has(p)){
    const ce=el.closest('textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,.ql-editor');
    if(ce&&aiComposerCandidate(ce,p))return ce
  }
  return null
}
E.Detector={platform,defs:D,root,messages,protectedEl,composers,closestComposer,youtubeKind,sidebarRoot,sidebars};
})();
