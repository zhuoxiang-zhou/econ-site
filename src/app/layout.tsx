// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Econometrics Hub",
  description: "Learning resources for undergraduate econometrics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          "antialiased bg-white text-neutral-900"
        )}
      >
        {/* Top Nav (glassy) */}
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-black/5">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6 text-sm">
            <Link href="/" className="font-semibold">
              Econometrics Hub
            </Link>
            <div className="hidden sm:flex gap-4">
              <Link href="/concepts" className="hover:opacity-80">
                Concepts
              </Link>
              <Link href="/labs" className="hover:opacity-80">
                RegLabs
              </Link>
              <Link href="/ai-stata" className="hover:opacity-80">
                AI
              </Link>
              <Link href="/resources" className="hover:opacity-80">
                Resources
              </Link>
            </div>
          </nav>
        </header>

        {/* Page content */}
        <main className="max-w-6xl mx-auto px-6">{children}</main>

        <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-neutral-500 border-t border-black/5 mt-16">
          © {new Date().getFullYear()} Undergraduate Econometrics. Built with Next.js & Tailwind.
        </footer>
      </body>
    </html>
  );
}