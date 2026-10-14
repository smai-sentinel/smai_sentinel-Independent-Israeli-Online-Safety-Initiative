const trimQuery=value=>String(value||'').replace(/^[\s:,-]+|[\s.,!?]+$/g,'').trim();
const stripMediaWords=value=>trimQuery(value).replace(/^(?:לי\s+)?(?:סרטונים?|וידאו|תוצאות|מידע)\s+(?:של|על)\s+/i,'').replace(/\s+(?:ב|באתר\s*)?(?:יוטיוב|youtube)$/i,'').trim();

function requestedQuery(text){
  return stripMediaWords(text.match(/(?:לחפש|תחפש|חפש|לבדוק|תבדוק|בדוק|search(?:\s+for)?)\s+(.+)$/i)?.[1]||'');
}

export function browserAgentPlan(prompt){
  const text=String(prompt||'').trim(),direct=text.match(/https?:\/\/[^\s<>()]+/i)?.[0]||text.match(/(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>()]*)?/i)?.[0];
  if(direct)return {kind:'direct',startUrl:/^https?:\/\//i.test(direct)?direct:`https://${direct}`,query:'',label:'פותח את הכתובת'};
  let query=requestedQuery(text);
  if(/youtube|יוטיוב/i.test(text)){
    query=stripMediaWords(query.replace(/^(?:ביוטיוב|ב-?youtube|youtube)\s*/i,''));
    return {kind:'youtube',startUrl:'https://www.youtube.com/',query,label:query?`מחפש ביוטיוב: ${query}`:'פותח את YouTube'};
  }
  if(/google|גוגל/i.test(text)){
    query=stripMediaWords(query.replace(/^(?:בגוגל|ב-?google|google)\s*/i,''));
    return {kind:'google',startUrl:'https://www.google.com/',query,label:query?`מחפש בגוגל: ${query}`:'פותח את Google'};
  }
  if(/wikipedia|ויקיפדיה/i.test(text)){
    query=stripMediaWords(query.replace(/^(?:בויקיפדיה|ב-?wikipedia|wikipedia)\s*/i,''));
    return {kind:'wikipedia',startUrl:'https://he.wikipedia.org/',query,label:query?`מחפש בוויקיפדיה: ${query}`:'פותח את Wikipedia'};
  }
  if(/whatsapp|וואטסאפ/i.test(text)&&/(תכנס|כנס|היכנס|פתח|תפתח|חבר|התחבר)/i.test(text))return {kind:'direct',startUrl:'https://web.whatsapp.com/',query:'',label:'פותח את WhatsApp Web לסריקת QR'};
  const known=[['וואטסאפ','WhatsApp official'],['whatsapp','WhatsApp official'],['רובלוקס','Roblox official'],['roblox','Roblox official'],['דיסקורד','Discord official'],['discord','Discord official'],['אינסטגרם','Instagram official'],['instagram','Instagram official'],['טיקטוק','TikTok official'],['tiktok','TikTok official']];
  const match=known.find(([name])=>text.toLowerCase().includes(name));
  if(match&&/(תכנס|כנס|היכנס|פתח|תפתח|מצא|חפש)/i.test(text))return {kind:'google',startUrl:'https://www.google.com/',query:match[1],label:`מאתר בגוגל: ${match[1]}`};
  return null;
}

export function publicAgentTarget(prompt){
  const plan=browserAgentPlan(prompt);if(!plan)return null;if(!plan.query)return plan.startUrl;
  if(plan.kind==='youtube')return `https://www.youtube.com/results?search_query=${encodeURIComponent(plan.query)}`;
  if(plan.kind==='google')return `https://www.google.com/search?q=${encodeURIComponent(plan.query)}`;
  if(plan.kind==='wikipedia')return `https://he.wikipedia.org/w/index.php?search=${encodeURIComponent(plan.query)}`;
  return plan.startUrl;
}
