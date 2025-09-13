// // src/app/labs/ols/page.tsx
// "use client";

// import Link from "next/link";
// import { useMemo, useState } from "react";

// /* ----------------------------- tiny linear algebra ----------------------------- */
// function t(A: number[][]) {
//   return A[0].map((_, j) => A.map((r) => r[j]));
// }
// function mm(A: number[][], B: number[][]) {
//   const m = A.length,
//     n = B[0].length,
//     p = B.length;
//   const C = Array.from({ length: m }, () => Array(n).fill(0));
//   for (let i = 0; i < m; i++)
//     for (let k = 0; k < p; k++)
//       for (let j = 0; j < n; j++) C[i][j] += A[i][k] * B[k][j];
//   return C;
// }
// function mv(A: number[][], v: number[]) {
//   return A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0));
// }
// function inv2or3(M: number[][]) {
//   if (M.length === 2) {
//     const [[a, b], [c, d]] = M;
//     const det = a * d - b * c;
//     return [
//       [d / det, -b / det],
//       [-c / det, a / det],
//     ];
//   }
//   const [[a, b, c], [d, e, f], [g, h, i]] = M;
//   const A = e * i - f * h,
//     B = -(d * i - f * g),
//     C = d * h - e * g,
//     D = -(b * i - c * h),
//     E = a * i - c * g,
//     F = -(a * h - b * g),
//     G = b * f - c * e,
//     H = -(a * f - b * d),
//     I = a * e - b * d;
//   const det = a * A + b * B + c * C;
//   return [
//     [A / det, D / det, G / det],
//     [B / det, E / det, H / det],
//     [C / det, F / det, I / det],
//   ];
// }
// function mean(v: number[]) {
//   return v.reduce((a, b) => a + b, 0) / v.length;
// }

// /* ------------------------------- toy dataset ---------------------------------- */
// // wage ~ educ + exper
// const demo = [
//   { wage: 10.2, educ: 10, exper: 1 },
//   { wage: 11.0, educ: 11, exper: 1 },
//   { wage: 12.5, educ: 12, exper: 3 },
//   { wage: 14.0, educ: 14, exper: 2 },
//   { wage: 15.5, educ: 16, exper: 4 },
//   { wage: 18.2, educ: 18, exper: 5 },
// ];

// /* ------------------------------- OLS core ------------------------------------- */
// type SEType = "classical" | "robust";

// function olsFit(y: number[], X: number[][], seType: SEType) {
//   // Add intercept
//   const Xb = X.map((r) => [1, ...r]);
//   const n = Xb.length;
//   const k = Xb[0].length;

//   const Xt = t(Xb);
//   const XtX = mm(Xt, Xb);
//   const XtXinv = inv2or3(XtX);
//   const Xty = mv(Xt, y);
//   const beta = mv(XtXinv, Xty); // (k x 1)

//   // Residuals, yhat, R2
//   const yhat = mv(Xb, beta);
//   const e = y.map((yi, i) => yi - yhat[i]);
//   const sse = e.reduce((s, v) => s + v * v, 0);
//   const ybar = mean(y);
//   const sst = y.reduce((s, yi) => s + (yi - ybar) ** 2, 0);
//   const r2 = 1 - sse / sst;

//   // Variance of beta
//   let V: number[][];
//   if (seType === "classical") {
//     const sigma2 = sse / (n - k);
//     V = XtXinv.map((row) => row.map((v) => v * sigma2));
//   } else {
//     // HC1 robust: (X′X)⁻¹ X′ diag(e²) X (X′X)⁻¹ × n/(n−k)
//     const scale = n / (n - k);
//     const diagE2 = e.map((ei, i) =>
//       Array.from({ length: n }, (_, j) => (i === j ? ei * ei : 0))
//     );
//     const Xt2 = t(Xb);
//     const meat = mm(mm(Xt2, diagE2), Xb);
//     const mid = mm(XtXinv, meat);
//     V = mm(mid, XtXinv).map((row) => row.map((v) => v * scale));
//   }
//   const se = V.map((row, i) => Math.sqrt(row[i]));
//   return { beta, se, r2, n, k, yhat, e, Xb };
// }

// /* --------------------------- residualization helper --------------------------- */
// // Regress v on Z (with intercept) and return residuals of v
// function residualize(v: number[], Z: number[][]) {
//   const Zb = Z.map((r) => [1, ...r]);
//   const beta = mv(inv2or3(mm(t(Zb), Zb)), mv(t(Zb), v));
//   const vhat = mv(Zb, beta);
//   return v.map((vi, i) => vi - vhat[i]);
// }

// /* ------------------------------ small SVG charts ------------------------------ */
// type Point = { x: number; y: number };
// function scaleLinear(domain: [number, number], range: [number, number]) {
//   const [d0, d1] = domain;
//   const [r0, r1] = range;
//   const m = (r1 - r0) / (d1 - d0 || 1);
//   return (v: number) => r0 + (v - d0) * m;
// }

// function Scatter({
//   width = 640,
//   height = 300,
//   points,
//   line,
//   xLabel,
//   yLabel,
// }: {
//   width?: number;
//   height?: number;
//   points: Point[];
//   line?: { x1: number; y1: number; x2: number; y2: number };
//   xLabel: string;
//   yLabel: string;
// }) {
//   const margin = { top: 14, right: 12, bottom: 34, left: 44 };
//   const innerW = width - margin.left - margin.right;
//   const innerH = height - margin.top - margin.bottom;

//   const xs = points.map((p) => p.x);
//   const ys = points.map((p) => p.y);
//   const xMin = Math.min(...xs);
//   const xMax = Math.max(...xs);
//   const yMin = Math.min(...ys);
//   const yMax = Math.max(...ys);

