// // src/app/labs/rd/page.tsx
// import Link from "next/link";

// export default function RDLab() {
//   return (
//     <div className="py-10">
//       <div className="text-sm mb-3">
//         <Link href="/labs" className="opacity-70 hover:opacity-100">
//           ← Back to Labs
//         </Link>
//       </div>
//       <h1 className="text-2xl font-semibold">Regression Discontinuity Lab</h1>
//       <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
//         Move the cutoff and bandwidth; check local effects and balance. (Coming soon.)
//       </p>
//       <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
//         <p className="text-sm">
//           🚧 Placeholder. We’ll add a simple plot and local linear fit near a
//           threshold with sliders for cutoff and bandwidth.
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Copy, RefreshCw, AlertTriangle, TrendingUp } from "lucide-react";

interface RDResults {
  rdEstimate: number;
  simpleDiff: number;
  treatmentGroup: {
    n: number;
    mean: number;
    regression: { slope: number; intercept: number };
  };
  controlGroup: {
    n: number;
    mean: number;
    regression: { slope: number; intercept: number };
  };
  bandwidth: number;
  totalN: number;
}

// Simple statistics functions
function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function linearRegression(x: number[], y: number[]) {
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominator += (x[i] - meanX) ** 2;
  }
  
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  
  return { slope, intercept };
}

// RD estimation function
function runRD(data: StudentData[], cutoff: number, bandwidth: number) {
  // Filter data to bandwidth window
  const windowData = data.filter(d => 
    Math.abs(d.gaokaoScore - cutoff) <= bandwidth
  );
  
  if (windowData.length < 10) {
    return null; // Too few observations
  }
  
  // Center scores around cutoff
  const centeredData = windowData.map(d => ({
    ...d,
    centeredScore: d.gaokaoScore - cutoff
  }));
  
  // Split into treated and control groups
  const treated = centeredData.filter(d => d.gaokaoScore >= cutoff);
  const control = centeredData.filter(d => d.gaokaoScore < cutoff);
  
  // Local linear regression on each side
  const treatX = treated.map(d => d.centeredScore);
  const treatY = treated.map(d => d.outcome);
  const controlX = control.map(d => d.centeredScore);
  const controlY = control.map(d => d.outcome);
  
  if (treatX.length === 0 || controlX.length === 0) {
    return null;
  }
  
  const treatReg = linearRegression(treatX, treatY);
  const controlReg = linearRegression(controlX, controlY);
  
  // RD estimate is the difference at the cutoff
  const rdEstimate = treatReg.intercept - controlReg.intercept;
  
  // Calculate means on each side for simple comparison
  const treatMean = mean(treatY);
  const controlMean = mean(controlY);
  const simpleDiff = treatMean - controlMean;
  
  return {
    rdEstimate,
    simpleDiff,
    treatmentGroup: {
      n: treated.length,
      mean: treatMean,
      regression: treatReg
    },
    controlGroup: {
      n: control.length,
      mean: controlMean,
      regression: controlReg
    },
    bandwidth,
    totalN: windowData.length
  };
}

type StudentData = {
  id: number;
  gaokaoScore: number;
  eliteCollege: boolean;
  outcome: number; // Future income in thousands
};

// Generate sample data for Gaokao RD
function generateGaokaoData(
  cutoff: number,
  rdEffect: number,
  polynomialDegree: number,
  noiseLevel: number,
  manipulation: number
): StudentData[] {
  const data: StudentData[] = [];
  
  for (let i = 0; i < 2000; i++) {
    let gaokaoScore: number;
    
    // Generate scores with potential manipulation around cutoff
    if (manipulation > 0 && Math.random() < 0.1) {
      // Some students manipulate scores to just above cutoff
      gaokaoScore = cutoff + Math.random() * manipulation;
    } else {
      // Normal distribution of scores centered around 550
      gaokaoScore = 400 + Math.random() * 300;
      // Add some noise
      gaokaoScore += (Math.random() - 0.5) * 50;
    }
    
    // Ensure scores are within reasonable bounds
    gaokaoScore = Math.max(300, Math.min(700, gaokaoScore));
    
    // Elite college admission based on cutoff
    const eliteCollege = gaokaoScore >= cutoff;
    
    // Generate outcome (future income) with RD effect
    let outcome = 30; // Base income
    
    // Smooth relationship with Gaokao score (polynomial)
    const normalizedScore = (gaokaoScore - 500) / 100;
    if (polynomialDegree === 1) {
      outcome += 8 * normalizedScore;
    } else if (polynomialDegree === 2) {
      outcome += 8 * normalizedScore + 2 * normalizedScore ** 2;
    } else {
      outcome += 8 * normalizedScore + 2 * normalizedScore ** 2 - 0.5 * normalizedScore ** 3;
    }
    
    // Add RD treatment effect for elite college
    if (eliteCollege) {
      outcome += rdEffect;
    }
    
    // Add random noise
    outcome += (Math.random() - 0.5) * noiseLevel;
    
    // Ensure positive income
    outcome = Math.max(15, outcome);
    
    data.push({
      id: i + 1,
      gaokaoScore: Math.round(gaokaoScore),
      eliteCollege,
      outcome: Math.round(outcome * 10) / 10
    });
  }
  
  return data.sort((a, b) => a.gaokaoScore - b.gaokaoScore);
}

