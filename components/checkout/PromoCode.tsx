"use client";
import { useEffect, useRef, useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

type Result = { key: string; discount?: number; error?: string };
export default function PromoCode() {
  const { order, setOrder, quote, quoteError } = useCheckout();
  const { lang } = useLanguage();
  const [code, setCode] = useState(order.couponCode || '');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const sequence = useRef(0);
  const ar = lang === 'ar';
  const cart = JSON.stringify(order.items.map(item => ({ productId: item.productId, variantId: item.variantId, qty: item.qty })));
  const activeCode = order.couponCode?.trim() || '';
  const key = JSON.stringify([activeCode, cart, attempt]);
  const checking = !!activeCode && result?.key !== key;
  useEffect(() => {
    if (!activeCode) return;
    const id = ++sequence.current;
    const controller = new AbortController();
    authenticatedFetch('/api/promocodes/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: activeCode, items: JSON.parse(cart) }), signal: controller.signal,
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not validate promo code.');
      if (id === sequence.current && !controller.signal.aborted) setResult({ key, discount: data.discount });
    }).catch(error => {
      if (id === sequence.current && !controller.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : 'Could not check this promo code. Please try again.' });
    });
    return () => { controller.abort(); };
  }, [activeCode, cart, key]);
  const error = result?.key === key ? result.error : '';
  const discount = quote?.totals.discount ?? result?.discount;
  const apply = () => {
    if (!code.trim()) { setResult({ key, error: ar ? 'اكتب كود الخصم.' : 'Enter a promo code.' }); return; }
    setAttempt(value => value + 1);
    setOrder(prev => ({ ...prev, couponCode: code.trim() }));
  };
  return <div className="space-y-2">
    <label htmlFor="promo-code" className="text-sm">{ar ? 'كود الخصم' : 'Promo code'}</label>
    <div className="flex gap-2">
      <input id="promo-code" maxLength={100} value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }} aria-describedby="promo-feedback" aria-invalid={!!error} className="border rounded p-2 min-w-0 flex-1" />
      <button type="button" disabled={checking} onClick={apply} className="border rounded px-3 disabled:opacity-50">{checking ? (ar ? 'جاري التحقق...' : 'Checking...') : (ar ? 'تطبيق' : 'Apply')}</button>
      {activeCode && <button type="button" onClick={() => { sequence.current++; setCode(''); setResult(null); setOrder(prev => ({ ...prev, couponCode: '' })); }}>{ar ? 'إزالة' : 'Remove'}</button>}
    </div>
    <div id="promo-feedback" aria-live="polite" aria-atomic="true" className="text-sm">
      {checking ? <p role="status">{ar ? 'جاري التحقق من الكود...' : 'Checking promo code...'}</p>
        : error ? <p role="alert" className="text-red-600">{error}</p>
        : activeCode && result?.key === key && discount !== undefined ? <p role="status" className="text-green-700">{ar ? `تم تطبيق الكود ${activeCode}. وفرت ${discount.toLocaleString()} جنيه.` : `Promo code ${activeCode} applied. You save EGP ${discount.toLocaleString()}.`}</p>
        : null}
      {!checking && !error && quoteError && <p role="alert" className="text-red-600">{quoteError}</p>}
    </div>
    <p className="text-xs text-gray-500">{ar ? 'يمكنك التحقق من الكود قبل إكمال بيانات التوصيل. يتم التحقق منه مرة أخرى عند تأكيد الطلب.' : 'Check your code before filling delivery details. It is checked again when you place the order.'}</p>
  </div>;
}
