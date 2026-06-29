"use client";

import { useState } from "react";

interface Props {
  sellerId: string;
  serviceType: string;
  amount: number;
  sellerName: string;
}

export function BookButton({ sellerId, serviceType, amount, sellerName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleBook() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, serviceType, amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Something went wrong");
        return;
      }
      setConfirmed(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    setConfirmed(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-green-600 text-green-700 font-semibold py-3 px-6 rounded-full hover:bg-green-50 transition"
      >
        Book for ${amount}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            {confirmed ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🤝</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your request has been sent to{" "}
                  <span className="font-medium text-gray-700">{sellerName}</span>. Message them to arrange a time and pay in person when the job is done.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="/chat"
                    className="block bg-green-600 text-white font-semibold py-3 rounded-full hover:bg-green-700 transition text-center"
                  >
                    Message {sellerName.split(" ")[0]}
                  </a>
                  <button onClick={close} className="text-gray-400 text-sm hover:text-gray-600">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800">Confirm Booking</h2>
                  <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Booking <span className="font-medium text-gray-700">{serviceType}</span> with{" "}
                  <span className="font-medium text-gray-700">{sellerName}</span> for{" "}
                  <span className="font-medium text-green-700">${amount}</span>. You&apos;ll pay in person when the job is done.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={close}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-full hover:border-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBook}
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? "Confirming…" : "Confirm Booking"}
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
