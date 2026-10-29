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
  return value.trim().replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\\+r\\+n/g, '\n').replace(/\\+n/g, '\n').replace(/\r\n/g, '\n');
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