//   const sx = scaleLinear([xMin, xMax], [0, innerW]);
//   const sy = scaleLinear([yMin, yMax], [innerH, 0]);

//   return (
//     <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
//       <g transform={`translate(${margin.left},${margin.top})`}>
//         {/* axes */}
//         <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#aaa" />
//         <line x1={0} y1={0} x2={0} y2={innerH} stroke="#aaa" />

//         {/* scatter */}
//         {points.map((p, i) => (
//           <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#111" fillOpacity={0.8} />
//         ))}

//         {/* fitted line */}
//         {line && (
//           <line
//             x1={sx(line.x1)}
//             y1={sy(line.y1)}
//             x2={sx(line.x2)}
//             y2={sy(line.y2)}
//             stroke="url(#grad1)"
//             strokeWidth={2}
//           />
//         )}

//         {/* labels */}
//         <text x={innerW / 2} y={innerH + 26} textAnchor="middle" fontSize="12">
//           {xLabel}
//         </text>
//         <text
//           x={-innerH / 2}
//           y={-34}
//           transform={`rotate(-90)`}
//           textAnchor="middle"
//           fontSize="12"
//         >
//           {yLabel}
//         </text>
//       </g>

//       {/* gradient stroke for the line */}
//       <defs>
//         <linearGradient id="grad1" x1="0" x2="1">
//           <stop offset="0%" stopColor="#60a5fa" />
//           <stop offset="100%" stopColor="#f472b6" />
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// }

// /* ------------------------------ UI component ---------------------------------- */
// export default function OLSLab() {
//   const [useEduc, setUseEduc] = useState(true);
//   const [useExper, setUseExper] = useState(true);
//   const [seType, setSeType] = useState<SEType>("robust");

//   const spec = useMemo(() => {
//     const y = demo.map((r) => r.wage);
//     const X: number[][] = demo.map((r) => {
//       const xs: number[] = [];
//       if (useEduc) xs.push(r.educ);
//       if (useExper) xs.push(r.exper);
//       return xs;
//     });
//     if (!X[0].length) return null;
//     return { y, X };
//   }, [useEduc, useExper]);

//   const result = useMemo(() => {
//     if (!spec) return null;
//     return olsFit(spec.y, spec.X, seType);
//   }, [spec, seType]);

//   const terms = useMemo(() => {
//     const t = ["Intercept"];
//     if (useEduc) t.push("educ");
//     if (useExper) t.push("exper");
//     return t;
//   }, [useEduc, useExper]);

//   const stata = useMemo(() => {
//     const rhs = [useEduc && "educ", useExper && "exper"]
//       .filter(Boolean)
//       .join(" ");
//     return `* OLS on toy data (replace with your file)
// regress wage ${rhs}, vce(${seType === "robust" ? "robust" : "ols"})
// `;
//   }, [useEduc, useExper, seType]);

//   /* --------------------------- plotting data prep --------------------------- */
//   // Residuals vs Fitted (always)
//   const rvfPoints = useMemo<Point[] | null>(() => {
//     if (!result) return null;
//     return result.yhat.map((yh, i) => ({ x: yh, y: result.e[i] }));
//   }, [result]);

//   // Scatter or partial regression for educ
//   const educPlot = useMemo<{
//     points: Point[];
//     line: { x1: number; y1: number; x2: number; y2: number };
//     xLabel: string;
//     yLabel: string;
//   } | null>(() => {
//     if (!spec || !result || !useEduc) return null;

//     const y = spec.y;
//     const educ = demo.map((r) => r.educ);

//     if (!useExper) {
//       // Simple scatter: y vs educ, fitted line using current beta
//       const b0 = result.beta[0],
//         b1 = result.beta[1];
//       const pts = educ.map((x, i) => ({ x, y: y[i] }));
//       const x1 = Math.min(...educ),
//         x2 = Math.max(...educ);
//       return {
//         points: pts,
//         line: { x1, y1: b0 + b1 * x1, x2, y2: b0 + b1 * x2 },
//         xLabel: "educ",
//         yLabel: "wage",
//       };
//     } else {
//       // Partial regression: residualize y and educ on exper
//       const exper = demo.map((r) => r.exper);
//       const y_res = residualize(y, exper.map((v) => [v]));
//       const x_res = residualize(educ, exper.map((v) => [v]));
//       // Fit line y_res ~ x_res
//       const Xp = x_res.map((x) => [1, x]);
//       const bp = mv(inv2or3(mm(t(Xp), Xp)), mv(t(Xp), y_res));
//       const x1 = Math.min(...x_res),
//         x2 = Math.max(...x_res);
//       const pts = x_res.map((x, i) => ({ x, y: y_res[i] }));
//       return {
//         points: pts,
//         line: { x1, y1: bp[0] + bp[1] * x1, x2, y2: bp[0] + bp[1] * x2 },
//         xLabel: "educ (residualized on exper)",
//         yLabel: "wage (residualized on exper)",
//       };
//     }
//   }, [spec, result, useEduc, useExper]);

//   return (
//     <div className="py-10 max-w-4xl mx-auto">
//       {/* breadcrumb */}
//       <div className="text-sm mb-3">
//         <Link href="/labs" className="opacity-70 hover:opacity-100">
//           ← Back to Labs
//         </Link>
//       </div>

//       <h1 className="text-2xl font-semibold">OLS Sandbox</h1>
//       <p className="text-sm text-neutral-700 mt-2">
//         Toggle covariates and standard errors. Inspect the residuals plot and, when possible, a
//         fitted line for <code>educ</code> (or its partialled-out version when <code>exper</code> is
//         included).
//       </p>

