"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { egyptCites } from "../../data/egyptCities";

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

    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validatePhone = (phone: string) => {
    const regex = /^01[0-9]{9}$/; // Egyptian mobile format
    if (!regex.test(phone)) {
      setErrors(prev => ({
        ...prev,
        phone: "Invalid Egyptian phone number",
      }));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-base font-medium">Delivery Information</h2>

      {/* Address */}
      <div>
        <label className="block text-xs mb-1">Address *</label>
        <input
          value={order.delivery.address}
          onChange={(e) => updateDelivery("address", e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 text-sm ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Street, building, area"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
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
            onBlur={() => validatePhone(order.delivery.phone)}
            placeholder="01xxxxxxxxx"
            className={`w-full border rounded-xl px-4 py-3 text-sm ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-xs mb-1">
            Second Phone (optional)
          </label>
          <input
            value={order.delivery.secondPhone || ""}
            onChange={(e) =>
              updateDelivery("secondPhone", e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>
      </div>

      {/* City Dropdown */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">City *</label>
          <select
            value={order.delivery.city}
            onChange={(e) => updateDelivery("city", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          >
            <option value="">Select City</option>
            {egyptCites.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1">Government *</label>
          <input
            value={order.delivery.government}
            onChange={(e) => updateDelivery("government", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>
      </div>

      {/* Apartment */}
      <div>
        <label className="block text-xs mb-1">Apartment</label>
        <input
          value={order.delivery.apartment}
          onChange={(e) => updateDelivery("apartment", e.target.value)}
          className="w-full border rounded-xl px-4 py-3 text-sm"
        />
      </div>
    </div>
  );
}
