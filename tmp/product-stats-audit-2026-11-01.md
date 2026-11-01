# Product statistics and active-cart audit

Read-only Firebase snapshot checked 2026-11-01 14:16 UTC. No production records were changed by the audit.

Sources: 77 products, 372 orders, 257 product-statistic records, 848 lead records.

| Sales view | Net units | Product revenue, EGP | Reconciled to orders |
| --- | ---: | ---: | --- |
| Current period, delivered | 0 | 0 | Yes |
| Current period, including pending | 0 | 0 | Yes |
| All time, delivered | 426 | 192,915 | Yes |
| All time, including pending | 459 | 201,215 | Yes |

Current reporting period began 2026-10-31 07:41:04 UTC. Product revenue excludes delivery charges and subtracts returns and discounts. Included pending statuses: pending, confirmed, shipped, delivered. All-time figures above are an audit calculation; the current dashboard period still honors its reset setting.

Current recorded engagement: 1,106 views, 333 clicks, 110 cart additions. These agree with stored counters, but historical event accuracy cannot be independently certified: the old product-page/quick-add paths emitted duplicate cart events, and guest/sign-in transitions could count another view. Raw event history needed to reconstruct correct historical counts is unavailable. No counters were halved, reset, or rewritten.

Basket snapshot: 1 synchronized non-empty active cart. Another 47 legacy cart rows have no synchronized basket state, so their contents and continued activity cannot be verified. New dashboard calculations exclude unverified legacy rows, count a shopper once across products, and exclude empty, expired, archived, and purchased baskets.

Fixes: centralized one cart-add event per successful action; stock-capped no-op additions excluded; persisted product quantities after remove/clear/checkout; revision checks reject late updates; persistent event receipts deduplicate retries beyond 250 events; stable daily view/click IDs across sign-in; largest-remainder cent allocation keeps product revenues equal to order net sales.

Changes require deployment of both storefront and dashboard. Automated tests and build checks do not establish that deployed clients are already running these changes. Old browsers must load the new storefront before they can send synchronized basket states.

Validation: 39 targeted cart/tracking/statistics tests passed; 26 checkout/promo tests passed; both production builds passed. The broader dashboard suite passed 96/97 tests; its cash-API malformed-input test returns 500 where the test expects 400. That cash-entry validation path was not changed by this work.

