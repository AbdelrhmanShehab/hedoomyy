import { adminDb, requestIdentity } from '@/lib/firebase-admin';
import { createCheckout } from '@/lib/checkoutService';
import { checkoutFailure } from '@/lib/checkoutFailure';

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
    const failure = checkoutFailure(error, 'promo');
    return Response.json(failure.body, { status: failure.status });
  }
}
