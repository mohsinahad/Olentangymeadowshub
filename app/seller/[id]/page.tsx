import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/services";
import Image from "next/image";
import Link from "next/link";
import { BookButton } from "@/components/BookButton";
import { MessageButton } from "@/components/MessageButton";
import { ReportButton } from "@/components/ReportButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      sellerProfile: true,
    },
  });

  if (!user || !user.sellerProfile) notFound();

  const profile = user.sellerProfile;
  const category = getCategoryBySlug(profile.jobType) ?? { icon: "🛠️", label: profile.jobType };

  const orderCount = await prisma.order.count({
    where: { sellerId: id, status: "PAID" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href={`/services/${profile.jobType}`} className="text-green-600 hover:text-green-800 text-sm mb-8 inline-flex items-center gap-1">
        &larr; Back to {category?.label ?? profile.jobType}
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-white">
          <div className="flex items-center gap-5">
            {user.image ? (
              <Image
                src={user.image}
                alt={profile.fullName}
                width={80}
                height={80}
                className="rounded-full border-4 border-white/50"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {profile.fullName[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              <p className="text-green-100 flex items-center gap-2 mt-1">
                <span>{category?.icon}</span>
                <span>{category?.label ?? profile.jobType}</span>
              </p>
              <p className="text-green-200 text-sm mt-1">{orderCount} jobs completed</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8">
          {profile.bio && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-700 mb-2">About</h2>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.adminNote && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">From the Seller</p>
              <p className="text-sm text-amber-900 leading-relaxed">{profile.adminNote}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">${profile.price}</p>
              <p className="text-sm text-gray-500 mt-1">{profile.priceUnit}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-blue-700">Availability</p>
              <p className="text-sm text-gray-600 mt-1">{profile.availability}</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-purple-700">Duration</p>
              <p className="text-sm text-gray-600 mt-1">{profile.duration}</p>
            </div>
          </div>

          {!session ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">Sign in to message or book this service</p>
              <Link
                href="/auth/signin"
                className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition"
              >
                Sign In
              </Link>
            </div>
          ) : session.user.id === id ? (
            <div className="text-center py-4 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-sm">This is your seller profile.</p>
              <Link href="/seller/dashboard" className="text-green-600 text-sm font-medium hover:underline">
                Go to dashboard &rarr;
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <MessageButton sellerId={id} sellerName={profile.fullName} />
                <BookButton
                  sellerId={id}
                  serviceType={profile.jobType}
                  amount={profile.price}
                  sellerName={profile.fullName}
                />
              </div>
              <div className="mt-4 text-right">
                <ReportButton reportedId={id} reportedName={profile.fullName} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
