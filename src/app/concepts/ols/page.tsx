"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, LineChart } from "lucide-react";

export default function OLS_SimpleConcept() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Back link */}
        <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
          <Link href="/concepts" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={16} />
            Back to Concepts
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Ordinary Least Squares (OLS): Simple Regression
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            The workhorse model: explain an outcome <code>y</code> with one regressor <code>x</code> via
            the line <code>y = β₀ + β₁x + u</code>. Use it to summarize relationships and—under conditions—draw causal conclusions.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Adapted in part from the course slide deck.
          </p>
        </motion.div>

        {/* Definition & Interpretation */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.section
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-2xl border border-slate-200 shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-2">Model & Terms</h2>
            <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li><strong>Dependent</strong> (response, regressand): <code>y</code></li>
              <li><strong>Independent</strong> (explanatory, regressor): <code>x</code></li>
              <li><strong>Intercept</strong> <code>β₀</code>, <strong>Slope</strong> <code>β₁</code>, <strong>Error</strong> <code>u</code></li>
            </ul>
            <div className="mt-3 text-sm text-slate-700">
              Interpretation (holding other factors fixed): a 1-unit increase in <code>x</code> changes the conditional mean of <code>y</code> by <code>β₁</code>.
            </div>
          </motion.section>

          <motion.section
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-2xl border border-slate-200 shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-2">Causal Meaning</h2>
            <p className="text-sm text-slate-700">
              To read <code>β₁</code> causally, we need the **zero conditional mean** / **conditional mean independence**:
              <code> E[u | x] = 0</code>. That is, <code>x</code> contains no information about the mean of omitted factors.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Example: schooling → wage. If education correlates with ability (unobserved), then <code>E[u|x]≠0</code> and the simple slope is biased.
            </p>
          </motion.section>
        </div>

        {/* Population regression & OLS idea */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Population Regression Function (PRF)</h3>
            <p className="text-sm text-slate-700">
              Under <code>E[u|x]=0</code>, the conditional mean is linear: <code>E[y|x] = β₀ + β₁x</code>. The PRF traces the average of <code>y</code> at each <code>x</code>.
            </p>
            <div className="mt-3 p-3 bg-slate-50 border rounded-lg text-sm font-mono">
              slope β₁ = Cov(x, y) / Var(x); &nbsp; intercept β₀ = ȳ − β₁x̄
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <h3 className="text-lg font-semibold mb-2">OLS = Least Squares</h3>
            <p className="text-sm text-slate-700">
              Fit the line that minimizes the **sum of squared residuals**: <code>SSR(β₀,β₁)=∑(yᵢ−β₀−β₁xᵢ)²</code>.
              In the fitted sample, residuals sum to zero and are uncorrelated with <code>x</code>.
            </p>
          </section>
        </div>

        {/* Goodness-of-fit, R^2, Examples */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <LineChart size={18} className="text-blue-600" />
              <h3 className="text-lg font-semibold">Goodness-of-Fit</h3>
            </div>
            <p className="text-sm text-slate-700">
              Decompose variation: <code>SST = SSR + SSE</code>. The <code>R² = 1 − SSE/SST</code> is the share of variation explained by the regression.
              High <code>R²</code> ≠ causal validity.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Functional Forms</h3>
            <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li><strong>Semi-log</strong> (log-level): <code>log y = β₀ + β₁ x</code> → <code>β₁</code> ≈ %Δy per 1 unit of <code>x</code>.</li>
              <li><strong>Log-log</strong>: <code>log y = β₀ + β₁ log x</code> → <code>β₁</code> is an elasticity (%Δy per 1%Δx).</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-amber-600" />
              <h3 className="text-lg font-semibold">Applied Examples</h3>
            </div>
            <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li>CEO pay vs. firm performance (low R² can still matter).</li>
              <li>Wage vs. education (returns to schooling; beware ability bias).</li>
              <li>Consumption vs. income (high R²; not necessarily causal).</li>
            </ul>
          </section>
        </div>

        {/* Assumptions & Sampling */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Standard Assumptions (SLR.1–SLR.5)</h3>
            <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li><strong>SLR.1</strong> Linearity in parameters</li>
              <li><strong>SLR.2</strong> Random sampling</li>
              <li><strong>SLR.3</strong> Sample variation in <code>x</code></li>
              <li><strong>SLR.4</strong> Zero conditional mean: <code>E[u|x]=0</code> (⇒ unbiasedness)</li>
              <li><strong>SLR.5</strong> Homoskedasticity: <code>Var(u|x)=σ²</code> (for classic SE formulas)</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">
              If <strong>heteroskedasticity</strong> is present (<code>Var(u|x)</code> varies with <code>x</code>), use **robust SE**.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Sampling Variability & SEs</h3>
            <p className="text-sm text-slate-700">
              OLS estimates vary across samples. Variances:
              increase with noise in <code>u</code>, decrease with more variation in <code>x</code> and larger <code>n</code>.
              Robust standard errors quantify precision without assuming homoskedasticity.
            </p>
          </section>
        </div>

        {/* Quick Worked Example */}
        <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Tiny Worked Example</h3>
          <p className="text-sm text-slate-700">
            Suppose hourly wage on years of education yields <code>wagê = 5.1 + 0.54·educ</code> with robust SE for 0.54 equal to 0.20.
          </p>
          <ul className="text-sm text-slate-700 list-disc pl-5 mt-2 space-y-1">
            <li>Interpretation: +1 year of education ↦ +0.54 in hourly wage (on average).</li>
            <li>95% CI: <code>0.54 ± 1.96×0.20 = [0.16, 0.92]</code>.</li>
            <li>Prediction at <code>educ=12</code>: <code>5.1 + 0.54×12 = 11.58</code> (add prediction intervals in practice).</li>
          </ul>
        </section>

        {/* Stata snippet */}
        <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold">Stata (simple OLS, robust SE)</h3>
          </div>
          <div className="p-6 bg-slate-50">
            <pre className="text-sm overflow-x-auto">
{`clear all
* Example data
sysuse auto, clear    // or: use "mydata.dta", clear

* Scatter + fit line (as in slides)
twoway (scatter price mpg, ytitle("Price")) (lfit price mpg, legend(off))

* Simple OLS with robust SE
regress price mpg, vce(robust)

* Semi-log or log-log
* gen ln_price = ln(price)
* regress ln_price mpg, vce(robust)   // semi-log: β ≈ %Δprice per 1 unit mpg
* gen ln_mpg = ln(mpg)
* regress ln_price ln_mpg, vce(robust)  // log-log: β is elasticity`}
            </pre>
            <p className="text-xs text-slate-600 mt-2">
              Where to find pieces in output: coefficients & SEs; SSE/SSR/SST and R²; residual diagnostics. (Replicates the slide workflow.)
            </p>
          </div>
        </section>

        {/* Next steps */}
        <motion.section
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center"
        >
          <h3 className="text-xl font-semibold mb-2">Practice & Go Further</h3>
          <p className="text-blue-100 mb-4">
            Move from simple to multiple regression; use robust SE; explore logs when relationships are nonlinear.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/labs/ols" className="px-5 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50">
              Try the OLS Lab
            </Link>
            <Link href="/labs/iv" className="px-5 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50">
              Instrumental Variables
            </Link>
            <Link href="/labs/did" className="px-5 py-2 border-2 border-white/30 rounded-lg font-semibold hover:bg-white/10">
              Difference-in-Differences
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}