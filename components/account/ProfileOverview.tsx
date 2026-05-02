"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, Save, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfileOverview() {
    const { t } = useLanguage();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        secondPhone: "",
        address: "",
        apartment: "",
        city: "",
    });
    const [citiesData, setCitiesData] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // ✅ Load data via API route (REST API)
                    const res = await fetch(`/api/user-data?uid=${currentUser.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            setFormData(prev => ({ ...prev, ...data }));
                        }
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                // ✅ Fetch cities via API route
                const res = await fetch("/api/cities");
                if (res.ok) {
                    const cities = await res.json();
                    setCitiesData(cities.map((c: any) => c.id));
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // ✅ Save data via API route
            const res = await fetch("/api/user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, ...formData }),
            });

            if (!res.ok) throw new Error("Failed to save");
            
            alert(t("profile_saved"));
        } catch (error) {
            console.error("Error saving user data:", error);
            alert(t("profile_save_failed"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse space-y-4">
        <div className="h-20 w-20 bg-gray-200 rounded-full" />
        <div className="h-10 bg-gray-200 rounded w-full" />
        <div className="h-10 bg-gray-200 rounded w-full" />
    </div>;

    return (
        <div className="space-y-10">
            {/* Header section */}
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-purple-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = "/1.png"; console.error("Image failed:", user.photoURL); }} />
                    ) : (
                        <User className="w-8 h-8 text-purple-400" />
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-zinc-800">
                        {user?.displayName || t("profile_your_profile")}
                    </h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_first_name")}</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="Mariem"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_last_name")}</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="Ahmed"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_phone")}</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="01xxxxxxxxx"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_second_phone")}</label>
                    <input
                        type="tel"
                        name="secondPhone"
                        value={formData.secondPhone}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="01xxxxxxxxx (Optional)"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_address")}</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="123 Street Name, Building, Area"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_apartment")}</label>
                    <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="Apt 4B"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("profile_city")}</label>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors bg-white cursor-pointer"
                    >
                        <option value="">{t("profile_select_city")}</option>
                        {citiesData.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                suppressHydrationWarning
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-300 w-full md:w-auto cursor-pointer"
            >
                {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                {t("profile_save")}
            </button>
        </div>
    );
}