//       {/* controls */}
//       <div className="mt-4 grid gap-3 md:grid-cols-2">
//         <div className="border rounded-2xl p-4">
//           <h3 className="font-medium mb-2 text-sm">Covariates</h3>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={useEduc}
//               onChange={() => setUseEduc((v) => !v)}
//             />
//             Include <code>educ</code>
//           </label>
//           <label className="flex items-center gap-2 mt-2 text-sm">
//             <input
//               type="checkbox"
//               checked={useExper}
//               onChange={() => setUseExper((v) => !v)}
//             />
//             Include <code>exper</code>
//           </label>
//         </div>

//         <div className="border rounded-2xl p-4">
//           <h3 className="font-medium mb-2 text-sm">Standard errors</h3>
//           <div className="flex gap-3 text-sm">
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="se"
//                 checked={seType === "robust"}
//                 onChange={() => setSeType("robust")}
//               />
//               Robust (HC1)
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="se"
//                 checked={seType === "classical"}
//                 onChange={() => setSeType("classical")}
//               />
//               Classical
//             </label>
//           </div>
//           <p className="text-xs text-neutral-500 mt-2">
//             HC1 scales for small samples: Var = (X′X)⁻¹ X′ diag(e²) X (X′X)⁻¹ × n/(n−k).
//           </p>
//         </div>
//       </div>

//       {/* results */}
//       <div className="mt-5 border rounded-2xl p-5">
//         <h2 className="text-lg font-medium mb-2">Estimates</h2>

//         {!result ? (
//           <p className="text-sm">Select at least one covariate.</p>
//         ) : (
//           <>
//             <table className="w-full text-sm">
//               <thead>
//                 <tr>
//                   <th className="text-left">Term</th>
//                   <th className="text-right">Estimate</th>
//                   <th className="text-right">SE</th>
//                   <th className="text-right">95% CI</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {["Intercept", useEduc && "educ", useExper && "exper"]
//                   .filter(Boolean)
//                   .map((name, j) => {
//                     const b = result.beta[j];
//                     const s = result.se[j];
//                     const lo = b - 1.96 * s;
//                     const hi = b + 1.96 * s;
//                     return (
//                       <tr key={String(name)}>
//                         <td>{String(name)}</td>
//                         <td className="text-right">{b.toFixed(3)}</td>
//                         <td className="text-right">{s.toFixed(3)}</td>
//                         <td className="text-right">
//                           [{lo.toFixed(3)}, {hi.toFixed(3)}]
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//             <div className="text-xs text-neutral-600 mt-3">
//               n = {result.n}, k (incl. intercept) = {result.k}, R² = {result.r2.toFixed(3)}
//             </div>
//           </>
//         )}
//       </div>

//       {/* plots */}
//       <div className="mt-5 grid gap-4 md:grid-cols-2">
//         <div className="border rounded-2xl p-4">
//           <h3 className="font-medium text-sm mb-2">Residuals vs Fitted</h3>
//           {rvfPoints && rvfPoints.length > 0 ? (
//             <Scatter points={rvfPoints} xLabel="Fitted" yLabel="Residual" />
//           ) : (
//             <p className="text-sm">Add at least one covariate to see the plot.</p>
//           )}
//           <p className="text-xs text-neutral-500 mt-2">
//             Look for patterns (funnel shapes ⇒ heteroskedasticity; curves ⇒ misspecification).
//           </p>
//         </div>

//         <div className="border rounded-2xl p-4">
//           <h3 className="font-medium text-sm mb-2">
//             {useExper && useEduc ? "Partial regression for educ" : "Scatter with fitted line"}
//           </h3>
//           {educPlot ? (
//             <Scatter
//               points={educPlot.points}
//               line={educPlot.line}
//               xLabel={educPlot.xLabel}
//               yLabel={educPlot.yLabel}
//             />
//           ) : (
//             <p className="text-sm">
//               Enable <code>educ</code> to see this plot.
//             </p>
//           )}
//           <p className="text-xs text-neutral-500 mt-2">
//             With both covariates on, we plot the Frisch–Waugh residuals of <code>wage</code> and{" "}
//             <code>educ</code> after removing <code>exper</code>.
//           </p>
//         </div>
//       </div>

//       {/* code box */}
//       <div className="mt-5 border rounded-2xl p-5">
//         <div className="flex items-center justify-between">
//           <h3 className="font-medium text-sm">Matching Stata snippet</h3>
//           <button
//             onClick={async () => navigator.clipboard.writeText(stata)}
//             className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm"
//           >
//             Copy
//           </button>
//         </div>
//         <pre className="text-xs whitespace-pre-wrap bg-neutral-50 rounded-lg p-3 border mt-2 overflow-x-auto">
//           <code>{stata}</code>
//         </pre>
//         <p className="text-xs text-neutral-500 mt-2">
//           Replace <code>wage</code>, <code>educ</code>, <code>exper</code> with your variables and run
//           in Stata.
//         </p>
//       </div>

//       {/* data preview */}
//       <div className="mt-5 border rounded-2xl p-5">
//         <h3 className="font-medium text-sm mb-2">Toy data (first rows)</h3>
//         <table className="w-full text-sm">
//           <thead>
//             <tr>
//               <th className="text-left">wage</th>
//               <th className="text-left">educ</th>
//               <th className="text-left">exper</th>
//             </tr>
//           </thead>
//           <tbody>
//             {demo.slice(0, 6).map((r, i) => (
//               <tr key={i}>
//                 <td>{r.wage}</td>
//                 <td>{r.educ}</td>
//                 <td>{r.exper}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


"use client";

import { useMemo, useState, useCallback } from "react";

