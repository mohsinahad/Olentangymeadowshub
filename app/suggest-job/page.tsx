"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SuggestJobPage() {
  const { data: session, status } = useSession();
  const [suggestion, setSuggestion] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/job-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestion, description }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
    setSubmitting(false);
  }

  if (status === "loading") {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl mb-3">💡</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Suggest a Job</h1>
        <p className="text-gray-500 mb-6">Sign in to suggest a new service for Olentangy Meadows.</p>
        <Link href="/auth/signin" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition">
          Sign In
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanks for your suggestion!</h2>
        <p className="text-gray-500 mb-6">The admin will review it and may add it as a new service category.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => { setDone(false); setSuggestion(""); setDescription(""); }} className="border border-green-600 text-green-700 font-semibold px-6 py-3 rounded-full hover:bg-green-50 transition">
            Suggest Another
          </button>
          <Link href="/" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-green-600 hover:text-green-800 text-sm">← Back to Home</Link>
      </div>

      <div className="text-center mb-8">
        <p className="text-3xl mb-3">💡</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Suggest a Job</h1>
        <p className="text-gray-500 text-sm">
          Have an idea for a service that should be on Olentangy Meadows? Submit it here and the admin will review it.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Service name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="e.g. Fence Painting, Plant Watering, Dog Boarding…"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why would this be useful for the neighborhood?"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !suggestion.trim()}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 text-sm"
          >
            {submitting ? "Submitting…" : "Submit Suggestion"}
          </button>
        </form>
      </div>
    </div>
  );
}
