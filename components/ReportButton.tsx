"use client";

import { useState } from "react";

const REPORT_REASONS = [
  "Inappropriate behavior",
  "Scam or fraud",
  "No-show",
  "Rude or disrespectful",
  "Did not complete job",
  "Other",
];

interface Props {
  reportedId: string;
  reportedName: string;
}

export function ReportButton({ reportedId, reportedName }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit() {
    if (!reason) return;
    setStatus("loading");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportedId, reason, note }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-red-500 transition">
        Report
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setOpen(false); setStatus("idle"); setReason(""); setNote(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {status === "done" ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">✓</p>
                <p className="font-semibold text-gray-800">Report submitted</p>
                <p className="text-sm text-gray-500 mt-1">The admin will review your report.</p>
                <button onClick={() => { setOpen(false); setStatus("idle"); setReason(""); setNote(""); }} className="mt-4 bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Report {reportedName}</h3>
                <p className="text-sm text-gray-500 mb-4">Reports are reviewed by the admin and kept confidential.</p>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                    <option value="">Select a reason…</option>
                    {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional details (optional)</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe what happened…" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
                {status === "error" && <p className="text-sm text-red-600 mb-3">Something went wrong. Please try again.</p>}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancel</button>
                  <button onClick={handleSubmit} disabled={!reason || status === "loading"} className="bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-red-700 transition disabled:opacity-50">
                    {status === "loading" ? "Submitting…" : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
