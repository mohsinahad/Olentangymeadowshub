import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminActions } from "@/components/AdminActions";
import { AdminTabsClient } from "@/components/AdminTabsClient";
import { MessageButton } from "@/components/MessageButton";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/services";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [pendingRequests, allSellers, allUsers, recentOrders, stats, reports, suggestions] = await Promise.all([
    prisma.sellerRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sellerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      },
      orderBy: { totalEarned: "desc" },
    }),
    prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      orderBy: { lastSignedIn: { sort: "desc", nulls: "last" } },
      take: 50,
    }),
    prisma.order.findMany({
      where: { status: "PAID" },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true, email: true } },
        reported: { select: { name: true, email: true } },
      },
    }),
    prisma.jobSuggestion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalRevenue = stats._sum.amount ?? 0;

  const overviewTab = (
    <div>
      {/* Stats Row */}
      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-green-600", bg: "bg-green-50" },
          { label: "Paid Orders", value: stats._count, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Sellers", value: allSellers.length, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Pending Requests", value: pendingRequests.length, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Pending Seller Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No pending requests
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => {
              const category = getCategoryBySlug(req.jobType);
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-yellow-100 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    {req.user.image ? (
                      <Image src={req.user.image} alt={req.fullName} width={48} height={48} className="rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold flex-shrink-0">
                        {req.fullName[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">{req.fullName}</p>
                          <p className="text-sm text-gray-500">{req.user.email}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">{category?.icon} {category?.label ?? req.jobType}</span>
                            {" · "}${req.price} {req.priceUnit}
                            {" · "}{req.availability}
                            {" · "}{req.duration}
                          </p>
                          {req.bio && <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{req.bio}&rdquo;</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <AdminActions requestId={req.id} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Orders */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Paid Orders</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No paid orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Buyer</th>
                  <th className="text-left px-6 py-3">Seller</th>
                  <th className="text-left px-6 py-3">Service</th>
                  <th className="text-right px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => {
                  const cat = getCategoryBySlug(o.serviceType);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700">{o.buyer.name}</td>
                      <td className="px-6 py-4 text-gray-700">{o.seller.name}</td>
                      <td className="px-6 py-4 text-gray-600">{cat?.icon} {cat?.label ?? o.serviceType}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700">${o.amount}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );

  const sellersTab = (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Seller Earnings</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {allSellers.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No sellers yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3">Seller</th>
                <th className="text-left px-6 py-3">Service</th>
                <th className="text-left px-6 py-3">Price</th>
                <th className="text-right px-6 py-3">Total Earned</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allSellers.map((s) => {
                const cat = getCategoryBySlug(s.jobType);
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {s.user.image ? (
                          <Image src={s.user.image} alt={s.fullName} width={32} height={32} className="rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                            {s.fullName[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{s.fullName}</p>
                          <p className="text-xs text-gray-400">{s.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cat?.icon} {cat?.label ?? s.jobType}</td>
                    <td className="px-6 py-4 text-gray-600">${s.price} {s.priceUnit}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-700">${s.totalEarned.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <AdminActions userId={s.user.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const usersTab = (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Users &mdash; sorted by last sign-in</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-6 py-3">User</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Joined</th>
              <th className="text-left px-6 py-3">Last Sign-in</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "SELLER" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-500">
                  {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleString() : <span className="text-gray-300">Never</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MessageButton sellerId={u.id} sellerName={u.name ?? u.email ?? "User"} compact />
                    <AdminActions userId={u.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const reportsTab = (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Reports
        {reports.filter((r) => r.status === "OPEN").length > 0 && (
          <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {reports.filter((r) => r.status === "OPEN").length} open
          </span>
        )}
      </h2>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No reports yet
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${r.status === "OPEN" ? "border-red-100" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "OPEN" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{r.reporter.name}</span>
                    <span className="text-gray-400"> ({r.reporter.email})</span>
                    <span className="text-gray-500"> reported </span>
                    <span className="font-semibold">{r.reported.name}</span>
                    <span className="text-gray-400"> ({r.reported.email})</span>
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{r.reason}</p>
                  {r.note && <p className="text-sm text-gray-500 mt-1 italic">&ldquo;{r.note}&rdquo;</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const suggestionsTab = (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Job Suggestions
        {suggestions.filter((s) => s.status === "PENDING").length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {suggestions.filter((s) => s.status === "PENDING").length} new
          </span>
        )}
      </h2>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No suggestions yet
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${s.status === "PENDING" ? "border-blue-100" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.status === "PENDING" ? "bg-blue-100 text-blue-700" : s.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{s.suggestion}</p>
                  {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">from {s.user.name} ({s.user.email})</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <span className="text-3xl">&#128081;</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ahmed&apos;s Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Olentangy Meadows &mdash; Admin View &middot; {session.user.email}</p>
        </div>
      </div>

      <AdminTabsClient
        pendingCount={pendingRequests.length}
        openReports={reports.filter((r) => r.status === "OPEN").length}
        pendingSuggestions={suggestions.filter((s) => s.status === "PENDING").length}
        overviewTab={overviewTab}
        sellersTab={sellersTab}
        usersTab={usersTab}
        reportsTab={reportsTab}
        suggestionsTab={suggestionsTab}
      />
    </div>
  );
}