/* ----------------------------- tiny linear algebra ----------------------------- */
function t(A: number[][]) {
  return A[0].map((_, j) => A.map((r) => r[j]));
}
function mm(A: number[][], B: number[][]) {
  const m = A.length, n = B[0].length, p = B.length;
  const C = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let k = 0; k < p; k++)
      for (let j = 0; j < n; j++) C[i][j] += A[i][k] * B[k][j];
  return C;
}
function mv(A: number[][], v: number[]) {
  return A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0));
}
function inv2or3(M: number[][]) {
  if (M.length === 2) {
    const [[a, b], [c, d]] = M;
    const det = a * d - b * c;
    return [[d / det, -b / det], [-c / det, a / det]];
  }
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g,
        D = -(b * i - c * h), E = a * i - c * g, F = -(a * h - b * g),
        G = b * f - c * e, H = -(a * f - b * d), I = a * e - b * d;
  const det = a * A + b * B + c * C;
  return [
    [A / det, D / det, G / det],
    [B / det, E / det, H / det],
    [C / det, F / det, I / det],
  ];
}
function mean(v: number[]) {
  return v.reduce((a, b) => a + b, 0) / v.length;
}

/* ------------------------------- enhanced dataset ---------------------------------- */
const demoData = [
  { id: 1, wage: 10.2, educ: 10, exper: 1, age: 22, female: 0, region: 'South' },
  { id: 2, wage: 11.0, educ: 11, exper: 1, age: 23, female: 1, region: 'North' },
  { id: 3, wage: 12.5, educ: 12, exper: 3, age: 25, female: 0, region: 'West' },
  { id: 4, wage: 14.0, educ: 14, exper: 2, age: 24, female: 1, region: 'East' },
  { id: 5, wage: 15.5, educ: 16, exper: 4, age: 28, female: 0, region: 'North' },
  { id: 6, wage: 18.2, educ: 18, exper: 5, age: 30, female: 1, region: 'West' },
  { id: 7, wage: 13.8, educ: 13, exper: 2, age: 26, female: 0, region: 'South' },
  { id: 8, wage: 16.1, educ: 15, exper: 3, age: 27, female: 1, region: 'East' },
  { id: 9, wage: 19.5, educ: 20, exper: 6, age: 32, female: 0, region: 'North' },
  { id: 10, wage: 17.2, educ: 17, exper: 4, age: 29, female: 1, region: 'West' },
];

/* ------------------------------- OLS core with diagnostics ------------------------------------- */
type SEType = "classical" | "robust";

function olsFit(y: number[], X: number[][], seType: SEType) {
  const Xb = X.map((r) => [1, ...r]);
  const n = Xb.length;
  const k = Xb[0].length;

  const Xt = t(Xb);
  const XtX = mm(Xt, Xb);
  const XtXinv = inv2or3(XtX);
  const Xty = mv(Xt, y);
  const beta = mv(XtXinv, Xty);

  const yhat = mv(Xb, beta);
  const e = y.map((yi, i) => yi - yhat[i]);
  const sse = e.reduce((s, v) => s + v * v, 0);
  const ybar = mean(y);
  const sst = y.reduce((s, yi) => s + (yi - ybar) ** 2, 0);
  const r2 = 1 - sse / sst;
  const adjR2 = 1 - ((1 - r2) * (n - 1)) / (n - k);

  // Diagnostics
  const mse = sse / (n - k);
  const rmse = Math.sqrt(mse);
  const leverage = Xb.map((xi, i) => mv([xi], mv(XtXinv, xi))[0]);
  const cookD = e.map((ei, i) => (ei * ei / (k * mse)) * (leverage[i] / ((1 - leverage[i]) ** 2)));
  
  // F-statistic for overall significance
  const msr = (sst - sse) / (k - 1);
  const fStat = msr / mse;

  let V: number[][];
  if (seType === "classical") {
    const sigma2 = sse / (n - k);
    V = XtXinv.map((row) => row.map((v) => v * sigma2));
  } else {
    const scale = n / (n - k);
    const diagE2 = e.map((ei, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? ei * ei : 0))
    );
    const Xt2 = t(Xb);
    const meat = mm(mm(Xt2, diagE2), Xb);
    const mid = mm(XtXinv, meat);
    V = mm(mid, XtXinv).map((row) => row.map((v) => v * scale));
  }
  const se = V.map((row, i) => Math.sqrt(row[i]));
  const tStats = beta.map((b, i) => b / se[i]);
  const pValues = tStats.map(t => 2 * (1 - normalCDF(Math.abs(t))));

  return { beta, se, tStats, pValues, r2, adjR2, n, k, yhat, e, Xb, rmse, fStat, leverage, cookD };
}

// Approximate normal CDF for p-values
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function residualize(v: number[], Z: number[][]) {
  const Zb = Z.map((r) => [1, ...r]);
  const beta = mv(inv2or3(mm(t(Zb), Zb)), mv(t(Zb), v));
  const vhat = mv(Zb, beta);
  return v.map((vi, i) => vi - vhat[i]);
}

/* ------------------------------ enhanced SVG charts ------------------------------ */
type Point = { x: number; y: number; id?: number; highlighted?: boolean };

function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0 || 1);
  return (v: number) => r0 + (v - d0) * m;
}

