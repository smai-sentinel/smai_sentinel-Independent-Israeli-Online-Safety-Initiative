const API='https://smai-sentinel-api.smai-sentinel-hcode404.workers.dev';
chrome.action.onClicked.addListener(tab=>chrome.sidePanel.open({tabId:tab.id}));
chrome.runtime.onInstalled.addListener(()=>chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}));

async function currentTab(){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw new Error('לא נמצא טאב פעיל');return tab;}
async function permissionFor(url){const origin=new URL(url).origin+'/*';if(await chrome.permissions.contains({origins:[origin]}))return true;return chrome.permissions.request({origins:[origin]});}
async function ensureContent(tab){if(!/^https?:/.test(tab.url||''))throw new Error('אפשר לשלוט רק בעמודי אינטרנט רגילים');if(!await permissionFor(tab.url))throw new Error('לא ניתנה הרשאה לעמוד הזה');try{await chrome.tabs.sendMessage(tab.id,{type:'PING'});}catch{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});}}
async function pageState(tab){await ensureContent(tab);return chrome.tabs.sendMessage(tab.id,{type:'SNAPSHOT'});}
async function plan(goal,state){
  const response=await fetch(API+'/api/extension/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goal,state,consent:true})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'המודל לא הצליח לתכנן פעולה');return data;
}
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{(async()=>{
  if(message.type==='STATE'){const tab=await currentTab();return {tab:{id:tab.id,title:tab.title,url:tab.url},state:await pageState(tab)};}
  if(message.type==='PLAN'){const tab=await currentTab(),state=await pageState(tab);return {tab:{id:tab.id,title:tab.title,url:tab.url},plan:await plan(message.goal,state)};}
  if(message.type==='EXECUTE'){
    if(message.action.type==='wait'){await new Promise(resolve=>setTimeout(resolve,Math.min(120000,Math.max(250,Number(message.action.amount)||1000))));return {ok:true};}
    if(message.action.type==='openTab'){const tab=await chrome.tabs.create({url:message.action.url,active:true});return {ok:true,tabId:tab.id};}
    if(message.action.type==='navigate'){const tab=await currentTab();await chrome.tabs.update(tab.id,{url:message.action.url});return {ok:true};}
    const tab=await currentTab();await ensureContent(tab);return chrome.tabs.sendMessage(tab.id,{type:'EXECUTE',action:message.action});
  }
  if(message.type==='TABS')return chrome.tabs.query({currentWindow:true}).then(tabs=>tabs.filter(t=>/^https?:/.test(t.url||'')).map(t=>({id:t.id,title:t.title,url:t.url,active:t.active})));
  if(message.type==='ACTIVATE_TAB'){await chrome.tabs.update(message.tabId,{active:true});return {ok:true};}
  throw new Error('בקשה לא מוכרת');
})().then(reply).catch(error=>reply({error:error.message}));return true;});
