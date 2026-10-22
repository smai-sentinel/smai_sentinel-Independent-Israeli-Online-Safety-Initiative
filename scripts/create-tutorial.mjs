// Creates an edited, narrated walkthrough from real UI captures made with the browser tool.
// No report is submitted during capture. Source captures live in .local/tutorial-frames.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE_PATH||'sharp');
const ffmpeg=process.env.FFMPEG_BIN||'ffmpeg',ffprobe=process.env.FFPROBE_BIN||'ffprobe';
const root=path.resolve(import.meta.dirname,'..'),work=path.join(root,'.local/tutorial-frames'),output=path.join(root,'public/media');
await mkdir(output,{recursive:true});
const scenes=[
 {title:'אתם לא לבד.',heading:['מטרידים אתכם?','פרצו לחשבון?'],lines:['מדריך מצולם מתוך האתר','הגנה, הכוונה ופתיחת פנייה','צעד אחד בכל פעם.'],image:'shield',voice:'מטרידים אתכם ברשת, או שנפרץ החשבון? אתם לא חייבים להתמודד לבד. כך נעזרים בסמאי סנטינל ופותחים פנייה, שלב אחרי שלב.'},
 {title:'לפני הדיווח: הטרדה',heading:['עוצרים. מתעדים.','מבקשים עזרה.'],lines:['לא מתעמתים עם הפוגע.','שומרים קישור, שם ותאריך.','לא מפיצים חומר אינטימי.','חוסמים ומדווחים בפלטפורמה.'],image:'shield',voice:'במקרה של הטרדה, אל תתעמתו. שמרו קישור, שם משתמש, תאריך וצילום מסך מתאים. אל תפיצו חומר אינטימי. חסמו ודווחו גם בפלטפורמה שבה זה קרה. אפשר לשתף אדם שאתם סומכים עליו.'},
 {title:'לפני הדיווח: פריצה',heading:['מחזירים שליטה.','בדרך הרשמית.'],lines:['פונים לשחזור החשבון הרשמי.','מחליפים סיסמה ממכשיר בטוח.','מנתקים חיבורים לא מוכרים.','מפעילים אימות דו־שלבי.'],image:'shield',voice:'אם החשבון נפרץ, השתמשו בתהליך השחזור הרשמי של הפלטפורמה. ממכשיר בטוח החליפו סיסמה, נתקו חיבורים לא מוכרים והפעילו אימות דו שלבי. לעולם אל תשלחו לנו סיסמה או קוד אימות.'},
 {title:'מכירים את SMAI AI',heading:['אפשר להתחיל','גם בשיחה.'],lines:['זהו מרחב ה־AI של האתר.','אפשר לבקש עזרה בניסוח,','או בסידור פרטי המקרה.','בודקים את התשובה לפני שימוש.'],image:'06-ai.png',target:[690,820],voice:'זהו מרחב הבינה המלאכותית של סמאי. אפשר לבקש עזרה בניסוח דיווח ברור, או בסידור פרטי המקרה. כאן מוצגת בקשה לדוגמה, ללא שליחה. תשובות הבינה המלאכותית עלולות להיות שגויות, ואינן תחליף לעזרה מקצועית או לשירות חירום.'},
 {title:'פותחים פנייה באתר',heading:['נכנסים לאתר.','בוחרים דיווח.'],lines:['לוחצים על פתיחת דיווח,','או על ״בואו נדבר״.','אם צריך — מתחברים לחשבון.'],image:'00-home.png',target:[1310,300],voice:'נכנסים לאתר סמאי סנטינל ולוחצים על פתיחת דיווח בסרגל, או על בואו נדבר בדף הבית. אם עדיין לא התחברתם, התחברו לחשבון שלכם כדי לפתוח פנייה ולעקוב אחריה.'},
 {title:'שלב 1 · איפה זה קרה',heading:['באיזו פלטפורמה','זה קרה?'],lines:['בוחרים את האתר או המשחק.','לדוגמה: רובלוקס או דיסקורד.','לא ברשימה? בוחרים מקום אחר.'],image:'01-platform.png',target:[1035,718],voice:'בשלב הראשון בוחרים איפה זה קרה. למשל רובלוקס, דיסקורד או פלטפורמה אחרת. אם הפלטפורמה לא מופיעה ברשימה, בוחרים מקום אחר.'},
 {title:'שלב 2 · מה קרה',heading:['בוחרים את','סוג המקרה.'],lines:['הטרדה, איומים או בריונות.','פריצה או גניבת חשבון.','או האפשרות המתאימה ביותר.'],image:'02-category.png',target:[920,420],voice:'בשלב השני בוחרים את סוג המקרה. לדוגמה, הטרדה, איומים או בריונות, או פריצה וגניבת חשבון. בוחרים באפשרות הקרובה ביותר למה שקרה.'},
 {title:'מה כדאי לכלול בדיווח',heading:['הפרטים שעוזרים','להבין את התמונה.'],lines:['הפלטפורמה וקישור לפרופיל.','מתי קרה ומה בדיוק קרה.','תיעוד מתאים, בלי מידע מיותר.','איזו עזרה אתם מבקשים.'],image:'03-details.png',voice:'כדי שהצוות יוכל להבין את המקרה, ציינו את הפלטפורמה, שם המשתמש או קישור לפרופיל, ומתי האירוע קרה. תארו במילים שלכם מה קרה ואיזו עזרה אתם מבקשים. הוסיפו קישורים או תיעוד מתאים במקום המיועד לכך, אם האפשרות זמינה. הסתירו מידע אישי של מי שלא קשור למקרה. אין לשלוח סיסמאות, קודי אימות או תוכן אינטימי.'},
 {title:'שלב 3 · מספרים במילים שלכם',heading:['מה קרה?','אנחנו מקשיבים.'],lines:['כותרת קצרה ותיאור ברור.','מתי זה התחיל ומה קרה?','רק פרטים שנחוצים למקרה.','בלי סיסמאות ובלי קודי אימות.'],image:'03-details.png',target:[845,440],voice:'כותבים כותרת קצרה ותיאור ברור. מתי זה התחיל, מה קרה ומה אתם צריכים. משתמשים רק בפרטים הדרושים. אל תכתבו סיסמאות או קודי אימות. כל הפרטים שמוצגים כאן הם דוגמה בלבד.'},
 {title:'בודקים לפני השליחה',heading:['בודקים את הפרטים.','ורק אז שולחים.'],lines:['משלימים פרטי קשר לפי הצורך.','קוראים את התיאור פעם נוספת.','לוחצים על שליחת הדיווח.','בסרטון לא נשלחת פנייה אמיתית.'],image:'04-review.png',target:[730,548],voice:'משלימים פרטי קשר לפי הצורך, ובודקים את התיאור פעם נוספת. כשהכול נכון, לוחצים על שליחת הדיווח. בסרטון הזה אנחנו לא שולחים פנייה אמיתית.'},
 {title:'נשארים מעודכנים',heading:['שומרים קוד.','עוקבים אחר הפנייה.'],lines:['קוד מתקבל לאחר שמירה בשרת.','נכנסים אל ״מעקב פנייה״,','או אל ״הפניות שלי״.','בודקים עדכונים באותו החשבון.'],image:'05-track.png',target:[882,445],voice:'רק אחרי אישור השמירה בשרת מתקבל קוד מעקב. שומרים אותו ובודקים עדכונים דרך מעקב פנייה או הפניות שלי. יש להתחבר לאותו החשבון שממנו נשלחה הפנייה.'},
 {title:'במה הצוות יכול לעזור',heading:['לא נשארים לבד','עם השאלות.'],lines:['לעזור לעשות סדר בפרטים.','להכווין לצעדי בטיחות.','להפנות לערוצי דיווח רשמיים.','לעקוב ולענות דרך הפנייה.'],image:'shield',voice:'הצוות יכול לעזור לעשות סדר בפרטי המקרה, להכווין לצעדי בטיחות ולערוצי הדיווח הרשמיים של הפלטפורמה, ולענות ולעקוב דרך הפנייה באתר. הצוות לא יכול להבטיח שחזור של חשבון, הסרת תוכן או פעולה של משטרה. אל תחכו לתשובה באתר כאשר יש סכנה מיידית.'},
 {title:'במקרה חירום לא מחכים',heading:['יש סכנה מיידית?','פונים לעזרה עכשיו.'],lines:['100 · משטרת ישראל','105 · פגיעה בילדים ברשת','SMAI היא יוזמה עצמאית,','לא משטרה ולא שירות חירום.'],image:'shield',voice:'חשוב לזכור: סמאי היא יוזמה עצמאית, לא משטרה ולא שירות חירום. בסכנה מיידית מתקשרים למאה. לפגיעה בילדים ובני נוער ברשת אפשר לפנות למוקד מאה וחמש. אתם לא צריכים לעבור את זה לבד.'}
];
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:8e6});if(r.status!==0)throw new Error(`${cmd}: ${r.stderr||r.error||r.status}`);return r.stdout;};
const svg=s=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${s}</svg>`);
const text=(value,x,y,size,color='#ecf0fa',weight=400)=>`<text x="${x}" y="${y}" direction="rtl" unicode-bidi="embed" text-anchor="start" font-family="Arial" font-size="${size}" fill="${color}" font-weight="${weight}">${xml(value)}</text>`;
const cursor=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="68" height="78" viewBox="0 0 68 78"><circle cx="26" cy="28" r="24" fill="#527bff" fill-opacity=".18" stroke="#94b2ff" stroke-opacity=".6"/><path d="M20 16L21 57L31 46L42 65L51 60L40 42L55 40Z" fill="white" stroke="#2446aa" stroke-width="3" stroke-linejoin="round"/></svg>');
await sharp(cursor).png().toFile(path.join(work,'cursor.png'));
const chapters=[];let total=0;
for(let i=0;i<scenes.length;i++){
  const s=scenes[i],prefix=path.join(work,`scene-${String(i).padStart(2,'0')}`);
  await writeFile(prefix+'.txt',s.voice);
  run('/usr/bin/say',['-v','Carmit','-r','157','-f',prefix+'.txt','-o',prefix+'.aiff']);
  const speechSeconds=Number(run(ffprobe,['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',prefix+'.aiff']).trim());
  if(!Number.isFinite(speechSeconds)||speechSeconds<1)throw new Error('Local speech service returned empty audio. Run with permission to access the macOS speech service.');
  const duration=Math.ceil((speechSeconds+1.1)*24)/24;
  let layer=`<rect width="1920" height="1080" fill="#080d17"/><rect x="1414" y="118" width="458" height="884" rx="24" fill="#101725" stroke="#23314a"/><rect x="46" y="116" width="1332" height="910" rx="20" fill="#101725" stroke="#33405a"/>`;
  layer+=`<text x="50" y="65" font-family="Arial" font-size="27" fill="#ecf0fa" letter-spacing="3">SMAI <tspan fill="#8ca7ff">SENTINEL</tspan></text>`;
  layer+=text('מדריך מצולם · צעד אחר צעד',1860,63,24,'#a8b6d0');
  layer+=`<text x="1835" y="183" text-anchor="end" font-family="Arial" font-size="22" fill="#8ca7ff">${String(i+1).padStart(2,'0')} / ${scenes.length}</text>`;
  s.heading.forEach((line,n)=>layer+=text(line,1835,279+n*64,43,'#f3f6ff',700));
  s.lines.forEach((line,n)=>{layer+=`<circle cx="1827" cy="${466+n*75}" r="4" fill="#8ca7ff"/>`;layer+=text(line,1808,474+n*75,25,'#b6c4dd');});
  layer+=text('הדגמה בלבד · ללא שליחת פנייה',1835,950,19,'#8b9dbb');
  layer+=text('אין לשתף סיסמאות, קודי אימות או תוכן אינטימי.',1340,1060,22,'#8b9dbb');
  const step=454/scenes.length;
  for(let p=0;p<scenes.length;p++)layer+=`<rect x="${1415+p*step}" y="1022" width="${step-7}" height="4" rx="2" fill="${p<=i?'#6b92ff':'#27354c'}"/>`;
  await sharp(svg(layer)).png().toFile(prefix+'-base.png');
  let shot;
  if(s.image==='shield')shot=await sharp(path.join(root,'public/assets/sentinel-core.webp')).resize(1328,904,{fit:'contain',background:'#090e1b'}).png().toBuffer();
  else {
    let input=sharp(path.join(work,s.image));
    // Crop browser-account chrome from every screenshot. Tracking capture is only 600px high,
    // deliberately excluding cached tracking codes and all private ticket information below it.
    const meta=await input.metadata();
    input=input.extract({left:0,top:72,width:meta.width,height:meta.height-72});
    shot=await input.resize(1328,904,{fit:'contain',background:'#080d17'}).png().toBuffer();
  }
  await writeFile(prefix+'-screen.png',shot);
  const plain=await sharp(prefix+'-base.png').composite([{input:shot,left:48,top:120}]).png().toBuffer();
  await writeFile(prefix+'-preview.png',plain);
  if(i===0)await sharp(plain).resize(1280,720).webp({quality:85}).toFile(path.join(output,'smai-guide-poster.webp'));
  // Actual captures remain unaltered; motion, cursor, captions and narration are editorial layers.
  let filter=`[1:v]zoompan=z='min(1.009,1+on*0.000018)':d=1:fps=24:s=1328x904[shot];[0:v][shot]overlay=48:120[scene];`;
  if(s.target&&s.image!=='05-track.png'){
    const x=Math.round(48+s.target[0]*1328/1440),y=Math.round(120+(s.target[1]-72)*904/908);
    filter+=`[scene][2:v]overlay=x='${x}-260*(1-min(t/2.2,1))':y='${y}+140*(1-min(t/2.2,1))':enable='gte(t,0.6)'[cursor];[cursor]`;
  }else filter+='[scene]';
  filter+=`fade=t=in:d=0.3,fade=t=out:st=${duration-.25}:d=0.25,format=yuv420p[out]`;
  run(ffmpeg,['-hide_banner','-loglevel','error','-y','-loop','1','-framerate','24','-i',prefix+'-base.png','-loop','1','-framerate','24','-i',prefix+'-screen.png','-loop','1','-framerate','24','-i',path.join(work,'cursor.png'),'-i',prefix+'.aiff','-filter_complex',filter,'-map','[out]','-map','3:a','-af','loudnorm=I=-16:TP=-1.5:LRA=11,apad','-t',String(duration),'-c:v','libx264','-preset','fast','-crf','23','-c:a','aac','-b:a','96k','-movflags','+faststart',prefix+'.mp4']);
  chapters.push({title:s.title,start:Math.round(total*1000)/1000,end:Math.round((total+duration)*1000)/1000,speechDuration:speechSeconds,text:s.voice,summary:s.lines.join(' ')});total+=duration;
  console.log(`Scene ${i+1}/${scenes.length}: ${duration.toFixed(1)}s`);
}
await writeFile(path.join(work,'concat.txt'),scenes.map((_,i)=>`file 'scene-${String(i).padStart(2,'0')}.mp4'`).join('\n'));
run(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(work,'concat.txt'),'-c','copy','-movflags','+faststart',path.join(output,'smai-guide-he.mp4')]);
await writeFile(path.join(output,'smai-guide.json'),JSON.stringify({version:1,duration:total,chapters},null,2));
const stamp=seconds=>new Date(Math.round(seconds*1000)).toISOString().slice(11,23);
const cues=chapters.flatMap(c=>{
  const lines=[];let line='';
  for(const word of c.text.split(' ')){if((line+' '+word).length>85){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);
  const length=lines.reduce((sum,line)=>sum+line.length,0);let elapsed=0;
  return lines.map(line=>{const start=c.start+elapsed;elapsed+=c.speechDuration*line.length/length;return `${stamp(start)} --> ${stamp(c.start+elapsed)}\n${line}\n`;});
});
await writeFile(path.join(output,'smai-guide-he.vtt'),'WEBVTT\n\n'+cues.join('\n'));
console.log(`Finished: ${total.toFixed(1)} seconds — public/media/smai-guide-he.mp4`);