function EnhancedScatter({
  width = 640,
  height = 300,
  points,
  line,
  xLabel,
  yLabel,
  onPointHover,
  highlightedPoint,
  showConfidenceBands = false,
}: {
  width?: number;
  height?: number;
  points: Point[];
  line?: { x1: number; y1: number; x2: number; y2: number };
  xLabel: string;
  yLabel: string;
  onPointHover?: (point: Point | null) => void;
  highlightedPoint?: number;
  showConfidenceBands?: boolean;
}) {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const sx = scaleLinear([xMin, xMax], [0, innerW]);
  const sy = scaleLinear([yMin, yMax], [innerH, 0]);

  // Generate tick values
  const xTicks = Array.from({ length: 5 }, (_, i) => xMin + (i / 4) * (xMax - xMin));
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i / 4) * (yMax - yMin));

  return (
    <div className="relative">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="border rounded-lg bg-gradient-to-br from-slate-50 to-white">
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {xTicks.map((tick, i) => (
            <line key={`xgrid-${i}`} x1={sx(tick)} y1={0} x2={sx(tick)} y2={innerH} 
                  stroke="#e5e7eb" strokeWidth={0.5} opacity={0.5} />
          ))}
          {yTicks.map((tick, i) => (
            <line key={`ygrid-${i}`} x1={0} y1={sy(tick)} x2={innerW} y2={sy(tick)} 
                  stroke="#e5e7eb" strokeWidth={0.5} opacity={0.5} />
          ))}

          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#374151" strokeWidth={1.5} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#374151" strokeWidth={1.5} />

          {/* Axis ticks and labels */}
          {xTicks.map((tick, i) => (
            <g key={`xtick-${i}`}>
              <line x1={sx(tick)} y1={innerH} x2={sx(tick)} y2={innerH + 5} stroke="#374151" />
              <text x={sx(tick)} y={innerH + 18} textAnchor="middle" fontSize="10" fill="#6b7280">
                {tick.toFixed(1)}
              </text>
            </g>
          ))}
          {yTicks.map((tick, i) => (
            <g key={`ytick-${i}`}>
              <line x1={0} y1={sy(tick)} x2={-5} y2={sy(tick)} stroke="#374151" />
              <text x={-8} y={sy(tick) + 3} textAnchor="end" fontSize="10" fill="#6b7280">
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Fitted line */}
          {line && (
            <line
              x1={sx(line.x1)} y1={sy(line.y1)} x2={sx(line.x2)} y2={sy(line.y2)}
              stroke="url(#lineGrad)" strokeWidth={3} filter="url(#shadow)"
            />
          )}

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={sx(p.x)} cy={sy(p.y)}
              r={highlightedPoint === p.id ? 7 : 5}
              fill={highlightedPoint === p.id ? "#f59e0b" : "#1f2937"}
              fillOpacity={highlightedPoint === p.id ? 0.9 : 0.7}
              stroke={highlightedPoint === p.id ? "#d97706" : "#374151"}
              strokeWidth={highlightedPoint === p.id ? 2 : 1}
              className="cursor-pointer transition-all duration-200 hover:r-6"
              filter="url(#shadow)"
              onMouseEnter={() => onPointHover?.(p)}
              onMouseLeave={() => onPointHover?.(null)}
            />
          ))}

          {/* Axis labels */}
          <text x={innerW / 2} y={innerH + 40} textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">
            {xLabel}
          </text>
          <text
            x={-innerH / 2} y={-40} transform={`rotate(-90)`} textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">
            {yLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------ data table component ------------------------------ */
function DataTable({ data, highlightedRow, onRowHover }: {
  data: typeof demoData;
  highlightedRow?: number;
  onRowHover?: (id: number | null) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
            {Object.keys(data[0]).map(col => (
              <th key={col} className="text-left p-2 font-semibold text-slate-700 capitalize">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b transition-colors cursor-pointer ${
                highlightedRow === row.id 
                  ? 'bg-amber-100 border-amber-300' 
                  : 'hover:bg-slate-50 border-slate-200'
              }`}
              onMouseEnter={() => onRowHover?.(row.id)}
              onMouseLeave={() => onRowHover?.(null)}
            >
              {Object.entries(row).map(([key, value], j) => (
                <td key={j} className="p-2">
                  {typeof value === 'number' && key !== 'id' ? value.toFixed(2) : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ main component ------------------------------ */
export default function EnhancedOLSLab() {
  const [useEduc, setUseEduc] = useState(true);
  const [useExper, setUseExper] = useState(true);
  const [useAge, setUseAge] = useState(false);
  const [useFemale, setUseFemale] = useState(false);
  const [seType, setSeType] = useState<SEType>("robust");
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'diagnostics' | 'data'>('results');

  const spec = useMemo(() => {
    const y = demoData.map((r) => r.wage);
    const X: number[][] = demoData.map((r) => {
      const xs: number[] = [];
      if (useEduc) xs.push(r.educ);
      if (useExper) xs.push(r.exper);
      if (useAge) xs.push(r.age);
      if (useFemale) xs.push(r.female);
      return xs;
    });
    if (!X[0].length) return null;
    return { y, X };
  }, [useEduc, useExper, useAge, useFemale]);

  const result = useMemo(() => {
    if (!spec) return null;
    return olsFit(spec.y, spec.X, seType);
  }, [spec, seType]);

  const terms = useMemo(() => {
    const t = ["Intercept"];
    if (useEduc) t.push("educ");
    if (useExper) t.push("exper");
    if (useAge) t.push("age");
    if (useFemale) t.push("female");
    return t;
  }, [useEduc, useExper, useAge, useFemale]);

  const rvfPoints = useMemo<Point[] | null>(() => {
    if (!result) return null;
    return result.yhat.map((yh, i) => ({ 
      x: yh, 
      y: result.e[i], 
      id: demoData[i].id,
    }));
  }, [result]);

  const educPlot = useMemo(() => {
    if (!spec || !result || !useEduc) return null;

    const y = spec.y;
    const educ = demoData.map((r) => r.educ);

    if (!useExper && !useAge && !useFemale) {
      const b0 = result.beta[0], b1 = result.beta[1];
      const pts = educ.map((x, i) => ({ x, y: y[i], id: demoData[i].id }));
      const x1 = Math.min(...educ), x2 = Math.max(...educ);
      return {
        points: pts,
        line: { x1, y1: b0 + b1 * x1, x2, y2: b0 + b1 * x2 },
        xLabel: "Education (years)",
        yLabel: "Wage ($/hour)",
      };
    } else {
      const otherVars = demoData.map((r) => {
        const vars = [];
        if (useExper) vars.push(r.exper);
        if (useAge) vars.push(r.age);
        if (useFemale) vars.push(r.female);
        return vars;
      });
      const y_res = residualize(y, otherVars);
      const x_res = residualize(educ, otherVars);
      const Xp = x_res.map((x) => [1, x]);
      const bp = mv(inv2or3(mm(t(Xp), Xp)), mv(t(Xp), y_res));
      const x1 = Math.min(...x_res), x2 = Math.max(...x_res);
      const pts = x_res.map((x, i) => ({ x, y: y_res[i], id: demoData[i].id }));
      return {
        points: pts,
        line: { x1, y1: bp[0] + bp[1] * x1, x2, y2: bp[0] + bp[1] * x2 },
        xLabel: "Education (partialled out)",
        yLabel: "Wage (partialled out)",
      };
    }
  }, [spec, result, useEduc, useExper, useAge, useFemale]);

  const handlePointHover = useCallback((point: Point | null) => {
    setHoveredPoint(point);
    setHighlightedRow(point?.id || null);
  }, []);

  const handleRowHover = useCallback((id: number | null) => {
    setHighlightedRow(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Interactive OLS Regression Lab
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore ordinary least squares regression with interactive visualizations, comprehensive diagnostics, and real-time coefficient updates.
          </p>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Model Configuration</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Covariates */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-800 flex items-center">
                <span className="mr-2">📊</span> Independent Variables
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'educ', label: 'Education (years)', state: useEduc, setState: setUseEduc },
                  { key: 'exper', label: 'Experience (years)', state: useExper, setState: setUseExper },
                  { key: 'age', label: 'Age (years)', state: useAge, setState: setUseAge },
                  { key: 'female', label: 'Gender (female=1)', state: useFemale, setState: setUseFemale },
                ].map(({ key, label, state, setState }) => (
                  <label key={key} className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state}
                      onChange={() => setState(!state)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <code className="bg-blue-200 px-2 py-1 rounded text-xs font-mono">{key}</code>
                    <span className="text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Standard Errors */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <h3 className="font-semibold mb-3 text-purple-800 flex items-center">
                <span className="mr-2">🔧</span> Standard Errors
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="se"
                    checked={seType === "robust"}
                    onChange={() => setSeType("robust")}
                    className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="font-medium">Robust (HC1)</span>
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="se"
                    checked={seType === "classical"}
                    onChange={() => setSeType("classical")}
                    className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="font-medium">Classical</span>
                </label>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                HC1 adjusts for heteroskedasticity with small-sample correction
              </p>
            </div>

            {/* Current Model */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
              <h3 className="font-semibold mb-3 text-emerald-800 flex items-center">
                <span className="mr-2">📝</span> Current Model
              </h3>
              <div className="bg-white rounded-lg p-3 border border-emerald-300">
                <code className="text-sm text-slate-800">
                  wage = β₀ + {terms.slice(1).map((term, i) => `β${i+1}·${term}`).join(' + ')}
                  {terms.length === 1 && <span className="text-slate-500">Select variables</span>}
                </code>
              </div>
              {result && (
                <div className="mt-2 text-xs text-emerald-700">
                  n = {result.n}, R² = {result.r2.toFixed(3)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'results', label: 'Regression Results', icon: '📊' },
                { key: 'diagnostics', label: 'Diagnostics', icon: '🔍' },
                { key: 'data', label: 'Data Explorer', icon: '📋' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'results' && (
              <div className="space-y-6">
                {!result ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔧</div>
                    <p className="text-lg text-slate-600">Select at least one independent variable to run the regression</p>
                  </div>
                ) : (
                  <>
                    {/* Coefficient Table */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">📈</span> Regression Coefficients
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
                              <th className="text-left p-3 font-semibold">Variable</th>
                              <th className="text-right p-3 font-semibold">Coefficient</th>
                              <th className="text-right p-3 font-semibold">Std. Error</th>
                              <th className="text-right p-3 font-semibold">t-statistic</th>
                              <th className="text-right p-3 font-semibold">p-value</th>
                              <th className="text-right p-3 font-semibold">95% CI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {terms.map((name, j) => {
                              const b = result.beta[j];
                              const s = result.se[j];
                              const t = result.tStats[j];
                              const p = result.pValues[j];
                              const lo = b - 1.96 * s;
                              const hi = b + 1.96 * s;
                              const isSignificant = p < 0.05;
                              
                              return (
                                <tr key={name} className={`border-b transition-colors ${isSignificant ? 'bg-green-50' : ''}`}>
                                  <td className="p-3 font-mono font-medium">
                                    {name}
                                    {isSignificant && <span className="ml-2 text-green-600 text-xs">*</span>}
                                  </td>
                                  <td className="p-3 text-right font-mono">{b.toFixed(4)}</td>
                                  <td className="p-3 text-right font-mono">{s.toFixed(4)}</td>
                                  <td className="p-3 text-right font-mono">{t.toFixed(3)}</td>
                                  <td className="p-3 text-right font-mono">
                                    <span className={p < 0.05 ? 'text-green-600 font-semibold' : ''}>
                                      {p < 0.001 ? '<0.001' : p.toFixed(3)}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-mono text-sm">
                                    [{lo.toFixed(3)}, {hi.toFixed(3)}]
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">* Significant at 5% level</p>
                    </div>

                    {/* Model Statistics */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{result.r2.toFixed(3)}</div>
                        <div className="text-sm text-blue-600">R-squared</div>
                        <div className="text-xs text-slate-600">Variance explained</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-700">{result.adjR2.toFixed(3)}</div>
                        <div className="text-sm text-purple-600">Adjusted R²</div>
                        <div className="text-xs text-slate-600">Penalized for parameters</div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-700">{result.rmse.toFixed(3)}</div>
                        <div className="text-sm text-emerald-600">RMSE</div>
                        <div className="text-xs text-slate-600">Root mean squared error</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'diagnostics' && (
              <div className="space-y-8">
                {!result ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg text-slate-600">Run a regression to see diagnostic plots</p>
                  </div>
                ) : (
                  <>
                    {/* Diagnostic Plots */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Residuals vs Fitted */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-semibold text-lg mb-3 flex items-center text-slate-800">
                          <span className="mr-2">🎯</span> Residuals vs Fitted
                        </h3>
                        {rvfPoints && (
                          <EnhancedScatter
                            points={rvfPoints}
                            xLabel="Fitted Values"
                            yLabel="Residuals"
                            onPointHover={handlePointHover}
                            highlightedPoint={highlightedRow || undefined}
                            height={280}
                          />
                        )}
                        <div className="mt-3 text-sm text-slate-600 bg-white rounded-lg p-3 border">
                          <strong>Interpretation:</strong> Look for patterns that indicate model problems:
                          <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                            <li><strong>Funnel shape:</strong> Heteroskedasticity (non-constant variance)</li>
                            <li><strong>Curved patterns:</strong> Non-linear relationships</li>
                            <li><strong>Random scatter:</strong> Good model assumptions ✓</li>
                          </ul>
                        </div>
                      </div>

                      {/* Education Relationship */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-semibold text-lg mb-3 flex items-center text-slate-800">
                          <span className="mr-2">📚</span> 
                          {useExper || useAge || useFemale ? "Education (Partial)" : "Education vs Wage"}
                        </h3>
                        {educPlot ? (
                          <EnhancedScatter
                            points={educPlot.points}
                            line={educPlot.line}
                            xLabel={educPlot.xLabel}
                            yLabel={educPlot.yLabel}
                            onPointHover={handlePointHover}
                            highlightedPoint={highlightedRow || undefined}
                            height={280}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-[280px] bg-white rounded border">
                            <p className="text-slate-500">Enable education to see this plot</p>
                          </div>
                        )}
                        <div className="mt-3 text-sm text-slate-600 bg-white rounded-lg p-3 border">
                          <strong>Note:</strong> {useExper || useAge || useFemale 
                            ? "Shows partial regression after controlling for other variables (Frisch-Waugh theorem)"
                            : "Simple bivariate relationship between education and wages"}
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">📊</span> Diagnostic Statistics
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="text-xl font-bold text-blue-700">{result.fStat.toFixed(2)}</div>
                          <div className="text-sm text-blue-600">F-statistic</div>
                          <div className="text-xs text-slate-600">Overall significance</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                          <div className="text-xl font-bold text-purple-700">{Math.max(...result.leverage).toFixed(3)}</div>
                          <div className="text-sm text-purple-600">Max Leverage</div>
                          <div className="text-xs text-slate-600">Observation #{result.leverage.indexOf(Math.max(...result.leverage)) + 1}</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                          <div className="text-xl font-bold text-amber-700">{Math.max(...result.cookD).toFixed(3)}</div>
                          <div className="text-sm text-amber-600">Max Cook's D</div>
                          <div className="text-xs text-slate-600">Observation #{result.cookD.indexOf(Math.max(...result.cookD)) + 1}</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                          <div className="text-xl font-bold text-red-700">{Math.max(...result.e.map(Math.abs)).toFixed(3)}</div>
                          <div className="text-sm text-red-600">Max |Residual|</div>
                          <div className="text-xs text-slate-600">Potential outlier</div>
                        </div>
                      </div>
                    </div>

                    {/* Influence Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">⚠️</span> Influence Analysis
                      </h3>
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-2">High Leverage Points</h4>
                            <div className="space-y-1">
                              {result.leverage.map((lev, i) => (
                                lev > 2 * result.k / result.n && (
                                  <div key={i} className="text-sm text-yellow-700">
                                    Obs #{i + 1}: {lev.toFixed(3)} (threshold: {(2 * result.k / result.n).toFixed(3)})
                                  </div>
                                )
                              ))}
                              {result.leverage.every(lev => lev <= 2 * result.k / result.n) && (
                                <div className="text-sm text-green-700">✓ No high leverage points detected</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-2">Influential Observations</h4>
                            <div className="space-y-1">
                              {result.cookD.map((cd, i) => (
                                cd > 4 / result.n && (
                                  <div key={i} className="text-sm text-yellow-700">
                                    Obs #{i + 1}: Cook's D = {cd.toFixed(3)} (threshold: {(4 / result.n).toFixed(3)})
                                  </div>
                                )
                              ))}
                              {result.cookD.every(cd => cd <= 4 / result.n) && (
                                <div className="text-sm text-green-700">✓ No highly influential points detected</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="mr-2">📋</span> Interactive Data Table
                  </h3>
                  {hoveredPoint && (
                    <div className="bg-amber-100 rounded-lg p-3 border border-amber-200">
                      <div className="text-sm font-medium text-amber-800">
                        Observation #{hoveredPoint.id}
                      </div>
                      <div className="text-xs text-amber-700">
                        Hover over points in plots to highlight rows
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <DataTable 
                    data={demoData} 
                    highlightedRow={highlightedRow || undefined}
                    onRowHover={handleRowHover}
                  />
                </div>

                {/* Summary Statistics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📈</span> Summary Statistics
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {['wage', 'educ', 'exper', 'age'].map(variable => {
                      const values = demoData.map(d => d[variable as keyof typeof d] as number);
                      const mean = values.reduce((a, b) => a + b, 0) / values.length;
                      const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1));
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      
                      return (
                        <div key={variable} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="font-mono font-semibold text-slate-800 mb-2 capitalize">{variable}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Mean:</span>
                              <span className="font-mono">{mean.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Std Dev:</span>
                              <span className="font-mono">{std.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Range:</span>
                              <span className="font-mono">{min.toFixed(1)} - {max.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Variable Descriptions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📖</span> Variable Dictionary
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
                          <th className="text-left p-3 font-semibold">Variable</th>
                          <th className="text-left p-3 font-semibold">Description</th>
                          <th className="text-left p-3 font-semibold">Type</th>
                          <th className="text-left p-3 font-semibold">Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { var: 'wage', desc: 'Hourly wage rate', type: 'Continuous', units: 'Dollars per hour' },
                          { var: 'educ', desc: 'Years of education completed', type: 'Continuous', units: 'Years' },
                          { var: 'exper', desc: 'Years of work experience', type: 'Continuous', units: 'Years' },
                          { var: 'age', desc: 'Age of individual', type: 'Continuous', units: 'Years' },
                          { var: 'female', desc: 'Gender indicator', type: 'Binary', units: '1=Female, 0=Male' },
                          { var: 'region', desc: 'Geographic region', type: 'Categorical', units: 'North/South/East/West' },
                        ].map(({ var, desc, type, units }) => (
                          <tr key={var} className="border-b border-slate-200">
                            <td className="p-3 font-mono font-semibold">{var}</td>
                            <td className="p-3">{desc}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                type === 'Continuous' ? 'bg-blue-100 text-blue-700' :
                                type === 'Binary' ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {type}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-slate-600">{units}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Generation */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <span className="mr-2">💻</span> Generated Code
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const stataCode = `* OLS Regression Analysis
use "your_dataset.dta", clear

* Descriptive statistics
summarize wage educ exper age female

* Run regression with ${seType} standard errors
regress wage ${[useEduc && 'educ', useExper && 'exper', useAge && 'age', useFemale && 'female'].filter(Boolean).join(' ')}, vce(${seType === 'robust' ? 'robust' : 'ols'})

* Generate diagnostic plots
predict yhat, xb
predict residuals, residuals
scatter residuals yhat, title("Residuals vs Fitted")

* Test for heteroskedasticity
estat hettest

* Calculate influence statistics
predict leverage, leverage
predict cooksd, cooksd
list obs leverage cooksd if leverage > 2*e(df_m)/e(N) | cooksd > 4/e(N)`;
                    await navigator.clipboard.writeText(stataCode);
                  }}
                  className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 transition-colors"
                >
                  Copy Stata
                </button>
                <button
                  onClick={async () => {
                    const pythonCode = `import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan
import matplotlib.pyplot as plt
import seaborn as sns

# Load and examine data
df = pd.read_csv('your_data.csv')
df.describe()

# Define variables
y = df['wage']
X = df[${JSON.stringify([useEduc && 'educ', useExper && 'exper', useAge && 'age', useFemale && 'female'].filter(Boolean))}]
X = sm.add_constant(X)  # Add intercept

# Fit OLS model
model = sm.OLS(y, X)
results = model.fit(${seType === 'robust' ? "cov_type='HC1'" : ""})
print(results.summary())

# Diagnostic plots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Residuals vs fitted
fitted = results.fittedvalues
residuals = results.resid
ax1.scatter(fitted, residuals, alpha=0.7)
ax1.axhline(y=0, color='red', linestyle='--')
ax1.set_xlabel('Fitted Values')
ax1.set_ylabel('Residuals')
ax1.set_title('Residuals vs Fitted')

# Q-Q plot
sm.qqplot(residuals, line='s', ax=ax2)
ax2.set_title('Q-Q Plot')

plt.tight_layout()
plt.show()

# Test for heteroskedasticity
bp_stat, bp_pvalue, _, _ = het_breuschpagan(residuals, X)
print(f"Breusch-Pagan test: statistic={bp_stat:.3f}, p-value={bp_pvalue:.3f}")

# Calculate influence measures
influence = results.get_influence()
leverage = influence.hat_matrix_diag
cooks_d = influence.cooks_distance[0]
print("High leverage points:", np.where(leverage > 2*X.shape[1]/len(X))[0])
print("Influential points:", np.where(cooks_d > 4/len(X))[0])`;
                    await navigator.clipboard.writeText(pythonCode);
                  }}
                  className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 transition-colors"
                >
                  Copy Python
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-2">Current model specification:</div>
              <code className="text-sm bg-slate-800 text-green-400 p-3 rounded-lg block font-mono">
                wage ~ {terms.slice(1).join(' + ')} + ε
                {terms.length === 1 && <span className="text-slate-500"> # Select variables to generate code</span>}
              </code>
            </div>
          </div>
        </div>

        {/* Educational Notes */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
              <span className="mr-2">🎓</span> Learning Notes: OLS Assumptions & Diagnostics
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Key OLS Assumptions</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><strong>Linearity:</strong> Relationship is linear in parameters</li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><strong>Independence:</strong> Observations are independent</li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><strong>Homoskedasticity:</strong> Constant error variance</li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><strong>Normality:</strong> Errors are normally distributed</li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><strong>No perfect multicollinearity</strong></li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Diagnostic Interpretation</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><strong>Random residuals:</strong> Model assumptions satisfied</li>
                  <li className="flex items-start"><span className="text-amber-500 mr-2">⚠</span><strong>Funnel pattern:</strong> Use robust standard errors</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">×</span><strong>Curved residuals:</strong> Consider non-linear terms</li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">•</span><strong>High leverage:</strong> Observations far from mean X</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2">•</span><strong>High Cook's D:</strong> Influential observations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}