// // src/app/labs/iv/page.tsx
// import Link from "next/link";

// export default function IVLab() {
//   return (
//     <div className="py-10">
//       <div className="text-sm mb-3">
//         <Link href="/labs" className="opacity-70 hover:opacity-100">
//           ← Back to Labs
//         </Link>
//       </div>
//       <h1 className="text-2xl font-semibold">Instrumental Variables (2SLS) Lab</h1>
//       <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
//         Explore relevance and exclusion. Try changing first-stage strength and
//         see how the 2SLS estimate and its SEs respond. (Coming soon.)
//       </p>

//       <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
//         <p className="text-sm">
//           🚧 This lab is a placeholder. You can start by showing a tiny generated
//           dataset with columns <code>y, x, z</code> and a first-stage regression, then compute a
//           2SLS estimate. I can scaffold that when you’re ready.
//         </p>
//       </div>
//     </div>
//   );
// }


// src/app/labs/iv/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, RefreshCw, AlertTriangle } from "lucide-react";

/* ----------------------------- tiny helpers ----------------------------- */
function mean(v: number[]) { return v.reduce((a, b) => a + b, 0) / v.length; }
function variance(v: number[]) {
  const m = mean(v);
  return v.reduce((s, x) => s + (x - m) ** 2, 0);
}
function cov(x: number[], y: number[]) {
  const mx = mean(x), my = mean(y);
  return x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
}
function olsSlope(y: number[], x: number[]) {
  const sx = variance(x); // sum of squares around mean
  const sxy = cov(x, y);
  return sx === 0 ? 0 : sxy / sx;
}
function olsIntercept(y: number[], x: number[]) {
  const b1 = olsSlope(y, x);
  return mean(y) - b1 * mean(x);
}
function r2(y: number[], yhat: number[]) {
  const sst = variance(y);
  const sse = y.reduce((s, yi, i) => s + (yi - yhat[i]) ** 2, 0);
  return sst === 0 ? 0 : 1 - sse / sst;
}
function firstStageF(x: number[], zCols: number[][]) {
  // First stage: x on [1, Z]. Using single or two instruments.
  // Compute R^2 from projection of x onto span{1, Z}.
  const n = x.length;
  const ones = Array(n).fill(1);
  const X = [ones, ...zCols]; // design matrix columns
  // Compute hat matrix projection via normal equations: xhat = X (X'X)^{-1} X' x
  // Build matrices
  const XtX: number[][] = X.map(col1 => X.map(col2 => col1.reduce((s, v, i) => s + v * col2[i], 0)));
  // Invert 2x2 or 3x3 (we only allow up to 3 cols: 1 + up to 2 instruments)
  function inv2or3(M: number[][]) {
    if (M.length === 2) {
      const [[a,b],[c,d]] = M; const det = a*d - b*c;
      return [[ d/det, -b/det],[-c/det,  a/det]];
    }
    const [[a,b,c],[d,e,f],[g,h,i]] = M;
    const A=e*i-f*h, B=-(d*i-f*g), C=d*h-e*g, D=-(b*i-c*h), E=a*i-c*g, F=-(a*h-b*g), G=b*f-c*e, H=-(a*f-b*d), I=a*e-b*d;
    const det=a*A+b*B+c*C;
    return [[A/det,D/det,G/det],[B/det,E/det,H/det],[C/det,F/det,I/det]];
  }
  const XtXinv = inv2or3(XtX);
  const Xtx = X.map(col => col.reduce((s, v, i) => s + v * x[i], 0));
  const beta = XtXinv.map(row => row.reduce((s, v, j) => s + v * Xtx[j], 0)); // coeffs
  const xhat = Array(n).fill(0).map((_, i) => X.reduce((s, col, j) => s + col[i]*beta[j], 0));
  const R2 = r2(x, xhat);
  const k = zCols.length; // number of instruments
  const F = (R2 / k) / ((1 - R2) / (n - k - 1));
  return { R2, F, xhat };
}
function twoSLS(y: number[], x: number[], zCols: number[][]) {
  // 2SLS with intercept:
  const n = y.length;
  const { xhat } = firstStageF(x, zCols);
  const b1 = olsSlope(y, xhat);
  const a = mean(y) - b1 * mean(x);
  // fitted on actual x (for plotting fitted line)
  const yhat = x.map(xi => a + b1 * xi);
  return { alpha: a, beta: b1, yhat };
}

