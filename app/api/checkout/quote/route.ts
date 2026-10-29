import { adminDb, requestIdentity } from '@/lib/firebase-admin';
import { createCheckout } from '@/lib/checkoutService';
import { CheckoutError } from '@/lib/checkoutValidation';

export async function POST(request: Request) {
  try {
    const identity = await requestIdentity(request);
    const body = await request.json();
    const quote = await createCheckout(adminDb(), body, crypto.randomUUID(), identity, new Date(), true);
    return Response.json(quote, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    const failure = error as { status?: number; message?: string; fields?: Record<string, string> };
    if (failure.message?.includes('Firebase Admin is not configured')) return Response.json({ error: 'Checkout validation is unavailable because the store server is not configured. Please contact the store.' }, { status: 503 });
    return Response.json({ error: error instanceof CheckoutError ? failure.message : failure.status === 401 ? failure.message : 'Could not validate checkout. Please try again.' }, { status: failure.status || 500 });
  }
}
