// src/app/labs/ols/page.tsx

"use client";

import { useMemo, useState, useCallback } from "react";

/* ----------------------------- Simple linear algebra ----------------------------- */
function transpose(A: number[][]) {
  return A[0].map((_, j) => A.map((r) => r[j]));
}

function multiply(A: number[][], B: number[][]) {
  const m = A.length, n = B[0].length, p = B.length;
  const C = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let k = 0; k < p; k++)
      for (let j = 0; j < n; j++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

function multiplyVector(A: number[][], v: number[]) {
  return A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0));
}

function invert2x2(M: number[][]) {
  if (M.length === 2) {
    const [[a, b], [c, d]] = M;
    const det = a * d - b * c;
    return [[d / det, -b / det], [-c / det, a / det]];
  }
  // For 3x3 matrices (simplified)
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  return [
    [(e * i - f * h) / det, -(b * i - c * h) / det, (b * f - c * e) / det],
    [-(d * i - f * g) / det, (a * i - c * g) / det, -(a * f - c * d) / det],
    [(d * h - e * g) / det, -(a * h - b * g) / det, (a * e - b * d) / det],
  ];
}

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/* ------------------------------- Simple dataset ---------------------------------- */
const wageData = [
  { wage: 8.5, education: 10, experience: 1 },
  { wage: 10.2, education: 12, experience: 2 },
  { wage: 12.8, education: 14, experience: 3 },
  { wage: 15.1, education: 16, experience: 4 },
  { wage: 18.5, education: 18, experience: 6 },
  { wage: 11.3, education: 11, experience: 2 },
  { wage: 14.7, education: 15, experience: 3 },
  { wage: 17.2, education: 17, experience: 5 },
];

/* ------------------------------- Simple OLS function ---------------------------------- */
function runRegression(y: number[], X: number[][]) {
  // Add column of 1s for intercept
  const XwithIntercept = X.map((row) => [1, ...row]);
  const n = XwithIntercept.length;
  
  // Calculate coefficients: β = (X'X)^(-1)X'y
  const Xt = transpose(XwithIntercept);
  const XtX = multiply(Xt, XwithIntercept);
  const XtXinverse = invert2x2(XtX);
  const Xty = multiplyVector(Xt, y);
  const coefficients = multiplyVector(XtXinverse, Xty);

  // Calculate predictions and residuals
  const predictions = multiplyVector(XwithIntercept, coefficients);
  const residuals = y.map((yi, i) => yi - predictions[i]);
  
  // Calculate R-squared
  const yMean = mean(y);
  const totalSumSquares = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
  const rSquared = 1 - residualSumSquares / totalSumSquares;

  return { coefficients, predictions, residuals, rSquared, n };
}

