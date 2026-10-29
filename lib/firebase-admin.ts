import { getStorage } from 'firebase-admin/storage';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
function adminApp() {
  if (getApps().length) return getApps()[0];
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase Admin is not configured');
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
export const adminDb = () => getFirestore(adminApp());
export const adminStorage = () => getStorage(adminApp()).bucket(process.env.FIREBASE_STORAGE_BUCKET || 'hedoomyy.firebasestorage.app');
export const adminAuth = () => getAuth(adminApp());
export async function requestIdentity(request: Request) {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) throw Object.assign(new Error('Please sign in again.'), { status: 401 });
  try { const identity = await adminAuth().verifyIdToken(header.slice(7), true); if (!identity.email) throw Object.assign(new Error('Use an account with an email address.'), { status: 401 }); return identity; }
  catch (error: any) {
    if (error.status === 401 || error.code?.startsWith('auth/')) throw Object.assign(new Error('Please sign in again.'), { status: 401 });
    throw error;
  }
}
