// // src/app/labs/fe/page.tsx
// import Link from "next/link";

// export default function FELab() {
//   return (
//     <div className="py-10">
//       <div className="text-sm mb-3">
//         <Link href="/labs" className="opacity-70 hover:opacity-100">
//           ← Back to Labs
//         </Link>
//       </div>
//       <h1 className="text-2xl font-semibold">Panels: Fixed Effects Lab</h1>
//       <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
//         Within-unit comparisons and the importance of clustered SEs. (Coming soon.)
//       </p>
//       <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
//         <p className="text-sm">
//           🚧 Placeholder. We’ll add a toy panel and show how unit FE and
//           clustering change the results.
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, RefreshCw, Play } from "lucide-react";

/* ------------------------------- helpers ---------------------------------- */
function mean(a: number[]) { return a.reduce((s, v) => s + v, 0) / (a.length || 1); }
function variance(a: number[]) {
  const m = mean(a);
  return mean(a.map(v => (v - m) ** 2));
}
function cov(a: number[], b: number[]) {
  const ma = mean(a), mb = mean(b);
  return mean(a.map((v, i) => (v - ma) * (b[i] - mb)));
}

/** OLS slope for y ~ a + b*x (returns b). */
function olsSlope(x: number[], y: number[]): number {
  const vxx = variance(x);
  if (vxx === 0) return 0;
  return cov(x, y) / vxx;
}

/** Within (demeaning) by an index (unit or time). */
function withinTransform(values: number[], index: number[]) {
  const groups = new Map<number, number[]>();
  index.forEach((g, i) => {
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(i);
  });
  const out = new Array(values.length);
  groups.forEach(idxList => {
    const m = mean(idxList.map(i => values[i]));
    idxList.forEach(i => { out[i] = values[i] - m; });
  });
  return out;
}

/** Two-way within transform (remove unit and time effects): y_it - y_i. - y_.t + y_.. */
function withinTwoWay(values: number[], unit: number[], time: number[]) {
  // unit means
  const y_i = new Map<number, number>();
  const idxByU = new Map<number, number[]>();
  unit.forEach((u, i) => {
    if (!idxByU.has(u)) idxByU.set(u, []);
    idxByU.get(u)!.push(i);
  });
  idxByU.forEach((idx, u) => y_i.set(u, mean(idx.map(i => values[i]))));

  // time means
  const y_t = new Map<number, number>();
  const idxByT = new Map<number, number[]>();
  time.forEach((tt, i) => {
    if (!idxByT.has(tt)) idxByT.set(tt, []);
    idxByT.get(tt)!.push(i);
  });
  idxByT.forEach((idx, tt) => y_t.set(tt, mean(idx.map(i => values[i]))));

  // grand mean
  const y_all = mean(values);

  // decompose
  return values.map((v, i) => v - (y_i.get(unit[i]) ?? 0) - (y_t.get(time[i]) ?? 0) + y_all);
}

/* ----------------------------- data generator ------------------------------ */
type Row = {
  i: number;  // unit id
  t: number;  // time id
  x: number;
  y: number;
  alpha_i: number; // unit FE
  gamma_t: number; // time FE
};

