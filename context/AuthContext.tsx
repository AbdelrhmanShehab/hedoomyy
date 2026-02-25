"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc: () => void = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // 🔄 Real-time listener for user profile data from Firestore
                unsubscribeDoc = onSnapshot(doc(db, "users", firebaseUser.uid), (snapshot) => {
                    if (snapshot.exists()) {
                        setUserData(snapshot.data());
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user data:", error);
                    setLoading(false);
                });
            } else {
                setUserData(null);
                unsubscribeDoc();
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeDoc();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
