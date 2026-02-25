"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, Save, Loader2 } from "lucide-react";
import { egyptCites } from "@/data/egyptCities";

export default function ProfileOverview() {
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
        government: "",
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Load additional data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setFormData(prev => ({ ...prev, ...userDoc.data() }));
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid), formData, { merge: true });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving user data:", error);
            alert("Failed to update profile.");
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
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-purple-400" />
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-zinc-800">
                        {user?.displayName || "Your Profile"}
                    </h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="John"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secondary Phone</label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Apartment/Suite</label>
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors bg-white cursor-pointer"
                    >
                        <option value="">Select City</option>
                        {egyptCites.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Government</label>
                    <input
                        type="text"
                        name="government"
                        value={formData.government}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 focus:border-purple-500 outline-none py-2 transition-colors"
                        placeholder="Cairo"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-300 w-full md:w-auto"
            >
                {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                Save Changes
            </button>
        </div>
    );
}
