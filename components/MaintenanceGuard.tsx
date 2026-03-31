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
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    // Check if we are on localhost
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsLocal(hostname === "localhost" || hostname === "127.0.0.1");
    }

    // Listen to website status in Firestore
    const unsubscribe = onSnapshot(
      doc(db, "settings", "website"),
      (snapshot) => {
        if (snapshot.exists()) {
          setIsActive(snapshot.data().isActive);
        } else {
          // Default to active if document doesn't exist
          setIsActive(true);
        }
      },
      (error) => {
        console.error("Error fetching website status:", error);
        // Fallback to active on error to avoid locking out the site
        setIsActive(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Show nothing until we have the status
  if (isActive === null) {
    return null; // Or a minimal loading spinner
  }

  // If website is OFF and we are NOT on localhost, show maintenance page
  if (!isActive && !isLocal) {
    return <MaintenanceMode />;
  }

  // Otherwise, show the application
  return <>{children}</>;
}
