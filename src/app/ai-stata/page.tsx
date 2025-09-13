// src/app/ai-stata/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/* ---------- tiny UI primitives ---------- */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm">
      {children}
    </span>
  );
}

function Section({ id, title, badge }: { id: string; title: string; badge?: string }) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {badge && <Pill>{badge}</Pill>}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-[11px] px-2 py-1 rounded-md border border-black/10 hover:border-black/20 hover:shadow-sm transition"
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure className="relative rounded-xl border border-black/10 bg-neutral-50">
      <figcaption className="flex items-center justify-between px-3 py-2 text-[11px] text-neutral-500 border-b border-black/5">
        <span>{caption ?? "Stata code"}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre className="text-xs leading-relaxed overflow-x-auto p-3">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

/* ---------- content blocks ---------- */
const promptTemplate = `Role: You are a careful Stata tutor for undergraduate econometrics.

Context:
- Study question and identification strategy: <1–2 lines>
- Dataset name: <e.g., wagepanel.dta>
- Variables (name : type : meaning):
  - wage : numeric : log hourly wage
  - educ : numeric : years of schooling
  - exper : numeric : years of experience
  - id, year : panel identifiers
- Assumptions / SEs: <e.g., cluster at id; robust>
- Output format: Stata code only, with short comments. Use explicit prefixes (xtset, ivregress, etc.). No placeholder variables.

Task:
- Write Stata code to accomplish: <task>
- Include: data load, minimal cleaning (few lines), model, SEs, brief postestimation.
- Constraints: no interactive prompts; set seed when simulating; avoid deprecated commands.

Return: A single code block.`;

const olsRobust = `* OLS with robust SEs
clear all
* use your dataset
use "wagepanel.dta", clear

* basic checks
describe
summarize wage educ exper

* OLS with robust (Huber-White) standard errors
regress wage educ exper, vce(robust)

* effect size in %% if wage is log-transformed
* (uncomment if wage is lnwage)
* regress lnwage educ exper, vce(robust)
* display "Return to schooling (%%) = " 100*(exp(_b[educ])-1)`;

const iv2sls = `* IV / 2SLS: wage on educ instrumented by quarter-of-birth (qob)
clear all
use "wage_iv.dta", clear
ivregress 2sls wage (educ = qob) exper age, vce(robust)
estat firststage
* weak-IV check: first-stage F-statistics
* over-identification test when multiple instruments:
* estat overid`;

const did = `* Difference-in-Differences with two periods
clear all
use "did_sample.dta", clear
* treat = 1 if treated group, 0 otherwise
* post  = 1 after policy, 0 before
* y     = outcome

reg y i.treat##i.post, vce(robust)

* Event-study if multiple periods and unit FE:
* xtset id year
* reghdfe y i.year##i.treat, absorb(id) vce(cluster id)
* or:
* areg y i.year##i.treat, absorb(id) vce(cluster id)`;

const rd = `* Sharp RD around cutoff c on running variable r
clear all
use "rd_sample.dta", clear
gen D = r >= 50 if !missing(r)

* rdrobust (if installed)
* ssc install rdrobust, replace
rdrobust y r, c(50)

* Manual local linear (illustrative only)
* keep if inrange(r, 50-5, 50+5)
* gen cdist = r - 50
* regress y c.D c.cdist##c.D, vce(robust)`;

const fePanel = `* Two-way Fixed Effects (unit and year), cluster by unit
clear all
use "wagepanel.dta", clear
xtset id year

* reghdfe (high-dimensional FE)
* ssc install reghdfe, replace
reghdfe wage educ exper, absorb(id year) vce(cluster id)

* Alternative: one absorb (unit FE) + year dummies
* areg wage educ exper i.year, absorb(id) vce(cluster id)`;

const qcChecklist = [
  "Do variable names in code match your dataset exactly?",
  "Confirm the sample and units (no unintended drops).",
  "Match SE choice to design: robust vs. cluster(level).",
  "For IV: inspect first-stage F-stat and over-identification (if applicable).",
  "For DiD: check pre-trends (event study) and group composition.",
  "For RD: validate bandwidth, polynomial order, and manipulation tests.",
  "Keep a do-file with seeds, versions, and explicit paths for reproducibility.",
];

const recipes = [
  { id: "r-ols", title: "OLS + robust SEs", code: olsRobust },
  { id: "r-iv", title: "IV / 2SLS with first-stage", code: iv2sls },
  { id: "r-did", title: "Difference-in-Differences", code: did },
  { id: "r-rd", title: "Regression Discontinuity", code: rd },
  { id: "r-fe", title: "Panel FE + clustered SEs", code: fePanel },
];

