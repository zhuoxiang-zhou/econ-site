// src/app/labs/ols/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/* ----------------------------- tiny linear algebra ----------------------------- */
function t(A: number[][]) {
  return A[0].map((_, j) => A.map((r) => r[j]));
}
function mm(A: number[][], B: number[][]) {
  const m = A.length,
    n = B[0].length,
    p = B.length;
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
    return [
      [d / det, -b / det],
      [-c / det, a / det],
    ];
  }
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  const A = e * i - f * h,
    B = -(d * i - f * g),
    C = d * h - e * g,
    D = -(b * i - c * h),
    E = a * i - c * g,
    F = -(a * h - b * g),
    G = b * f - c * e,
    H = -(a * f - b * d),
    I = a * e - b * d;
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

/* ------------------------------- toy dataset ---------------------------------- */
// wage ~ educ + exper
const demo = [
  { wage: 10.2, educ: 10, exper: 1 },
  { wage: 11.0, educ: 11, exper: 1 },
  { wage: 12.5, educ: 12, exper: 3 },
  { wage: 14.0, educ: 14, exper: 2 },
  { wage: 15.5, educ: 16, exper: 4 },
  { wage: 18.2, educ: 18, exper: 5 },
];

/* ------------------------------- OLS core ------------------------------------- */
type SEType = "classical" | "robust";

function olsFit(y: number[], X: number[][], seType: SEType) {
  // Add intercept
  const Xb = X.map((r) => [1, ...r]);
  const n = Xb.length;
  const k = Xb[0].length;

  const Xt = t(Xb);
  const XtX = mm(Xt, Xb);
  const XtXinv = inv2or3(XtX);
  const Xty = mv(Xt, y);
  const beta = mv(XtXinv, Xty); // (k x 1)

  // Residuals, yhat, R2
  const yhat = mv(Xb, beta);
  const e = y.map((yi, i) => yi - yhat[i]);
  const sse = e.reduce((s, v) => s + v * v, 0);
  const ybar = mean(y);
  const sst = y.reduce((s, yi) => s + (yi - ybar) ** 2, 0);
  const r2 = 1 - sse / sst;

  // Variance of beta
  let V: number[][];
  if (seType === "classical") {
    const sigma2 = sse / (n - k);
    V = XtXinv.map((row) => row.map((v) => v * sigma2));
  } else {
    // HC1 robust: (X′X)⁻¹ X′ diag(e²) X (X′X)⁻¹ × n/(n−k)
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
  return { beta, se, r2, n, k, yhat, e, Xb };
}

/* --------------------------- residualization helper --------------------------- */
// Regress v on Z (with intercept) and return residuals of v
function residualize(v: number[], Z: number[][]) {
  const Zb = Z.map((r) => [1, ...r]);
  const beta = mv(inv2or3(mm(t(Zb), Zb)), mv(t(Zb), v));
  const vhat = mv(Zb, beta);
  return v.map((vi, i) => vi - vhat[i]);
}

/* ------------------------------ small SVG charts ------------------------------ */
type Point = { x: number; y: number };
function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0 || 1);
  return (v: number) => r0 + (v - d0) * m;
}

function Scatter({
  width = 640,
  height = 300,
  points,
  line,
  xLabel,
  yLabel,
}: {
  width?: number;
  height?: number;
  points: Point[];
  line?: { x1: number; y1: number; x2: number; y2: number };
  xLabel: string;
  yLabel: string;
}) {
  const margin = { top: 14, right: 12, bottom: 34, left: 44 };
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

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* axes */}
        <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#aaa" />
        <line x1={0} y1={0} x2={0} y2={innerH} stroke="#aaa" />

        {/* scatter */}
        {points.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#111" fillOpacity={0.8} />
        ))}

        {/* fitted line */}
        {line && (
          <line
            x1={sx(line.x1)}
            y1={sy(line.y1)}
            x2={sx(line.x2)}
            y2={sy(line.y2)}
            stroke="url(#grad1)"
            strokeWidth={2}
          />
        )}

        {/* labels */}
        <text x={innerW / 2} y={innerH + 26} textAnchor="middle" fontSize="12">
          {xLabel}
        </text>
        <text
          x={-innerH / 2}
          y={-34}
          transform={`rotate(-90)`}
          textAnchor="middle"
          fontSize="12"
        >
          {yLabel}
        </text>
      </g>

      {/* gradient stroke for the line */}
      <defs>
        <linearGradient id="grad1" x1="0" x2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------ UI component ---------------------------------- */
