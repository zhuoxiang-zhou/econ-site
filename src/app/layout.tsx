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
import { BookOpen, FlaskConical, Bot, FileText, GraduationCap, TrendingUp } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Econometrics Hub | Learn Causal Inference Interactively",
  description: "Master econometric methods with interactive labs, AI-powered Stata workflows, and concept-first explanations for undergraduate and graduate students.",
  keywords: "econometrics, causal inference, OLS, IV, DiD, RD, Stata, interactive learning",
  authors: [{ name: "Zhuoxiang Zhou" }],
  viewport: "width=device-width, initial-scale=1",
};

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
        {/* Premium Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/60 shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              
              {/* Enhanced Logo */}
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all transform group-hover:scale-105">
                    <GraduationCap size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Econometrics Hub
                  </div>
                  <div className="text-sm text-slate-600 font-medium -mt-1">
                    Interactive Learning Platform by PKU NSD
                  </div>
                </div>
              </Link>

              {/* Premium Navigation */}
              <nav className="flex items-center gap-2">
                <Link
                  href="/concepts"
                  className="group flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 text-slate-700 hover:text-blue-800"
                >
                  <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold">Concepts</div>
                    <div className="text-xs text-slate-500 group-hover:text-blue-600">Core methods</div>
                  </div>
                </Link>
                
                <Link
                  href="/labs"
                  className="group flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 text-slate-700 hover:text-purple-800"
                >
                  <FlaskConical size={20} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold">Interactive Labs</div>
                    <div className="text-xs text-slate-500 group-hover:text-purple-600">Hands-on practice</div>
                  </div>
                </Link>
                
                <Link
                  href="/ai-stata"
                  className="group flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 transition-all duration-300 text-slate-700 hover:text-emerald-800"
                >
                  <Bot size={20} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold">AI + Stata</div>
                    <div className="text-xs text-slate-500 group-hover:text-emerald-600">Code generation</div>
                  </div>
                </Link>
                
                <Link
                  href="/resources"
                  className="group flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-300 text-slate-700 hover:text-amber-800"
                >
                  <FileText size={20} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold">Resources</div>
                    <div className="text-xs text-slate-500 group-hover:text-amber-600">Books & data</div>
                  </div>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="relative">
          {/* Sophisticated background elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Primary gradient orb */}
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-gradient-to-bl from-blue-200/40 via-purple-200/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            
            {/* Secondary gradient orb */}
            <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-gradient-to-tr from-emerald-200/30 via-blue-200/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
            
            {/* Subtle geometric pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-40" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6">
            {children}
          </div>
        </main>

        {/* Premium Footer */}
        <footer className="mt-24 border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-5 gap-12">
              
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                    <GraduationCap size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Econometrics Hub
                    </div>
                    <div className="text-slate-600">Interactive Learning Platform</div>
                  </div>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed max-w-md">
                  Master causal inference and econometric methods through interactive experiments, 
                  AI-powered code generation, and concept-first explanations designed for modern learners.
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <TrendingUp size={16} />
                  <span>Designed for AI-assisted learning</span>
                </div>
              </div>

              {/* Learning Paths */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Core Methods
                </h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/concepts/ols" className="text-slate-600 hover:text-blue-600 transition-colors hover:underline">OLS Regression</Link></li>
                  <li><Link href="/concepts/instrumental-variables" className="text-slate-600 hover:text-blue-600 transition-colors hover:underline">Instrumental Variables</Link></li>
                  <li><Link href="/concepts/difference-in-differences" className="text-slate-600 hover:text-blue-600 transition-colors hover:underline">Difference-in-Differences</Link></li>
                  <li><Link href="/concepts/regression-discontinuity" className="text-slate-600 hover:text-blue-600 transition-colors hover:underline">Regression Discontinuity</Link></li>
                  <li><Link href="/concepts/fixed-effects" className="text-slate-600 hover:text-blue-600 transition-colors hover:underline">Fixed Effects</Link></li>
                </ul>
              </div>

              {/* Interactive Tools */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FlaskConical size={18} className="text-purple-600" />
                  Interactive Labs
                </h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/labs/ols" className="text-slate-600 hover:text-purple-600 transition-colors hover:underline">OLS Sandbox</Link></li>
                  <li><Link href="/labs/iv" className="text-slate-600 hover:text-purple-600 transition-colors hover:underline">IV Experiments</Link></li>
                  <li><Link href="/labs/did" className="text-slate-600 hover:text-purple-600 transition-colors hover:underline">DiD with Pre-trends</Link></li>
                  <li><Link href="/labs/rd" className="text-slate-600 hover:text-purple-600 transition-colors hover:underline">RD Cutoff Analysis</Link></li>
                  <li><Link href="/labs/fe" className="text-slate-600 hover:text-purple-600 transition-colors hover:underline">Panel Fixed Effects</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" />
                  Learning Resources
                </h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/resources#textbooks" className="text-slate-600 hover:text-emerald-600 transition-colors hover:underline">Essential Textbooks</Link></li>
                  <li><Link href="/resources#datasets" className="text-slate-600 hover:text-emerald-600 transition-colors hover:underline">Practice Datasets</Link></li>
                  <li><Link href="/resources#software" className="text-slate-600 hover:text-emerald-600 transition-colors hover:underline">Software & Tools</Link></li>
                  <li><Link href="/ai-stata" className="text-slate-600 hover:text-emerald-600 transition-colors hover:underline">AI Code Generation</Link></li>
                  <li><Link href="/resources#journals" className="text-slate-600 hover:text-emerald-600 transition-colors hover:underline">Academic Papers</Link></li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="mt-12 pt-8 border-t border-slate-200/60">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="text-center lg:text-left">
                  <div className="text-sm font-medium text-slate-700 mb-1">
                    © {new Date().getFullYear()} Peking University, National School of Development
                  </div>
                  <div className="text-xs text-slate-500">
                    Econometrics Course Team • Designed by Zhuoxiang Zhou with AI assistance
                  </div>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-slate-500">
                    Built with Next.js • TypeScript • Tailwind CSS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}