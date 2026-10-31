import { createPrivateKey } from 'node:crypto';

export function firebaseConfigurationError(issue, sdkCode = '') {
  return Object.assign(new Error('Firebase server initialization failed'), {
    code: 'STORE_FIREBASE_CONFIGURATION', configurationIssue: issue,
    sdkCode: typeof sdkCode === 'string' && /^[a-zA-Z0-9_/-]{1,100}$/.test(sdkCode) ? sdkCode : '',
  });
}

// Environment providers may store PEM line breaks literally or as escaped text.
export function normalizePrivateKey(value) {
  if (typeof value !== 'string') return '';
  let key = value.trim();
  // Accept PEM, a JSON string, or the downloaded service-account JSON itself.
  // Some environment tools base64-encode the whole JSON/PEM value.
  for (let depth = 0; depth < 4; depth++) {
    try {
      const parsed = JSON.parse(key);
      if (typeof parsed === 'string') { key = parsed.trim(); continue; }
      if (parsed && typeof parsed.private_key === 'string') { key = parsed.private_key.trim(); continue; }
    } catch { /* A plain PEM is not JSON. */ }
    if (/^[A-Za-z0-9+/=\s]+$/.test(key) && key.length < 100000) {
      const decoded = Buffer.from(key.replace(/\s/g, ''), 'base64').toString('utf8').trim();
      if (decoded.startsWith('{') || decoded.startsWith('"') || decoded.startsWith('-----BEGIN')) { key = decoded; continue; }
    }
    break;
  }
  key = key.replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\\+r\\+n/g, '\n').replace(/\\+n/g, '\n').replace(/\r\n/g, '\n');
  const pem = key.match(/^-----BEGIN (RSA PRIVATE KEY|PRIVATE KEY)-----\s*([A-Za-z0-9+/=\s]+?)\s*-----END \1-----$/);
  if (pem) {
    const body = pem[2].replace(/\s/g, '');
    return `-----BEGIN ${pem[1]}-----\n${body.match(/.{1,64}/g)?.join('\n') || ''}\n-----END ${pem[1]}-----\n`;
  }
  return key;
}

export function firebaseCredentialOptions(env) {
  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(env.FIREBASE_PRIVATE_KEY);
  if (!projectId) throw firebaseConfigurationError('missing_project_id');
  if (!clientEmail) throw firebaseConfigurationError('missing_client_email');
  if (!privateKey) throw firebaseConfigurationError('missing_private_key');
  try {
    if (createPrivateKey(privateKey).asymmetricKeyType !== 'rsa') throw new Error('Unsupported key type');
  } catch { throw firebaseConfigurationError('private_key_format'); }
  return { projectId, clientEmail, privateKey };
}