export default function OLSLab() {
  const [useEduc, setUseEduc] = useState(true);
  const [useExper, setUseExper] = useState(true);
  const [seType, setSeType] = useState<SEType>("robust");

  const spec = useMemo(() => {
    const y = demo.map((r) => r.wage);
    const X: number[][] = demo.map((r) => {
      const xs: number[] = [];
      if (useEduc) xs.push(r.educ);
      if (useExper) xs.push(r.exper);
      return xs;
    });
    if (!X[0].length) return null;
    return { y, X };
  }, [useEduc, useExper]);

  const result = useMemo(() => {
    if (!spec) return null;
    return olsFit(spec.y, spec.X, seType);
  }, [spec, seType]);

  const terms = useMemo(() => {
    const t = ["Intercept"];
    if (useEduc) t.push("educ");
    if (useExper) t.push("exper");
    return t;
  }, [useEduc, useExper]);

  const stata = useMemo(() => {
    const rhs = [useEduc && "educ", useExper && "exper"]
      .filter(Boolean)
      .join(" ");
    return `* OLS on toy data (replace with your file)
regress wage ${rhs}, vce(${seType === "robust" ? "robust" : "ols"})
`;
  }, [useEduc, useExper, seType]);

  /* --------------------------- plotting data prep --------------------------- */
  // Residuals vs Fitted (always)
  const rvfPoints = useMemo<Point[] | null>(() => {
    if (!result) return null;
    return result.yhat.map((yh, i) => ({ x: yh, y: result.e[i] }));
  }, [result]);

  // Scatter or partial regression for educ
  const educPlot = useMemo<{
    points: Point[];
    line: { x1: number; y1: number; x2: number; y2: number };
    xLabel: string;
    yLabel: string;
  } | null>(() => {
    if (!spec || !result || !useEduc) return null;

    const y = spec.y;
    const educ = demo.map((r) => r.educ);

    if (!useExper) {
      // Simple scatter: y vs educ, fitted line using current beta
      const b0 = result.beta[0],
        b1 = result.beta[1];
      const pts = educ.map((x, i) => ({ x, y: y[i] }));
      const x1 = Math.min(...educ),
        x2 = Math.max(...educ);
      return {
        points: pts,
        line: { x1, y1: b0 + b1 * x1, x2, y2: b0 + b1 * x2 },
        xLabel: "educ",
        yLabel: "wage",
      };
    } else {
      // Partial regression: residualize y and educ on exper
      const exper = demo.map((r) => r.exper);
      const y_res = residualize(y, exper.map((v) => [v]));
      const x_res = residualize(educ, exper.map((v) => [v]));
      // Fit line y_res ~ x_res
      const Xp = x_res.map((x) => [1, x]);
      const bp = mv(inv2or3(mm(t(Xp), Xp)), mv(t(Xp), y_res));
      const x1 = Math.min(...x_res),
        x2 = Math.max(...x_res);
      const pts = x_res.map((x, i) => ({ x, y: y_res[i] }));
      return {
        points: pts,
        line: { x1, y1: bp[0] + bp[1] * x1, x2, y2: bp[0] + bp[1] * x2 },
        xLabel: "educ (residualized on exper)",
        yLabel: "wage (residualized on exper)",
      };
    }
  }, [spec, result, useEduc, useExper]);

  return (
    <div className="py-10 max-w-4xl mx-auto">
      {/* breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/labs" className="opacity-70 hover:opacity-100">
          ← Back to Labs
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">OLS Sandbox</h1>
      <p className="text-sm text-neutral-700 mt-2">
        Toggle covariates and standard errors. Inspect the residuals plot and, when possible, a
        fitted line for <code>educ</code> (or its partialled-out version when <code>exper</code> is
        included).
      </p>

      {/* controls */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="border rounded-2xl p-4">
          <h3 className="font-medium mb-2 text-sm">Covariates</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useEduc}
              onChange={() => setUseEduc((v) => !v)}
            />
            Include <code>educ</code>
          </label>
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={useExper}
              onChange={() => setUseExper((v) => !v)}
            />
            Include <code>exper</code>
          </label>
        </div>

        <div className="border rounded-2xl p-4">
          <h3 className="font-medium mb-2 text-sm">Standard errors</h3>
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="se"
                checked={seType === "robust"}
                onChange={() => setSeType("robust")}
              />
              Robust (HC1)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="se"
                checked={seType === "classical"}
                onChange={() => setSeType("classical")}
              />
              Classical
            </label>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            HC1 scales for small samples: Var = (X′X)⁻¹ X′ diag(e²) X (X′X)⁻¹ × n/(n−k).
          </p>
        </div>
      </div>

      {/* results */}
      <div className="mt-5 border rounded-2xl p-5">
        <h2 className="text-lg font-medium mb-2">Estimates</h2>

        {!result ? (
          <p className="text-sm">Select at least one covariate.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Term</th>
                  <th className="text-right">Estimate</th>
                  <th className="text-right">SE</th>
                  <th className="text-right">95% CI</th>
                </tr>
              </thead>
              <tbody>
                {["Intercept", useEduc && "educ", useExper && "exper"]
                  .filter(Boolean)
                  .map((name, j) => {
                    const b = result.beta[j];
                    const s = result.se[j];
                    const lo = b - 1.96 * s;
                    const hi = b + 1.96 * s;
                    return (
                      <tr key={String(name)}>
                        <td>{String(name)}</td>
                        <td className="text-right">{b.toFixed(3)}</td>
                        <td className="text-right">{s.toFixed(3)}</td>
                        <td className="text-right">
                          [{lo.toFixed(3)}, {hi.toFixed(3)}]
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="text-xs text-neutral-600 mt-3">
              n = {result.n}, k (incl. intercept) = {result.k}, R² = {result.r2.toFixed(3)}
            </div>
          </>
        )}
      </div>

      {/* plots */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="border rounded-2xl p-4">
          <h3 className="font-medium text-sm mb-2">Residuals vs Fitted</h3>
          {rvfPoints && rvfPoints.length > 0 ? (
            <Scatter points={rvfPoints} xLabel="Fitted" yLabel="Residual" />
          ) : (
            <p className="text-sm">Add at least one covariate to see the plot.</p>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            Look for patterns (funnel shapes ⇒ heteroskedasticity; curves ⇒ misspecification).
          </p>
        </div>

        <div className="border rounded-2xl p-4">
          <h3 className="font-medium text-sm mb-2">
            {useExper && useEduc ? "Partial regression for educ" : "Scatter with fitted line"}
          </h3>
          {educPlot ? (
            <Scatter
              points={educPlot.points}
              line={educPlot.line}
              xLabel={educPlot.xLabel}
              yLabel={educPlot.yLabel}
            />
          ) : (
            <p className="text-sm">
              Enable <code>educ</code> to see this plot.
            </p>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            With both covariates on, we plot the Frisch–Waugh residuals of <code>wage</code> and{" "}
            <code>educ</code> after removing <code>exper</code>.
          </p>
        </div>
      </div>

      {/* code box */}
      <div className="mt-5 border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Matching Stata snippet</h3>
          <button
            onClick={async () => navigator.clipboard.writeText(stata)}
            className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm"
          >
            Copy
          </button>
        </div>
        <pre className="text-xs whitespace-pre-wrap bg-neutral-50 rounded-lg p-3 border mt-2 overflow-x-auto">
          <code>{stata}</code>
        </pre>
        <p className="text-xs text-neutral-500 mt-2">
          Replace <code>wage</code>, <code>educ</code>, <code>exper</code> with your variables and run
          in Stata.
        </p>
      </div>

      {/* data preview */}
      <div className="mt-5 border rounded-2xl p-5">
        <h3 className="font-medium text-sm mb-2">Toy data (first rows)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">wage</th>
              <th className="text-left">educ</th>
              <th className="text-left">exper</th>
            </tr>
          </thead>
          <tbody>
            {demo.slice(0, 6).map((r, i) => (
              <tr key={i}>
                <td>{r.wage}</td>
                <td>{r.educ}</td>
                <td>{r.exper}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


