import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

/**
 * Sends a heartbeat to the server-side API every 45s.
 * Used for "Live Visitors" real-time monitoring.
 * No Firestore SDK used on the client.
 */
export function useHeartbeat() {
    const { user } = useAuth();
    const pathname = usePathname();
    const sessionIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!sessionIdRef.current) {
            sessionIdRef.current = Math.random().toString(36).substring(7);
        }

        const sendHeartbeat = async () => {
            try {
                await fetch("/api/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: sessionIdRef.current,
                        path: pathname,
                        email: user?.email || "Anonymous",
                        uid: user?.uid || null,
                    }),
                });
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
        };
    }, [user, pathname]);
}
