import './tutorial.css';

let closeCurrent;
const stamp=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

// Use native media controls and a modal dialog: no audio autoplay and no account data.
export function openTutorial(trigger){
  closeCurrent?.();
  const dialog=document.createElement('dialog');
  dialog.className='smai-tutorial';
  dialog.dir='rtl';
  dialog.setAttribute('aria-labelledby','tutorial-title');
  dialog.innerHTML=`<div class="tutorial-shell">
    <header class="tutorial-header"><div><span>SMAI SENTINEL / GUIDE</span><h2 id="tutorial-title">צעד ראשון. אתם לא לבד.</h2></div><button type="button" class="tutorial-close" aria-label="סגירת ההדרכה">×</button></header>
    <div class="tutorial-layout"><div class="tutorial-player">
      <video controls playsinline preload="metadata" poster="/media/smai-guide-poster.webp" aria-label="מדריך בעברית לפתיחת דיווח וקבלת הכוונה">
        <source src="/media/smai-guide-he.mp4" type="video/mp4">
        <track kind="captions" src="/media/smai-guide-he.vtt" srclang="he" label="עברית">
        הדפדפן אינו תומך בהצגת הסרטון. אפשר לפתוח את הקובץ בקישור שמתחתיו.
      </video>
      <p class="tutorial-note">צילומים מתוך האתר, עם עריכה, אנימציה וקריינות. פרטי דוגמה בלבד — לא נשלחה פנייה אמיתית.</p>
      <p class="tutorial-error" role="status" hidden></p>
      <a class="tutorial-file" href="/media/smai-guide-he.mp4" target="_blank" rel="noopener">פתיחת קובץ הסרטון</a>
    </div><nav class="tutorial-chapters" aria-label="פרקי ההדרכה"><h3>מה תרצו לראות?</h3><p class="tutorial-loading">טוען את הפרקים…</p><ol></ol></nav></div>
    <details class="tutorial-transcript"><summary>לקריאת ההדרכה כטקסט</summary><div class="tutorial-script"></div><p>מקורות להנחיות הבטיחות: <a href="https://www.gov.il/he/Departments/Units/105_call_center" target="_blank" rel="noopener">מוקד 105</a> · <a href="https://www.isoc.org.il/digital-literacy/online-safety-guides/guides-users/guide-prevention-of-online-vulnerabilities" target="_blank" rel="noopener">איגוד האינטרנט הישראלי</a>.</p></details>
    <footer class="tutorial-footer">הצוות מסייע בהכוונה ובדיווח; אינו משטרה או שירות חירום. בסכנה מיידית בישראל: <a href="tel:100">100</a>. לפגיעה בילדים ובנוער ברשת: <a href="tel:105">105</a>.</footer>
  </div>`;
  const controller=new AbortController();
  const video=dialog.querySelector('video');
  let closed=false,chapters=[];
  const cleanup=()=>{
    if(closed)return;
    closed=true;controller.abort();video.pause();video.removeAttribute('src');
    video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));
    video.load();dialog.remove();document.body.classList.remove('tutorial-open');
    if(closeCurrent===cleanup)closeCurrent=undefined;
    if(trigger?.isConnected)trigger.focus({preventScroll:true});
  };
  closeCurrent=cleanup;
  document.body.append(dialog);document.body.classList.add('tutorial-open');
  dialog.addEventListener('close',cleanup);
  dialog.querySelector('.tutorial-close').onclick=()=>dialog.close();
  dialog.onclick=e=>{if(e.target===dialog)dialog.close();};
  video.onerror=()=>{
    if(closed)return;
    const error=dialog.querySelector('.tutorial-error');error.hidden=false;
    error.textContent='לא הצלחנו לטעון את הסרטון. אפשר לקרוא את ההדרכה למטה או לנסות לפתוח את הקובץ.';
  };
  video.ontimeupdate=()=>{
    const active=chapters.findIndex(c=>video.currentTime>=c.start&&video.currentTime<c.end);
    dialog.querySelectorAll('.tutorial-chapters button').forEach((button,index)=>{
      if(index===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
  };
  dialog.showModal();
  fetch('/media/smai-guide.json',{signal:controller.signal}).then(response=>{
    if(!response.ok)throw new Error('Guide unavailable');return response.json();
  }).then(data=>{
    if(closed)return;
    chapters=data.chapters.filter(c=>Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.end>c.start);
    dialog.querySelector('.tutorial-loading').remove();
    const list=dialog.querySelector('.tutorial-chapters ol'),script=dialog.querySelector('.tutorial-script');
    chapters.forEach(chapter=>{
      const item=document.createElement('li'),button=document.createElement('button'),time=document.createElement('time'),label=document.createElement('span');
      button.type='button';time.textContent=stamp(chapter.start);time.dir='ltr';label.textContent=chapter.title;
      button.append(time,label);button.onclick=()=>{video.currentTime=chapter.start;video.play().catch(()=>video.focus());};
      item.append(button);list.append(item);
      const section=document.createElement('section'),heading=document.createElement('h3'),paragraph=document.createElement('p');
      heading.textContent=chapter.title;paragraph.textContent=chapter.text;section.append(heading,paragraph);script.append(section);
    });
    video.ontimeupdate();
  }).catch(error=>{
    if(closed||error.name==='AbortError')return;
    dialog.querySelector('.tutorial-loading').textContent='רשימת הפרקים לא נטענה. הסרטון עדיין זמין לצפייה.';
  });
  return cleanup;
}
