import test from 'node:test';
import assert from 'node:assert/strict';
import {renderAnswer, safeLink} from '../src/ai-ui.js';
import {aiAccess} from '../server/ai-access.js';

test('AI formatting preserves text without permitting injected markup or URLs',()=>{
  const result=renderAnswer('**שלום**\n\n- ראשון\n- שני\n\n```html\n<script>alert(1)</script>\n```');
  assert.ok(result.includes('<strong>שלום</strong>'));
  assert.ok(result.includes('<ul><li>ראשון</li>'));
  assert.ok(result.includes('&lt;script&gt;'));
  assert.ok(!result.includes('<script>'));
  assert.equal(safeLink('javascript:alert(1)'), '');
  assert.equal(safeLink('data:text/html,hi'), '');
  assert.equal(safeLink('https://example.com/test'),'https://example.com/test');
});

test('creator exemption requires the server-verified owner flag',()=>{
  assert.equal(aiAccess({isOwner:true}).textPerHour,null);
  assert.equal(aiAccess({isOwner:true}).imagesPerHour,null);
  assert.equal(aiAccess({rank:'founder',rankLvl:100,isOwner:false}).textPerHour,120);
  assert.equal(aiAccess({isOwner:'true'}).textPerHour,120);
  assert.equal(aiAccess(null).textPerHour,12);
  assert.equal(aiAccess(null).imagesPerHour,3);
  assert.equal(aiAccess({isOwner:true}).providerLimited,true);
  assert.equal(aiAccess(null,{AI:{}}).searchAvailable,false);
});