// RD Plot component
function RDPlot({ 
  data, 
  cutoff, 
  bandwidth, 
  rdResults,
  width = 700, 
  height = 450 
}: {
  data: StudentData[];
  cutoff: number;
  bandwidth: number;
  rdResults: RDResults;
  width?: number;
  height?: number;
}) {
  const margin = { top: 40, right: 60, bottom: 60, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Filter to bandwidth for main analysis
  const windowData = data.filter(d => 
    Math.abs(d.gaokaoScore - cutoff) <= bandwidth
  );

  const xMin = cutoff - bandwidth;
  const xMax = cutoff + bandwidth;
  const yMin = Math.min(...windowData.map(d => d.outcome)) - 5;
  const yMax = Math.max(...windowData.map(d => d.outcome)) + 5;
  
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold mb-4 text-center">
        RD Plot: Elite College Admission and Future Income
      </h3>
      <svg width={width} height={height} className="border rounded">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Cutoff line */}
          <line 
            x1={xScale(cutoff)} y1={0}
            x2={xScale(cutoff)} y2={innerH}
            stroke="#f97316" strokeWidth={3} strokeDasharray="6,6"
          />
          <text 
            x={xScale(cutoff)} y={-8}
            textAnchor="middle" 
            className="text-sm fill-orange-600 font-semibold"
          >
            Cutoff: {cutoff}
          </text>
          
          {/* Bandwidth shading */}
          <rect
            x={0} y={0}
            width={innerW} height={innerH}
            fill="blue" fillOpacity={0.05}
          />
          
          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#666" strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#666" strokeWidth={1} />
          
          {/* Data points */}
          {windowData.map((point, i) => (
            <circle
              key={i}
              cx={xScale(point.gaokaoScore)}
              cy={yScale(point.outcome)}
              r={2}
              fill={point.eliteCollege ? "#3b82f6" : "#ef4444"}
              fillOpacity={0.6}
            />
          ))}
          
          {/* Regression lines */}
          {rdResults && (
            <>
              {/* Control group line (left of cutoff) */}
              <line
                x1={xScale(xMin)}
                y1={yScale(rdResults.controlGroup.regression.intercept + rdResults.controlGroup.regression.slope * (xMin - cutoff))}
                x2={xScale(cutoff)}
                y2={yScale(rdResults.controlGroup.regression.intercept)}
                stroke="#ef4444" strokeWidth={3}
              />
              
              {/* Treatment group line (right of cutoff) */}
              <line
                x1={xScale(cutoff)}
                y1={yScale(rdResults.treatmentGroup.regression.intercept)}
                x2={xScale(xMax)}
                y2={yScale(rdResults.treatmentGroup.regression.intercept + rdResults.treatmentGroup.regression.slope * (xMax - cutoff))}
                stroke="#3b82f6" strokeWidth={3}
              />
              
              {/* RD effect arrow */}
              <line
                x1={xScale(cutoff) + 2}
                y1={yScale(rdResults.controlGroup.regression.intercept)}
                x2={xScale(cutoff) + 2}
                y2={yScale(rdResults.treatmentGroup.regression.intercept)}
                stroke="#16a34a" strokeWidth={4}
                markerEnd="url(#arrowhead)"
              />
              
              {/* Effect size label */}
              <text
                x={xScale(cutoff) + 15}
                y={yScale((rdResults.controlGroup.regression.intercept + rdResults.treatmentGroup.regression.intercept) / 2)}
                className="text-sm font-semibold fill-green-700"
              >
                RD = {rdResults.rdEstimate.toFixed(1)}
              </text>
            </>
          )}
          
          {/* Axis labels */}
          <text x={innerW / 2} y={innerH + 40} textAnchor="middle" className="text-sm font-semibold fill-slate-700">
            Gaokao Score (National College Entrance Exam)
          </text>
          <text 
            x={-innerH / 2} y={-35} 
            textAnchor="middle" 
            transform={`rotate(-90, ${-innerH / 2}, -35)`}
            className="text-sm font-semibold fill-slate-700"
          >
            Future Annual Income (10k RMB)
          </text>
          
          {/* Legend */}
          <g transform={`translate(${innerW - 150}, 20)`}>
            <circle cx={10} cy={5} r={4} fill="#ef4444" />
            <text x={20} y={9} className="text-xs fill-slate-700">Regular College</text>
            <circle cx={10} cy={25} r={4} fill="#3b82f6" />
            <text x={20} y={29} className="text-xs fill-slate-700">Elite College</text>
          </g>
          
        </g>
        
        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
           refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#16a34a" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function RDLab() {
  const [cutoff, setCutoff] = useState(580);
  const [rdEffect, setRdEffect] = useState(8);
  const [polynomialDegree, setPolynomialDegree] = useState(1);
  const [bandwidth, setBandwidth] = useState(40);
  const [noiseLevel, setNoiseLevel] = useState(8);
  const [manipulation, setManipulation] = useState(0);
  const [showCode, setShowCode] = useState(false);

  // Generate data
  const data = useMemo(() => 
    generateGaokaoData(cutoff, rdEffect, polynomialDegree, noiseLevel, manipulation), 
    [cutoff, rdEffect, polynomialDegree, noiseLevel, manipulation]
  );

  // Run RD analysis
  const rdResults = useMemo(() => 
    runRD(data, cutoff, bandwidth), 
    [data, cutoff, bandwidth]
  );

  const handleCopyCode = useCallback(() => {
    const stataCode = `* Regression Discontinuity: Gaokao Cutoff and Elite College
clear all
use "gaokao_data.dta", clear

* Generate treatment indicator and centered running variable
generate elite_college = (gaokao_score >= ${cutoff})
generate centered_score = gaokao_score - ${cutoff}

* Descriptive statistics around cutoff
tabulate elite_college if abs(centered_score) <= ${bandwidth}
summarize future_income gaokao_score if abs(centered_score) <= ${bandwidth}

* Basic RD regression (local linear with triangular kernel)
rdrobust future_income gaokao_score, c(${cutoff}) p(1) kernel(triangular)

* Manual RD estimation for comparison
regress future_income i.elite_college##c.centered_score ///
    if abs(centered_score) <= ${bandwidth}, vce(robust)
    
* Extract RD estimate
lincom 1.elite_college

* Sensitivity analysis: different bandwidths
foreach bw in 20 30 40 50 60 {
    rdrobust future_income gaokao_score, c(${cutoff}) h(\`bw') p(1)
    matrix results[\`bw', 1] = e(tau_cl)
    matrix results[\`bw', 2] = e(ci_l_cl) 
    matrix results[\`bw', 3] = e(ci_r_cl)
}

* Test for manipulation around cutoff (McCrary test)
rddensity gaokao_score, c(${cutoff}) plot

* Covariate balance tests
foreach var of varlist parent_income age urban {
    rdrobust \`var' gaokao_score, c(${cutoff})
}

* Visualization
rdplot future_income gaokao_score, c(${cutoff}) ///
    title("RD Plot: Elite College and Future Income") ///
    xtitle("Gaokao Score") ytitle("Future Income (10k RMB)")`;
    
    navigator.clipboard.writeText(stataCode);
  }, [cutoff, bandwidth]);

  const resetToDefaults = useCallback(() => {
    setCutoff(580);
    setRdEffect(8);
    setPolynomialDegree(1);
    setBandwidth(40);
    setNoiseLevel(8);
    setManipulation(0);
  }, []);

  // Calculate some basic stats
  const statsAboveCutoff = data.filter(d => d.gaokaoScore >= cutoff);
  const statsBelowCutoff = data.filter(d => d.gaokaoScore < cutoff);
  const admissionRate = (statsAboveCutoff.filter(d => d.eliteCollege).length / Math.max(1, statsAboveCutoff.length)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link 
            href="/labs" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={16} />
            Back to Labs
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Regression Discontinuity Lab
          </h1>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto">
            Explore how Gaokao score cutoffs create quasi-random assignment to elite colleges. 
            Adjust parameters to understand bandwidth selection, functional form, and potential manipulation issues in RD designs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800">RD Parameters</h2>
                <button
                  onClick={resetToDefaults}
                  className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Reset to defaults"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cutoff Score: <span className="text-orange-600">{cutoff}</span>
                  </label>
                  <input
                    type="range"
                    min="520"
                    max="630"
                    step="5"
                    value={cutoff}
                    onChange={(e) => setCutoff(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>520</span>
                    <span>630</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Minimum Gaokao score for elite college admission
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    True RD Effect: <span className="text-green-600">{rdEffect}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={rdEffect}
                    onChange={(e) => setRdEffect(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0</span>
                    <span>20</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Elite college income premium (10k RMB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bandwidth: <span className="text-blue-600">{bandwidth}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={bandwidth}
                    onChange={(e) => setBandwidth(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10</span>
                    <span>80</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Analysis window around cutoff (±{bandwidth} points)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Functional Form: 
                  </label>
                  <select
                    value={polynomialDegree}
                    onChange={(e) => setPolynomialDegree(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value={1}>Linear</option>
                    <option value={2}>Quadratic</option>
                    <option value={3}>Cubic</option>
                  </select>
                  <p className="text-xs text-slate-600 mt-1">
                    True relationship between score and income
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Noise Level: <span className="text-purple-600">{noiseLevel}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>2</span>
                    <span>15</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Score Manipulation: <span className="text-red-600">{manipulation}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="2"
                    value={manipulation}
                    onChange={(e) => setManipulation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0</span>
                    <span>20</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Some students manipulate scores above cutoff
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Scenarios</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setRdEffect(12); setBandwidth(30); setPolynomialDegree(1); setManipulation(0); }}
                    className="w-full p-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                  >
                    Clean RD Design
                  </button>
                  <button
                    onClick={() => { setRdEffect(5); setBandwidth(60); setPolynomialDegree(3); setManipulation(0); }}
                    className="w-full p-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                  >
                    Wrong Functional Form
                  </button>
                  <button
                    onClick={() => { setRdEffect(8); setBandwidth(40); setPolynomialDegree(1); setManipulation(15); }}
                    className="w-full p-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                  >
                    Manipulation Problem
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 space-y-8"
          >
            
            {rdResults ? (
              <RDPlot 
                data={data} 
                cutoff={cutoff} 
                bandwidth={bandwidth}
                rdResults={rdResults}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Insufficient Data</h3>
                <p className="text-slate-600">Increase bandwidth to get enough observations for analysis.</p>
              </div>
            )}

            {rdResults && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">RD Results</h3>
                
                {manipulation > 10 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-red-800">Potential Manipulation Detected</div>
                      <div className="text-sm text-red-700 mt-1">
                        Score manipulation around the cutoff may bias RD estimates. 
                        Consider testing for bunching and covariate balance.
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {rdResults.rdEstimate.toFixed(1)}
                    </div>
                    <div className="text-sm text-green-600 font-medium">RD Estimate</div>
                    <div className="text-xs text-slate-600">
                      10k RMB income gain
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      {Math.abs(rdResults.rdEstimate - rdEffect).toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Estimation Error</div>
                    <div className="text-xs text-slate-600">
                      |Estimate - True|
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      {rdResults.totalN}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Sample Size</div>
                    <div className="text-xs text-slate-600">
                      ±{bandwidth} bandwidth
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700">
                      {admissionRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-amber-600 font-medium">Elite Admission</div>
                    <div className="text-xs text-slate-600">
                      Above cutoff rate
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">RD Validation</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Bandwidth:</span>
                        <span className="font-mono">±{bandwidth} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Simple Difference:</span>
                        <span className="font-mono">{rdResults.simpleDiff.toFixed(1)} 万元</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Local Linear RD:</span>
                        <span className="font-mono">{rdResults.rdEstimate.toFixed(1)} 万元</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimation Accuracy:</span>
                        <span className={`font-mono ${Math.abs(rdResults.rdEstimate - rdEffect) < 2 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(rdResults.rdEstimate - rdEffect) < 2 ? 'Good' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chinese Context */}
            <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Understanding the Gaokao Context</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-red-700 mb-2">RD Design Logic</h4>
                  <p className="text-sm text-red-800">
                    Gaokao creates sharp cutoffs for elite university admission. Students just above vs. below 
                    the cutoff are similar in all characteristics except college quality, making this a credible 
                    natural experiment.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Key Assumptions</h4>
                  <p className="text-sm text-red-800">
                    Students cannot precisely manipulate their Gaokao score around the cutoff. 
                    The outcome (future income) changes smoothly except for the treatment effect.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Policy Relevance:</strong> RD estimates can inform debates about education inequality, 
                  university resource allocation, and the returns to elite education in China.
                </p>
              </div>
            </div>

            {/* Interpretation Guide */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">RD Best Practices</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-700 mb-3">Bandwidth Selection</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Too narrow:</strong> Small sample, large standard errors</li>
                    <li>• <strong>Too wide:</strong> Bias from functional form misspecification</li>
                    <li>• <strong>Optimal:</strong> Use data-driven methods (Imbens-Kalyanaraman)</li>
                    <li>• <strong>Robustness:</strong> Show results across multiple bandwidths</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-3">Validity Tests</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Manipulation:</strong> McCrary density test around cutoff</li>
                    <li>• <strong>Balance:</strong> Predetermined characteristics smooth at cutoff</li>
                    <li>• <strong>Functional form:</strong> Try different polynomial orders</li>
                    <li>• <strong>Placebo:</strong> Test fake cutoffs away from true threshold</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Code Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold">Stata Implementation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Copy size={14} />
                    Copy Code
                  </button>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Play size={14} />
                    {showCode ? "Hide" : "Show"} Code
                  </button>
                </div>
              </div>
              
              {showCode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="p-6 bg-slate-50"
                >
                  <pre className="text-sm overflow-x-auto">
                    <code>{`* Regression Discontinuity: Gaokao Cutoff and Elite College
clear all
use "gaokao_data.dta", clear

* Generate treatment indicator and centered running variable
generate elite_college = (gaokao_score >= ${cutoff})
generate centered_score = gaokao_score - ${cutoff}

* Descriptive statistics around cutoff
tabulate elite_college if abs(centered_score) <= ${bandwidth}
summarize future_income gaokao_score if abs(centered_score) <= ${bandwidth}, detail

* Basic RD regression with optimal bandwidth (requires rdrobust)
* ssc install rdrobust, replace
rdrobust future_income gaokao_score, c(${cutoff}) p(1) kernel(triangular)

* Manual RD estimation for transparency
regress future_income i.elite_college##c.centered_score ///
    if abs(centered_score) <= ${bandwidth}, vce(robust)
    
* Extract RD estimate (coefficient on elite_college)
lincom 1.elite_college
display "RD Estimate: " %6.2f _b[1.elite_college] " (10k RMB)"

* Sensitivity analysis: different bandwidths
matrix results = J(5, 3, .)
local row = 1
foreach bw in 20 30 40 50 60 {
    quietly rdrobust future_income gaokao_score, c(${cutoff}) h(\`bw') p(1)
    matrix results[\`row', 1] = e(tau_cl)
    matrix results[\`row', 2] = e(ci_l_cl) 
    matrix results[\`row', 3] = e(ci_r_cl)
    local ++row
}
matrix colnames results = "RD_Effect" "CI_Lower" "CI_Upper"
matrix rownames results = "BW=20" "BW=30" "BW=40" "BW=50" "BW=60"
matrix list results

* Test for manipulation around cutoff (McCrary density test)
rddensity gaokao_score, c(${cutoff}) plot
* H0: No manipulation if p > 0.05

* Covariate balance tests (placebo outcomes)
foreach var of varlist parent_income family_size urban_hukou {
    quietly rdrobust \`var' gaokao_score, c(${cutoff})
    display "Balance test for \`var': " %6.3f e(pv_cl)
}

* Placebo cutoff tests (should find no effects)
foreach fake_cutoff in ${cutoff-30} ${cutoff+30} {
    quietly rdrobust future_income gaokao_score, c(\`fake_cutoff')
    display "Placebo test at \`fake_cutoff': " %6.3f e(pv_cl)
}

* Visualization with confidence intervals
rdplot future_income gaokao_score, c(${cutoff}) ///
    title("RD Plot: Elite College Effect on Future Income", size(medium)) ///
    xtitle("Gaokao Score", size(small)) ///
    ytitle("Future Annual Income (10k RMB)", size(small)) ///
    graph_options(scheme(s2color))

* Export results for reporting
outreg2 using "rd_results.tex", tex replace ///
    title("Regression Discontinuity Results") ///
    addtext("Cutoff", "${cutoff}", "Bandwidth", "${bandwidth}")`}</code>
                  </pre>
                </motion.div>
              )}
            </div>

          </motion.div>
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Explore More Causal Inference Methods</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            RD is just one tool in the causal inference toolkit. Compare it with other quasi-experimental 
            methods to understand when each design is most appropriate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/labs/did"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Try Difference-in-Differences
            </Link>
            <Link
              href="/labs/iv"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Explore Instrumental Variables
            </Link>
            <Link
              href="/concepts/regression-discontinuity"
              className="px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold"
            >
              Learn RD Theory
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}