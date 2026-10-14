(()=>{
  if(window.__smaiAgentLoaded)return;window.__smaiAgentLoaded=true;
  document.documentElement.dataset.smaiExtension='connected';
  window.dispatchEvent(new CustomEvent('smai-extension-ready'));
  window.addEventListener('message',event=>{if(event.source===window&&event.origin===location.origin&&event.data?.type==='SMAI_SITE_CONNECT'){document.documentElement.dataset.smaiExtension='connected';window.dispatchEvent(new CustomEvent('smai-extension-ready'));}});
  const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>2&&r.height>2&&s.visibility!=='hidden'&&s.display!=='none'};
  const label=el=>(el.innerText||el.textContent||el.getAttribute('aria-label')||el.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,160);
  const candidates=()=>[...document.querySelectorAll('button,a,input,textarea,select,[role="button"],[contenteditable="true"]')].filter(visible).slice(0,220).map((el,index)=>({index,tag:el.tagName.toLowerCase(),text:label(el),type:el.getAttribute('type')||'',name:el.getAttribute('name')||''}));
  const resolve=action=>{const all=[...document.querySelectorAll('button,a,input,textarea,select,[role="button"],[contenteditable="true"]')].filter(visible);if(Number.isInteger(action.index)&&all[action.index])return all[action.index];const wanted=String(action.text||'').toLowerCase();return all.find(el=>label(el).toLowerCase().includes(wanted));};
  function cursor(){let node=document.getElementById('smai-agent-cursor');if(!node){node=document.createElement('div');node.id='smai-agent-cursor';node.innerHTML='<span></span>';Object.assign(node.style,{position:'fixed',left:'0',top:'0',zIndex:'2147483647',width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(145deg,#8db7ff,#2f68ff)',border:'3px solid white',boxShadow:'0 5px 20px #1f5fffaa,0 0 0 8px #2f68ff22',pointerEvents:'none',transition:'transform .72s cubic-bezier(.16,1,.3,1)',transform:'translate3d(-50px,-50px,0)',willChange:'transform'});Object.assign(node.firstChild.style,{position:'absolute',inset:'-10px',border:'2px solid #71a4ff',borderRadius:'50%',opacity:'0',transition:'transform .32s ease,opacity .32s ease'});document.documentElement.append(node);}return node;}
  async function move(el){el.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});await new Promise(r=>setTimeout(r,260));const r=el.getBoundingClientRect(),node=cursor();node.style.transform=`translate3d(${r.left+r.width/2-12}px,${r.top+r.height/2-12}px,0)`;await new Promise(r=>setTimeout(r,760));node.firstChild.style.opacity='1';node.firstChild.style.transform='scale(1.35)';await new Promise(r=>setTimeout(r,180));node.firstChild.style.opacity='0';node.firstChild.style.transform='scale(.8)';}
  async function execute(action){
    if(action.type==='scroll'){scrollBy({top:Number(action.amount)||innerHeight*.72,behavior:'smooth'});return {ok:true};}
    if(action.type==='read')return snapshot();
    const el=resolve(action);if(!el)throw new Error('הרכיב המבוקש לא נמצא בעמוד');await move(el);
    if(action.type==='click'){el.click();return {ok:true,label:label(el)};}
    if(action.type==='type'){el.focus();if('value'in el)el.value='';else el.textContent='';el.dispatchEvent(new Event('input',{bubbles:true}));if('value'in el)el.value=String(action.value||'');else el.textContent=String(action.value||'');el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:String(action.value||'')}));return {ok:true,label:label(el)};}
    throw new Error('פעולה לא נתמכת');
  }
  function snapshot(){return {url:location.href,title:document.title,text:(document.body?.innerText||'').replace(/\s+/g,' ').slice(0,10000),elements:candidates()};}
  chrome.runtime.onMessage.addListener((message,_sender,reply)=>{if(message.type==='PING'){reply({ok:true});return;}if(message.type==='SNAPSHOT'){reply(snapshot());return;}if(message.type==='EXECUTE'){execute(message.action).then(reply).catch(error=>reply({error:error.message}));return true;}});
})();
