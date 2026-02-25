"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, Package, ChevronDown, ChevronUp } from "lucide-react";

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const ordersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

          setOrders(ordersList);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500" /></div>;

  if (orders.length === 0) return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">You haven't placed any orders yet.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        return (
          <div key={order.id} className="border border-zinc-100 rounded-3xl overflow-hidden transition-all bg-white shadow-sm hover:shadow-md">
            {/* Main Info */}
            <div
              className="p-6 cursor-pointer select-none"
              onClick={() => toggleOrder(order.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Order ID</span>
                  <span className="font-mono text-sm text-zinc-800 font-bold uppercase">#{order.id.slice(-8)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Date</span>
                  <span className="text-sm text-zinc-600">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Amount</span>
                  <span className="text-lg font-bold text-purple-600">EGP {order.totals?.total || order.total}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {order.status}
                  </span>
                  <div className="text-purple-500 flex items-center gap-1 text-[10px] font-bold uppercase">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide' : 'Details'}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section (Accordion) */}
            {isExpanded && (
              <div className="bg-zinc-50/50 border-t border-zinc-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Items Purchased</h4>
                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                        {item.image && (
                          <div className="w-14 h-14 relative rounded-xl overflow-hidden flex-shrink-0 border border-zinc-50">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-800 truncate">{item.title}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-medium">{item.color}</span>
                            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-medium">{item.size}</span>
                            <span className="text-[10px] bg-purple-50 text-purple-500 px-2 py-0.5 rounded-full font-bold">x{item.qty}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-zinc-700 whitespace-nowrap">
                          EGP {item.price * item.qty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Summary Grid */}
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Details</h4>
                    <div className="text-xs text-zinc-600 space-y-1.5 bg-white p-4 rounded-2xl border border-zinc-100">
                      <p className="font-bold text-zinc-800">{order.delivery?.firstName} {order.delivery?.lastName}</p>
                      <p className="flex items-center gap-2"><span className="text-xs text-gray-400">📍</span> {order.delivery?.address}{order.delivery?.apartment ? `, Apt ${order.delivery.apartment}` : ''}</p>
                      <p className="ml-5">{order.delivery?.city}, {order.delivery?.government}</p>
                      <p className="flex items-center gap-2 pt-1 font-medium"><span className="text-xs text-gray-400">📞</span> {order.delivery?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Summary</h4>
                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-zinc-800">EGP {order.totals?.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-zinc-800">EGP {order.totals?.shipping}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-dashed border-zinc-100 mt-2">
                        <span className="font-bold text-zinc-800">Total Paid</span>
                        <span className="font-bold text-purple-600 text-base">EGP {order.totals?.total}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] bg-zinc-50 text-zinc-400 px-2 py-1 rounded block text-center">Payment: {order.payment?.method === 'cod' ? 'Cash on Delivery' : order.payment?.method}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}