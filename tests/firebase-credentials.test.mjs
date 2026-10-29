import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createPrivateKey } from 'node:crypto';
import { cert } from 'firebase-admin/app';
import { normalizePrivateKey, firebaseCredentialOptions, firebaseConfigurationError } from '../lib/firebaseCredentials.js';
import { checkoutFailure } from '../lib/checkoutFailure.js';
import { CheckoutError } from '../lib/checkoutValidation.js';
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
test('Firebase PEM credentials accept real, escaped, doubly escaped and quoted line breaks', () => {
  const slash = String.fromCharCode(92);
  const newline = String.fromCharCode(10);
  const forms = [privateKey, privateKey.replaceAll(newline, slash + 'n'), privateKey.replaceAll(newline, slash + slash + 'n'), JSON.stringify(privateKey), privateKey.replaceAll(newline, slash + 'r' + slash + 'n')];
  for (const value of forms) {
    const normalized = normalizePrivateKey(value);
    assert.equal(createPrivateKey(normalized).asymmetricKeyType, 'rsa');
    const credential = firebaseCredentialOptions({ FIREBASE_PROJECT_ID: 'demo-project', FIREBASE_CLIENT_EMAIL: 'server@demo-project.iam.gserviceaccount.com', FIREBASE_PRIVATE_KEY: value });
    assert.ok(cert(credential));
  }
});
test('missing Firebase credentials fail with a configuration code and no secret contents', () => {
  assert.throws(() => firebaseCredentialOptions({ FIREBASE_PROJECT_ID: 'demo' }), error => error.code === 'STORE_FIREBASE_CONFIGURATION');
});
test('checkout distinguishes configuration, data access, database outage and invalid promo errors', () => {
  for (const [error, code] of [[Object.assign(new Error('secret credential detail'), { code: 'STORE_FIREBASE_CONFIGURATION' }), 'STORE_FIREBASE_CONFIGURATION'], [Object.assign(new Error('private error'), { code: 7 }), 'STORE_DATABASE_ACCESS'], [Object.assign(new Error('private error'), { code: 14 }), 'STORE_DATABASE_UNAVAILABLE']]) {
    const failure = checkoutFailure(error, 'test');
    assert.equal(failure.status, 503); assert.equal(failure.body.code, code);
    assert.ok(failure.body.requestId); assert.doesNotMatch(failure.body.error, /secret credential detail|private error/);
  }
  const failure = checkoutFailure(new CheckoutError('This code does not apply to the selected items.'), 'test');
  assert.equal(failure.status, 400); assert.match(failure.body.error, /does not apply/);
});

test('diagnostics distinguish variables missing at runtime from malformed keys and SDK initialization', () => {
  for (const [env, expected] of [[{}, 'missing_project_id'], [{ FIREBASE_PROJECT_ID: 'demo' }, 'missing_client_email'], [{ FIREBASE_PROJECT_ID: 'demo', FIREBASE_CLIENT_EMAIL: 'server@example.com' }, 'missing_private_key'], [{ FIREBASE_PROJECT_ID: 'demo', FIREBASE_CLIENT_EMAIL: 'server@example.com', FIREBASE_PRIVATE_KEY: 'invalid-key-secret' }, 'private_key_format']]) {
    assert.throws(() => firebaseCredentialOptions(env), error => {
      assert.equal(error.configurationIssue, expected);
      const response = checkoutFailure(error, 'test');
      assert.equal(response.status, 503); assert.doesNotMatch(JSON.stringify(response), /invalid-key-secret/);
      return true;
    });
  }
  const certificate = checkoutFailure(firebaseConfigurationError('certificate_configuration', 'app/invalid-credential'), 'test');
  assert.match(certificate.body.error, /private key parsed/);
  const app = checkoutFailure(firebaseConfigurationError('app_initialization', 'app/duplicate-app'), 'test');
  assert.match(app.body.error, /application initialization failed/);
});
