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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  async function handleRequest(status: "APPROVED" | "REJECTED", note?: string) {
    if (!requestId) return;
    setLoading(true);
    try {
      await fetch(`/api/seller-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note ?? "" }),
      });
      setShowApproveModal(false);
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
      <>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowApproveModal(true)}
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

        {showApproveModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowApproveModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Approve Seller</h3>
              <p className="text-sm text-gray-500 mb-4">Optionally add a note that will appear on their public profile — e.g. what they charge, what&apos;s included, any limitations.</p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Charges $20/hr, brings own supplies. No riding mowers."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequest("APPROVED", adminNote)}
                  disabled={loading}
                  className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Approving…" : "Approve"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
