"use client";

import { useState } from "react";

interface Props {
  sellerId: string;
  serviceType: string;
  amount: number;
  sellerName: string;
}

type Step = "choose" | "loading-stripe" | "loading-inperson" | "confirmed";

export function BookButton({ sellerId, serviceType, amount, sellerName }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choose");

  async function handleStripe() {
    setStep("loading-stripe");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, serviceType, amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Something went wrong");
        setStep("choose");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
      setStep("choose");
    }
  }

  async function handleInPerson() {
    setStep("loading-inperson");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, serviceType, amount, paymentMethod: "IN_PERSON" }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Something went wrong");
        setStep("choose");
        return;
      }
      setStep("confirmed");
    } catch {
      alert("Something went wrong. Please try again.");
      setStep("choose");
    }
  }

  function close() {
    setOpen(false);
    setStep("choose");
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
            {step === "confirmed" ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🤝</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your request has been sent to <span className="font-medium text-gray-700">{sellerName}</span>. You can message them to arrange a time and pay in person when the job is done.
                </p>
                <div className="flex flex-col gap-3">
                  <a href="/chat" className="block bg-green-600 text-white font-semibold py-3 rounded-full hover:bg-green-700 transition text-center">
                    Message {sellerName}
                  </a>
                  <button onClick={close} className="text-gray-400 text-sm hover:text-gray-600">Close</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800">How would you like to pay?</h2>
                  <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  Booking <span className="font-medium text-gray-700">{serviceType}</span> with{" "}
                  <span className="font-medium text-gray-700">{sellerName}</span> for{" "}
                  <span className="font-medium text-green-700">${amount}</span>
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleStripe}
                    disabled={step !== "choose"}
                    className="flex items-center gap-4 p-4 border-2 border-green-500 rounded-2xl hover:bg-green-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-gray-800">{step === "loading-stripe" ? "Redirecting to Stripe..." : "Pay online"}</p>
                      <p className="text-xs text-gray-400">Secure card payment via Stripe</p>
                    </div>
                  </button>
                  <button
                    onClick={handleInPerson}
                    disabled={step !== "choose"}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-gray-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">🤝</span>
                    <div>
                      <p className="font-semibold text-gray-800">{step === "loading-inperson" ? "Confirming..." : "Pay in person"}</p>
                      <p className="text-xs text-gray-400">Arrange payment directly with {sellerName}</p>
                    </div>
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
