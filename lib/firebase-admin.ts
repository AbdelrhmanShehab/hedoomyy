import { getStorage } from 'firebase-admin/storage';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseCredentialOptions } from './firebaseCredentials.js';
function adminApp() {
  if (getApps().length) return getApps()[0];
  const credentials = firebaseCredentialOptions(process.env);
  try { return initializeApp({ credential: cert(credentials) }); }
  catch { throw Object.assign(new Error('Firebase Admin credentials are invalid'), { code: 'STORE_FIREBASE_CONFIGURATION' }); }
}
export const adminDb = () => getFirestore(adminApp());
export const adminStorage = () => getStorage(adminApp()).bucket(process.env.FIREBASE_STORAGE_BUCKET || 'hedoomyy.firebasestorage.app');
export const adminAuth = () => getAuth(adminApp());
export async function requestIdentity(request: Request) {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) throw Object.assign(new Error('Please sign in again.'), { status: 401 });
  try { const identity = await adminAuth().verifyIdToken(header.slice(7), true); if (!identity.email) throw Object.assign(new Error('Use an account with an email address.'), { status: 401 }); return identity; }
  catch (error: unknown) {
    const failure = error as { status?: number; code?: string };
    if (['auth/invalid-credential', 'app/invalid-credential'].includes(failure.code || '')) throw Object.assign(new Error('Firebase Admin credentials are invalid'), { code: 'STORE_FIREBASE_CONFIGURATION' });
    if (failure.status === 401 || failure.code?.startsWith('auth/')) throw Object.assign(new Error('Please sign in again.'), { status: 401 });
    throw error;
  }
}
