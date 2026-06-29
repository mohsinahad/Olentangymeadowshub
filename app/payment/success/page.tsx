import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">
          Your booking is confirmed. The service provider has been notified and will reach out to schedule the job.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/chat" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition">
            Go to Messages
          </Link>
          <Link href="/" className="border-2 border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-full hover:border-green-400 hover:text-green-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
