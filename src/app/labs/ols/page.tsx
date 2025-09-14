// // src/app/labs/ols/page.tsx

// "use client";

// import { useMemo, useState, useCallback } from "react";

// /* ----------------------------- Simple linear algebra ----------------------------- */
// function transpose(A: number[][]) {
//   return A[0].map((_, j) => A.map((r) => r[j]));
// }

// function multiply(A: number[][], B: number[][]) {
//   const m = A.length, n = B[0].length, p = B.length;
//   const C = Array.from({ length: m }, () => Array(n).fill(0));
//   for (let i = 0; i < m; i++)
//     for (let k = 0; k < p; k++)
//       for (let j = 0; j < n; j++) C[i][j] += A[i][k] * B[k][j];
//   return C;
// }

// function multiplyVector(A: number[][], v: number[]) {
//   return A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0));
// }

// function invert2x2(M: number[][]) {
//   if (M.length === 2) {
//     const [[a, b], [c, d]] = M;
//     const det = a * d - b * c;
//     return [[d / det, -b / det], [-c / det, a / det]];
//   }
//   // For 3x3 matrices (simplified)
//   const [[a, b, c], [d, e, f], [g, h, i]] = M;
//   const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
//   return [
//     [(e * i - f * h) / det, -(b * i - c * h) / det, (b * f - c * e) / det],
//     [-(d * i - f * g) / det, (a * i - c * g) / det, -(a * f - c * d) / det],
//     [(d * h - e * g) / det, -(a * h - b * g) / det, (a * e - b * d) / det],
//   ];
// }

// function mean(values: number[]) {
//   return values.reduce((a, b) => a + b, 0) / values.length;
// }

// /* ------------------------------- Simple dataset ---------------------------------- */
// const wageData = [
//   { wage: 8.5, education: 10, experience: 1 },
//   { wage: 10.2, education: 12, experience: 2 },
//   { wage: 12.8, education: 14, experience: 3 },
//   { wage: 15.1, education: 16, experience: 4 },
//   { wage: 18.5, education: 18, experience: 6 },
//   { wage: 11.3, education: 11, experience: 2 },
//   { wage: 14.7, education: 15, experience: 3 },
//   { wage: 17.2, education: 17, experience: 5 },
// ];

// /* ------------------------------- Simple OLS function ---------------------------------- */
// function runRegression(y: number[], X: number[][]) {
//   // Add column of 1s for intercept
//   const XwithIntercept = X.map((row) => [1, ...row]);
//   const n = XwithIntercept.length;
  
//   // Calculate coefficients: β = (X'X)^(-1)X'y
//   const Xt = transpose(XwithIntercept);
//   const XtX = multiply(Xt, XwithIntercept);
//   const XtXinverse = invert2x2(XtX);
//   const Xty = multiplyVector(Xt, y);
//   const coefficients = multiplyVector(XtXinverse, Xty);

//   // Calculate predictions and residuals
//   const predictions = multiplyVector(XwithIntercept, coefficients);
//   const residuals = y.map((yi, i) => yi - predictions[i]);
  
//   // Calculate R-squared
//   const yMean = mean(y);
//   const totalSumSquares = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
//   const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
//   const rSquared = 1 - residualSumSquares / totalSumSquares;

//   return { coefficients, predictions, residuals, rSquared, n };
// }

// /* ------------------------------ Simple chart component ------------------------------ */
// function SimpleChart({ 
//   points, 
//   line, 
//   xLabel, 
//   yLabel, 
//   width = 500, 
//   height = 300 
// }: {
//   points: { x: number; y: number }[];
//   line?: { slope: number; intercept: number };
//   xLabel: string;
//   yLabel: string;
//   width?: number;
//   height?: number;
// }) {
//   const margin = { top: 20, right: 20, bottom: 40, left: 50 };
//   const innerW = width - margin.left - margin.right;
//   const innerH = height - margin.top - margin.bottom;

