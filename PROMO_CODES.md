# Promo codes

Dashboard: open **Promo codes** in the sidebar (`/promocodes`). Create a percentage discount for all products, one product, or one category. Choose an optional expiry in your browser's local time and unlimited uses, one order, or a limited number of orders. Edit limits later, or disable the code. Codes are unique and cannot be reused by deleting and recreating them through this interface.

One use means one placed order across all customers, not one order per customer. Order creation, stock deduction and usage increment run in the same Firestore transaction. Failed checkout and preview do not redeem codes. Retrying an order with the same checkout reference does not redeem it again. Cancellation does not restore a use. Increasing an existing limit preserves its usage count.

Checkout offers apply to current product prices. Existing catalogue offers remain separate and cannot be redeemed again as a promo. Existing personal offers retain their verified-email restriction. Manual dashboard orders do not automatically apply promo codes.

The storefront accepts a code, validates it using server prices and delivery fees, shows discounted totals and payment amounts, and rechecks eligibility, expiry and usage during order submission. Payment amounts must match the quote. Quotes refresh every 30 seconds and whenever checkout details change. A quote does not reserve a use; a code can expire or be exhausted before order submission. Zero-payment orders require no transfer screenshot.

## Verification

- `npm run test:promo`: transaction tests, actual dashboard/storefront API integration with an in-memory Firestore test double, and React server-render checks of summary/payment/promo UI. The API test expects the dashboard at sibling `../Dashboard-ecommerce`; `HEDOOMYY_DASHBOARD_ROUTE` can override its route using a file URL.
- Storefront and dashboard production builds passed. Storefront TypeScript and lint for changed checkout components and API routes passed.
- The pre-existing `tests/checkout-api.test.mjs` suite is stale against current profile/upload/order implementations and fails on missing mock imports. It is separate from the passing promo suite.
- No live database orders, customer emails, real payments, or authenticated browser purchases were created during validation.

## Deployment

Deploy both applications. The storefront now requires Firebase Admin credentials: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`, referring to the same project as the dashboard. Do not expose these as `NEXT_PUBLIC_*` variables. `firebase-admin` is included in the storefront dependency lockfile.

Merge the dashboard's `security/firestore.rules` **offers** block into the actual deployed Firestore rules. Do not deploy the restricted baseline file wholesale: it intentionally omits other storefront collections. Live rules must deny customer writes to offers and deny direct browser writes to promo documents/counters, including any overlapping wildcard rules that could otherwise grant access. Staff APIs use Firebase Admin and authoritative role checks.

Code changes and rules templates are local; production deployment and a live authenticated smoke test remain necessary before calling this verified in production.

## Immediate promo feedback fix

Apply now validates cart items and the code independently of contact, delivery and payment fields, and shows checking, success with savings, or an error beside the input. Reapplying the same code retries the request. Cart changes revalidate it; removing a code ignores pending responses. Final checkout still requires the complete form and repeats validation transactionally.

Local configuration inspected on this follow-up: the storefront has no `.env.local`, and the dashboard `.env.local` does not supply a non-empty `FIREBASE_PRIVATE_KEY`. This prevented inspecting the real `LULU` offer with Firebase Admin. Configure the server credentials in the environment actually running each app; the UI now reports unavailable server configuration instead of remaining silent.