function rngNormal() {
  // Box–Muller
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function genPanel({
  N = 40,
  T = 8,
  beta = 1.2,
  sigmaU = 1.0,  // SD of unit FE
  sigmaT = 0.8,  // SD of time FE shock
  timeTrend = 0.3, // deterministic trend in gamma_t
  rhoUX = 0.7,   // corr strength: x depends on alpha_i (endogeneity if unit FE omitted)
  noiseX = 1.0,
  noiseY = 1.0,
}: {
  N?: number; T?: number; beta?: number; sigmaU?: number; sigmaT?: number;
  timeTrend?: number; rhoUX?: number; noiseX?: number; noiseY?: number;
}): Row[] {
  const alphas = Array.from({ length: N }, () => sigmaU * rngNormal());
  const gammas: number[] = [];
  for (let t = 0; t < T; t++) {
    gammas.push(timeTrend * t + sigmaT * rngNormal());
  }

  const rows: Row[] = [];
  for (let i = 0; i < N; i++) {
    for (let t = 0; t < T; t++) {
      // x correlated with alpha_i (endogeneity if we ignore unit FE)
      const x = rhoUX * alphas[i] + 0.5 * t + noiseX * rngNormal();
      const eps = noiseY * rngNormal();
      const y = beta * x + alphas[i] + gammas[t] + eps;
      rows.push({ i, t, x, y, alpha_i: alphas[i], gamma_t: gammas[t] });
    }
  }
  return rows;
}

/* --------------------------------- chart ----------------------------------- */
function TimeMeansChart({
  rows, width = 680, height = 360,
}: { rows: Row[]; width?: number; height?: number; }) {
  // Mean y by time
  const times = Array.from(new Set(rows.map(r => r.t))).sort((a, b) => a - b);
  const mY = times.map(tt => mean(rows.filter(r => r.t === tt).map(r => r.y)));
  const minY = Math.min(...mY), maxY = Math.max(...mY);
  const pad = 40, innerW = width - 2 * pad, innerH = height - 2 * pad;
  const sx = (tt: number) => pad + (tt / (times.length - 1 || 1)) * innerW;
  const sy = (yy: number) => pad + innerH - ((yy - minY) / (maxY - minY || 1)) * innerH;

  return (
    <svg width={width} height={height} className="border rounded bg-white">
      {/* axes */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#777" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#777" />
      {/* polyline */}
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth={3}
        points={times.map(tt => `${sx(tt)},${sy(mY[tt])}`).join(" ")}
      />
      {/* points + labels */}
      {times.map(tt => (
        <g key={tt}>
          <circle cx={sx(tt)} cy={sy(mY[tt])} r={4} fill="#2563eb" />
          <text x={sx(tt)} y={height - pad + 16} textAnchor="middle" className="text-[10px] fill-slate-700">
            {tt}
          </text>
        </g>
      ))}
      <text x={width / 2} y={height - 6} textAnchor="middle" className="text-xs fill-slate-700">
        Time (t)
      </text>
      <text x={14} y={height / 2} textAnchor="middle"
            transform={`rotate(-90 14 ${height / 2})`} className="text-xs fill-slate-700">
        Mean outcome ȳ_t
      </text>
      <text x={width / 2} y={22} textAnchor="middle" className="text-sm fill-slate-800 font-medium">
        Average outcome over time (for the simulated panel)
      </text>
    </svg>
  );
}

/* ---------------------------------- page ----------------------------------- */
export default function FELab() {
  // true DGP parameters
  const [beta, setBeta] = useState(1.2);
  const [rhoUX, setRhoUX] = useState(0.7);
  const [timeTrend, setTimeTrend] = useState(0.3);
  const [N, setN] = useState(40);
  const [T, setT] = useState(8);

  // estimation toggles
  const [showCode, setShowCode] = useState(false);

  const rows = useMemo(() => genPanel({ N, T, beta, rhoUX, timeTrend }), [N, T, beta, rhoUX, timeTrend]);

  // build arrays
  const x = useMemo(() => rows.map(r => r.x), [rows]);
  const y = useMemo(() => rows.map(r => r.y), [rows]);
  const unit = useMemo(() => rows.map(r => r.i), [rows]);
  const time = useMemo(() => rows.map(r => r.t), [rows]);

  // pooled OLS (ignores FE)
  const bPooled = useMemo(() => olsSlope(x, y), [x, y]);

  // unit FE (within-unit)
  const xWithinU = useMemo(() => withinTransform(x, unit), [x, unit]);
  const yWithinU = useMemo(() => withinTransform(y, unit), [y, unit]);
  const bUnitFE = useMemo(() => olsSlope(xWithinU, yWithinU), [xWithinU, yWithinU]);

  // two-way FE (unit + time)
  const xTW = useMemo(() => withinTwoWay(x, unit, time), [x, unit, time]);
  const yTW = useMemo(() => withinTwoWay(y, unit, time), [y, unit, time]);
  const bTWFE = useMemo(() => olsSlope(xTW, yTW), [xTW, yTW]);

  const biasPooled = useMemo(() => bPooled - beta, [bPooled, beta]);
  const biasU = useMemo(() => bUnitFE - beta, [bUnitFE, beta]);
  const biasTW = useMemo(() => bTWFE - beta, [bTWFE, beta]);

  const stata = useMemo(() => {
    return `* Two-way Fixed Effects (unit & year), robust/clustered SEs
clear all
use "your_panel.dta", clear
* Your data should have: id (unit), year (time), y, x

* Unit FE only:
xtset id year
xtreg y x, fe vce(cluster id)

* Two-way FE (unit & year):
* Option 1 (xtreg + year dummies)
xtreg y c.x i.year, fe vce(cluster id)

* Option 2 (reghdfe, recommended)
* ssc install reghdfe, replace
reghdfe y x, absorb(id year) vce(cluster id)

* If x is correlated with unit FE, pooled OLS is biased.
* The FE estimator uses within transformations (demeaning) to remove FE.`;
  }, []);

  const handleCopy = useCallback(() => navigator.clipboard.writeText(stata), [stata]);

  const reset = useCallback(() => {
    setBeta(1.2);
    setRhoUX(0.7);
    setTimeTrend(0.3);
    setN(40);
    setT(8);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* back */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <Link href="/labs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={16} />
            Back to Labs
          </Link>
        </motion.div>

        {/* header */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                    className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Fixed-Effects Lab (Unit and Two-Way FE)
          </h1>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto">
            Explore why pooled OLS can be biased when regressors are correlated with unobserved
            unit or time factors. Compare pooled OLS, unit fixed-effects, and two-way FE estimates
            on a simulated panel where you control endogeneity and time trends.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* controls */}
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Parameters</h2>
                <button onClick={reset} className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    True β (effect of x): <span className="text-blue-700">{beta.toFixed(2)}</span>
                  </label>
                  <input type="range" min={-1.5} max={2.5} step={0.1}
                         value={beta} onChange={e => setBeta(Number(e.target.value))}
                         className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Corr(x, unit FE) strength ρ: <span className="text-amber-700">{rhoUX.toFixed(2)}</span>
                  </label>
                  <input type="range" min={0} max={1} step={0.05}
                         value={rhoUX} onChange={e => setRhoUX(Number(e.target.value))}
                         className="w-full" />
                  <p className="text-xs text-slate-500 mt-1">
                    Higher ρ = stronger endogeneity if you ignore unit FE.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Time trend in γ<sub>t</sub>: <span className="text-green-700">{timeTrend.toFixed(2)}</span>
                  </label>
                  <input type="range" min={-0.5} max={0.8} step={0.05}
                         value={timeTrend} onChange={e => setTimeTrend(Number(e.target.value))}
                         className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Units N</label>
                    <input type="range" min={10} max={100} step={5} value={N}
                           onChange={e => setN(Number(e.target.value))} className="w-full" />
                    <div className="text-xs text-slate-500">{N}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Periods T</label>
                    <input type="range" min={5} max={16} step={1} value={T}
                           onChange={e => setT(Number(e.target.value))} className="w-full" />
                    <div className="text-xs text-slate-500">{T}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">Quick scenarios</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setBeta(1.2); setRhoUX(0.7); setTimeTrend(0.3); }}
                    className="w-full p-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg">Endogenous x
                  </button>
                  <button
                    onClick={() => { setBeta(1.2); setRhoUX(0.0); setTimeTrend(0.3); }}
                    className="w-full p-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg">Exogenous x (ρ≈0)
                  </button>
                  <button
                    onClick={() => { setBeta(0.0); setRhoUX(0.7); setTimeTrend(0.6); }}
                    className="w-full p-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg">No effect + strong trend
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* results */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
                      className="lg:col-span-3 space-y-8">

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Estimates</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 bg-slate-50">
                  <div className="text-xs text-slate-600 font-medium mb-1">Pooled OLS (no FE)</div>
                  <div className="text-2xl font-bold text-slate-800">{bPooled.toFixed(3)}</div>
                  <div className="text-xs text-slate-600 mt-1">Bias vs β: <span className="font-mono">{biasPooled.toFixed(3)}</span></div>
                </div>
                <div className="rounded-lg border p-4 bg-blue-50">
                  <div className="text-xs text-blue-700 font-medium mb-1">Unit Fixed Effects</div>
                  <div className="text-2xl font-bold text-blue-800">{bUnitFE.toFixed(3)}</div>
                  <div className="text-xs text-blue-700 mt-1">Bias vs β: <span className="font-mono">{biasU.toFixed(3)}</span></div>
                </div>
                <div className="rounded-lg border p-4 bg-indigo-50">
                  <div className="text-xs text-indigo-700 font-medium mb-1">Two-Way FE (unit + time)</div>
                  <div className="text-2xl font-bold text-indigo-800">{bTWFE.toFixed(3)}</div>
                  <div className="text-xs text-indigo-700 mt-1">Bias vs β: <span className="font-mono">{biasTW.toFixed(3)}</span></div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4">
                When <span className="font-mono">ρ&gt;0</span>, pooled OLS is biased because <span className="font-mono">x</span> is correlated
                with unit FE <span className="font-mono">α<sub>i</sub></span>. The FE estimators remove these unobservables by demeaning.
                Two-way FE also removes common time shocks/trends <span className="font-mono">γ<sub>t</sub></span>.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Panel at a glance</h3>
              <TimeMeansChart rows={rows} />
              <p className="text-xs text-slate-600 mt-3">
                The average outcome rises with time when a deterministic trend is present in <span className="font-mono">γ<sub>t</sub></span>.
                Two-way FE accounts for these common shocks.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold">Stata implementation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                    <Copy size={14} /> Copy Code
                  </button>
                  <button
                    onClick={() => setShowCode(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
                    <Play size={14} /> {showCode ? "Hide" : "Show"} Code
                  </button>
                </div>
              </div>
              {showCode && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="p-6 bg-slate-50">
                  <pre className="text-sm overflow-x-auto"><code>{stata}</code></pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* next steps */}
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">What’s next?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Try Instrumental Variables to handle endogeneity when FE is not enough, or head back to DiD for policy evaluation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/labs/iv" className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-semibold">
              Instrumental Variables
            </Link>
            <Link href="/labs/did" className="px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-semibold">
              Difference-in-Differences
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}