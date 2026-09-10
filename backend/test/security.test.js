import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceTrustedOrigin } from '../src/middleware/origin.js';
import { rejectUnsafeInput } from '../src/middleware/inputGuard.js';
import { pick } from '../src/utils/input.js';

const response = () => ({ statusCode:200, payload:null, status(code){this.statusCode=code;return this;}, json(value){this.payload=value;return this;} });

test('trusted-origin middleware blocks cookie-authenticated cross-site writes', () => {
  const req={method:'POST',cookies:{rcerp_token:'token'},get:()=> 'https://evil.example'};
  const res=response(); let continued=false;
  enforceTrustedOrigin(['https://erp.example'])(req,res,()=>{continued=true;});
  assert.equal(continued,false); assert.equal(res.statusCode,403);
});

test('trusted-origin middleware allows configured frontend', () => {
  const req={method:'POST',cookies:{rcerp_token:'token'},get:()=> 'https://erp.example'};
  const res=response(); let continued=false;
  enforceTrustedOrigin(['https://erp.example'])(req,res,()=>{continued=true;});
  assert.equal(continued,true);
});

test('input guard rejects MongoDB operator keys', () => {
  const req={body:{status:{$ne:'inactive'}},query:{},params:{}};
  const res=response(); let continued=false;
  rejectUnsafeInput(req,res,()=>{continued=true;});
  assert.equal(continued,false); assert.equal(res.statusCode,400);
});

test('pick prevents mass assignment', () => {
  assert.deepEqual(pick({name:'Allowed',createdBy:'attacker'},['name']),{name:'Allowed'});
});
