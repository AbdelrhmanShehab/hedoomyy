const mockOrders = [
  { id: "#ORD-7392", date: "20 Feb 2024", total: "1,200", status: "Delivered" },
  { id: "#ORD-6281", date: "15 Feb 2024", total: "850", status: "Processing" },
];

export default function OrderHistory() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Your Orders</h3>

      {mockOrders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{order.id}</span>
            <span>{order.date}</span>
          </div>

          <div className="text-sm text-gray-600">
            Total: EGP {order.total}
          </div>

          <div className="text-sm mt-2">
            Status: {order.status}
          </div>
        </div>
      ))}
    </div>
  );
}