//   const xValues = points.map(p => p.x);
//   const yValues = points.map(p => p.y);
//   const xMin = Math.min(...xValues);
//   const xMax = Math.max(...xValues);
//   const yMin = Math.min(...yValues);
//   const yMax = Math.max(...yValues);

//   const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerW;
//   const yScale = (y: number) => innerH - ((y - yMin) / (yMax - yMin)) * innerH;

//   return (
//     <div className="bg-white rounded-lg border p-4">
//       <svg width={width} height={height} className="border rounded">
//         <g transform={`translate(${margin.left}, ${margin.top})`}>
//           {/* Axes */}
//           <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#666" strokeWidth={1} />
//           <line x1={0} y1={0} x2={0} y2={innerH} stroke="#666" strokeWidth={1} />
          
//           {/* Data points */}
//           {points.map((point, i) => (
//             <circle
//               key={i}
//               cx={xScale(point.x)}
//               cy={yScale(point.y)}
//               r={5}
//               fill="#3b82f6"
//               stroke="#1e40af"
//               strokeWidth={1}
//             />
//           ))}
          
//           {/* Regression line */}
//           {line && (
//             <line
//               x1={0}
//               y1={yScale(line.intercept + line.slope * xMin)}
//               x2={innerW}
//               y2={yScale(line.intercept + line.slope * xMax)}
//               stroke="#ef4444"
//               strokeWidth={2}
//             />
//           )}
          
//           {/* Labels */}
//           <text x={innerW / 2} y={innerH + 30} textAnchor="middle" className="text-sm font-medium">
//             {xLabel}
//           </text>
//           <text 
//             x={-innerH / 2} 
//             y={-30} 
//             textAnchor="middle" 
//             transform={`rotate(-90, ${-innerH / 2}, -30)`}
//             className="text-sm font-medium"
//           >
//             {yLabel}
//           </text>
//         </g>
//       </svg>
//     </div>
//   );
// }

// /* ------------------------------ Main component ------------------------------ */
// export default function SimpleOLSLab() {
//   const [includeEducation, setIncludeEducation] = useState(true);
//   const [includeExperience, setIncludeExperience] = useState(false);

//   // Prepare data for regression
//   const regressionData = useMemo(() => {
//     const y = wageData.map(d => d.wage);
//     const X: number[][] = wageData.map(d => {
//       const row: number[] = [];
//       if (includeEducation) row.push(d.education);
//       if (includeExperience) row.push(d.experience);
//       return row;
//     });
    
//     if (X[0].length === 0) return null;
//     return { y, X };
//   }, [includeEducation, includeExperience]);

//   // Run regression
//   const results = useMemo(() => {
//     if (!regressionData) return null;
//     return runRegression(regressionData.y, regressionData.X);
//   }, [regressionData]);

//   // Prepare chart data
//   const chartData = useMemo(() => {
//     if (!includeEducation || includeExperience) return null;
    
//     const points = wageData.map(d => ({ x: d.education, y: d.wage }));
//     const line = results ? {
//       intercept: results.coefficients[0],
//       slope: results.coefficients[1]
//     } : undefined;
    
//     return { points, line };
//   }, [includeEducation, includeExperience, results]);

//   // Prepare residuals chart
//   const residualsData = useMemo(() => {
//     if (!results) return null;
//     return results.predictions.map((pred, i) => ({ 
//       x: pred, 
//       y: results.residuals[i] 
//     }));
//   }, [results]);

//   const getVariableNames = () => {
//     const names = ["Intercept"];
//     if (includeEducation) names.push("Education");
//     if (includeExperience) names.push("Experience");
//     return names;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             Learn OLS Regression
//           </h1>
//           <p className="text-lg text-gray-600">
//             Explore how education and experience affect wages
//           </p>
//         </div>

