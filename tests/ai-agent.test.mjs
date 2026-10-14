import test from 'node:test';
import assert from 'node:assert/strict';
import {browserAgentPlan,publicAgentTarget} from '../server/ai-agent.js';

test('Work mode turns natural public-site requests into the intended target',()=>{
  assert.equal(publicAgentTarget('תכנס ליוטיוב ותחפש SMAI Sentinel'),'https://www.youtube.com/results?search_query=SMAI%20Sentinel');
  assert.equal(browserAgentPlan('לחפש סרטונים של רובלוקס ביוטיוב').query,'רובלוקס');
  assert.deepEqual(browserAgentPlan('תכנס לוואטסאפ'),{kind:'direct',startUrl:'https://web.whatsapp.com/',query:'',label:'פותח את WhatsApp Web לסריקת QR'});
  assert.equal(publicAgentTarget('חפש בגוגל flydubai incident'),'https://www.google.com/search?q=flydubai%20incident');
  assert.equal(publicAgentTarget('בדוק בויקיפדיה בטיחות ברשת'),'https://he.wikipedia.org/w/index.php?search=%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA%20%D7%91%D7%A8%D7%A9%D7%AA');
  assert.equal(publicAgentTarget('פתח https://example.com/page'),'https://example.com/page');
  assert.equal(publicAgentTarget('תכתוב לי סיפור'),null);
});