/* ------------------------------ Simple chart component ------------------------------ */
function SimpleChart({ 
  points, 
  line, 
  xLabel, 
  yLabel, 
  width = 500, 
  height = 300 
}: {
  points: { x: number; y: number }[];
  line?: { slope: number; intercept: number };
  xLabel: string;
  yLabel: string;
  width?: number;
  height?: number;
}) {
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xValues = points.map(p => p.x);
  const yValues = points.map(p => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  return (
    <div className="bg-white rounded-lg border p-4">
      <svg width={width} height={height} className="border rounded">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#666" strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#666" strokeWidth={1} />
          
          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={5}
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth={1}
            />
          ))}
          
          {/* Regression line */}
          {line && (
            <line
              x1={0}
              y1={yScale(line.intercept + line.slope * xMin)}
              x2={innerW}
              y2={yScale(line.intercept + line.slope * xMax)}
              stroke="#ef4444"
              strokeWidth={2}
            />
          )}
          
          {/* Labels */}
          <text x={innerW / 2} y={innerH + 30} textAnchor="middle" className="text-sm font-medium">
            {xLabel}
          </text>
          <text 
            x={-innerH / 2} 
            y={-30} 
            textAnchor="middle" 
            transform={`rotate(-90, ${-innerH / 2}, -30)`}
            className="text-sm font-medium"
          >
            {yLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------ Main component ------------------------------ */
export default function SimpleOLSLab() {
  const [includeEducation, setIncludeEducation] = useState(true);
  const [includeExperience, setIncludeExperience] = useState(false);

  // Prepare data for regression
  const regressionData = useMemo(() => {
    const y = wageData.map(d => d.wage);
    const X: number[][] = wageData.map(d => {
      const row: number[] = [];
      if (includeEducation) row.push(d.education);
      if (includeExperience) row.push(d.experience);
      return row;
    });
    
    if (X[0].length === 0) return null;
    return { y, X };
  }, [includeEducation, includeExperience]);

  // Run regression
  const results = useMemo(() => {
    if (!regressionData) return null;
    return runRegression(regressionData.y, regressionData.X);
  }, [regressionData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!includeEducation || includeExperience) return null;
    
    const points = wageData.map(d => ({ x: d.education, y: d.wage }));
    const line = results ? {
      intercept: results.coefficients[0],
      slope: results.coefficients[1]
    } : undefined;
    
    return { points, line };
  }, [includeEducation, includeExperience, results]);

  // Prepare residuals chart
  const residualsData = useMemo(() => {
    if (!results) return null;
    return results.predictions.map((pred, i) => ({ 
      x: pred, 
      y: results.residuals[i] 
    }));
  }, [results]);

  const getVariableNames = () => {
    const names = ["Intercept"];
    if (includeEducation) names.push("Education");
    if (includeExperience) names.push("Experience");
    return names;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Learn OLS Regression
          </h1>
          <p className="text-lg text-gray-600">
            Explore how education and experience affect wages
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Your Variables</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeEducation}
                onChange={() => setIncludeEducation(!includeEducation)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span>Include Education (years)</span>
            </label>
            <label className="flex items-center gap-2 text-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeExperience}
                onChange={() => setIncludeExperience(!includeExperience)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span>Include Experience (years)</span>
            </label>
          </div>
        </div>

        {/* Results */}
        {!results ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-xl text-gray-600">
              Select at least one variable to run the regression!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Regression Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Regression Results</h2>
              
              {/* Equation */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-lg font-mono text-center">
                  Wage = {results.coefficients[0].toFixed(2)}
                  {includeEducation && ` + ${results.coefficients[1].toFixed(2)} × Education`}
                  {includeExperience && ` + ${results.coefficients[includeEducation ? 2 : 1].toFixed(2)} × Experience`}
                </div>
              </div>

              {/* Coefficients Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left font-semibold">Variable</th>
                      <th className="border p-3 text-right font-semibold">Coefficient</th>
                      <th className="border p-3 text-left font-semibold">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getVariableNames().map((name, i) => (
                      <tr key={name}>
                        <td className="border p-3 font-medium">{name}</td>
                        <td className="border p-3 text-right font-mono text-lg">
                          {results.coefficients[i].toFixed(3)}
                        </td>
                        <td className="border p-3 text-gray-700">
                          {i === 0 
                            ? "Base wage when other variables = 0"
                            : name === "Education"
                            ? "Each extra year of education increases wage by $" + results.coefficients[i].toFixed(2)
                            : "Each extra year of experience increases wage by $" + results.coefficients[i].toFixed(2)
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* R-squared */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-700">
                    {(results.rSquared * 100).toFixed(1)}%
                  </div>
                  <div className="text-blue-600 font-semibold">
                    R-squared (Variance Explained)
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {results.rSquared > 0.7 ? "Strong relationship!" : 
                     results.rSquared > 0.4 ? "Moderate relationship" : 
                     "Weak relationship"}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Scatter plot (only for education alone) */}
              {chartData && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Education vs Wage</h3>
                  <SimpleChart
                    points={chartData.points}
                    line={chartData.line}
                    xLabel="Years of Education"
                    yLabel="Hourly Wage ($)"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Blue dots = actual data, Red line = our regression line
                  </p>
                </div>
              )}

              {/* Residuals plot */}
              {residualsData && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">How Good is Our Model?</h3>
                  <SimpleChart
                    points={residualsData}
                    xLabel="Predicted Wage"
                    yLabel="Prediction Error"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Points close to zero = good predictions. Scattered randomly = good model!
                  </p>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Our Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Person</th>
                      <th className="border p-3 text-right">Wage ($/hour)</th>
                      <th className="border p-3 text-right">Education (years)</th>
                      <th className="border p-3 text-right">Experience (years)</th>
                      {results && (
                        <>
                          <th className="border p-3 text-right">Predicted Wage</th>
                          <th className="border p-3 text-right">Error</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {wageData.map((person, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="border p-3 font-medium">Person {i + 1}</td>
                        <td className="border p-3 text-right">${person.wage.toFixed(2)}</td>
                        <td className="border p-3 text-right">{person.education}</td>
                        <td className="border p-3 text-right">{person.experience}</td>
                        {results && (
                          <>
                            <td className="border p-3 text-right">${results.predictions[i].toFixed(2)}</td>
                            <td className="border p-3 text-right">
                              <span className={results.residuals[i] > 0 ? "text-green-600" : "text-red-600"}>
                                {results.residuals[i] > 0 ? "+" : ""}{results.residuals[i].toFixed(2)}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simple Explanation */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">🎓 What does this mean?</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Regression</strong> helps us find the best line through our data points.
                </p>
                <p>
                  <strong>Coefficients</strong> tell us how much wages change when education or experience increases by 1 year.
                </p>
                <p>
                  <strong>R-squared</strong> tells us what percentage of wage differences our model explains.
                </p>
                <p>
                  <strong>Residuals</strong> show how wrong our predictions are for each person.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}