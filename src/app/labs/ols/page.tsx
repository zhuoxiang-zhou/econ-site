// src/app/labs/ols/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
function eye(k: number) {
  const I = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))
  );
  return I;
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

  // Residuals
  const yhat = mv(Xb, beta);
  const e = y.map((yi, i) => yi - yhat[i]);
  const sse = e.reduce((s, v) => s + v * v, 0);
  const sst = y.reduce((s, yi) => s + Math.pow(yi - (y.reduce((a, b) => a + b, 0) / n), 2), 0);
  const r2 = 1 - sse / sst;

  // Variance of beta
  let V: number[][];
  if (seType === "classical") {
    const sigma2 = sse / (n - k);
    V = XtXinv.map((row) => row.map((v) => v * sigma2));
  } else {
    // HC1 robust: (X'X)^-1 X' diag(e^2) X (X'X)^-1 * n/(n-k)
    const scale = n / (n - k);
    const diagE2 = e.map((ei, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? ei * ei : 0))
    );
    const meat = mm(mm(Xt, diagE2), Xb);
    const mid = mm(XtXinv, meat);
    V = mm(mid, XtXinv).map((row) => row.map((v) => v * scale));
  }
  const se = V.map((row, i) => Math.sqrt(row[i]));
  return { beta, se, r2, n, k };
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
    const rhs = [useEduc && "educ", useExper && "exper"].filter(Boolean).join(" ");
    return `* OLS on toy data (replace with your file)
regress wage ${rhs}, vce(${seType === "robust" ? "robust" : "ols"})
`;
  }, [useEduc, useExper, seType]);

  return (
    <div className="py-10 max-w-3xl mx-auto">
      {/* breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/labs" className="opacity-70 hover:opacity-100">
          ← Back to Labs
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">OLS Sandbox</h1>
      <p className="text-sm text-neutral-700 mt-2">
        Toggle covariates and standard errors to see how the results change on a tiny dataset.
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
            HC1 scales for small samples: Var = (X'X)^−1 X' diag(e²) X (X'X)^−1 × n/(n−k).
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
                {terms.map((name, j) => {
                  const b = result.beta[j];
                  const s = result.se[j];
                  const lo = b - 1.96 * s;
                  const hi = b + 1.96 * s;
                  return (
                    <tr key={name}>
                      <td>{name}</td>
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
              n = {result.n}, k (incl. intercept) = {result.k}, R² ={" "}
              {result.r2.toFixed(3)}
            </div>
          </>
        )}
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
          Replace <code>wage</code>, <code>educ</code>, <code>exper</code> with your variables and run in Stata.
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