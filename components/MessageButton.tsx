"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MessageButton({
  sellerId,
  sellerName,
  compact,
}: {
  sellerId: string;
  sellerName: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMessage() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      const data = await res.json();
      router.push(`/chat/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleMessage}
        disabled={loading}
        className="text-green-600 hover:text-green-800 text-xs font-medium transition disabled:opacity-50"
      >
        {loading ? "Opening…" : "Message"}
      </button>
    );
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-green-700 transition disabled:opacity-60"
    >
      {loading ? "Opening chat..." : `💬 Message ${sellerName.split(" ")[0]}`}
    </button>
  );
}
