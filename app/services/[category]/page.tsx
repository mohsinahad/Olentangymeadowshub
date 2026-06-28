import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug, SERVICE_CATEGORIES } from "@/lib/services";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return SERVICE_CATEGORIES.map((s) => ({ category: s.slug }));
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryInfo = getCategoryBySlug(category);
  if (!categoryInfo) notFound();

  const sellers = await prisma.sellerProfile.findMany({
    where: { jobType: category },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/" className="text-green-600 hover:text-green-800 text-sm mb-6 inline-flex items-center gap-1">
        ← Back to all services
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <span className="text-5xl">{categoryInfo.icon}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{categoryInfo.label}</h1>
          <p className="text-gray-500">{categoryInfo.description}</p>
        </div>
      </div>

      {sellers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No providers yet</h2>
          <p className="text-gray-400 mb-6">Nobody in the neighborhood offers this service yet.</p>
          <Link href="/become-seller" className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition">
            Be the first — Create Sales Account
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sellers.map((seller) => (
            <Link key={seller.id} href={`/seller/${seller.user.id}`} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                {seller.user.image ? (
                  <Image src={seller.user.image} alt={seller.fullName} width={48} height={48} className="rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                    {seller.fullName[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{seller.fullName}</p>
                  <p className="text-xs text-green-600 font-medium">{categoryInfo.label}</p>
                </div>
              </div>
              {seller.bio && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{seller.bio}</p>}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600"><span>💰</span><span><strong className="text-gray-800">${seller.price}</strong> {seller.priceUnit}</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><span>📅</span><span>{seller.availability}</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><span>⏱️</span><span>{seller.duration}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Tap to view & message</span>
                <span className="text-green-600 text-sm font-medium">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
