"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/services";

export default function BecomeSeller() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [jobTypeSelect, setJobTypeSelect] = useState("");
  const [customJobType, setCustomJobType] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    price: "",
    priceUnit: "per job",
    availability: "",
    duration: "",
    bio: "",
  });

  const isCustom = jobTypeSelect === "__custom__";
  const finalJobType = isCustom ? customJobType.trim() : jobTypeSelect;

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Sign In Required</h1>
          <p className="text-gray-500 mb-6">
            You need to sign in before applying to become a seller.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/become-seller"
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (session.user.role === "SELLER") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            You&apos;re already a seller!
          </h1>
          <Link
            href="/seller/dashboard"
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Request Submitted!
          </h1>
          <p className="text-gray-500 mb-6">
            Your seller account request has been sent to the Olentangy Meadows
            admin for review. You&apos;ll be able to start selling once
            you&apos;re approved.
          </p>
          <Link
            href="/"
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!finalJobType) {
      setError("Please select or enter a job type.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/seller-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jobType: finalJobType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="text-green-600 hover:text-green-800 text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to home
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💼</div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create Sales Account
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Fill in your details below. The admin will review and approve your
            account before it goes live. Sellers keep 100% of what they earn.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service / Job Type *
            </label>
            <select
              required
              value={jobTypeSelect}
              onChange={(e) => {
                setJobTypeSelect(e.target.value);
                if (e.target.value !== "__custom__") setCustomJobType("");
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            >
              <option value="">Select a service...</option>
              {SERVICE_CATEGORIES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.icon} {s.label}
                </option>
              ))}
              <option value="__custom__">✏️ Other (type your own)</option>
            </select>
          </div>

          {isCustom && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe your service *
              </label>
              <input
                type="text"
                required={isCustom}
                value={customJobType}
                onChange={(e) => setCustomJobType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Leaf blowing, Bike repair, Pet sitting..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Unit
              </label>
              <select
                value={form.priceUnit}
                onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                <option value="per job">per job</option>
                <option value="per hour">per hour</option>
                <option value="per visit">per visit</option>
                <option value="per week">per week</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability *
            </label>
            <input
              type="text"
              required
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Weekends 9am–5pm, or Weekdays after 3pm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How long does the job take? *
            </label>
            <input
              type="text"
              required
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. 1–2 hours, About 45 minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Description (optional)
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Tell your neighbors a bit about yourself and your experience..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-full hover:bg-green-700 transition disabled:opacity-60 mt-2"
          >
            {loading ? "Submitting..." : "Submit for Admin Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
