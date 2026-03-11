"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function DeliveryForm() {
  const { order, setOrder, errors, setErrors, setShippingFee } = useCheckout();
  const { userData } = useAuth();
  const [citiesData, setCitiesData] = useState<{ id: string; fee: number }[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cities"));
        const cities = snapshot.docs.map(doc => ({
          id: doc.id,
          fee: doc.data().fee || 0
        }));
        setCitiesData(cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (order.delivery.city && citiesData.length > 0) {
      const selectedCity = citiesData.find(c => c.id === order.delivery.city);
      if (selectedCity) {
        setShippingFee(selectedCity.fee);
      }
    }
  }, [order.delivery.city, citiesData, setShippingFee]);

  const updateDelivery = (field: string, value: string) => {
    setOrder(prev => {
      const newOrder = {
        ...prev,
        delivery: {
          ...prev.delivery,
          [field]: value,
        },
      };

      if (field === "city") {
        const selectedCity = citiesData.find(c => c.id === value);
        if (selectedCity) {
          setShippingFee(selectedCity.fee);
        } else {
          setShippingFee(0);
        }
      }

      return newOrder;
    });

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
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Delivery Information</h2>
        {userData && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-100 animate-in fade-in zoom-in duration-500">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            Profile Synced
          </span>
        )}
      </div>

      {!userData?.address && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-lg">💡</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            Filling your <a href="/account" className="font-bold underline">profile details</a> saves time! We&apos;ll auto-fill them for all your future checkouts.
          </p>
        </div>
      )}

      {/* Address */}
      <div>
        <label className="block text-xs mb-1">Address *</label>
        <input
          value={order.delivery.address}
          onChange={(e) => updateDelivery("address", e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 text-sm ${errors.address ? "border-red-500" : "border-gray-300"
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
            className={`w-full border rounded-xl px-4 py-3 text-sm ${errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-xs mb-1">Last Name *</label>
          <input
            value={order.delivery.lastName}
            onChange={(e) => updateDelivery("lastName", e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 text-sm ${errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
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
            className={`w-full border rounded-xl px-4 py-3 text-sm ${errors.phone ? "border-red-500" : "border-gray-300"
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
            className={`w-full border rounded-xl px-4 py-3 text-sm ${errors.city ? "border-red-500" : "border-gray-300"
              }`}
          >
            <option value="">Select City</option>
            {citiesData.map(city => (
              <option key={city.id} value={city.id}>
                {city.id}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>


      </div>

      {/* Apartment */}
      <div>
        <label className="block text-xs mb-1">Apartment *</label>
        <input
          value={order.delivery.apartment}
          onChange={(e) => updateDelivery("apartment", e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 text-sm ${errors.apartment ? "border-red-500" : "border-gray-300"
            }`}
          placeholder="Apt, floor, etc."
        />
        {errors.apartment && (
          <p className="text-red-500 text-xs mt-1">{errors.apartment}</p>
        )}
      </div>
    </div>
  );
}
