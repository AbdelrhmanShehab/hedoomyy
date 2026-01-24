"use client";
import { useRouter } from "next/navigation";

export default function SubmitOrder() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/confirmation")}
      className="w-full mt-6 bg-purple-300 hover:bg-purple-400 transition text-white rounded-full py-4 text-sm"
    >
      Save and Proceed
    </button>
  );
}