/* -------------------------- simulate IV data --------------------------- */
/**
 * y = α + β x + ε
 * x = π1 z1 + [π2 z2] + u
 * corr(u, ε) = ρ  (endogeneity)
 * Controls: intercept only in this simple lab.
 */
type SimParams = {
  n: number;          // sample size
  beta: number;       // true effect of x on y
  pi1: number;        // instrument strength for z1
  pi2: number;        // instrument strength for z2 (0 means absent)
  rho: number;        // correlation between u and e (endogeneity)
  sigmaU: number;     // sd of u
  sigmaE: number;     // sd of e
  seed?: number;
};

type Row = { x: number; y: number; z1: number; z2?: number };

function rng(seed: number) {
  // simple LCG
  let s = seed >>> 0;
  return () => (s = (1664525 * s + 1013904223) >>> 0) / 2 ** 32;
}
function simulateIV(p: SimParams): Row[] {
  const r = rng(p.seed ?? 12345);
  const data: Row[] = [];
  for (let i = 0; i < p.n; i++) {
    const z1 = (r() * 2 - 1) * 2;                 // uniform approx
    const z2 = p.pi2 !== 0 ? (r() * 2 - 1) * 2 : undefined;

    // generate correlated (u, e): construct from two normals with correlation rho
    const n1 = Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
    const n2 = Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.sin(2 * Math.PI * r());
    const u = p.sigmaU * n1;
    const e = p.sigmaE * (p.rho * n1 + Math.sqrt(Math.max(0, 1 - p.rho ** 2)) * n2);

    const x = p.pi1 * z1 + (z2 !== undefined ? p.pi2 * z2 : 0) + u;
    const alpha = 2;
    const y = alpha + p.beta * x + e;

    data.push({ x, y, z1, z2 });
  }
  return data;
}

