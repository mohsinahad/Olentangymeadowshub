import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/services";

export default async function ChatListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/chat");

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
    },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          sellerProfile: { select: { fullName: true, jobType: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h2>
          <p className="text-gray-400 mb-6">Browse services and message a provider to get started.</p>
          <Link href="/" className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-700 transition">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const isbuyer = conv.buyerId === session.user.id;
            const other = isbuyer ? conv.seller : conv.buyer;
            const otherName = conv.seller.sellerProfile?.fullName ?? other.name ?? "Unknown";
            const jobType = conv.seller.sellerProfile?.jobType;
            const category = jobType ? getCategoryBySlug(jobType) : null;
            const lastMsg = conv.messages[0];

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition"
              >
                {other.image ? (
                  <Image src={other.image} alt={otherName} width={48} height={48} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold flex-shrink-0">
                    {otherName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 truncate">{otherName}</p>
                    {lastMsg && (
                      <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {category && (
                    <p className="text-xs text-green-600 font-medium">
                      {category.icon} {category.label}
                    </p>
                  )}
                  {lastMsg && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {lastMsg.imageData ? "📷 Photo" : lastMsg.content}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