//         {/* Controls */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-semibold mb-4">Choose Your Variables</h2>
//           <div className="flex gap-6">
//             <label className="flex items-center gap-2 text-lg cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={includeEducation}
//                 onChange={() => setIncludeEducation(!includeEducation)}
//                 className="w-5 h-5 text-blue-600 rounded"
//               />
//               <span>Include Education (years)</span>
//             </label>
//             <label className="flex items-center gap-2 text-lg cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={includeExperience}
//                 onChange={() => setIncludeExperience(!includeExperience)}
//                 className="w-5 h-5 text-blue-600 rounded"
//               />
//               <span>Include Experience (years)</span>
//             </label>
//           </div>
//         </div>

//         {/* Results */}
//         {!results ? (
//           <div className="bg-white rounded-xl shadow-lg p-12 text-center">
//             <div className="text-4xl mb-4">📊</div>
//             <p className="text-xl text-gray-600">
//               Select at least one variable to run the regression!
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-8">
//             {/* Regression Results */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-xl font-semibold mb-4">Regression Results</h2>
              
//               {/* Equation */}
//               <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                 <div className="text-lg font-mono text-center">
//                   Wage = {results.coefficients[0].toFixed(2)}
//                   {includeEducation && ` + ${results.coefficients[1].toFixed(2)} × Education`}
//                   {includeExperience && ` + ${results.coefficients[includeEducation ? 2 : 1].toFixed(2)} × Experience`}
//                 </div>
//               </div>

//               {/* Coefficients Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="border p-3 text-left font-semibold">Variable</th>
//                       <th className="border p-3 text-right font-semibold">Coefficient</th>
//                       <th className="border p-3 text-left font-semibold">Interpretation</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getVariableNames().map((name, i) => (
//                       <tr key={name}>
//                         <td className="border p-3 font-medium">{name}</td>
//                         <td className="border p-3 text-right font-mono text-lg">
//                           {results.coefficients[i].toFixed(3)}
//                         </td>
//                         <td className="border p-3 text-gray-700">
//                           {i === 0 
//                             ? "Base wage when other variables = 0"
//                             : name === "Education"
//                             ? "Each extra year of education increases wage by $" + results.coefficients[i].toFixed(2)
//                             : "Each extra year of experience increases wage by $" + results.coefficients[i].toFixed(2)
//                           }
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* R-squared */}
//               <div className="mt-6 bg-blue-50 rounded-lg p-4">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-blue-700">
//                     {(results.rSquared * 100).toFixed(1)}%
//                   </div>
//                   <div className="text-blue-600 font-semibold">
//                     R-squared (Variance Explained)
//                   </div>
//                   <div className="text-sm text-gray-600 mt-1">
//                     {results.rSquared > 0.7 ? "Strong relationship!" : 
//                      results.rSquared > 0.4 ? "Moderate relationship" : 
//                      "Weak relationship"}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Charts */}
//             <div className="grid gap-8 lg:grid-cols-2">
//               {/* Scatter plot (only for education alone) */}
//               {chartData && (
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Education vs Wage</h3>
//                   <SimpleChart
//                     points={chartData.points}
//                     line={chartData.line}
//                     xLabel="Years of Education"
//                     yLabel="Hourly Wage ($)"
//                   />
//                   <p className="text-sm text-gray-600 mt-2">
//                     Blue dots = actual data, Red line = our regression line
//                   </p>
//                 </div>
//               )}

