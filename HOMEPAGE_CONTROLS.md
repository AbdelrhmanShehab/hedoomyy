# Homepage visibility and dashboard discounts

Admins can open **Homepage sections** in the dashboard sidebar (`/homepage`). Each switch saves immediately. The storefront reads `settings/homepage.sections` on each homepage request, so changes appear on refresh after both apps are deployed. All eight sections default to visible for existing stores. Header and footer stay visible. Hidden catalogue sections do not trigger their catalogue queries. If settings cannot be read, the homepage retains the default visible layout.

The settings API verifies the current admin role, accepts only the eight named sections and boolean visibility, and merges individual changes without modifying website maintenance settings. It uses the existing Firebase Admin connection and requires no new public Firestore permissions.

In **Orders**, discounted orders show the discount amount and promo code under the total. The order details also show a separate discount row between shipping and the grand total. Discounts without a promo code are labelled “Discount”. Full-price orders have no discount badge. These are displays of saved order values; totals and finance calculations are unchanged.

Validation: `node --experimental-vm-modules --test tests/homepage-settings.test.mjs` covers access checks, invalid updates, merged settings, all section rendering switches, and discount display.

Changes are local until the storefront and dashboard are deployed. No live homepage setting or order was modified during implementation.