/* ---------- page ---------- */
export default function AIStataGuide() {
  const toc = useMemo(
    () => [
      { id: "top", label: "Overview", icon: "🏁" },
      { id: "rules", label: "Rules", icon: "📜" },
      { id: "template", label: "Template", icon: "🧩" },
      { id: "recipes", label: "Tasks", icon: "🛠️" },
      { id: "patterns", label: "Patterns", icon: "🔁" },
      { id: "qc", label: "QC", icon: "✅" },
      { id: "extras", label: "Extras", icon: "✨" },
    ],
    []
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden rounded-3xl border border-black/5 bg-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(40rem 20rem at -10% -10%, #dbeafe 0%, transparent 60%), radial-gradient(28rem 16rem at 110% -10%, #fee2e2 0%, transparent 60%), radial-gradient(30rem 18rem at 50% 120%, #ede9fe 0%, transparent 60%)",
          }}
        />
        <div className="relative p-8 md:p-12">
          <Pill>Guide</Pill>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
            AI → Stata: Prompting for Econometrics
          </h1>
          <p className="mt-3 max-w-3xl text-neutral-700">
            Turn clear problem statements into reliable Stata code. Focus on scope, schema, and reproducibility—then verify with a quick checklist.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Pill>Stata</Pill>
            <Pill>OLS / IV / DiD / RD / FE</Pill>
            <Pill>Robust / Clustered SEs</Pill>
          </div>
        </div>
      </section>

      {/* Mobile mini-nav (horizontal) */}
      <div className="mt-6 md:hidden">
        <div className="flex flex-wrap gap-2">
          {toc.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="text-xs rounded-full border border-black/10 bg-white px-3 py-1"
            >
              {t.icon} {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* Grid: thin sticky sidebar + content */}
      <div className="mt-8 grid gap-6 md:grid-cols-[56px,1fr]">
        {/* Thin vertical sidebar (desktop only) */}
        <aside
          className="sticky top-24 hidden md:block h-max rounded-2xl border border-black/10 bg-white"
          aria-label="Section navigation"
        >
          <ul className="flex flex-col items-center gap-2 py-3">
            {toc.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  title={t.label}
                  aria-label={t.label}
                  className="block h-9 w-9 rounded-full border border-black/10 bg-white grid place-items-center hover:shadow-sm hover:border-black/20 transition"
                >
                  <span className="text-base" aria-hidden>
                    {t.icon}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <div className="space-y-10">
          <section id="rules" className="rounded-2xl border border-black/10 bg-white p-5">
            <Section id="rules" title="Golden Rules" badge="Read before prompting" />
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Describe the <strong>data schema</strong> (names, types, meaning).</li>
              <li>State the <strong>design</strong> (OLS / IV / RD / DiD / FE) and <strong>SE choice</strong>.</li>
              <li>Ask for <strong>code only</strong> with concise comments; avoid interactive prompts and placeholders.</li>
              <li>Keep it <strong>reproducible</strong>: set seed, pin packages (e.g., <code>reghdfe</code>), save a do-file.</li>
              <li><strong>Verify</strong> with the checklist before using results in reports.</li>
            </ul>
          </section>

          <section id="template" className="rounded-2xl border border-black/10 bg-white p-5">
            <Section id="template" title="Prompt Template" badge="Copy & fill" />
            <p className="text-sm text-neutral-700 mb-3">
              Copy this template, fill placeholders, then paste into your model of choice.
            </p>
            <CodeBlock caption="Prompt template" code={promptTemplate} />
          </section>

          <section id="recipes" className="rounded-2xl border border-black/10 bg-white p-5">
            <Section id="recipes" title="Common Tasks — Copy-ready Stata" />
            <div className="grid md:grid-cols-2 gap-4">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-black/10 bg-white/70 p-3 hover:shadow-sm transition"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{r.title}</h3>
                    <CopyButton text={r.code} />
                  </div>
                  <CodeBlock code={r.code} />
                </div>
              ))}
            </div>
          </section>

          <section id="patterns" className="rounded-2xl border border-black/10 bg-white p-5">
            <Section id="patterns" title="Prompt Patterns (for revisions)" />
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Tighten scope:</strong> <em>Return one Stata code block; robust SEs; no graphs; minimal comments.</em></li>
              <li><strong>Match my schema:</strong> paste a short table of names/types (or <code>describe</code> output).</li>
              <li><strong>Swap estimators:</strong> <em>Rewrite using <code>ivregress 2sls</code> with instrument Z; include first-stage diagnostics.</em></li>
              <li><strong>Panel SEs:</strong> <em>Cluster at id; two-way FE for id & year.</em></li>
              <li><strong>Minimal cleaning:</strong> <em>Include only necessary recodes; avoid drops unless justified.</em></li>
            </ul>
          </section>

          <section id="qc" className="rounded-2xl border border-black/10 bg-white p-5">
            <Section id="qc" title="QC Checklist" />
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              {qcChecklist.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </section>

          <section id="extras" className="rounded-2xl border border-black/10 bg-white p-5">
            <Section id="extras" title="Extras" />
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Packages:</strong> <code>reghdfe</code> (two-way FE), <code>rdrobust</code> (RD), <code>estout</code> / <code>esttab</code> (tables).</li>
              <li><strong>Do-file header:</strong> <em>clear all; version; set more off; set seed;</em> define project-root paths.</li>
              <li><strong>Ethics:</strong> you are responsible for verification; cite your own code, not the model.</li>
            </ul>
            <div className="mt-4 text-xs text-neutral-500">
              Tip: keep a <code>/code</code> folder with dated do-files and a minimal <code>README.md</code> describing data sources and steps.
            </div>
            <div className="mt-3 text-xs text-neutral-500">
              <Link href="/resources" className="text-blue-600 hover:underline">
                → See Resources
              </Link>{" "}
              for textbooks and data portals.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}