//               {/* Residuals plot */}
//               {residualsData && (
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">How Good is Our Model?</h3>
//                   <SimpleChart
//                     points={residualsData}
//                     xLabel="Predicted Wage"
//                     yLabel="Prediction Error"
//                   />
//                   <p className="text-sm text-gray-600 mt-2">
//                     Points close to zero = good predictions. Scattered randomly = good model!
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Data Table */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold mb-4">Our Data</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="border p-3 text-left">Person</th>
//                       <th className="border p-3 text-right">Wage ($/hour)</th>
//                       <th className="border p-3 text-right">Education (years)</th>
//                       <th className="border p-3 text-right">Experience (years)</th>
//                       {results && (
//                         <>
//                           <th className="border p-3 text-right">Predicted Wage</th>
//                           <th className="border p-3 text-right">Error</th>
//                         </>
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {wageData.map((person, i) => (
//                       <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
//                         <td className="border p-3 font-medium">Person {i + 1}</td>
//                         <td className="border p-3 text-right">${person.wage.toFixed(2)}</td>
//                         <td className="border p-3 text-right">{person.education}</td>
//                         <td className="border p-3 text-right">{person.experience}</td>
//                         {results && (
//                           <>
//                             <td className="border p-3 text-right">${results.predictions[i].toFixed(2)}</td>
//                             <td className="border p-3 text-right">
//                               <span className={results.residuals[i] > 0 ? "text-green-600" : "text-red-600"}>
//                                 {results.residuals[i] > 0 ? "+" : ""}{results.residuals[i].toFixed(2)}
//                               </span>
//                             </td>
//                           </>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Simple Explanation */}
//             <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
//               <h3 className="text-lg font-semibold mb-4">🎓 What does this mean?</h3>
//               <div className="space-y-3 text-gray-700">
//                 <p>
//                   <strong>Regression</strong> helps us find the best line through our data points.
//                 </p>
//                 <p>
//                   <strong>Coefficients</strong> tell us how much wages change when education or experience increases by 1 year.
//                 </p>
//                 <p>
//                   <strong>R-squared</strong> tells us what percentage of wage differences our model explains.
//                 </p>
//                 <p>
//                   <strong>Residuals</strong> show how wrong our predictions are for each person.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// src/app/labs/ols/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, RefreshCw, AlertTriangle } from "lucide-react";

/* ----------------------------- helpers ----------------------------- */
function mean(v: number[]) { return v.reduce((a, b) => a + b, 0) / v.length; }
function variance(v: number[]) {
  const m = mean(v);
  return v.reduce((s, x) => s + (x - m) ** 2, 0);
}
function cov(x: number[], y: number[]) {
  const mx = mean(x), my = mean(y);
  return x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
}
function t(A: number[][]) { return A[0].map((_, j) => A.map(r => r[j])); }
function mm(A: number[][], B: number[][]) {
  const m = A.length, n = B[0].length, p = B.length;
  const C = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let k = 0; k < p; k++)
      for (let j = 0; j < n; j++) C[i][j] += A[i][k] * B[k][j];
  return C;
}
function mv(A: number[][], v: number[]) {
  return A.map(r => r.reduce((s, a, j) => s + a * v[j], 0));
}
function inv2(M: number[][]) {
  const [[a, b], [c, d]] = M; const det = a * d - b * c;
  return [[ d / det, -b / det], [ -c / det, a / det ]];
}

/* ------------------------- simulation model ------------------------- */
/**
 * Data generating process:
 *  y = α + βx * x + βw * w + ε
 *  [x, w] jointly normal with corr ρxw
 *  Heteroskedasticity: Var(ε | x) = σ² * (1 + h * (x - mean(x))^2)
 */
type Row = { x: number; w: number; y: number };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (1664525 * s + 1013904223) >>> 0) / 2 ** 32;
}
function rnorm(u: number, v: number) {
  const r = Math.sqrt(-2 * Math.log(u + 1e-12));
  return { n1: r * Math.cos(2 * Math.PI * v), n2: r * Math.sin(2 * Math.PI * v) };
}

function simulateOLS(n: number, betaX: number, betaW: number, rhoXW: number, sigma: number, het: number, seed = 7): Row[] {
  const U = rng(seed), V = rng(seed + 1);
  const data: Row[] = [];
  for (let i = 0; i < n; i++) {
    const { n1, n2 } = rnorm(U(), V());
    // x and w correlated with rho
    const x = n1;
    const w = rhoXW * n1 + Math.sqrt(Math.max(0, 1 - rhoXW ** 2)) * n2;
    // heteroskedastic ε depending on x
    const xCentered = x - 0; // mean ~ 0
    const sdE = sigma * Math.sqrt(Math.max(0.0001, 1 + het * xCentered ** 2));
    const { n1: e1 } = rnorm(U(), V());
    const e = sdE * e1;

    const alpha = 2;
    const y = alpha + betaX * x + betaW * w + e;
    data.push({ x, w, y });
  }
  return data;
}

