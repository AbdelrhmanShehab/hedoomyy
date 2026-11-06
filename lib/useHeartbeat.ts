"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

// One browser across tabs/reloads. Hidden tabs do not renew presence.
const KEY = "hedoomyy-presence-browser";
export function useHeartbeat() {
  const { user } = useAuth();
  const pathname = usePathname();
  const session = useRef<string | null>(null);
  useEffect(() => {
    if (!session.current) {
      try {
        session.current = localStorage.getItem(KEY) || crypto.randomUUID();
        localStorage.setItem(KEY, session.current);
      } catch { session.current = crypto.randomUUID(); }
    }
    let pending = false;
    let stopped = false;
    const send = async () => {
      if (stopped || pending || document.visibilityState !== "visible" || !navigator.onLine) return;
      pending = true;
      try {
        const response = await fetch("/api/heartbeat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session.current, path: pathname, email: user?.email || "Anonymous", uid: user?.uid || null }),
          signal: AbortSignal.timeout(10000), cache: "no-store",
        });
        if (!response.ok) console.warn("Visitor heartbeat unavailable:", response.status);
      } catch { /* Retry on the next interval or reconnect. */ }
      finally { pending = false; }
    };
    void send();
    const interval = setInterval(send, 30000);
    document.addEventListener("visibilitychange", send);
    window.addEventListener("online", send);
    window.addEventListener("pageshow", send);
    return () => {
      stopped = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", send);
      window.removeEventListener("online", send);
      window.removeEventListener("pageshow", send);
    };
  }, [user?.uid, user?.email, pathname]);
}
