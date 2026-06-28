import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Olentangy Meadows",
  description: "Your neighborhood summer service marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-green-800 text-green-100 py-6 text-center text-sm mt-auto">
            <p>🌿 Olentangy Meadows Neighborhood Services &copy; {new Date().getFullYear()}</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