/* --------------------------- OLS + SEs --------------------------- */
type SEType = "classical" | "robust";

function olsFit(y: number[], X: number[][], seType: SEType) {
  // add intercept
  const Xb = X.map(r => [1, ...r]);
  const n = Xb.length;
  const k = Xb[0].length;

  const Xt = t(Xb);
  const XtX = mm(Xt, Xb);
  const XtXinv = k === 2 ? inv2(XtX) : (() => {
    // small safe inverse for k=3 using adjugate
    const [[a,b,c],[d,e,f],[g,h,i]] = XtX;
    const A=e*i-f*h, B=-(d*i-f*g), C=d*h-e*g, D=-(b*i-c*h), E=a*i-c*g, F=-(a*h-b*g), G=b*f-c*e, H=-(a*f-b*d), I=a*e-b*d;
    const det=a*A+b*B+c*C;
    return [[A/det,D/det,G/det],[B/det,E/det,H/det],[C/det,F/det,I/det]];
  })();

  const Xty = mv(Xt, y);
  const beta = mv(XtXinv, Xty); // k x 1
  const yhat = mv(Xb, beta);
  const e = y.map((yi, i) => yi - yhat[i]);
  const sse = e.reduce((s, v) => s + v * v, 0);
  const r2 = 1 - sse / variance(y);

  // variance of beta
  let V: number[][];
  if (seType === "classical") {
    const sigma2 = sse / (n - k);
    V = XtXinv.map(row => row.map(v => v * sigma2));
  } else {
    // HC1: (X'X)^-1 X' diag(e^2) X (X'X)^-1 * n/(n-k)
    const scale = n / (n - k);
    const meat = mm(mm(Xt, diagOfSquares(e)), Xb);
    const mid = mm(XtXinv, meat);
    V = mm(mid, XtXinv).map(row => row.map(v => v * scale));
  }
  const se = V.map((row, i) => Math.sqrt(Math.max(0, row[i])));
  return { beta, se, r2, n, k, yhat, e };
}

function diagOfSquares(e: number[]) {
  // returns X' diag(e^2) X via streaming later; here we keep diag(e^2) as matrix mult helper
  // For small n in a teaching app, we can build explicitly:
  const n = e.length;
  const D: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? e[i] * e[i] : 0))
  );
  return D;
}

/* ----------------------------- charts ----------------------------- */
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
        {/* labels */}
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

