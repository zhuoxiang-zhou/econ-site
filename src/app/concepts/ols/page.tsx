"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function OLSConceptCard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        
        {/* Back link */}
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Link 
            href="/concepts" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={16} />
            Back to Concepts
          </Link>
        </motion.div>

        {/* Title + Intro */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Ordinary Least Squares (OLS) — Simple Regression
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            The workhorse of econometrics. OLS fits a straight line through data to summarize the relationship 
            between one independent variable and one dependent variable. It is the foundation for modern applied econometrics.
          </p>
        </motion.div>

        {/* Key idea card */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-10"
        >
          <h2 className="text-xl font-semibold mb-3">The Key Idea</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            We want to explain an outcome <code>y</code> (e.g. wages) with a single regressor <code>x</code> 
            (e.g. years of education). OLS chooses the line 
            <code> y = α + βx </code> that minimizes the sum of squared residuals (the vertical distances between the line and the data points).
          </p>
        </motion.div>

        {/* Formula + intuition */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl border border-slate-200 shadow p-6"
          >
            <h3 className="text-lg font-semibold mb-3">Formula</h3>
            <p className="text-sm text-slate-700 mb-2">
              The slope <code>β̂</code> is:
            </p>
            <pre className="bg-slate-50 rounded-lg p-3 text-sm font-mono overflow-x-auto">
              β̂ = Cov(x, y) / Var(x)
            </pre>
            <p className="text-sm text-slate-600 mt-3">
              Intuitively, β̂ tells us how much <code>y</code> changes on average when <code>x</code> increases by one unit.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl border border-slate-200 shadow p-6"
          >
            <h3 className="text-lg font-semibold mb-3">Assumptions</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Linearity: true model is linear in parameters.</li>
              <li>Exogeneity: E[u | x] = 0 (no omitted-variable bias).</li>
              <li>Var(x) &gt; 0 (variation in regressor).</li>
              <li>Homoskedasticity (optional for efficiency).</li>
              <li>Independence across observations.</li>
            </ul>
          </motion.div>
        </div>

        {/* Applications */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-12"
        >
          <h2 className="text-xl font-semibold mb-3">Applications</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
            <li><strong>Wages on Education:</strong> Estimate returns to schooling.</li>
            <li><strong>Test Scores on Class Size:</strong> Measure the effect of smaller classes.</li>
            <li><strong>Consumption on Income:</strong> Understand marginal propensity to consume.</li>
          </ul>
        </motion.div>

        {/* Stata example */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-3">Stata Example</h2>
          <pre className="bg-slate-50 rounded-lg p-3 text-sm font-mono overflow-x-auto">
            {`clear all
use "wage_data.dta", clear

* Run simple regression
regress wage educ, vce(robust)

* Interpretation: β = average change in wage per extra year of education
`}
          </pre>
        </motion.div>

      </div>
    </div>
  );
}