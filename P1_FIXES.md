# P1 checkout, inventory and reporting fixes

## Implemented

- Both public checkout endpoints use the same strict input projection and transaction service. Product/variant price, cost and availability come from Firestore. Missing internal costs are saved as unknown and flagged in finance, without blocking purchases. The delivery city must exist; its fee is authoritative. Discounts require an active server offer, correct eligibility/expiry, and a verified account for personal offers. Client totals, user IDs, staff flags, order status and paid flags are ignored. Initial state is pending and unpaid.
- Checkout requires valid email, both Egyptian mobile numbers, names, address, apartment/floor, city, payment choice, and valid product/variant quantities. These checks also run before both frontend checkout steps. Screenshot uploads require authentication, supported image bytes/type and a 5 MB limit.
- Checkout uses an Idempotency-Key saved in the browser across retries. A transaction stores the order and a private checkout request receipt together with stock deductions. Reusing a key returns the same order; changed order details with the same key conflict. Stock is aggregated per product/variant.
- Cancellation restores only original quantity minus returned quantity, once. Return selection uses order-line keys, so two products with the same variant ID are handled separately. All product reads precede writes; each affected product is updated once. Terminal transitions, payment-type coercion, conflicting payment/status changes, and over-returns are rejected. Removed products are not recreated; skipped restoration IDs are retained on the order.
- Shared financial calculations define gross product sales before returns/discounts, net product sales after both, retained product costs, item margin, operating profit, received cash, paid refunds and expenses. Negative profit is preserved. Reports reconstruct historical sales from item snapshots instead of subtracting returns again from modified subtotals. Missing costs and current-catalogue fallback costs are flagged, as are inferred old collections and mismatching stored totals. Finance includes an order-by-order historical review table; no stored historical financial records were rewritten.
- Finance reads the complete order/expense collections in pages of 500, including records without createdAt, then applies the report dates. There is no 1,000-record cap. Scope, row counts, load time, chart period and refresh controls are shown. A failed page hides partial totals. This is a completed read/refresh report, not a continually updated bank statement.
- Google is the storefront's existing sign-in provider; there are no password/signup input forms. Sign-in now handles errors and only follows local redirects. Profile inputs are validated on both sides. Profile APIs require the signed-in owner and only permit contact/delivery fields, preserving role/status fields. Order history and confirmation API requests also require the owner.

## Financial definitions

| Figure | Definition |
| --- | --- |
| Gross sales | Original quantity x order item selling price; excludes cancelled/rejected orders and shipping |
| Return value | Returned quantity x original selling price |
| Net product sales | Gross sales - return value - remaining order discount |
| Net item profit (Business Overview) | Retained quantity x (selling price - cost); the requested per-item margin, before order discounts/expenses |
| Operating profit | Net product sales - retained product costs; missing-cost pieces excluded and flagged |
| Net profit (Finance) | Operating profit - recorded expenses |
| Received cash | Explicit recorded collection amount; legacy fully-paid/deposit flags produce clearly flagged estimates |
| Collected cash | Received cash - actually recorded refund payments; independent of sales cancellation |
| Collected product margin | Product share of received cash - paid refunds - retained product costs; shipping allocated proportionally |

## Before deployment

- The storefront now needs trusted server credentials: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. Optional FIREBASE_STORAGE_BUCKET overrides hedoomyy.firebasestorage.app. Set these in the server hosting environment, never NEXT_PUBLIC variables or chat. The dashboard also needs its existing Admin credentials. Live checkout/profile/upload writes were not exercised because the local private key is unavailable. Do not deploy the storefront changes before credentials are configured.
- Review and merge deployed Firestore/Storage rules so browsers cannot directly write orders, checkout_requests, stock, staff roles or finance records. security/firestore.rules is a restricted proposed baseline, not a full storefront rules replacement, and was not deployed. Broad overlapping allow rules would bypass endpoint validation.
- No production records were edited, archived or deleted in this work. No push/deployment was performed.
- Builds can run with BUILD_CPUS=1 on memory-constrained machines. Normal builds retain Next's default worker count.

## Validation

- Dashboard: 80 automated tests passed, including checkout field forgery, missing email, variant/stock failures, repeated and concurrent checkout requests, cancellation/returns, payment-transition bypasses, financial reconciliation, 1,503-record pagination and page rendering.
- Storefront: 17 automated tests passed (checkout, account/API authorization, upload validation and tracking), plus TypeScript checks.
- Production builds are checked in both repositories with one worker.
