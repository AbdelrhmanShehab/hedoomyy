"use client";

import { MapPin, Plus, Trash2, Edit2 } from "lucide-react";

const mockAddresses = [
    {
        id: 1,
        label: "Home",
        fullName: "Abdelrhman Shehab",
        phone: "01141088386",
        address: "123 Nile Street, Zamalek",
        city: "Cairo",
        isDefault: true,
    },
    {
        id: 2,
        label: "Work",
        fullName: "Abdelrhman Shehab",
        phone: "01000000000",
        address: "Building 45, Smart Village",
        city: "Giza",
        isDefault: false,
    }
];

export default function AddressManager() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-zinc-800">Your Addresses</h3>
                <button className="flex items-center gap-2 bg-[#E6A6E9] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAddresses.map((addr) => (
                    <div key={addr.id} className={`
            p-5 rounded-2xl border transition-all relative
            ${addr.isDefault ? "border-purple-200 bg-purple-50/30" : "border-gray-100 bg-white hover:border-purple-100"}
          `}>
                        {addr.isDefault && (
                            <span className="absolute top-4 right-4 bg-purple-100 text-purple-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                Default
                            </span>
                        )}

                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
                                <MapPin className="ml-0.5 w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-800">{addr.label}</h4>
                                <p className="text-sm text-zinc-600">{addr.fullName}</p>
                            </div>
                        </div>

                        <div className="text-sm text-zinc-500 space-y-1 mb-5">
                            <p>{addr.address}</p>
                            <p>{addr.city}</p>
                            <p className="text-zinc-400">{addr.phone}</p>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50">
                            <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                            {!addr.isDefault && (
                                <button className="ml-auto text-xs font-medium text-purple-600 hover:text-purple-700">
                                    Set Default
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
