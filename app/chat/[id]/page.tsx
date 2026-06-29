import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";
import Link from "next/link";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const conversation = await prisma.conversation.findUnique({
    where: { id },
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
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const isParticipant =
    conversation.buyerId === session.user.id ||
    conversation.sellerId === session.user.id;

  if (!isParticipant) notFound();

  const otherUser =
    session.user.id === conversation.buyerId
      ? conversation.seller
      : conversation.buyer;

  const displayName =
    conversation.seller.sellerProfile?.fullName ?? otherUser.name ?? "User";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/chat" className="text-green-600 hover:text-green-800">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-800">{displayName}</h1>
      </div>

      <ChatWindow
        conversationId={id}
        currentUserId={session.user.id}
        initialMessages={conversation.messages}
      />
    </div>
  );
}
