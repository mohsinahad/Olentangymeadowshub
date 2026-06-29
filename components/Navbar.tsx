"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span>🌿</span>
          <span className="hidden sm:block">Olentangy Meadows</span>
          <span className="sm:hidden">OM</span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/chat" className="hidden sm:block hover:text-green-200 transition text-sm">
                Messages
              </Link>
              {session.user.role === "SELLER" && (
                <Link href="/seller/dashboard" className="hidden sm:block hover:text-green-200 transition text-sm">
                  My Services
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="hidden sm:block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-300 transition">
                  Admin
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-green-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold">
                      {session.user.name?.[0] ?? "U"}
                    </div>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <Link href="/chat" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Messages
                    </Link>
                    {session.user.role === "BUYER" && (
                      <Link href="/become-seller" className="block px-4 py-2 text-sm hover:bg-gray-50 text-green-700 font-medium" onClick={() => setMenuOpen(false)}>
                        Create Sales Account
                      </Link>
                    )}
                    <Link href="/suggest-job" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      💡 Suggest a Job
                    </Link>
                    {session.user.role === "SELLER" && (
                      <Link href="/seller/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        My Services
                      </Link>
                    )}
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 text-yellow-700 font-semibold" onClick={() => setMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-white text-green-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
