"use client";
import { useCheckout } from "../../context/CheckoutContext";

export default function DeliveryForm() {
  const { order, setOrder, errors, setErrors } = useCheckout();

  const updateDelivery = (field: string, value: string) => {
    setOrder(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [field]: value,
      },
    }));

    // clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-base font-medium">Delivery Information</h2>

      {/* Country & Address */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">Country *</label>
          <select className="w-full border rounded-xl px-4 py-3 text-sm bg-white">
            <option>Egypt</option>
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1">Address *</label>
          <input
            value={order.delivery.address}
            onChange={(e) => updateDelivery("address", e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 text-sm
              ${errors.address ? "border-red-500" : "border-gray-300"}
            `}
            placeholder="Street, building, area"
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
      </div>

      {/* Names */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">First Name *</label>
          <input
            value={order.delivery.firstName}
            onChange={(e) => updateDelivery("firstName", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Last Name *</label>
          <input
            value={order.delivery.lastName}
            onChange={(e) => updateDelivery("lastName", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>
      </div>

      {/* Phones */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">Phone Number *</label>
          <input
            value={order.delivery.phone}
            onChange={(e) => updateDelivery("phone", e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 text-sm
              ${errors.phone ? "border-red-500" : "border-gray-300"}
            `}
            placeholder="01xxxxxxxxx"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-xs mb-1">Second Phone (optional)</label>
          <input
            value={order.delivery.secondPhone || ""}
            onChange={(e) => updateDelivery("secondPhone", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>
      </div>

      {/* Location details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs mb-1">City *</label>
          <input
            value={order.delivery.city}
            onChange={(e) => updateDelivery("city", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Government *</label>
          <input
            value={order.delivery.government}
            onChange={(e) => updateDelivery("government", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Apartment</label>
          <input
            value={order.delivery.apartment}
            onChange={(e) => updateDelivery("apartment", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
