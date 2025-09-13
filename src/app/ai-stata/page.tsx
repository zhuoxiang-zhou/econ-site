"use client";

import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs px-2 py-1 border rounded-md hover:shadow"
      aria-label="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="text-sm overflow-x-auto bg-neutral-50 border rounded-xl p-3">
        <code>{code}</code>
      </pre>
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export default function AIStataGuide() {
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
- Include: data load, cleaning as needed (few lines), model, SEs, brief postestimation.
- Constraints: no user interaction, use set seed when simulating, no deprecated commands.

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

* effect size in % if wage is log-transformed
* (uncomment if wage is lnwage)
* regress lnwage educ exper, vce(robust)
* display "Return to schooling (%) = " 100*(exp(_b[educ])-1)`;

  const iv2sls = `* IV / 2SLS: wage on educ instrumented by quarter-of-birth (qob)
clear all
use "wage_iv.dta", clear
* first stage
ivregress 2sls wage (educ = qob) exper age, vce(robust)
estat firststage
* weak-IV check: look at first-stage F-statistics
* over-id test when >1 instrument:
* estat overid`;

  const did = `* Difference-in-Differences with two periods
clear all
use "did_sample.dta", clear
* Variables:
* treat = 1 if treated group, 0 otherwise
* post  = 1 after policy, 0 before
* y     = outcome

* DiD specification with robust SEs (cluster by group if panel groups exist)
reg y i.treat##i.post, vce(robust)

* Event-study style (if multiple periods and unit FE available)
* xtset id year
* reghdfe y i.year##i.treat, absorb(id) vce(cluster id)
* or: areg y i.year##i.treat, absorb(id) vce(cluster id)`;

  const rd = `* Sharp RD around cutoff c on running variable r
clear all
use "rd_sample.dta", clear
* running variable r, treatment D = r >= c
gen D = r >= 50 if !missing(r)

* local polynomial RD using rdrobust (if installed)
* ssc install rdrobust, replace
rdrobust y r, c(50)

* Manual local linear with bandwidth h (illustrative)
* keep if inrange(r, 50-5, 50+5)
* regress y c.D c.cdist##c.D, vce(robust)
* where cdist = r - 50`;

  const fePanel = `* Two-way Fixed Effects (unit and year), cluster by unit
clear all
use "wagepanel.dta", clear
xtset id year

* reghdfe is convenient for high-dimensional FE
* ssc install reghdfe, replace
reghdfe wage educ exper, absorb(id year) vce(cluster id)

* Alternative: areg for one absorb (unit FE) + year dummies
* areg wage educ exper i.year, absorb(id) vce(cluster id)`;

  const qcChecklist = [
    "Read the code comments: do variable names match your dataset exactly?",
    "Confirm sample and units: any accidental listwise deletion or missing filters?",
    "Check SE choice: robust vs. cluster(level). For panels, cluster at the unit (or group) level.",
    "For IV: look at first-stage F-stat and over-id (when applicable).",
    "For DiD: check pretrends (event-study) and group composition.",
    "For RD: verify bandwidth, polynomial order, and manipulation checks (McCrary).",
    "Save a do-file with seeds, versions, and explicit file paths for full reproducibility.",
  ];

  const promptExamples = [
    {
      title: "Prompt recipe (fill before sending to a model)",
      content: promptTemplate,
    },
    {
      title: "OLS + robust SEs",
      code: olsRobust,
    },
    {
      title: "IV / 2SLS with first-stage check",
      code: iv2sls,
    },
    {
      title: "Difference-in-Differences",
      code: did,
    },
    {
      title: "Regression Discontinuity",
      code: rd,
    },
    {
      title: "Panel FE + clustered SEs",
      code: fePanel,
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-2">AI → Stata: Prompting Guide for Econometrics</h1>
      <p className="text-neutral-700 mb-6">
        This page shows how to leverage a generative model <em>productively</em> to write Stata code.
        Focus on good prompts, verify outputs, and keep do-files reproducible. No API keys are required to read/learn here.
      </p>

      <section className="border rounded-2xl p-5 mb-8">
        <h2 className="text-xl font-medium mb-2">Golden rules</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Describe the data schema</strong> (names, types, meaning).</li>
          <li><strong>State the identification strategy</strong> (OLS/IV/RD/DiD/FE) and <strong>SE choice</strong>.</li>
          <li><strong>Ask for Stata code only</strong> with short comments; no placeholders or interactive commands.</li>
          <li><strong>Reproducibility</strong>: set seeds, pin commands (e.g., <code>reghdfe</code>), and save a do-file.</li>
          <li><strong>Verify</strong> with the QC checklist below before using results in a report.</li>
        </ul>
      </section>

      <section className="border rounded-2xl p-5 mb-8">
        <h2 className="text-xl font-medium mb-3">Prompt template</h2>
        <p className="text-sm mb-3">
          Copy this template, fill the placeholders, then paste it into your preferred model (ChatGPT, Claude, Gemini, etc.).
        </p>
        <CodeBlock code={promptTemplate} />
      </section>

      <section className="border rounded-2xl p-5 mb-8">
        <h2 className="text-xl font-medium mb-3">Common tasks — copy-ready Stata</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {promptExamples.slice(1).map((ex, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{ex.title}</h3>
                <CopyButton text={ex.code!} />
              </div>
              <CodeBlock code={ex.code!} />
            </div>
          ))}
        </div>
      </section>

      <section className="border rounded-2xl p-5 mb-8">
        <h2 className="text-xl font-medium mb-2">How to ask for code revisions (prompt patterns)</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>“Tighten scope”</strong>: <em>“Return a single Stata code block; robust SEs; no graphs; few comments.”</em></li>
          <li><strong>“Match my schema”</strong>: paste <em>describe</em> output or a short table of names/types.</li>
          <li><strong>“Swap estimators”</strong>: <em>“Rewrite using <code>ivregress 2sls</code> with instrument Z; report first-stage.”</em></li>
          <li><strong>“Panel SEs”</strong>: <em>“Cluster at id; two-way FE id & year.”</em></li>
          <li><strong>“Show minimal cleaning”</strong>: <em>“Include only necessary recodes, no drops unless justified.”</em></li>
        </ul>
      </section>

      <section className="border rounded-2xl p-5 mb-8">
        <h2 className="text-xl font-medium mb-2">QC checklist before you trust the output</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {qcChecklist.map((t, i) => (<li key={i}>{t}</li>))}
        </ol>
      </section>

      <section className="border rounded-2xl p-5">
        <h2 className="text-xl font-medium mb-2">Extras</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Packages:</strong> <code>reghdfe</code> (two-way FE), <code>rdrobust</code> (RD), <code>estout/esttab</code> (tables).</li>
          <li><strong>Reproducible do-file header:</strong> <em>clear all; version; set more off; set seed;</em> define paths.</li>
          <li><strong>Ethics:</strong> you are responsible for verification; cite your own code, not the model.</li>
        </ul>
      </section>
    </main>
  );
}