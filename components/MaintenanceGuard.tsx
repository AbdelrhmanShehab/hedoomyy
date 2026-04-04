"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import MaintenanceMode from "./MaintenanceMode";

export default function MaintenanceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsLocal(hostname === "localhost" || hostname === "127.0.0.1");
    }

    let unsubscribe = () => { };

    try {
      unsubscribe = onSnapshot(
        doc(db, "settings", "website"),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setIsActive(data?.isActive ?? true);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching website status:", error);
          setIsActive(true);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Firestore failed completely:", error);
      setIsActive(true);
      setLoading(false);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  // While checking, we still show the app by default (isActive is true)
  // unless we've explicitly received a 'false' from Firestore.
  // We use the loading state to decide if we should even bother
  // with the maintenance screen during the first 3 seconds.

  if (!isActive && !isLocal && !loading) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
}
