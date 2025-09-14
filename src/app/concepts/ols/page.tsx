"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs px-2 py-1 border rounded-md hover:shadow transition"
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

const stataSnippet = `* OLS (simple regression): y on x with robust SEs
clear all
* use your data
use "mydata.dta", clear

describe y x
summarize y x

regress y x, vce(robust)

* If y is log:
* regress ln_y x, vce(robust)
* di "Semi-elasticity (%) = " 100*(exp(_b[x])-1)`;

export default function OLS_SimpleConcept() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/concepts" className="opacity-70 hover:opacity-100">← Back to Concepts</Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold">OLS (Simple Regression)</h1>
      <p className="text-neutral-700 mt-2 max-w-3xl">
        One regressor, one outcome. Fit a line that minimizes squared residuals:
        the best linear predictor of <code>y</code> from <code>x</code>.
      </p>

      {/* Grid of concept cards */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Intuition */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Intuition</h2>
          <p className="text-sm text-neutral-700">
            OLS chooses <code>(a, b)</code> in <code>y ≈ a + b·x</code> to make residuals
            <code> eᵢ = yᵢ − (a + b xᵢ)</code> as small as possible on average (least squares).
            The slope <code>b</code> tells how much <code>y</code> changes with a one-unit change in <code>x</code>.
          </p>
        </section>

        {/* Closed-form */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Closed-form formulas</h2>
          <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
            <li>
              Slope: <code>b = Cov(x, y) / Var(x)</code>
            </li>
            <li>
              Intercept: <code>a = ȳ − b x̄</code>
            </li>
            <li>
              Fitted value: <code>ŷᵢ = a + b xᵢ</code>, residual: <code>eᵢ = yᵢ − ŷᵢ</code>
            </li>
            <li>
              Fit: <code>R² = 1 − SSR/SST</code>, where <code>SSR = Σ eᵢ²</code>
            </li>
          </ul>
        </section>

        {/* Assumptions */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Key assumptions (to interpret b causally)</h2>
          <ol className="text-sm text-neutral-700 list-decimal pl-5 space-y-1">
            <li><strong>Linearity:</strong> the conditional mean is linear in <code>x</code>.</li>
            <li><strong>Exogeneity:</strong> <code>E[u | x] = 0</code> (no omitted confounders, no reverse causality).</li>
            <li><strong>No perfect collinearity:</strong> <code>Var(x) &gt; 0</code>.</li>
            <li><strong>Random sampling</strong> from the population of interest.</li>
            <li><strong>Finite variance:</strong> <code>Var(u)</code> exists; use robust SE if heteroskedastic.</li>
          </ol>
        </section>

        {/* Diagnostics */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Diagnostics & quick checks</h2>
          <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
            <li>
              <strong>Scatterplot + line:</strong> look for curvature (model misspecification) and outliers.
            </li>
            <li>
              <strong>Residuals vs fitted:</strong> funnel shapes → heteroskedasticity (use robust SE).
            </li>
            <li>
              <strong>Influence:</strong> high-leverage points can dominate; check leverage/Cook’s D.
            </li>
            <li>
              <strong>Functional form:</strong> consider logs or polynomials if relationships are nonlinear.
            </li>
          </ul>
        </section>

        {/* Pitfalls */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Common pitfalls</h2>
          <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
            <li>
              <strong>Omitted variable bias:</strong> if <code>x</code> correlates with an unobserved determinant of <code>y</code>,
              <code> b</code> is biased.
            </li>
            <li>
              <strong>Bad controls:</strong> don’t control for post-treatment variables in causal models (that’s for multiple regression).
            </li>
            <li>
              <strong>Units:</strong> interpret <code>b</code> in the units of <code>x</code> and <code>y</code>; log-level ≠ level-level.
            </li>
            <li>
              <strong>Extrapolation:</strong> avoid interpreting far beyond the observed range of <code>x</code>.
            </li>
          </ul>
        </section>

        {/* Worked example */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Tiny worked example</h2>
          <p className="text-sm text-neutral-700 mb-2">
            Suppose <code>y = hourly wage</code> and <code>x = years of schooling</code> for 100 workers. You estimate
            <code> ŷ = 5.1 + 0.7·x</code> (robust SE for 0.7 is 0.2).
          </p>
          <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
            <li>
              <strong>Interpretation:</strong> +1 year of schooling is associated with +0.7 currency units in hourly wage (on average).
            </li>
            <li>
              <strong>95% CI for slope:</strong> <code>0.7 ± 1.96×0.2 = [0.31, 1.09]</code>.
            </li>
            <li>
              <strong>Prediction at x=12:</strong> <code>ŷ = 5.1 + 0.7×12 = 13.5</code> (add prediction intervals in practice).
            </li>
          </ul>
        </section>
      </div>

      {/* Stata block */}
      <section className="bg-white border rounded-2xl p-6 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Stata: simple OLS (copy-ready)</h2>
          <CopyButton text={stataSnippet} />
        </div>
        <div className="mt-3">
          <CodeBlock code={stataSnippet} />
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Tip: If <code>y</code> is log, interpret <code>_b[x]</code> approximately as a percent change. Use
          <code> 100·(exp(_b[x])−1)</code> for exact percent.
        </p>
      </section>

      {/* Next steps */}
      <section className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Practice & go further</h2>
        <p className="text-blue-100 mb-4">
          Move from simple to multiple regression, then to causal designs when exogeneity is doubtful.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/labs/ols" className="px-5 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50">
            Try the OLS Lab
          </Link>
          <Link href="/labs/iv" className="px-5 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50">
            Explore Instrumental Variables
          </Link>
          <Link href="/labs/did" className="px-5 py-2 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10">
            Learn Difference-in-Differences
          </Link>
        </div>
      </section>
    </main>
  );
}