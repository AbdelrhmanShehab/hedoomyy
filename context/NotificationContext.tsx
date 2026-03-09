"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit } from "firebase/firestore";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  orderId: string;
  total: number;
  customerName: string;
  createdAt: any;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  notifications: [],
  markAllAsRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);

  useEffect(() => {
    // Only listen for notifications if user is logged in (or if we want a global dashboard listener)
    // The requirement says "If the dashboard is open in the browser"
    // Assuming the dashboard is accessible to authenticated users (admins/staff)
    // For now, we listen globally for any new order created after the app started
    
    const startTime = new Date();
    
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const playNotificationSound = () => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(e => console.log("Audio play blocked:", e));
    };

    const showBrowserNotification = (order: Notification) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🛒 New Order", {
          body: `Order #${order.orderId.slice(-6)}\nTotal: ${order.total} EGP`,
          icon: "/favicon.ico",
        });
      }
    };

    const vibratePhone = () => {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    };

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          
          // Only notify if the order was created after the listener started
          if (createdAt > startTime) {
            const newNotification: Notification = {
              id: change.doc.id,
              orderId: change.doc.id,
              total: data.totals?.total || data.total || 0,
              customerName: `${data.delivery?.firstName || ""} ${data.delivery?.lastName || ""}`.trim() || "Customer",
              createdAt: data.createdAt,
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Trigger alerts
            playNotificationSound();
            showBrowserNotification(newNotification);
            vibratePhone();
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
