// src/app/concepts/page.tsx
"use client";

import { useMemo, useState } from "react";

// --- tiny helper ---
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }}
      className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm transition"
      aria-label="Copy Stata snippet"
      title="Copy Stata snippet"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// --- content model ---
type Card = {
  key: string;
  title: string;
  tags: string[];
  intuition: string;
  gotcha: string;
  checks: string[];
  stata: string;
};

const CARDS: Card[] = [
  {
    key: "ols",
    title: "OLS (Simple Regression)",
    tags: ["OLS", "Robust SE"],
    intuition:
      "Fits a line that minimizes squared residuals: best linear predictor of Y from X under the Gauss–Markov conditions.",
    gotcha:
      "Report uncertainty: use robust standard errors when errors are heteroskedastic; high R² ≠ causal.",
    checks: [
      "Look for outliers/leverage; plot residuals vs. fitted.",
      "If Y is log, interpret β as approx. % change: 100*(exp(β)−1).",
      "Always state the identifying assumption (exogeneity).",
    ],
    stata: `* OLS with robust SEs
reg y x1 x2, vce(robust)

* log outcome interpretation (if ln_y is used)
reg ln_y x1 x2, vce(robust)
display "Percent effect of x1 = " 100*(exp(_b[x1]) - 1)`,
  },
  {
    key: "mr",
    title: "Multiple Regression & Controls",
    tags: ["Controls", "Confounding"],
    intuition:
      "Controls soak up confounders so the remaining variation in X is closer to as-good-as-random.",
    gotcha:
      "Bad controls (post-treatment or mediators) bias estimates; watch functional form.",
    checks: [
      "Justify each control; avoid post-treatment variables.",
      "Try alternative sets of controls to show robustness.",
      "Nonlinearities? Add polynomials or bins if justified.",
    ],
    stata: `* Multiple regression with selected controls
reg y treat age agesq i.region, vce(robust)

* NOTE: avoid including variables affected by 'treat'`,
  },
  {
    key: "iv",
    title: "Instrumental Variables (2SLS)",
    tags: ["IV", "2SLS"],
    intuition:
      "Use Z that moves X but affects Y only through X (exclusion). First-stage relevance is essential.",
    gotcha:
      "Weak instruments → big bias; always show first-stage F and justify exclusion in words.",
    checks: [
      "Report first-stage F (rule of thumb: >10).",
      "Argue exclusion with a causal diagram or narrative.",
      "If multiple instruments, check over-ID (Hansen/Sargan).",
    ],
    stata: `* IV / 2SLS
ivregress 2sls y (x = z) w1 w2, vce(robust)
estat firststage
* if multiple instruments
* estat overid`,
  },
  {
    key: "did",
    title: "Difference-in-Differences",
    tags: ["DiD", "Event study"],
    intuition:
      "Identifies effects from differential changes over time; needs a parallel-trends assumption.",
    gotcha:
      "Check pretrends; group composition and staggered timing can matter.",
    checks: [
      "Plot pre-period effects (event study).",
      "Check for treatment timing heterogeneity issues.",
      "State why parallel trends is plausible.",
    ],
    stata: `* Two-period DiD
reg y i.treat##i.post, vce(robust)

* Event study (panel)
* xtset id year
* reghdfe y i.year##i.treat, absorb(id) vce(cluster id)`,
  },
  {
    key: "rd",
    title: "Regression Discontinuity",
    tags: ["RD"],
    intuition:
      "Local randomization at a cutoff yields local treatment effects near the threshold.",
    gotcha:
      "Bandwidth choice, balance around cutoff, and manipulation checks (McCrary) matter.",
    checks: [
      "Report robustness across bandwidths & polynomials.",
      "Test covariate balance near the cutoff.",
      "Check for bunching/manipulation at the threshold.",
    ],
    stata: `* Sharp RD with rdrobust (if installed)
* ssc install rdrobust, replace
rdrobust y r, c(50)

* Manual local linear (illustrative)
* keep if inrange(r, 45, 55)
* gen D = r >= 50
* gen dist = r - 50
* regress y c.D c.dist##c.D, vce(robust)`,
  },
  {
    key: "fe",
    title: "Panels: Fixed Effects",
    tags: ["Panel", "FE", "Clustered SE"],
    intuition:
      "Within-unit comparisons remove time-invariant bias; cluster SEs at the unit level.",
    gotcha:
      "Serial correlation inflates precision if not clustered; beware dynamic FE bias with short panels.",
    checks: [
      "Cluster at the correct level (often unit).",
      "Consider two-way FE (unit & year) to absorb shocks.",
      "If treatment varies over time, consider event-study.",
    ],
    stata: `* Two-way FE (id and year)
* ssc install reghdfe, replace
reghdfe y x1 x2, absorb(id year) vce(cluster id)

* One absorb + time dummies
* areg y x1 x2 i.year, absorb(id) vce(cluster id)`,
  },
];

// --- pill component ---
function Tag({ t, active, onClick }: { t: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-full border transition ${
        active ? "bg-black text-white" : "bg-white hover:bg-neutral-50"
      } border-black/10`}
    >
      {t}
    </button>
  );
}

export default function Concepts() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(null);

  const allTags = useMemo(
    () => ["All", ...Array.from(new Set(CARDS.flatMap((c) => c.tags)))],
    []
  );

  const filtered = useMemo(() => {
    return CARDS.filter((c) => {
      const hitTag = tag === "All" || c.tags.includes(tag);
      const hay = (c.title + " " + c.intuition + " " + c.gotcha + " " + c.tags.join(" "))
        .toLowerCase();
      const hitQ = hay.includes(q.trim().toLowerCase());
      return hitTag && hitQ;
    });
  }, [q, tag]);

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold mb-4">Concept Cards</h1>

      {/* Search + tags */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (e.g., 'robust', 'IV', 'parallel trends')"
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => (
            <Tag key={t} t={t} active={t === tag} onClick={() => setTag(t)} />
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c, idx) => (
          <article
            key={c.key}
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white"
          >
            {/* gradient top border */}
            <div
              className="absolute inset-x-0 top-0 h-1 opacity-70"
              style={{
                background:
                  idx % 3 === 0
                    ? "linear-gradient(90deg,#60a5fa,#f472b6)"
                    : idx % 3 === 1
                    ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                    : "linear-gradient(90deg,#34d399,#60a5fa)",
              }}
            />

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{c.title}</h2>
                <div className="flex gap-2">
                  <CopyButton text={c.stata} />
                  <button
                    onClick={() => setOpen((o) => (o === c.key ? null : c.key))}
                    className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm transition"
                    aria-expanded={open === c.key}
                  >
                    {open === c.key ? "Hide checks" : "More"}
                  </button>
                </div>
              </div>

              <p className="mt-2 text-sm">
                <span className="font-medium">Intuition:</span> {c.intuition}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Gotcha:</span> {c.gotcha}
              </p>

              {/* reveal section */}
              <div
                className={`transition-[max-height,opacity] duration-300 ease-out ${
                  open === c.key ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="border rounded-xl p-3">
                    <h3 className="font-medium text-sm mb-2">Checks</h3>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {c.checks.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">Stata pattern</h3>
                      <CopyButton text={c.stata} />
                    </div>
                    <pre className="text-xs whitespace-pre-wrap bg-neutral-50 rounded-lg p-3 border overflow-x-auto">
                      <code>{c.stata}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-neutral-50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-sm text-neutral-600 mt-10">
          No matches. Try a different keyword or tag.
        </div>
      )}
    </div>
  );
}