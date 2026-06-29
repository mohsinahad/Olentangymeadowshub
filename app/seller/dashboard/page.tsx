import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/services";
import { SellerNoteForm } from "@/components/SellerNoteForm";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/become-seller");
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const orders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    include: {
      buyer: { select: { name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const category = profile ? getCategoryBySlug(profile.jobType) : null;
  const totalEarned = orders
    .filter((o) => o.status === "PAID" || o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">My Seller Dashboard</h1>

      {!profile ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-yellow-800">Your profile is being set up...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-green-600">${totalEarned.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Total Earned</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {orders.filter((o) => o.status === "PAID").length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Paid Orders</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {orders.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total Orders</p>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="font-semibold text-gray-700 mb-4">Your Listing</h2>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-400">Service</p>
                <p className="font-medium text-gray-800">
                  {category?.icon} {category?.label ?? profile.jobType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Price</p>
                <p className="font-medium text-gray-800">${profile.price} {profile.priceUnit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Availability</p>
                <p className="font-medium text-gray-800">{profile.availability}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="font-medium text-gray-800">{profile.duration}</p>
              </div>
            </div>
            <Link
              href={`/seller/${session.user.id}`}
              className="inline-block mt-4 text-green-600 text-sm font-medium hover:underline"
            >
              View public profile &rarr;
            </Link>
          </div>

          {/* Notes & Pricing */}
          <SellerNoteForm initialNote={profile.adminNote} />

          {/* Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No orders yet. Your profile is live!</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{order.buyer.name}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-semibold text-gray-800">${order.amount}</p>
                      {order.paymentMethod === "IN_PERSON" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                          Pay in person
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === "PAID" ? "bg-green-100 text-green-700" :
                          order.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
