import { buildProductStatistics, buildActiveCarts, buildPurchaseIndex, timestampMs, isActiveCart } from 'file:///C:/Dashboard-ecommerce/src/utils/storeOperations.js';
const base = 'https://firestore.googleapis.com/v1/projects/hedoomyy/databases/(default)/documents';
function value(v) { if (!v) return null; if ('stringValue' in v) return v.stringValue; if ('booleanValue' in v) return v.booleanValue; if ('integerValue' in v || 'doubleValue' in v) return Number(v.integerValue ?? v.doubleValue); if (v.timestampValue) return Date.parse(v.timestampValue); if (v.mapValue) return fields(v.mapValue.fields || {}); if (v.arrayValue) return (v.arrayValue.values || []).map(value); return null; }
const fields = object => Object.fromEntries(Object.entries(object).map(([key, v]) => [key, value(v)]));
async function list(name) {
  const rows = []; let token = '';
  do {
    const response = await fetch(base + '/' + name + '?pageSize=1000' + (token ? '&pageToken=' + encodeURIComponent(token) : ''), { signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!response.ok) throw new Error(name + ' HTTP ' + response.status);
    const data = await response.json();
    rows.push(...(data.documents || []).map(d => ({ ...fields(d.fields || {}), id: d.name.split('/').pop() })));
    token = data.nextPageToken || '';
  } while (token);
  return rows;
}
const results = await Promise.allSettled(['products', 'orders', 'productStats', 'leads', 'settings'].map(list));
if (results.some(r => r.status === 'rejected')) { console.log(JSON.stringify({ auditComplete: false, failures: results.filter(r => r.status === 'rejected').map(r => r.reason.message) })); process.exit(1); }
const [products, orders, events, leads, settings] = results.map(r => r.value);
const tracking = settings.find(s => s.id === 'tracking') || {};
const reset = timestampMs(tracking.productStatsResetAt), now = Date.now();
const summary = {};
for (const [mode, period, label] of [['delivered',reset,'currentDelivered'],['active',reset,'currentIncludingPending'],['delivered',0,'allTimeDelivered'],['active',0,'allTimeIncludingPending']]) {
  const rows = buildProductStatistics(products, orders, events, period, mode);
  const totals = rows.reduce((sum, row) => { for (const key of ['views', 'clicks', 'cartAdds', 'units', 'revenue']) sum[key] += row[key]; return sum; }, { views: 0, clicks: 0, cartAdds: 0, units: 0, revenue: 0 });
  totals.revenue = Math.round(totals.revenue * 100) / 100;
  let expectedCents = 0, expectedUnits = 0;
  for (const order of orders) {
    if ((mode === 'delivered' ? order.status !== 'delivered' : !['pending','confirmed','shipped','delivered'].includes(order.status)) || timestampMs(order.createdAt) < period) continue;
    let cents = 0;
    for (const item of order.items || []) {
      const qty = Math.max(0, Number(item.qty ?? item.quantity ?? 1) || 0);
      const net = qty - Math.min(qty, Math.max(0, Number(item.returnedQty) || 0));
      expectedUnits += net; cents += Math.round(net * Math.max(0, Number(item.price) || 0) * 100);
    }
    expectedCents += Math.max(0, cents - Math.round(Math.max(0, Number(order.originalTotals?.discount ?? order.totals?.discount) || 0) * 100));
  }
  summary[label] = { ...totals, salesReconcile: Math.round(totals.revenue * 100) === expectedCents && totals.units === expectedUnits };
}
const purchases = buildPurchaseIndex(orders);
console.log(JSON.stringify({ auditComplete: true, checkedAt: new Date().toISOString(), records: { products: products.length, orders: orders.length, engagement: events.length, leads: leads.length }, periodStart: reset ? new Date(reset).toISOString() : 'all time', totals: summary, synchronizedActiveCarts: buildActiveCarts(leads, now, timestampMs(tracking.cartsResetAt), purchases).length, legacyCartRowsWithoutBasketState: leads.filter(l => l.cartStateAt == null && isActiveCart(l, now, timestampMs(tracking.cartsResetAt), purchases)).length, historicalEngagementIndependentlyVerifiable: false, orderItemsMissingProductId: orders.reduce((sum, o) => sum + (o.items || []).filter(i => !i.productId).length, 0) }, null, 2));
