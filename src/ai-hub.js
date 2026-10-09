import './ai-hub.css';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const STORE_KEY='smai_ai_hub_history_v1';

export function renderAiHub(app,{request}){
  let history=[];try{history=JSON.parse(localStorage.getItem(STORE_KEY)||'[]').slice(-30);}catch{}
  app.innerHTML=`<section class="ai-hub">
    <aside class="ai-hub-rail">
      <div class="ai-hub-brand"><img src="/assets/smai-ai-assistant.png" alt=""><div><b>SMAI AI</b><small>מרכז הבטיחות החכם</small></div></div>
      <button class="ai-new-chat" type="button">＋ שיחה חדשה</button>
      <nav aria-label="פעולות AI">
        <button data-seed="עזור לי להבין מה הצעד הבטוח הבא במקרה שלי">בדיקת מצב בטוחה</button>
        <button data-seed="עזור לי לנסח דיווח ברור ומסודר לצוות">ניסוח דיווח</button>
        <button data-seed="הסבר לי איך לשמור ראיות דיגיטליות בצורה בטוחה">שמירת ראיות</button>
        <button data-seed="חפש באינטרנט מידע עדכני ומקורות אמינים בנושא הבא: ">מחקר ברשת</button>
      </nav>
      <p>המערכת מספקת מידע כללי בלבד. בסכנה מיידית מתקשרים ל־100.</p>
    </aside>
    <main class="ai-hub-main">
      <header class="ai-hub-head"><div><span class="ai-live-dot"></span><b>SMAI Intelligence</b><small>שיחה, קול, חיפוש וכלים אינטראקטיביים</small></div><div class="ai-hub-toggles"><label><input id="aiWeb" type="checkbox"> חיפוש ברשת</label><label><input id="aiVoice" type="checkbox"> הקראת תשובות</label></div></header>
      <div class="ai-hub-thread" id="aiHubThread" aria-live="polite"></div>
      <div class="ai-hub-starters" id="aiHubStarters"><button data-seed="מישהו מטריד אותי ברשת, מה לעשות?">מטרידים אותי</button><button data-seed="פרצו לי לחשבון. תן לי צעדים מיידיים">פרצו לי לחשבון</button><button data-seed="עזור לי לבדוק אם הודעה שקיבלתי היא הונאה">בדיקת הונאה</button><button data-seed="אני צריך עזרה עכשיו">אני צריך עזרה</button></div>
      <form class="ai-hub-composer" id="aiHubForm"><button type="button" id="aiHubMic" aria-label="דיבור למערכת">◉</button><textarea id="aiHubInput" rows="1" maxlength="12000" placeholder="שאלו כל דבר על בטיחות ברשת או על SMAI…" required></textarea><button type="submit" class="ai-hub-send" aria-label="שליחה">➤</button><div class="ai-hub-meta"><span>Enter לשליחה · Shift+Enter לשורה חדשה</span><span>אל תשתפו סיסמאות או קודי אימות</span></div></form>
    </main>
  </section>`;
  const thread=app.querySelector('#aiHubThread'),form=app.querySelector('#aiHubForm'),input=app.querySelector('#aiHubInput'),send=form.querySelector('.ai-hub-send'),starters=app.querySelector('#aiHubStarters');
  const persist=()=>localStorage.setItem(STORE_KEY,JSON.stringify(history.slice(-30)));
  const scroll=()=>requestAnimationFrame(()=>thread.scrollTop=thread.scrollHeight);
  const actions=result=>{const links=[];if(result?.reportSuggestion)links.push([result.reportSuggestion.href,'פתיחת דיווח','primary']);links.push(['/report','דיווח לצוות'],['/articles','מדריכים'],['/my','הפניות שלי']);return `<div class="ai-hub-actions">${links.map(([href,label,kind])=>`<a href="${escapeHtml(href)}" class="${kind||''}">${escapeHtml(label)}</a>`).join('')}</div>`;};
  const add=(role,text,result={})=>{const article=document.createElement('article');article.className='ai-hub-message '+role;article.innerHTML=role==='model'?`<img src="/assets/smai-ai-assistant.png" alt=""><div><div class="ai-hub-answer">${escapeHtml(text).replace(/\n/g,'<br>')}</div>${result.sources?.length?`<div class="ai-hub-sources"><b>מקורות</b>${result.sources.map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title||source.url)}</a>`).join('')}</div>`:''}${actions(result)}</div>`:`<div>${escapeHtml(text)}</div>`;thread.append(article);scroll();};
  if(history.length)history.forEach(item=>add(item.role,item.text,item.result||{}));else add('model','היי, אני מרכז ה־AI של SMAI Sentinel. אפשר לדבר איתי בחופשיות, לבקש מחקר עם מקורות, לקבל צעדים בטוחים או לפתוח דיווח מסודר.');
  const typing=()=>{const node=document.createElement('article');node.className='ai-hub-message model typing';node.innerHTML='<img src="/assets/smai-ai-assistant.png" alt=""><div><i></i><i></i><i></i><span>חושב ומארגן תשובה…</span></div>';thread.append(node);scroll();return node;};
  const submit=async()=>{const prompt=input.value.trim();if(!prompt||send.disabled)return;input.value='';input.style.height='auto';starters?.remove();add('user',prompt);history.push({role:'user',text:prompt});persist();send.disabled=true;const pending=typing();try{const result=await request('/api/ai','POST',{prompt,history:history.slice(-12),consent:true,requireModel:true,webSearch:app.querySelector('#aiWeb').checked});pending.remove();add('model',result.text,result);history.push({role:'model',text:result.text,result:{sources:result.sources||[],reportSuggestion:result.reportSuggestion||null}});persist();if(app.querySelector('#aiVoice').checked&&'speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(result.text.slice(0,1800)));}}catch(error){pending.remove();add('model',error.message||'לא הצלחתי להשיב כרגע. נסו שוב בעוד רגע.');}finally{send.disabled=false;input.focus();}};
  form.onsubmit=event=>{event.preventDefault();submit();};input.onkeydown=event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit();}};input.oninput=()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,180)+'px';};
  app.querySelectorAll('[data-seed]').forEach(button=>button.onclick=()=>{input.value=button.dataset.seed;input.focus();input.dispatchEvent(new Event('input'));});
  app.querySelector('.ai-new-chat').onclick=()=>{history=[];persist();thread.innerHTML='';add('model','נפתחה שיחה חדשה. במה תרצו שאעזור?');};
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition,mic=app.querySelector('#aiHubMic');if(!Recognition)mic.hidden=true;else{const recognition=new Recognition();recognition.lang=document.documentElement.lang==='en'?'en-US':'he-IL';recognition.interimResults=true;recognition.onstart=()=>mic.classList.add('listening');recognition.onend=()=>mic.classList.remove('listening');recognition.onresult=event=>{input.value=[...event.results].map(result=>result[0].transcript).join(' ');input.dispatchEvent(new Event('input'));};mic.onclick=()=>recognition.start();}
}
