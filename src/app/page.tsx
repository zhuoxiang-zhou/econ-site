// // src/app/page.tsx
// "use client";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { BookOpen, FlaskConical, Bot, ArrowRight } from "lucide-react";

// export default function Home() {
//   return (
//     <div className="relative py-16">
//       {/* Gradient blobs */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
//         <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-sky-400 to-fuchsia-500 dark:opacity-30" />
//         <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-amber-400 to-rose-500 dark:opacity-30" />
//       </div>

//       {/* Hero */}
//       <section className="text-center max-w-3xl mx-auto">
//         <motion.h1
//           initial={{ y: 10, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//           className="text-4xl md:text-5xl font-bold tracking-tight"
//         >
//           Econometrics, made clear.
//         </motion.h1>
//         <motion.p
//           initial={{ y: 10, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.05 }}
//           className="mt-3 text-neutral-600 dark:text-neutral-300"
//         >
//           Concept-first explanations, reproducible Stata patterns, and hands-on labs for undergraduates.
//         </motion.p>
//         <motion.div
//           initial={{ y: 10, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="mt-6 flex justify-center gap-3"
//         >
//           <Link
//             href="/concepts"
//             className="rounded-xl px-4 py-2 text-sm font-medium border border-black/10 dark:border-white/15 hover:shadow-sm bg-white dark:bg-white/5"
//           >
//             Explore Concepts
//           </Link>
//           <Link
//             href="/ai-stata"
//             className="rounded-xl px-4 py-2 text-sm font-medium border border-black/10 dark:border-white/15 hover:shadow-sm inline-flex items-center gap-1"
//           >
//             AI → Stata Guide <ArrowRight size={16} />
//           </Link>
//         </motion.div>
//       </section>

//       {/* Features */}
//       <section className="mt-14 grid md:grid-cols-3 gap-4">
//         {[
//           {
//             title: "Concept Cards",
//             desc: "OLS, IV, DiD, RD, panels—intuition + pitfalls, at a glance.",
//             href: "/concepts",
//             Icon: BookOpen,
//           },
//           {
//             title: "Reg Labs",
//             desc: "Tiny sandboxes to see regressions behave on toy data.",
//             href: "/labs/ols",
//             Icon: FlaskConical,
//           },
//           {
//             title: "Learn Stata with AI",
//             desc: "Prompt recipes and copy-ready Stata for robust workflows.",
//             href: "/ai-stata",
//             Icon: Bot,
//           },
//         ].map(({ title, desc, href, Icon }, i) => (
//           <motion.div
//             key={title}
//             initial={{ y: 8, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.45, delay: 0.05 * i }}
//             className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur hover:shadow-sm"
//           >
//             <Link href={href} className="block p-5">
//               <div className="flex items-center gap-3">
//                 <div className="rounded-xl p-2 border border-black/10 dark:border-white/15">
//                   <Icon size={18} />
//                 </div>
//                 <h3 className="text-lg font-semibold">{title}</h3>
//               </div>
//               <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{desc}</p>
//               <div className="mt-4 text-sm font-medium opacity-70 group-hover:opacity-100 inline-flex items-center gap-1">
//                 Open <ArrowRight size={14} />
//               </div>
//             </Link>
//           </motion.div>
//         ))}
//       </section>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Bot, ArrowRight, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

export default function FancyHome() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient blobs */}
        <motion.div 
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: 'blur(60px)' }}
        />
        
        <motion.div 
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-25 bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-600"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: 'blur(60px)' }}
        />
        
        <motion.div 
          className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full opacity-20 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: 'blur(50px)', transform: 'translate(-50%, -50%)' }}
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
      </div>

      <div className="relative px-6 py-20">
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 text-blue-500 opacity-60"
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <TrendingUp size={32} />
        </motion.div>
        
        <motion.div
          className="absolute top-40 left-10 text-purple-500 opacity-50"
          animate={{ 
            y: [10, -10, 10],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles size={24} />
        </motion.div>

        {/* Hero Section */}
        <section className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg mb-8"
          >
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learn Econometrics the Modern Way
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Econometrics,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              made clear.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            Welcome to the PKU NSD Econometrics Course Hub!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <Link
              href="/labs/ols"
              className="group relative px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FlaskConical size={20} />
                Start with Interactive Labs
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
            
            <Link
              href="/ai-stata"
              className="group px-8 py-4 rounded-xl font-semibold border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <Bot size={20} />
                AI Stata Guide
              </span>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-8 py-6 px-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
          >
            {[
              { icon: BookOpen, label: "Interactive Concepts", value: "6+" },
              { icon: FlaskConical, label: "Live Experiments", value: "12+" },
              { icon: Bot, label: "AI Code Recipes", value: "50+" },
              { icon: Users, label: "Learning Paths", value: "3" }
            ].map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-600">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Enhanced Feature Cards */}
        <section className="mt-20 max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Everything You Need to Master Econometrics
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From foundational concepts to advanced applications, our platform provides 
              a complete learning ecosystem for modern econometrics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Concept Cards",
                desc: "Explore OLS, IV, DiD, RD, and panel methods with visual explanations, real-world examples, and common pitfalls to avoid.",
                href: "/concepts",
                Icon: BookOpen,
                color: "from-blue-500 to-cyan-500",
                features: ["Visual Explanations", "Common Pitfalls", "Real Examples"]
              },
              {
                title: "Live Regression Labs",
                desc: "Experiment with econometric methods using interactive sandboxes. See how coefficients change in real-time with clean toy datasets.",
                href: "/labs/ols",
                Icon: FlaskConical,
                color: "from-purple-500 to-pink-500",
                features: ["Real-time Results", "Interactive Plots", "Clean Data"]
              },
              {
                title: "AI-Powered Stata Workflows",
                desc: "Transform research questions into production-ready Stata code using structured prompts and battle-tested recipes.",
                href: "/ai-stata",
                Icon: Bot,
                color: "from-emerald-500 to-teal-500",
                features: ["Code Generation", "Best Practices", "Quality Checks"]
              },
            ].map(({ title, desc, href, Icon, color, features }, i) => (
              <motion.div
                key={title}
                initial={{ y: 50, opacity: 0, rotateY: 25 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 1.4 + i * 0.2 }}
                whileHover={{ 
                  y: -10, 
                  rotateY: -5,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl blur-xl" 
                     style={{
                       background: `linear-gradient(135deg, ${color.split(' ')[1]}, ${color.split(' ')[3]})`
                     }} />
                
                <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl group-hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${color}`} />
                  
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${color} shadow-lg`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    </div>
                    
                    <p className="text-slate-600 mb-6 leading-relaxed">{desc}</p>
                    
                    <div className="space-y-2 mb-6">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <Zap size={14} className="text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      href={href}
                      className="group/link inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      Explore Now 
                      <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="mt-20 text-center"
        >
          <div className="relative max-w-4xl mx-auto p-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Econometrics Skills?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students and researchers who are mastering causal inference 
                with our modern, interactive approach to econometrics education.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/labs/ols"
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Start Learning Now
                </Link>
                <Link
                  href="/resources"
                  className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Browse Resources
                </Link>
              </div>
            </div>
            
            {/* Floating elements in CTA */}
            <motion.div
              className="absolute top-4 right-4 text-white/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={40} />
            </motion.div>
            
            <motion.div
              className="absolute bottom-4 left-4 text-white/20"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingUp size={32} />
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}