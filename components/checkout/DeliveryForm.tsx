"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

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

  const autoFillFromProfile = () => {
    if (!userData) return;

    setOrder(prev => ({
      ...prev,
      contact: {
        email: userData.email || prev.contact.email || ""
      },
      delivery: {
        address: userData.address || "",
        phone: userData.phone || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        city: userData.city || "",
        apartment: userData.apartment || "",
        secondPhone: userData.secondPhone || "",
      }
    }));

    // Clear form errors after filling
    setErrors({});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Delivery Information</h2>
        {userData ? (
          <div className="flex items-center gap-3">
             <Link
              href="/account"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-purple-500 transition-colors"
            >
              Go to Account →
            </Link>
            <button
              onClick={autoFillFromProfile}
              className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all active:scale-95 group cursor-pointer"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full group-hover:animate-ping" />
              Fill from Profile
            </button>
          </div>
        ) : (
          <Link
            href="/account"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-purple-500 transition-colors"
          >
            Go to Account →
          </Link>
        )}
      </div>

      {userData && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex gap-4 items-center animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">
            ✨
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-purple-900">Fill your data once!</p>
            <p className="text-xs text-purple-800/80 leading-relaxed">
              Save your info in the <Link href="/account" className="font-extrabold underline decoration-purple-300 underline-offset-2 cursor-pointer">Account Page</Link> so it&apos;s ready for every order. Use the button above to auto-fill.
            </p>
          </div>
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
            className={`w-full border rounded-xl px-4 py-3 text-sm cursor-pointer ${errors.city ? "border-red-500" : "border-gray-300"
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
