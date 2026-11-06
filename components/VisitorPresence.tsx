"use client";
import { useHeartbeat } from "@/lib/useHeartbeat";
export default function VisitorPresence() {
  useHeartbeat();
  return null;
}