/* ------------------------------- page ------------------------------- */
export default function OLSLab() {
  // Controls
  const [n, setN] = useState(300);
  const [betaX, setBetaX] = useState(1.2);
  const [betaW, setBetaW] = useState(0.8);
  const [rhoXW, setRhoXW] = useState(0.6);     // correlation between x and w
  const [sigma, setSigma] = useState(1.2);     // noise base SD
  const [het, setHet] = useState(0.8);         // heteroskedasticity strength
  const [includeW, setIncludeW] = useState(false);
  const [seType, setSeType] = useState<SEType>("robust");
  const [showCode, setShowCode] = useState(false);

  const data = useMemo(() => simulateOLS(n, betaX, betaW, rhoXW, sigma, het, 11), [n, betaX, betaW, rhoXW, sigma, het]);
  const x = useMemo(() => data.map(d => d.x), [data]);
  const w = useMemo(() => data.map(d => d.w), [data]);
  const y = useMemo(() => data.map(d => d.y), [data]);

  // Design matrices
  const X_model: number[][] = useMemo(() => data.map((d) => includeW ? [d.x, d.w] : [d.x]), [data, includeW]);

  // OLS fit
  const fit = useMemo(() => olsFit(y, X_model, seType), [y, X_model, seType]);

  // Extract βx position depending on spec (Intercept is 0)
  const betaIdxX = 1;            // position of x
  const betaIdxW = includeW ? 2 : null;

  const estX = fit.beta[betaIdxX];
  const seX = fit.se[betaIdxX];
  const ciX = [estX - 1.96 * seX, estX + 1.96 * seX];

  const estW = betaIdxW !== null ? fit.beta[betaIdxW] : null;
  const seW = betaIdxW !== null ? fit.se[betaIdxW] : null;
  const ciW = betaIdxW !== null ? [estW! - 1.96 * seW!, estW! + 1.96 * seW!] : null;

  // Bias relative to true βx (shows omitted-variable bias when w is excluded)
  const biasX = estX - betaX;

  // Plots
  const pointsMain = useMemo(() => data.map(d => ({ x: d.x, y: d.y })), [data]);
  const lineOLS = useMemo(() => {
    // simple line using estimated coefficients; when including w, we plot ŷ as a function of x at w = mean(w)
    const a = fit.beta[0];
    const wbar = mean(w);
    const b = estX; // slope w.r.t. x is estX
    const alphaForLine = includeW ? a + (estW ?? 0) * wbar : a;

    return { a: alphaForLine, b, color: "#2563eb", label: "OLS fit" };
  }, [fit.beta, estX, estW, includeW, w]);

  const rvfPoints = useMemo(() => fit.yhat.map((yh, i) => ({ x: yh, y: y[i] - yh })), [fit.yhat, y]);

  const reset = useCallback(() => {
    setN(300); setBetaX(1.2); setBetaW(0.8); setRhoXW(0.6); setSigma(1.2); setHet(0.8);
    setIncludeW(false); setSeType("robust");
  }, []);

  const stataCode = useMemo(() => {
    const rhs = includeW ? "x w" : "x";
    const vce = seType === "robust" ? "robust" : "ols";
    return `* OLS with ${seType === "robust" ? "HC1 robust" : "classical"} SEs
clear all
use "your_data.dta", clear

* Fit model
regress y ${rhs}, vce(${vce})

* Diagnostics
predict yhat, xb
predict e, residuals
rvfplot

* If heteroskedasticity is suspected, prefer robust SEs
* estat hettest  // Breusch–Pagan
`
    .replace(/'/g, "’"); // avoid unescaped apostrophes for ESLint
  }, [includeW, seType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* back link */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <Link href="/labs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={16} />
            Back to Labs
          </Link>
        </motion.div>

        {/* header */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ordinary Least Squares (OLS) Lab</h1>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto">
            Explore OLS estimation, heteroskedasticity, and omitted-variable bias. Toggle a control variable, switch between
            classical and robust standard errors, and inspect diagnostics like Residuals vs. Fitted.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* controls */}
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Parameters</h2>
                <button onClick={reset} className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors" title="Reset to defaults">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    True β<sub>x</sub>: <span className="text-blue-600">{betaX.toFixed(1)}</span>
                  </label>
                  <input type="range" min={-0.5} max={2.5} step={0.1} value={betaX} onChange={(e) => setBetaX(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Include control w</label>
                  <input type="checkbox" checked={includeW} onChange={() => setIncludeW(v => !v)} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    True β<sub>w</sub>: <span className="text-emerald-600">{betaW.toFixed(1)}</span>
                  </label>
                  <input type="range" min={0} max={1.8} step={0.1} value={betaW} onChange={(e) => setBetaW(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Corr(x, w): <span className="text-amber-600">{rhoXW.toFixed(2)}</span>
                  </label>
                  <input type="range" min={-0.9} max={0.9} step={0.05} value={rhoXW} onChange={(e) => setRhoXW(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  <p className="text-xs text-slate-500 mt-1">
                    High correlation + excluding w ⇒ omitted-variable bias in β<sub>x</sub>.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Heteroskedasticity (h): <span className="text-red-600">{het.toFixed(1)}</span>
                  </label>
                  <input type="range" min={0} max={2} step={0.1} value={het} onChange={(e) => setHet(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Noise σ
                    </label>
                    <input type="range" min={0.6} max={3} step={0.1} value={sigma} onChange={(e) => setSigma(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Sample size n: <span className="text-slate-800">{n}</span>
                    </label>
                    <input type="range" min={80} max={1000} step={20} value={n} onChange={(e) => setN(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Standard Errors</h4>
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="se" checked={seType === "robust"} onChange={() => setSeType("robust")} />
                      Robust (HC1)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="se" checked={seType === "classical"} onChange={() => setSeType("classical")} />
                      Classical
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Quick Scenarios</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setIncludeW(true); setRhoXW(0.6); setHet(0); }}
                    className="w-full p-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                  >
                    Well-specified + Homoskedastic
                  </button>
                  <button
                    onClick={() => { setIncludeW(false); setRhoXW(0.8); }}
                    className="w-full p-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                  >
                    Omitted-Variable Bias
                  </button>
                  <button
                    onClick={() => { setHet(1.6); setSeType("robust"); }}
                    className="w-full p-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                  >
                    Strong Heteroskedasticity (use robust)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* charts + results */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-3 space-y-8">
            <Scatter
              points={pointsMain}
              lines={[{ a: lineOLS.a as number, b: lineOLS.b as number, color: "#2563eb", label: "OLS fit" }]}
              xLabel="x (key regressor)"
              yLabel="y (outcome)"
            />

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
                <div className="text-2xl font-bold text-blue-700">{estX.toFixed(3)}</div>
                <div className="text-sm text-blue-700/80 font-medium">β̂ for x</div>
                <div className="mt-1 text-xs text-slate-500">True β<sub>x</sub> = <span className="font-mono">{betaX.toFixed(2)}</span></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
                <div className="text-2xl font-bold text-slate-800">{fit.r2.toFixed(3)}</div>
                <div className="text-sm text-slate-700/80 font-medium">R²</div>
                <div className="mt-1 text-xs text-slate-500">Goodness of fit</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
                <div className="text-2xl font-bold text-rose-700">{biasX.toFixed(3)}</div>
                <div className="text-sm text-rose-700/80 font-medium">Bias (β̂ − β)</div>
                <div className="mt-1 text-xs text-slate-500">{includeW ? "With control" : "No control"}; corr(x,w) = {rhoXW.toFixed(2)}</div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
                <div className="text-2xl font-bold text-emerald-700">{seX.toFixed(3)}</div>
                <div className="text-sm text-emerald-700/80 font-medium">SE for β̂<sub>x</sub></div>
                <div className="mt-1 text-xs text-slate-500">{seType === "robust" ? "HC1 robust" : "Classical"}</div>
              </div>
            </div>

            {/* Residuals vs Fitted */}
            <div className="bg-white rounded-xl border border-slate-200 shadow p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Residuals vs Fitted</h3>
              <Scatter points={rvfPoints} xLabel="Fitted" yLabel="Residuals" />
              <div className="mt-2 text-xs text-slate-600">
                Funnel shape ⇒ heteroskedasticity; curvature ⇒ misspecification (consider adding w).
              </div>
            </div>

            {/* Stata code */}
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
            <div className="bg-gradient-to-r from-sky-50 to-violet-50 rounded-xl border border-sky-200/70 p-6">
              <h3 className="text-lg font-semibold text-sky-900 mb-3">When do OLS estimates make sense?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-sky-900/90">
                <div>
                  <p className="font-medium mb-1">Key assumptions:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Linearity & correct specification</strong> (include relevant controls like <code>w</code>).</li>
                    <li><strong>Exogeneity</strong> (errors uncorrelated with regressors).</li>
                    <li><strong>Homoskedasticity</strong> for classical SEs — otherwise prefer <em>robust</em> SEs.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Good practice:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Report robust SEs when heteroskedasticity is plausible.</li>
                    <li>Check residual plots; add controls to address omitted-variable bias.</li>
                    <li>Document your model choices and assumptions clearly.</li>
                  </ul>
                </div>
              </div>
              {seType === "classical" && het > 0.8 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    Strong heteroskedasticity with classical SEs — switch to robust (HC1) for valid inference.
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}