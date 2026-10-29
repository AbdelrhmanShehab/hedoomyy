import { adminDb, requestIdentity } from '@/lib/firebase-admin';
import { createCheckout } from '@/lib/checkoutService';
import { checkoutFailure } from '@/lib/checkoutFailure';

export async function POST(request: Request) {
  try {
    const identity = await requestIdentity(request);
    const body = await request.json();
    const quote = await createCheckout(adminDb(), body, crypto.randomUUID(), identity, new Date(), true);
    return Response.json(quote, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    const failure = checkoutFailure(error, 'quote');
    return Response.json(failure.body, { status: failure.status });
  }
}
