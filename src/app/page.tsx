// src/app/page.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Bot, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative py-16">
      {/* Gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-sky-400 to-fuchsia-500 dark:opacity-30" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-amber-400 to-rose-500 dark:opacity-30" />
      </div>

      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold tracking-tight"
        >
          Econometrics, made clear.
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-3 text-neutral-600 dark:text-neutral-300"
        >
          Concept-first explanations, reproducible Stata patterns, and hands-on labs for undergraduates.
        </motion.p>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 flex justify-center gap-3"
        >
          <Link
            href="/concepts"
            className="rounded-xl px-4 py-2 text-sm font-medium border border-black/10 dark:border-white/15 hover:shadow-sm bg-white dark:bg-white/5"
          >
            Explore Concepts
          </Link>
          <Link
            href="/ai-stata"
            className="rounded-xl px-4 py-2 text-sm font-medium border border-black/10 dark:border-white/15 hover:shadow-sm inline-flex items-center gap-1"
          >
            AI → Stata Guide <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mt-14 grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Concept Cards",
            desc: "OLS, IV, DiD, RD, panels—intuition + pitfalls, at a glance.",
            href: "/concepts",
            Icon: BookOpen,
          },
          {
            title: "Reg Labs",
            desc: "Tiny sandboxes to see regressions behave on toy data.",
            href: "/labs/ols",
            Icon: FlaskConical,
          },
          {
            title: "Learn Stata with AI",
            desc: "Prompt recipes and copy-ready Stata for robust workflows.",
            href: "/ai-stata",
            Icon: Bot,
          },
        ].map(({ title, desc, href, Icon }, i) => (
          <motion.div
            key={title}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.05 * i }}
            className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur hover:shadow-sm"
          >
            <Link href={href} className="block p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2 border border-black/10 dark:border-white/15">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{desc}</p>
              <div className="mt-4 text-sm font-medium opacity-70 group-hover:opacity-100 inline-flex items-center gap-1">
                Open <ArrowRight size={14} />
              </div>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
}