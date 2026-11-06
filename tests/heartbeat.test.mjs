import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createContext,SourceTextModule,SyntheticModule} from 'node:vm';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
async function harness(storage=new Map()) {
 const requests=[], listeners=new Map(); let interval,cleanup;
 const document={visibilityState:'visible',addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 const window={addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 const navigator={onLine:true};
 const context=createContext({console,document,window,navigator,AbortSignal,crypto:{randomUUID:()=> 'test-browser-123'},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},fetch:async (url,options)=>{requests.push(JSON.parse(options.body));return {ok:true}},setInterval:fn=>{interval=fn;return 1},clearInterval:()=>{interval=null}});
 const mocks={react:{useRef:()=>({current:null}),useEffect:fn=>{cleanup=fn()}},'@/context/AuthContext':{useAuth:()=>({user:null})},'next/navigation':{usePathname:()=>'/products'}};
 const mod=new SourceTextModule(compile(await fs.readFile('lib/useHeartbeat.ts','utf8')),{context});
 await mod.link(name=>{const data=mocks[name];return new SyntheticModule(Object.keys(data),function(){for(const [k,v] of Object.entries(data))this.setExport(k,v)},{context})});await mod.evaluate();mod.namespace.useHeartbeat();await new Promise(resolve => setImmediate(resolve));
 return {requests,document,navigator,storage,tick:async()=>{await interval?.()},event:async k=>{await listeners.get(k)?.()},cleanup,listeners};
}
test('immediate heartbeat and periodic renewal use the same identity across reloads/tabs',async()=>{const h=await harness();assert.equal(h.requests.length,1);await h.tick();assert.equal(h.requests.length,2);const second=await harness(h.storage);assert.equal(second.requests[0].sessionId,h.requests[0].sessionId);assert.equal(h.requests[0].path,'/products')});
test('hidden and offline tabs do not renew; visibility and reconnect resume immediately',async()=>{const h=await harness();h.document.visibilityState='hidden';await h.tick();assert.equal(h.requests.length,1);h.document.visibilityState='visible';await h.event('visibilitychange');assert.equal(h.requests.length,2);h.navigator.onLine=false;await h.tick();assert.equal(h.requests.length,2);h.navigator.onLine=true;await h.event('online');assert.equal(h.requests.length,3)});
test('cleanup removes timers and listeners',async()=>{const h=await harness();h.cleanup();assert.equal(h.listeners.size,0);await h.tick();assert.equal(h.requests.length,1)});
test('presence is mounted in the storefront root layout',async()=>{assert.match(await fs.readFile('app/layout.tsx','utf8'),/<VisitorPresence\s*\/>/)});

async function routeHarness(fail=false) {
 const writes=[];
 const context=createContext({Response,Date,console:{error(){}}});
 const mod=new SourceTextModule(compile(await fs.readFile('app/api/heartbeat/route.ts','utf8')),{context});
 await mod.link(name=>{assert.equal(name,'@/lib/firestore-server');return new SyntheticModule(['upsertDocument'],function(){this.setExport('upsertDocument',async(...args)=>{if(fail)throw new Error('offline');writes.push(args)})},{context})});
 await mod.evaluate();return {writes,post:body=>mod.namespace.POST({json:async()=>body})};
}
test('heartbeat stores server time and browser identity, strips URL query strings',async()=>{const h=await routeHarness();const before=Date.now();const r=await h.post({sessionId:'browser-123456',path:'/products?secret=omit'});assert.equal(r.status,200);assert.equal(h.writes[0][0],'activePresence');assert.equal(h.writes[0][1],'browser-123456');assert.equal(h.writes[0][2].sessionId,'browser-123456');assert.equal(h.writes[0][2].path,'/products');assert.ok(h.writes[0][2].lastActive.getTime()>=before)});
test('malformed identities never write and storage failures are not reported as success',async()=>{const h=await routeHarness();assert.equal((await h.post({sessionId:'../bad'})).status,400);assert.equal(h.writes.length,0);const broken=await routeHarness(true);assert.equal((await broken.post({sessionId:'browser-123456'})).status,500)});
