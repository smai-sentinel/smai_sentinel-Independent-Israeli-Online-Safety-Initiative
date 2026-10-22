import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';

const compiled=await build({entryPoints:[new URL('../src/home.js',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',loader:{'.css':'empty'}});
const {renderHome}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

function fixture({reduced=false,preference='on',draft=''}={}){
  const old={};
  const storage=entries=>{const map=new Map(entries);return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value))};};
  const media={matches:reduced,addEventListener(){},removeEventListener(){this.cleaned=true;}};
  const globals={document:{hidden:false,addEventListener(){},removeEventListener(){}},matchMedia:()=>media,localStorage:storage([['smai_home_motion',preference]]),sessionStorage:storage([['smai_report_draft',draft]]),window:{},location:{hash:''}};
  for(const [key,value] of Object.entries(globals)){old[key]=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
  const nodes=Object.fromEntries(['homeMotionToggle','homeExplore','home-explore','quick-description','draftCount','quick-report'].map(id=>[id,{value:'',textContent:'',checked:false,scrollIntoView(options){this.scrolled=options;}}]));
  const home={dataset:{},classList:{toggle(){}},querySelector:selector=>nodes[selector.slice(1)],querySelectorAll:()=>[]};
  const app={innerHTML:'',querySelector:()=>home};
  let cleanup;
  renderHome(app,{ic:()=>'<svg></svg>',esc:escape,Auth:{user:{name:'<visitor>'}},DEPTS:[{id:'other',ico:'shield',short:'תמיכה',desc:'כאן בשבילכם'}],onCleanup:fn=>cleanup=fn});
  return {app,home,nodes,media,restore(){cleanup?.();for(const key of Object.keys(globals)){if(old[key])Object.defineProperty(globalThis,key,old[key]);else delete globalThis[key];}}};
}

test('new landing preserves core destinations and never renders a branded entrance overlay',()=>{
  const f=fixture();try{
    for(const path of ['/report','/community','/ai','/friends','/games','/contact','/join','/track'])assert.ok(f.app.innerHTML.includes(`href="${path}"`),path);
    assert.ok(f.app.innerHTML.includes('&lt;visitor&gt;'));
    assert.ok(!f.app.innerHTML.includes('<visitor>'));
    assert.ok(!f.app.innerHTML.includes('sentinel-arrival'));
    assert.ok(f.app.innerHTML.includes('/assets/sentinel-core.webp'));
  }finally{f.restore();}
});

test('quick report restores and saves a device draft without submitting a report',()=>{
  const f=fixture({draft:'existing draft'});try{
    assert.equal(f.nodes['quick-description'].value,'existing draft');
    f.nodes['quick-description'].value='new draft';f.nodes['quick-description'].oninput();
    assert.equal(sessionStorage.getItem('smai_report_draft'),'new draft');
    assert.equal(f.nodes.draftCount.textContent,'9 / 4,000');
    let prevented=false;f.nodes['quick-report'].onsubmit({preventDefault(){prevented=true;}});
    assert.ok(prevented);assert.equal(location.hash,'#/report');
  }finally{f.restore();}
});

test('motion preference and reduced motion keep the full page available without animation',()=>{
  const f=fixture({preference:'off'});try{
    assert.equal(f.home.dataset.motion,'off');assert.equal(f.nodes.homeMotionToggle.checked,false);
    f.nodes.homeMotionToggle.checked=true;f.nodes.homeMotionToggle.onchange();
    assert.equal(localStorage.getItem('smai_home_motion'),'on');assert.equal(f.home.dataset.motion,'on');
  }finally{f.restore();}
  assert.ok(f.media.cleaned);
  const reduced=fixture({reduced:true});try{
    assert.equal(reduced.home.dataset.motion,'off');
    reduced.nodes.homeExplore.onclick({preventDefault(){}});
    assert.equal(reduced.nodes['home-explore'].scrolled.behavior,'instant');
  }finally{reduced.restore();}
});

test('sidebar uses the shared router, retains the mobile dock and no longer forces a reload',async()=>{
  const source=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const nav=source.slice(source.indexOf('function renderNav()'),source.indexOf('function renderFooter()'));
  assert.doesNotMatch(nav,/setTimeout\(\s*\(\)\s*=>\s*location\.href/);
  assert.match(nav,/nova-mobile-dock/);
  assert.match(source,/nav\.inert=!nav\.classList\.contains\('open'\)/);
});
