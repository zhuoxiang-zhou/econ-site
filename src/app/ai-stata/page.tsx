// src/app/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/* ------------------------- small UI helpers ------------------------- */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm transition"
      aria-label="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-xl border bg-neutral-50">
      <pre className="text-sm overflow-x-auto rounded-xl p-3">
        <code>{code}</code>
      </pre>
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-full border border-black/10 hover:border-black/20 hover:bg-white/60 bg-white/50 text-sm transition"
    >
      {children}
    </Link>
  );
}

function FeatureCard({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-black/10 bg-white/60 hover:bg-white/80 hover:shadow-sm transition p-5"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl border border-black/10 grid place-items-center bg-white/80">
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-neutral-600 mt-2">{desc}</p>
      <div className="mt-3 text-sm text-blue-600 group-hover:underline">Open →</div>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white/60 p-5">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      {children}
    </section>
  );
}

/* --------------------------- content pieces --------------------------- */
const promptTemplate = `Role: You are a careful Stata tutor for undergraduate econometrics.

Context:
- Study question and identification strategy: <1–2 lines>
- Dataset name: <e.g., wagepanel.dta>
- Variables (name:type:meaning):
  - wage: numeric, log hourly wage
  - educ: numeric, years of schooling
  - exper: numeric, years of experience
  - id, year: panel identifiers
- Assumptions / SEs: <e.g., cluster at id; robust>
- Output format: Stata code only, with short comments. Use explicit prefixes (xtset, ivregress, etc.). No placeholder variables.

Task:
- Write Stata code to accomplish: <task>
- Include: data load, minimal cleaning, model, SEs, brief postestimation.
- Constraints: no user interaction, set seed when simulating, avoid deprecated commands.

Return: A single code block.`;

const olsRobust = `* OLS with robust SEs
clear all
use "wagepanel.dta", clear

describe
summarize wage educ exper

regress wage educ exper, vce(robust)

* If wage is log:
* regress lnwage educ exper, vce(robust)
* display "Return to schooling (%) = " 100*(exp(_b[educ])-1)`;

const iv2sls = `* IV / 2SLS example
clear all
use "wage_iv.dta", clear

ivregress 2sls wage (educ = qob) exper age, vce(robust)
estat firststage
* If multiple instruments: estat overid`;

const did = `* Difference-in-Differences
clear all
use "did_sample.dta", clear
* treat=1 if treated group; post=1 after policy

reg y i.treat##i.post, vce(robust)

* Event-study (if panel):
* xtset id year
* reghdfe y i.year##i.treat, absorb(id) vce(cluster id)`;

const rd = `* Sharp RD
clear all
use "rd_sample.dta", clear
gen D = r >= 50 if !missing(r)

* rdrobust (if installed)
* ssc install rdrobust, replace
rdrobust y r, c(50)`;

const fePanel = `* Two-way FE, cluster by unit
clear all
use "wagepanel.dta", clear
xtset id year

* ssc install reghdfe, replace
reghdfe wage educ exper, absorb(id year) vce(cluster id)

* One absorb alternative:
* areg wage educ exper i.year, absorb(id) vce(cluster id)`;

const qcChecklist = [
  "Do variable names match your dataset exactly?",
  "Is the sample definition correct? (drops / missing handling)",
  "Are SEs appropriate? (robust vs cluster, and cluster level)",
  "IV: check first-stage F and over-ID (when applicable).",
  "DiD: check pretrends/event-study and composition.",
  "RD: bandwidth, polynomial order, manipulation (McCrary).",
  "Save a reproducible do-file (seed, version, pinned packages).",
];

const codeTabs: { key: string; label: string; code: string }[] = [
  { key: "ols", label: "OLS (robust)", code: olsRobust },
  { key: "iv", label: "IV / 2SLS", code: iv2sls },
  { key: "did", label: "DiD", code: did },
  { key: "rd", label: "RD", code: rd },
  { key: "fe", label: "Panel FE", code: fePanel },
];

/* ------------------------------- page ------------------------------- */
export default function Home() {
  const [active, setActive] = useState(codeTabs[0].key);

  const activeCode = useMemo(
    () => codeTabs.find((t) => t.key === active)?.code ?? codeTabs[0].code,
    [active]
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-indigo-50 via-rose-50 to-amber-50 p-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-wide text-neutral-600">Undergraduate Econometrics</p>
          <h1 className="text-4xl font-semibold leading-tight mt-1">
            Econometrics, made clear.
          </h1>
          <p className="mt-3 text-neutral-700">
            Concept-first explanations, reproducible Stata patterns, and hands-on labs.
            Start with concepts, try an interactive regression lab, or use the AI → Stata
            prompting recipes below.
          </p>

          {/* Quick nav pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <PillLink href="/concepts">Concept Cards</PillLink>
            <PillLink href="/labs">Labs</PillLink>
            <PillLink href="/labs/ols">OLS Sandbox</PillLink>
            <PillLink href="/ai-stata">AI → Stata Guide</PillLink>
            <PillLink href="/syllabus">Syllabus</PillLink>
            <PillLink href="/resources">Resources</PillLink>
          </div>
        </div>
      </div>

      {/* FEATURE LINKS */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <FeatureCard
          title="Concept Cards"
          desc="OLS, IV, RD, DiD, panels—intuition, assumptions, pitfalls, and plain-language summaries."
          href="/concepts"
          icon={<span>📘</span>}
        />
        <FeatureCard
          title="Labs"
          desc="Tiny sandboxes to see regressions behave on toy data. Build intuition before writing code."
          href="/labs"
          icon={<span>🧪</span>}
        />
        <FeatureCard
          title="AI → Stata"
          desc="Prompt recipes and copy-ready Stata code snippets for robust workflows."
          href="/ai-stata"
          icon={<span>🤖</span>}
        />
      </div>

      {/* AI → STATA MINI-GUIDE */}
      <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <Section title="Prompt template (copy & fill)">
          <p className="text-sm text-neutral-700 mb-3">
            Use this template with ChatGPT / Claude / Gemini to generate clean, reproducible Stata.
            Be explicit about schema, estimator, and SEs.
          </p>
          <CodeBlock code={promptTemplate} />
          <p className="text-xs text-neutral-500 mt-2">
            Tip: ask for <em>one</em> code block only; paste <code>describe</code> output to align variable names.
          </p>
        </Section>

        <Section title="QC checklist">
          <ol className="text-sm list-decimal pl-5 space-y-1">
            {qcChecklist.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          <div className="text-xs text-neutral-500 mt-3">
            Packages: <code>reghdfe</code>, <code>rdrobust</code>, <code>esttab</code>. Header:{" "}
            <em>clear all; version; set more off; set seed</em>; define paths.
          </div>
        </Section>
      </div>

      {/* CODE TABS */}
      <Section title="Common tasks — copy-ready Stata">
        <div className="flex flex-wrap gap-2 mb-3">
          {codeTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${
                active === t.key
                  ? "bg-white border-black/20 shadow-sm"
                  : "bg-white/60 border-black/10 hover:border-black/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CodeBlock code={activeCode} />
      </Section>

      {/* FOOTER */}
      <footer className="text-xs text-neutral-500 mt-12">
        © {new Date().getFullYear()} Undergraduate Econometrics. Built with Next.js & Tailwind.
      </footer>
    </main>
  );
}