import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';
import ts from 'typescript';
async function setup() {
 const context=createContext({});
 const source=ts.transpileModule(await readFile('lib/useImageSwipe.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod=new SourceTextModule(source,{context});
 await mod.link(()=>new SyntheticModule(['useRef'],function(){this.setExport('useRef',initial=>({current:initial}))},{context}));
 await mod.evaluate();
 const moves=[],captures=new Set();const handlers=mod.namespace.useImageSwipe(d=>moves.push(d));
 const event=(x,y,extra={})=>({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:y,target:{closest:()=>null},currentTarget:{setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)},...extra});
 return {handlers,event,moves};
}
test('horizontal swipe moves forward and backward',async()=>{const {handlers:h,event:e,moves}=await setup();h.onPointerDown(e(200,100));h.onPointerUp(e(100,110));h.onPointerDown(e(100,100));h.onPointerUp(e(200,100));assert.deepEqual(moves,[1,-1])});
test('taps, vertical scrolls, diagonal gestures and cancelled pointers do not navigate',async()=>{const {handlers:h,event:e,moves}=await setup();for(const [x,y] of [[110,105],[110,250],[150,150]]){h.onPointerDown(e(100,100));h.onPointerUp(e(x,y))}h.onPointerDown(e(200,100));h.onPointerCancel();h.onPointerUp(e(100,100));assert.deepEqual(moves,[])});
test('two-finger gestures and arrow-button contacts do not swipe',async()=>{const {handlers:h,event:e,moves}=await setup();h.onPointerDown(e(200,100));h.onPointerDown(e(150,100,{isPrimary:false,pointerId:2}));h.onPointerUp(e(100,100));h.onPointerDown(e(200,100,{target:{closest:()=>({})}}));h.onPointerUp(e(100,100));assert.deepEqual(moves,[])});
