"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  requestId?: string;
  userId?: string;
}

export function AdminActions({ requestId, userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRequest(status: "APPROVED" | "REJECTED") {
    if (!requestId) return;
    setLoading(true);
    try {
      await fetch(`/api/seller-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!userId) return;
    if (!confirm("Are you sure you want to delete this account? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (requestId) {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => handleRequest("APPROVED")}
          disabled={loading}
          className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => handleRequest("REJECTED")}
          disabled={loading}
          className="bg-red-100 text-red-700 text-sm font-medium px-4 py-2 rounded-full hover:bg-red-200 transition disabled:opacity-50"
        >
          ✗ Reject
        </button>
      </div>
    );
  }

  if (userId) {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-500 hover:text-red-700 text-xs font-medium transition disabled:opacity-50"
      >
        Delete
      </button>
    );
  }

  return null;
}
