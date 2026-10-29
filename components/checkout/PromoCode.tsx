"use client";
import { useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useLanguage } from '@/context/LanguageContext';

export default function PromoCode() {
  const { order, setOrder } = useCheckout();
  const { lang } = useLanguage();
  const [code, setCode] = useState(order.couponCode || '');
  const ar = lang === 'ar';
  return <div className="space-y-2">
    <label htmlFor="promo-code" className="text-sm">{ar ? 'كود الخصم' : 'Promo code'}</label>
    <div className="flex gap-2">
      <input id="promo-code" maxLength={100} value={code} onChange={e => setCode(e.target.value)} className="border rounded p-2 min-w-0 flex-1" />
      <button type="button" onClick={() => setOrder(prev => ({ ...prev, couponCode: code.trim() }))} className="border rounded px-3">{ar ? 'تطبيق' : 'Apply'}</button>
      {order.couponCode && <button type="button" onClick={() => { setCode(''); setOrder(prev => ({ ...prev, couponCode: '' })); }}>{ar ? 'إزالة' : 'Remove'}</button>}
    </div>
    <p className="text-xs text-gray-500">{ar ? 'سيتم التحقق من الكود مع تفاصيل طلبك قبل الدفع وعند تأكيد الطلب.' : 'Code is checked with your checkout details before payment and again when placing the order.'}</p>
  </div>;
}
