// Environment providers may store PEM line breaks literally or as escaped text.
export function normalizePrivateKey(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\\+r\\+n/g, '\n').replace(/\\+n/g, '\n').replace(/\r\n/g, '\n');
}

export function firebaseCredentialOptions(env) {
  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(env.FIREBASE_PRIVATE_KEY);
  if (!projectId || !clientEmail || !privateKey) throw Object.assign(new Error('Firebase Admin is not configured'), { code: 'STORE_FIREBASE_CONFIGURATION' });
  return { projectId, clientEmail, privateKey };
}
