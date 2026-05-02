"use client";

import { useEffect, useState } from "react";
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
    let isMounted = true; // prevent state updates after unmount

    // Detect local environment
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsLocal(
        hostname === "localhost" || hostname === "127.0.0.1"
      );
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setIsActive(data?.isActive ?? true);
        }
      } catch (error) {
        console.error("Error fetching website status:", error);
        if (isMounted) setIsActive(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStatus();

    // Fallback timeout (unchanged logic)
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!isActive && !isLocal && !loading) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
}