import { adminDb, requestIdentity } from '@/lib/firebase-admin';
import { createCheckout } from '@/lib/checkoutService';
import { CheckoutError } from '@/lib/checkoutValidation';

export async function POST(request: Request) {
  try {
    const identity = await requestIdentity(request);
    const body = await request.json().catch(() => null);
    if (!body || typeof body.couponCode !== 'string' || !body.couponCode.trim()) {
      return Response.json({ error: 'Enter a promo code.' }, { status: 400 });
    }
    const quote = await createCheckout(adminDb(), body, crypto.randomUUID(), identity, new Date(), true, true);
    return Response.json({ code: quote.couponCode, discount: quote.totals.discount }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    const failure = error as { status?: number; message?: string };
    const configuration = failure.message?.includes('Firebase Admin is not configured');
    return Response.json({ error: configuration ? 'Promo validation is temporarily unavailable because the store server is not configured. Please contact the store.' : error instanceof CheckoutError || failure.status === 401 ? failure.message : 'Could not check this promo code. Please try again.' }, { status: configuration ? 503 : failure.status || 500 });
  }
}
