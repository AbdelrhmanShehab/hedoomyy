import { useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

/**
 * Sends a heartbeat to Firestore `activePresence` collection every 45s.
 * Used for "Live Visitors" real-time monitoring.
 */
export function useHeartbeat() {
    const { user } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        // Unique session ID for the heartbeat (stored in memory/state)
        // For simplicity, we'll use a combination of random ID and email/anonymous
        const sessionId = Math.random().toString(36).substring(7);

        const sendHeartbeat = async () => {
            const ref = doc(db, "activePresence", sessionId);
            try {
                await setDoc(ref, {
                    lastActive: serverTimestamp(),
                    path: pathname,
                    email: user?.email || "Anonymous",
                    uid: user?.uid || null,
                }, { merge: true });
            } catch (error) {
                // Silently fails
            }
        };

        // Initial heartbeat
        sendHeartbeat();

        // Interval heartbeat every 45 seconds
        const interval = setInterval(sendHeartbeat, 45000);

        return () => {
            clearInterval(interval);
            // Optional: delete or mark as inactive on unmount?
            // Firestore TTL or dashboard filter (last 2 mins) is better for "real-time".
        };
    }, [user, pathname]);
}
