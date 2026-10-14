const trimQuery=value=>String(value||'').replace(/^[\s:,-]+|[\s.,!?]+$/g,'').trim();

export function publicAgentTarget(prompt){
  const text=String(prompt||'').trim();
  const direct=text.match(/https?:\/\/[^\s<>()]+/i)?.[0]||text.match(/(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>()]*)?/i)?.[0];
  if(direct)return /^https?:\/\//i.test(direct)?direct:`https://${direct}`;
  const query=trimQuery(text.match(/(?:תחפש|חפש|תבדוק|בדוק|search(?:\s+for)?)\s+(.+)$/i)?.[1]);
  if(/youtube|יוטיוב/i.test(text))return query?`https://www.youtube.com/results?search_query=${encodeURIComponent(query.replace(/^(?:ביוטיוב|ב-?youtube|youtube)\s*/i,''))}`:'https://www.youtube.com/';
  if(/google|גוגל/i.test(text))return query?`https://www.google.com/search?q=${encodeURIComponent(query.replace(/^(?:בגוגל|ב-?google|google)\s*/i,''))}`:'https://www.google.com/';
  if(/wikipedia|ויקיפדיה/i.test(text))return query?`https://he.wikipedia.org/w/index.php?search=${encodeURIComponent(query.replace(/^(?:בויקיפדיה|ב-?wikipedia|wikipedia)\s*/i,''))}`:'https://he.wikipedia.org/';
  return null;
}
