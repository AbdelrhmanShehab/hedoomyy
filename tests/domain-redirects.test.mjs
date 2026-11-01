import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../next.config.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { default: config } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const rules = await config.redirects();
const match = host => rules.find(rule => rule.has?.some(condition => condition.type === 'host' && new RegExp('^' + condition.value + '$').test(host)));

test('both current domain aliases are left to hosting without an application redirect loop', () => {
  assert.equal(match('hedoomyy.co'), undefined);
  assert.equal(match('www.hedoomyy.co'), undefined);
});
test('old domains still redirect permanently and preserve the path', () => {
  for (const host of ['hedoomyy.com', 'www.hedoomyy.com']) {
    const rule = match(host);
    assert.equal(rule.source, '/:path*');
    assert.equal(rule.destination, 'https://hedoomyy.co/:path*');
    assert.equal(rule.permanent, true);
  }
});
test('local development and preview hosts are not redirected', () => {
  assert.equal(match('localhost'), undefined);
  assert.equal(match('hedoomyyXcom'), undefined);
});