/* ------------------------------- charts -------------------------------- */
function Scatter({
  points,
  width = 720,
  height = 420,
  lines = [],
  xLabel,
  yLabel,
}: {
  points: { x: number; y: number; color?: string; r?: number }[];
  width?: number; height?: number;
  lines?: { a: number; b: number; color: string; label: string }[]; // y = a + b x
  xLabel: string; yLabel: string;
}) {
  const margin = { top: 36, right: 16, bottom: 48, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const sx = (v: number) => margin.left + ((v - xMin) / (xMax - xMin || 1)) * innerW;
  const sy = (v: number) => margin.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <svg width={width} height={height} className="rounded">
        {/* axes */}
        <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} stroke="#666" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerH} stroke="#666" />
        {/* ticks (simple) */}
        <text x={margin.left + innerW / 2} y={height - 14} textAnchor="middle" className="text-sm fill-slate-700">{xLabel}</text>
        <text x={16} y={margin.top + innerH / 2} transform={`rotate(-90, 16, ${margin.top + innerH / 2})`} textAnchor="middle" className="text-sm fill-slate-700">{yLabel}</text>

        {/* points */}
        {points.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={p.r ?? 2.2} fill={p.color ?? "#0f172a"} fillOpacity={0.8} />
        ))}

        {/* lines */}
        {lines.map((ln, i) => {
          const x1 = xMin, x2 = xMax;
          const y1 = ln.a + ln.b * x1, y2 = ln.a + ln.b * x2;
          return (
            <g key={i}>
              <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke={ln.color} strokeWidth={2.5} />
            </g>
          );
        })}
      </svg>
      {lines.length > 0 && (
        <div className="mt-2 flex gap-4 text-xs text-slate-600">
          {lines.map((ln, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="inline-block h-2 w-6 rounded" style={{ background: ln.color }} />
              <span>{ln.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Page --------------------------------- */
export default function IVLab() {
  const [n, setN] = useState(300);
  const [betaTrue, setBetaTrue] = useState(1.5);
  const [pi1, setPi1] = useState(0.9);          // instrument strength (z1 -> x)
  const [useZ2, setUseZ2] = useState(false);    // toggle second instrument
  const [pi2, setPi2] = useState(0.6);
  const [rho, setRho] = useState(0.6);          // endogeneity corr(u, e)
  const [sigmaU, setSigmaU] = useState(1.0);
  const [sigmaE, setSigmaE] = useState(2.0);
  const [showCode, setShowCode] = useState(false);

  const data = useMemo(() => simulateIV({
    n, beta: betaTrue, pi1, pi2: useZ2 ? pi2 : 0, rho, sigmaU, sigmaE, seed: 42
  }), [n, betaTrue, pi1, useZ2, pi2, rho, sigmaU, sigmaE]);

  // Prepare vectors
  const x = useMemo(() => data.map(d => d.x), [data]);
  const y = useMemo(() => data.map(d => d.y), [data]);
  const z1 = useMemo(() => data.map(d => d.z1), [data]);
  const z2 = useMemo(() => data.map(d => d.z2 ?? 0), [data]);

  // First-stage and estimators
  const firstStage = useMemo(() => {
    const Z: number[][] = useZ2 ? [z1, z2] : [z1];
    return firstStageF(x, Z);
  }, [x, z1, z2, useZ2]);

  const iv = useMemo(() => {
    const Z: number[][] = useZ2 ? [z1, z2] : [z1];
    return twoSLS(y, x, Z);
  }, [y, x, z1, z2, useZ2]);

  const ols = useMemo(() => {
    const b = olsSlope(y, x);
    const a = olsIntercept(y, x);
    const yhat = x.map(xi => a + b * xi);
    return { alpha: a, beta: b, yhat };
  }, [y, x]);

  const weak = firstStage.F < 10; // rule-of-thumb

  const reset = useCallback(() => {
    setN(300); setBetaTrue(1.5); setPi1(0.9); setUseZ2(false); setPi2(0.6);
    setRho(0.6); setSigmaU(1.0); setSigmaE(2.0);
  }, []);

  const stataCode = useMemo(() => {
    const ivrhs = useZ2 ? "(x = z1 z2)" : "(x = z1)";
    return `* 2SLS with robust SEs
clear all
use "your_data.dta", clear

* First stage diagnostics (x on instruments)
regress x z1${useZ2 ? " z2" : ""}, vce(robust)
estat firststage

* Second stage (2SLS)
ivregress 2sls y ${ivrhs}, vce(robust)

* Over-ID test (only when >1 instrument)
${useZ2 ? "estat overid" : "* estat overid  // (needs >1 instrument)"}`
      .replace(/'/g, "’"); // avoid unescaped apostrophes for ESLint
  }, [useZ2]);

  /* ------------------------------- plots ------------------------------- */
  const mainPoints = useMemo(() => data.map(d => ({ x: d.x, y: d.y })), [data]);
  const lines = useMemo(() => ([
    { a: ols.alpha, b: ols.beta, color: "#ef4444", label: "OLS fit" },
    { a: iv.alpha,  b: iv.beta,  color: "#2563eb", label: "IV (2SLS) fit" },
  ]), [ols, iv]);

  // First-stage scatter x ~ z1 (averaging z2 into noise if present)
  const fsPoints = useMemo(() => data.map(d => ({ x: d.z1, y: d.x, color: "#0ea5e9", r: 2 })), [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <Link href="/labs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={16} />
            Back to Labs
          </Link>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Instrumental Variables (2SLS) Lab</h1>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto">
            Explore bias from endogeneity and how a valid instrument recovers the causal effect. Adjust instrument strength,
            endogeneity, and noise; compare OLS vs. IV; and check the first-stage F-statistic for weak instruments.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Controls */}
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Controls</h2>
                <button onClick={reset} className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors" title="Reset to defaults">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    True Effect β: <span className="text-blue-600">{betaTrue.toFixed(1)}</span>
                  </label>
                  <input type="range" min={-1} max={3} step={0.1} value={betaTrue} onChange={(e) => setBetaTrue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-500"><span>-1</span><span>3</span></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Instrument Strength π₁: <span className="text-emerald-600">{pi1.toFixed(1)}</span>
                  </label>
                  <input type="range" min={0} max={1.6} step={0.1} value={pi1} onChange={(e) => setPi1(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-500"><span>0</span><span>1.6</span></div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Use Second Instrument (z2)</label>
                  <input type="checkbox" checked={useZ2} onChange={() => setUseZ2(v => !v)} />
                </div>

                {useZ2 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Strength π₂: <span className="text-emerald-600">{pi2.toFixed(1)}</span>
                    </label>
                    <input type="range" min={0} max={1.6} step={0.1} value={pi2} onChange={(e) => setPi2(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                    <div className="flex justify-between text-xs text-slate-500"><span>0</span><span>1.6</span></div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Endogeneity ρ (corr(u, ε)): <span className="text-red-600">{rho.toFixed(1)}</span>
                  </label>
                  <input type="range" min={0} max={0.95} step={0.05} value={rho} onChange={(e) => setRho(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-500"><span>0</span><span>0.95</span></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Sample Size n: <span className="text-slate-800">{n}</span>
                  </label>
                  <input type="range" min={80} max={1000} step={20} value={n} onChange={(e) => setN(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-500"><span>80</span><span>1000</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">σᵤ</label>
                    <input type="range" min={0.4} max={3} step={0.1} value={sigmaU} onChange={(e) => setSigmaU(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">σₑ</label>
                    <input type="range" min={0.4} max={3} step={0.1} value={sigmaE} onChange={(e) => setSigmaE(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Quick Scenarios</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setPi1(1.2); setUseZ2(false); setRho(0.6); }}
                    className="w-full p-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                  >
                    Strong IV, Endogenous x
                  </button>
                  <button
                    onClick={() => { setPi1(0.1); setUseZ2(false); setRho(0.6); }}
                    className="w-full p-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                  >
                    Weak IV (F &lt; 10)
                  </button>
                  <button
                    onClick={() => { setUseZ2(true); setPi1(0.8); setPi2(0.8); setRho(0.6); }}
                    className="w-full p-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                  >
                    Over-identified (2 IVs)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts + Results */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-3 space-y-8">
            <Scatter
              points={mainPoints}
              lines={lines}
              xLabel="x (endogenous regressor)"
              yLabel="y (outcome)"
            />

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
                <div className="text-2xl font-bold text-blue-700">{iv.beta.toFixed(3)}</div>
                <div className="text-sm text-blue-700/80 font-medium">IV (2SLS) Estimate</div>
                <div className="mt-1 text-xs text-slate-500">True β = <span className="font-mono">{betaTrue.toFixed(2)}</span></div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
                <div className="text-2xl font-bold text-rose-700">{ols.beta.toFixed(3)}</div>
                <div className="text-sm text-rose-700/80 font-medium">OLS Estimate</div>
                <div className="mt-1 text-xs text-slate-500">Bias from corr(x, ε) when ρ &gt; 0</div>
              </div>
              <div className={`rounded-xl border shadow p-4 ${weak ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <div className={`text-2xl font-bold ${weak ? "text-red-700" : "text-green-700"}`}>{firstStage.F.toFixed(2)}</div>
                <div className={`text-sm font-medium ${weak ? "text-red-700/80" : "text-green-700/80"}`}>First-Stage F</div>
                <div className="mt-1 text-xs text-slate-600">Rule-of-thumb: F ≥ 10</div>
              </div>
            </div>

            {weak && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <div className="font-semibold">Weak instrument detected</div>
                  Low first-stage F can make 2SLS biased and imprecise. Consider stronger or additional instruments, or use LIML/Fuller in practice.
                </div>
              </div>
            )}

            {/* First stage small plot */}
            <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">First Stage: x on z1</h3>
              <Scatter points={fsPoints} xLabel="z1" yLabel="x" />
              <div className="mt-2 text-xs text-slate-600">
                R² (first stage) = <span className="font-mono">{firstStage.R2.toFixed(3)}</span>,&nbsp;
                F = <span className="font-mono">{firstStage.F.toFixed(2)}</span>
              </div>
            </div>

            {/* Stata box */}
            <div className="bg-white rounded-xl border border-slate-200 shadow">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold">Stata Implementation</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(stataCode)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Copy size={14} />
                  Copy Code
                </button>
              </div>
              <div className="p-6 bg-slate-50">
                <pre className="text-sm overflow-x-auto"><code>{stataCode}</code></pre>
              </div>
            </div>

            {/* Concept card */}
            <div className="bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded-xl border border-indigo-200/70 p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">When does IV work?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-900/90">
                <div>
                  <p className="font-medium mb-1">Two key conditions:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Relevance:</strong> instruments explain variation in <em>x</em> (check first-stage F).</li>
                    <li><strong>Exogeneity:</strong> instruments affect <em>y</em> only through <em>x</em>, uncorrelated with ε.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Good practice:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Report first-stage results and F-statistic.</li>
                    <li>Use robust or clustered SEs; consider LIML for weak IVs.</li>
                    {useZ2 && <li>Run <code>estat overid</code> for over-identification (diagnostic, not proof).</li>}
                  </ul>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
