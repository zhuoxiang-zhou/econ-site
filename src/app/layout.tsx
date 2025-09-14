// // src/app/layout.tsx
// import type { Metadata } from "next";
// import Link from "next/link";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import clsx from "clsx";

// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Econometrics Hub",
//   description: "Learning resources for undergraduate econometrics",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body
//         className={clsx(
//           geistSans.variable,
//           geistMono.variable,
//           "antialiased bg-white text-neutral-900"
//         )}
//       >
//         {/* Top Nav (glassy) */}
//         <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-black/5">
//           <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6 text-sm">
//             <Link href="/" className="font-semibold">
//               Econometrics Hub
//             </Link>
//             <div className="hidden sm:flex gap-4">
//               <Link href="/concepts" className="hover:opacity-80">
//                 Concepts
//               </Link>
//               <Link href="/labs" className="hover:opacity-80">
//                 RegLabs
//               </Link>
//               <Link href="/ai-stata" className="hover:opacity-80">
//                 AI+Stata
//               </Link>
//               <Link href="/resources" className="hover:opacity-80">
//                 Resources
//               </Link>
//             </div>
//           </nav>
//         </header>

//         {/* Page content */}
//         <main className="max-w-6xl mx-auto px-6">{children}</main>

//         <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-neutral-500 border-t border-black/5 mt-16">
//           © {new Date().getFullYear()} Peking University, National School of Development, Econometrics Course Team. Designed by Zhuoxiang Zhou with AI assistance.
//         </footer>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { useState } from "react";
import { Menu, X, BookOpen, FlaskConical, Bot, FileText, GraduationCap } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Econometrics Hub | Learn Causal Inference Interactively",
  description: "Master econometric methods with interactive labs, AI-powered Stata workflows, and concept-first explanations for undergraduate and graduate students.",
  keywords: "econometrics, causal inference, OLS, IV, DiD, RD, Stata, interactive learning",
  authors: [{ name: "Zhuoxiang Zhou" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Econometrics Hub",
    description: "Interactive econometrics learning platform",
    type: "website",
  }
};

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/concepts", label: "Concepts", icon: BookOpen, description: "Core econometric methods" },
    { href: "/labs", label: "Interactive Labs", icon: FlaskConical, description: "Hands-on experiments" },
    { href: "/ai-stata", label: "AI + Stata", icon: Bot, description: "Code generation guide" },
    { href: "/resources", label: "Resources", icon: FileText, description: "Books, data & tools" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg sm:hidden">
          <nav className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <link.icon size={20} className="text-slate-600 group-hover:text-blue-600" />
                <div>
                  <div className="font-medium text-slate-800">{link.label}</div>
                  <div className="text-xs text-slate-500">{link.description}</div>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          "antialiased bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 min-h-screen"
        )}
      >
        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Econometrics Hub
                  </div>
                  <div className="text-xs text-slate-500 -mt-1">Interactive Learning Platform</div>
                </div>
                <div className="sm:hidden font-bold text-slate-800">EconHub</div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/concepts"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <BookOpen size={16} />
                  <span className="font-medium">Concepts</span>
                </Link>
                <Link
                  href="/labs"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <FlaskConical size={16} />
                  <span className="font-medium">Labs</span>
                </Link>
                <Link
                  href="/ai-stata"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <Bot size={16} />
                  <span className="font-medium">AI + Stata</span>
                </Link>
                <Link
                  href="/resources"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <FileText size={16} />
                  <span className="font-medium">Resources</span>
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Main Content with better spacing */}
        <main className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {children}
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="mt-20 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              
              {/* Brand Column */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Econometrics Hub
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 mb-4 max-w-md">
                  Interactive platform for learning causal inference and econometric methods. 
                  Built for undergraduate and graduate students worldwide.
                </p>
                <div className="text-sm text-slate-500">
                  <div>© {new Date().getFullYear()} Peking University</div>
                  <div>National School of Development</div>
                  <div className="mt-1">Designed by Zhuoxiang Zhou</div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Learn</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/concepts" className="text-slate-600 hover:text-blue-600 transition-colors">Core Concepts</Link></li>
                  <li><Link href="/labs/ols" className="text-slate-600 hover:text-blue-600 transition-colors">OLS Lab</Link></li>
                  <li><Link href="/labs/did" className="text-slate-600 hover:text-blue-600 transition-colors">DiD Lab</Link></li>
                  <li><Link href="/ai-stata" className="text-slate-600 hover:text-blue-600 transition-colors">Stata Guide</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/resources" className="text-slate-600 hover:text-blue-600 transition-colors">Textbooks</Link></li>
                  <li><Link href="/resources" className="text-slate-600 hover:text-blue-600 transition-colors">Datasets</Link></li>
                  <li><Link href="/resources" className="text-slate-600 hover:text-blue-600 transition-colors">Software</Link></li>
                  <li><Link href="/resources" className="text-slate-600 hover:text-blue-600 transition-colors">Papers</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-slate-200/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-500">
                Built with Next.js, TypeScript, and Tailwind CSS. Assisted by ChatGPT and Claude.
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-700 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}