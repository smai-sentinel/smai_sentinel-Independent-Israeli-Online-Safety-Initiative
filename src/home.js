import './home-experience.css';

export function renderHome(app, {ic, esc, Auth, DEPTS, onCleanup}) {
  const name = Auth.user ? esc((Auth.user.name || '').split(' ')[0]) : '';
  const arrow = ic('arrow', 18);
  app.innerHTML = `<div class="nova-home">
    <div class="nova-welcome"><span>${name ? `טוב לראות אותך, ${name}` : 'ברוכים הבאים למרחב שלכם'}</span><span class="nova-micro" dir="ltr">SMAI SENTINEL / HUMAN FIRST</span></div>
    <section class="nova-hero" aria-labelledby="home-title">
      <div class="nova-hero-copy">
        <span class="nova-kicker"><i></i> יוזמה עצמאית לבטיחות ברשת</span>
        <h1 id="home-title">עולם דיגיטלי.<br><span>גב אנושי.</span></h1>
        <p>יותר ביטחון להיות מי שאתם. מקום אחד לדווח, לקבל הכוונה ולמצוא אנשים שבצד שלכם.</p>
        <div class="nova-hero-actions"><a class="nova-button nova-button-primary" href="/report">בואו נדבר ${arrow}</a><a class="nova-button nova-button-quiet" href="/community">לגלות את הקהילה ${ic('users',18)}</a></div>
        <div class="nova-hero-note">${ic('shield-check',16)} אפשר להתחיל בכינוי. ממשיכים בקצב שלכם.</div>
        <button type="button" class="nova-watch" data-open-tutorial><span class="nova-play">▶</span><span><b>איך זה עובד?</b><small>הדרכה מצולמת, צעד אחר צעד</small></span></button>
      </div>
      <div class="nova-hero-art" aria-hidden="true">
        <img class="nova-shield" src="/assets/sentinel-core.webp" alt="" width="1024" height="1024" fetchpriority="high">
        <div class="nova-orbit orbit-a"><i></i></div><div class="nova-orbit orbit-b"><i></i></div>
        <span class="nova-art-corner corner-one"></span><span class="nova-art-corner corner-two"></span>
        <div class="nova-art-label"><span class="nova-art-icon">${ic('shield',20)}</span><span><b>CONNECTED. PROTECTED.</b><small>TECHNOLOGY WITH A HUMAN SIDE</small></span></div>
        <span class="nova-art-coordinate" dir="ltr">S / 01 — YOUR DIGITAL SPACE</span>
      </div>
      <div class="nova-hero-bottom"><span>הגנה. הכוונה. קהילה.</span><a href="#home-explore" id="homeExplore">מגלים מה אפשר לעשות כאן <span>↓</span></a><span class="nova-micro" dir="ltr">BUILT AROUND YOU</span></div>
    </section>
    <section class="nova-launch-grid" id="home-explore" aria-label="נקודות התחלה">
      <a href="/report" class="nova-launch nova-launch-report" data-reveal><div class="nova-launch-top"><span class="nova-feature-icon">${ic('shield-alert',25)}</span><span class="nova-micro">01 / SUPPORT</span></div><h2>קרה משהו ברשת?</h2><p>מספרים מה קרה, מסדרים את המידע ומקבלים כיוון לצעד הבא.</p><span class="nova-link">פתיחת דיווח ${arrow}</span></a>
      <a href="/ai" class="nova-launch nova-launch-ai" data-reveal><div class="nova-launch-top"><span class="nova-feature-icon">${ic('sparkle',25)}</span><span class="nova-micro">02 / INTELLIGENCE</span></div><h2>מחשבה מתחילה בשיחה.</h2><p>שאלות, רעיונות, ניסוח ומידע. הכירו את מרחב ה־AI של SMAI.</p><span class="nova-link">לדבר עם SMAI AI ${arrow}</span></a>
      <a href="/community" class="nova-launch nova-launch-community" data-reveal><div class="nova-launch-top"><span class="nova-feature-icon">${ic('message',25)}</span><span class="nova-micro">03 / TOGETHER</span></div><h2>אנשים. לא רק פרופילים.</h2><p>מכירים, משתפים ושואלים. הקהילה שלכם, גם אחרי שהמסך נסגר.</p><span class="nova-link">למרחב הקהילה ${arrow}</span></a>
    </section>
    <div class="nova-platforms"><span>לצדכם, גם בפלטפורמות שלכם</span><div dir="ltr"><b>ROBLOX</b><b>Discord</b><b>Instagram</b><b>TikTok</b><b>WhatsApp</b></div><small>הפלטפורמות מוצגות לציון תחומי הפעילות, ללא טענה לשותפות.</small></div>
    <section class="nova-section" aria-labelledby="help-title">
      <div class="nova-section-heading" data-reveal><div><span class="nova-overline">לא צריך לדעת איך קוראים לזה</span><h2 id="help-title">משהו לא מרגיש נכון?<br><span>יש מאיפה להתחיל.</span></h2></div><a class="nova-text-link" href="/articles">לכל המדריכים ${arrow}</a></div>
      <div class="nova-departments">${DEPTS.map((d,i)=>`<a href="/report" class="nova-department" data-reveal><span class="nova-dept-number">0${i+1}</span><span class="nova-dept-icon">${ic(d.ico,24)}</span><h3>${esc(d.short)}</h3><p>${esc(d.desc)}</p><span class="nova-dept-arrow">${arrow}</span></a>`).join('')}</div>
    </section>
    <section class="nova-report-section" data-reveal aria-labelledby="start-title">
      <div class="nova-report-copy"><span class="nova-overline">צעד קטן. התחלה חדשה.</span><h2 id="start-title">אפשר פשוט<br>לספר מה קרה.</h2><p>לא צריך למצוא את המילים המושלמות. נתחיל מהסיפור שלכם ונעזור לעשות סדר.</p><ol class="nova-steps"><li><span>01</span><div><b>כותבים במילים שלכם</b><small>תיאור ראשוני, בלי לחץ ובלי שיפוט.</small></div></li><li><span>02</span><div><b>משלימים ושולחים</b><small>בוחרים פלטפורמה ומאשרים את הדיווח.</small></div></li><li><span>03</span><div><b>נשארים בקשר</b><small>עוקבים אחרי הפנייה והעדכונים במקום אחד.</small></div></li></ol></div>
      <form class="nova-report-form" id="quick-report"><div class="nova-form-heading"><span class="nova-feature-icon">${ic('message',22)}</span><div><h3>אנחנו מקשיבים.</h3><p>מה הייתם רוצים לשתף?</p></div></div><label for="quick-description" class="sr-only">תיאור ראשוני של המקרה</label><textarea id="quick-description" maxlength="4000" placeholder="אפשר להתחיל ב: מישהו מטריד אותי, פרצו לי לחשבון, אני דואג לילד שלי…"></textarea><div class="nova-draft-meta"><span>${ic('lock',13)} טיוטה במכשיר הזה</span><span id="draftCount">0 / 4,000</span></div><button type="submit" class="nova-button nova-button-primary">ממשיכים לדיווח ${arrow}</button><p class="nova-form-hint">שום דיווח לא נשלח לפני האישור שלכם בטופס הבא.</p><a class="nova-track-link" href="/track">כבר פניתם? מעקב אחר פנייה ${arrow}</a></form>
    </section>
    <section class="nova-community-section" data-reveal>
      <div><span class="nova-overline">יותר בטוח, ביחד</span><h2>מקום להרגיש<br><span>שייכים.</span></h2><p>משאלות קטנות ועד שיחות גדולות. מכירים אנשים, מחליפים רעיונות ולוקחים גם רגע לשחק.</p><div class="nova-hero-actions"><a class="nova-button nova-button-primary" href="/community">לכניסה לקהילה ${arrow}</a><a class="nova-button nova-button-quiet" href="/friends">למציאת חברים ${ic('users',18)}</a></div></div>
      <div class="nova-community-cards"><a href="/community"><span class="nova-mini-icon">${ic('message',22)}</span><div><b>שיחות שמחברות</b><small>מרחבים לשאלות, שיתוף ותמיכה</small></div>${arrow}</a><a href="/games"><span class="nova-mini-icon">${ic('grid',22)}</span><div><b>פסק זמן. משחקים יחד.</b><small>פותחים חדר ומזמינים חבר</small></div>${arrow}</a><a href="/team-praise"><span class="nova-mini-icon">${ic('heart',22)}</span><div><b>מילה טובה עושה הבדל</b><small>מפרגנים למי שהיה שם בשבילכם</small></div>${arrow}</a></div>
    </section>
    <section class="nova-faq-section nova-section" data-reveal><div class="nova-section-heading"><div><span class="nova-overline">טוב לדעת</span><h2>לפני שמתחילים.</h2></div><span class="nova-micro" dir="ltr">A LITTLE MORE CLARITY</span></div><div class="nova-faq">
      <details><summary>מה זה SMAI Sentinel?<span>+</span></summary><p>SMAI Sentinel היא יוזמה ישראלית עצמאית לבטיחות ברשת. כאן תמצאו כלי דיווח, הכוונה, מדריכים וקהילה לילדים, לבני נוער ולהורים. <a href="/about-smai.html">עוד על היוזמה</a></p></details>
      <details><summary>צריך להשתמש בשם האמיתי?<span>+</span></summary><p>אפשר להשתמש בשם תצוגה או בכינוי. הפנייה משויכת לחשבון שלכם כדי שתוכלו לעקוב אחריה. כדאי לשתף רק מידע שנחוץ להבנת המקרה.</p></details>
      <details><summary>איך רואים מה קורה עם הפנייה?<span>+</span></summary><p>לאחר השליחה אפשר לצפות בעדכונים דרך <a href="/my">הפניות שלי</a>, או להשתמש בקוד ב<a href="/track">מעקב פנייה</a>.</p></details>
      <details><summary>מה עושים אם יש סכנה מיידית?<span>+</span></summary><p>במצב סכנה מיידית פונים למשטרה בטלפון <a href="tel:100">100</a>. SMAI אינה משטרה או שירות חירום, ואין להמתין לתשובה באתר במצב כזה.</p></details>
    </div></section>
    <section class="nova-contact" data-reveal><span class="nova-overline">הדבר הבא מתחיל בשיחה</span><h2>בונים רשת<br>שטוב יותר להיות בה.</h2><p>רוצים להצטרף, לשתף פעולה או להציע משהו? יש כאן מקום גם לכם.</p><div class="nova-hero-actions"><a class="nova-button nova-button-light" href="/contact">בואו ניצור קשר ${arrow}</a><a class="nova-button nova-button-quiet" href="/join">הצטרפות לצוות ${ic('users',18)}</a></div><div class="nova-contact-word" aria-hidden="true">SENTINEL</div></section>
    <div class="nova-motion-control"><label><input type="checkbox" id="homeMotionToggle"> אפקטים ותנועה בגלילה</label><span>הבחירה נשמרת במכשיר שלכם.</span></div>
  </div>`;
  const home = app.querySelector('.nova-home');
  let tutorialCleanup;
  home.querySelectorAll('[data-open-tutorial]').forEach(button=>button.onclick=async()=>{
    button.disabled=true;
    try{const {openTutorial}=await import('./tutorial.js');if(home.isConnected)tutorialCleanup=openTutorial(button);}
    catch{if(home.isConnected){button.querySelector('small').textContent='ההדרכה לא נטענה. לחצו כדי לנסות שוב.';}}
    finally{button.disabled=false;}
  });
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = home.querySelector('#homeMotionToggle');
  let observer;
  const applyMotion = () => {
    observer?.disconnect();
    const enabled = localStorage.getItem('smai_home_motion') !== 'off';
    toggle.checked = enabled;
    home.dataset.motion = enabled && !media.matches ? 'on' : 'off';
    home.querySelectorAll('[data-reveal]').forEach(el => el.classList.remove('nova-reveal'));
    if (home.dataset.motion === 'on' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), {threshold: .05});
      home.querySelectorAll('[data-reveal]').forEach(el => {
        if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('nova-reveal'); observer.observe(el); }
      });
    }
  };
  toggle.onchange = () => {localStorage.setItem('smai_home_motion', toggle.checked ? 'on' : 'off'); applyMotion();};
  applyMotion();
  const visibility=()=>home.classList.toggle('nova-paused',document.hidden);
  document.addEventListener('visibilitychange',visibility);visibility();
  let heroObserver;
  if('IntersectionObserver' in window){heroObserver=new IntersectionObserver(entries=>home.classList.toggle('nova-out-of-view',!entries[0].isIntersecting));heroObserver.observe(home.querySelector('.nova-hero'));}
  media.addEventListener('change', applyMotion);
  onCleanup?.(() => {observer?.disconnect();heroObserver?.disconnect();tutorialCleanup?.();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change', applyMotion);});
  home.querySelector('#homeExplore').onclick = e => {e.preventDefault(); home.querySelector('#home-explore').scrollIntoView({behavior: home.dataset.motion === 'on' ? 'smooth' : 'instant'});};
  const input = home.querySelector('#quick-description');
  input.value = sessionStorage.getItem('smai_report_draft') || '';
  const updateDraft = () => {home.querySelector('#draftCount').textContent = `${input.value.length.toLocaleString()} / 4,000`;};
  input.oninput = () => {sessionStorage.setItem('smai_report_draft', input.value); updateDraft();};
  updateDraft();
  home.querySelector('#quick-report').onsubmit = e => {e.preventDefault(); sessionStorage.setItem('smai_report_draft', input.value); location.hash = '#/report';};
}
