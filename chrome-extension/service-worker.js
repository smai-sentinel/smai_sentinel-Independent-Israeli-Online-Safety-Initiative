const API='https://smai-sentinel-api.smai-sentinel-hcode404.workers.dev';
const IDLE_MS=15*60*1000;
chrome.action.onClicked.addListener(tab=>chrome.sidePanel.open({tabId:tab.id}));
chrome.runtime.onInstalled.addListener(()=>chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}));

let saveTimer;
async function saveWorkspace(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    const windows=await chrome.windows.getAll({populate:true,windowTypes:['normal']});
    const workspace=windows.map(win=>({tabs:(win.tabs||[]).filter(tab=>/^https?:/.test(tab.url||'')).map(tab=>({url:tab.url,title:tab.title,pinned:tab.pinned,active:tab.active,index:tab.index}))})).filter(win=>win.tabs.length);
    await chrome.storage.local.set({workspace,workspaceSavedAt:Date.now()});
  },350);
}
chrome.tabs.onCreated.addListener(saveWorkspace);
chrome.tabs.onUpdated.addListener(saveWorkspace);
chrome.tabs.onRemoved.addListener(saveWorkspace);
chrome.tabs.onMoved.addListener(saveWorkspace);
chrome.tabs.onActivated.addListener(saveWorkspace);
chrome.windows.onRemoved.addListener(saveWorkspace);
chrome.runtime.onStartup.addListener(()=>chrome.storage.local.set({agentAwakeAt:Date.now()}));

async function currentTab(){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw new Error('לא נמצא טאב פעיל');return tab;}
async function permissionFor(url){const origin=new URL(url).origin+'/*';if(await chrome.permissions.contains({origins:[origin]}))return true;return chrome.permissions.request({origins:[origin]});}
async function ensureContent(tab){if(!/^https?:/.test(tab.url||''))throw new Error('אפשר לשלוט רק בעמודי אינטרנט רגילים');if(!await permissionFor(tab.url))throw new Error('לא ניתנה הרשאה לעמוד הזה');try{await chrome.tabs.sendMessage(tab.id,{type:'PING'});}catch{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});}}
async function pageState(tab){await ensureContent(tab);return chrome.tabs.sendMessage(tab.id,{type:'SNAPSHOT'});}
async function plan(goal,state){
  const response=await fetch(API+'/api/extension/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goal,state,consent:true})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'המודל לא הצליח לתכנן פעולה');return data;
}
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{(async()=>{
  if(message.type==='AGENT_STATUS'){const saved=await chrome.storage.local.get('agentLastActive'),last=Number(saved.agentLastActive||0);return {connected:Date.now()-last<IDLE_MS,lastActive:last};}
  if(message.type==='AGENT_RECONNECT'){await chrome.storage.local.set({agentLastActive:Date.now()});return {connected:true};}
  const activityTypes=new Set(['STATE','PLAN','EXECUTE','TABS','ACTIVATE_TAB','RESTORE_WORKSPACE']);
  if(activityTypes.has(message.type)){
    const saved=await chrome.storage.local.get('agentLastActive'),last=Number(saved.agentLastActive||0);
    if(last&&Date.now()-last>=IDLE_MS)throw new Error('AGENT_IDLE');
    await chrome.storage.local.set({agentLastActive:Date.now()});
  }
  if(message.type==='STATE'){const tab=await currentTab();return {tab:{id:tab.id,title:tab.title,url:tab.url},state:await pageState(tab)};}
  if(message.type==='PLAN'){const tab=await currentTab(),state=await pageState(tab);return {tab:{id:tab.id,title:tab.title,url:tab.url},plan:await plan(message.goal,state)};}
  if(message.type==='EXECUTE'){
    if(message.action.type==='wait'){await new Promise(resolve=>setTimeout(resolve,Math.min(120000,Math.max(250,Number(message.action.amount)||1000))));return {ok:true};}
    if(message.action.type==='openTab'){const tab=await chrome.tabs.create({url:message.action.url,active:true});return {ok:true,tabId:tab.id};}
    if(message.action.type==='navigate'){const tab=await currentTab();await chrome.tabs.update(tab.id,{url:message.action.url});return {ok:true};}
    const tab=await currentTab();await ensureContent(tab);return chrome.tabs.sendMessage(tab.id,{type:'EXECUTE',action:message.action});
  }
  if(message.type==='TABS')return chrome.tabs.query({currentWindow:true}).then(tabs=>tabs.filter(t=>/^https?:/.test(t.url||'')).map(t=>({id:t.id,title:t.title,url:t.url,active:t.active})));
  if(message.type==='WORKSPACE_INFO'){const saved=await chrome.storage.local.get(['workspace','workspaceSavedAt']);return {windows:saved.workspace||[],savedAt:saved.workspaceSavedAt||0};}
  if(message.type==='RESTORE_WORKSPACE'){
    const saved=await chrome.storage.local.get('workspace'),tabs=(saved.workspace||[]).flatMap(win=>win.tabs||[]).filter(tab=>/^https?:/.test(tab.url||''));
    if(!tabs.length)throw new Error('לא נמצאה סביבת עבודה שמורה');
    const existing=await chrome.tabs.query({});const urls=new Set(existing.map(tab=>tab.url));let restored=0;
    for(const tab of tabs){if(urls.has(tab.url))continue;await chrome.tabs.create({url:tab.url,active:false,pinned:Boolean(tab.pinned)});urls.add(tab.url);restored++;}
    return {ok:true,restored};
  }
  if(message.type==='ACTIVATE_TAB'){await chrome.tabs.update(message.tabId,{active:true});return {ok:true};}
  throw new Error('בקשה לא מוכרת');
})().then(reply).catch(error=>reply({error:error.message}));return true;});
