"use client";

import { useState } from "react";

export function SellerNoteForm({ initialNote }: { initialNote: string | null }) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/seller-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerNote: note }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="font-semibold text-gray-700 mb-1">Notes & Pricing Details</h2>
      <p className="text-sm text-gray-400 mb-4">
        Add anything you want customers to know — what&apos;s included, your exact pricing, supplies you bring, any limitations, etc. This shows on your public profile.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. I charge $20/hr and bring all my own supplies. Lawn care includes edging and blowing. No riding mowers needed."
        rows={4}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="flex items-center justify-end gap-3 mt-3">
        {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}
