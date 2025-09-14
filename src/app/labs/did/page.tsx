// // src/app/labs/did/page.tsx
// import Link from "next/link";

// export default function DiDLab() {
//   return (
//     <div className="py-10">
//       <div className="text-sm mb-3">
//         <Link href="/labs" className="opacity-70 hover:opacity-100">
//           ← Back to Labs
//         </Link>
//       </div>
//       <h1 className="text-2xl font-semibold">Difference-in-Differences Lab</h1>
//       <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
//         Toggle treatment timing and pretrends to see how the DiD estimate
//         changes. (Coming soon.)
//       </p>
//       <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
//         <p className="text-sm">
//           🚧 Placeholder. We’ll add a tiny panel generator and a simple DiD
//           regression with “parallel trends” on/off.
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Copy, Download, RefreshCw } from "lucide-react";

// Simple linear algebra functions
function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function runDiDRegression(data: PolicyData[]) {
  const n = data.length;
  
  // Create design matrix for: outcome = β0 + β1*treat + β2*post + β3*(treat*post)
  const y = data.map(d => d.outcome);
  const treat = data.map(d => d.treated ? 1 : 0);
  const post = data.map(d => d.period === "post" ? 1 : 0);
  const treatPost = data.map((d, i) => treat[i] * post[i]);
  
  // Calculate means for each group-time combination
  const preTreat = data.filter(d => d.treated && d.period === "pre").map(d => d.outcome);
  const preControl = data.filter(d => !d.treated && d.period === "pre").map(d => d.outcome);
  const postTreat = data.filter(d => d.treated && d.period === "post").map(d => d.outcome);
  const postControl = data.filter(d => !d.treated && d.period === "post").map(d => d.outcome);
  
  const meanPreTreat = mean(preTreat);
  const meanPreControl = mean(preControl);
  const meanPostTreat = mean(postTreat);
  const meanPostControl = mean(postControl);
  
  // Calculate DiD estimate manually
  const firstDiff = meanPostTreat - meanPreTreat; // Change in treatment group
  const secondDiff = meanPostControl - meanPreControl; // Change in control group
  const didEstimate = firstDiff - secondDiff; // Difference-in-differences
  
  // Simple OLS calculation for coefficients
  const meanY = mean(y);
  const meanTreat = mean(treat);
  const meanPost = mean(post);
  const meanTreatPost = mean(treatPost);
  
  // Calculate coefficients (simplified - normally would use matrix algebra)
  const beta3 = didEstimate; // This is our DiD coefficient
  const beta0 = meanPreControl; // Intercept (control group, pre-period)
  const beta1 = meanPreTreat - meanPreControl; // Baseline difference
  const beta2 = secondDiff; // Time trend in control group
  
  return {
    coefficients: [beta0, beta1, beta2, beta3],
    groupMeans: {
      preTreat: meanPreTreat,
      preControl: meanPreControl,
      postTreat: meanPostTreat,
      postControl: meanPostControl
    },
    didEstimate,
    firstDiff,
    secondDiff
  };
}

type PolicyData = {
  id: number;
  treated: boolean;
  period: "pre" | "post";
  outcome: number;
  group: string;
};

// Generate sample data
function generateData(
  treatmentEffect: number,
  baselineDiff: number,
  timeTrend: number,
  noise: number = 1
): PolicyData[] {
  const data: PolicyData[] = [];
  let id = 1;
  
  // Control group baseline
  const controlBaseline = 50;
  
  // Generate data for each group-time combination
  for (const treated of [false, true]) {
    for (const period of ["pre", "post"] as const) {
      for (let i = 0; i < 25; i++) {
        let outcome = controlBaseline;
        
        // Add baseline difference for treatment group
        if (treated) {
          outcome += baselineDiff;
        }
        
        // Add time trend
        if (period === "post") {
          outcome += timeTrend;
        }
        
        // Add treatment effect (only for treated units in post period)
        if (treated && period === "post") {
          outcome += treatmentEffect;
        }
        
        // Add noise
        outcome += (Math.random() - 0.5) * noise * 2;
        
        data.push({
          id: id++,
          treated,
          period,
          outcome: Math.round(outcome * 10) / 10,
          group: treated ? "Treatment" : "Control"
        });
      }
    }
  }
  
  return data;
}

// Chart component
function DiDChart({ 
  data, 
  width = 600, 
  height = 400 
}: {
  data: PolicyData[];
  width?: number;
  height?: number;
}) {
  const margin = { top: 40, right: 60, bottom: 60, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Calculate group means
  const groupMeans = useMemo(() => {
    const preTreat = data.filter(d => d.treated && d.period === "pre").map(d => d.outcome);
    const preControl = data.filter(d => !d.treated && d.period === "pre").map(d => d.outcome);
    const postTreat = data.filter(d => d.treated && d.period === "post").map(d => d.outcome);
    const postControl = data.filter(d => !d.treated && d.period === "post").map(d => d.outcome);
    
    return {
      preTreat: mean(preTreat),
      preControl: mean(preControl),
      postTreat: mean(postTreat),
      postControl: mean(postControl)
    };
  }, [data]);

  const yMin = Math.min(...data.map(d => d.outcome)) - 5;
  const yMax = Math.max(...data.map(d => d.outcome)) + 5;
  
  const xScale = (period: string) => period === "pre" ? innerW * 0.25 : innerW * 0.75;
  const yScale = (y: number) => innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold mb-4 text-center">Difference-in-Differences Visualization</h3>
      <svg width={width} height={height} className="border rounded">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#666" strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#666" strokeWidth={1} />
          
          {/* Scatter points */}
          {data.map((point, i) => (
            <circle
              key={i}
              cx={xScale(point.period)}
              cy={yScale(point.outcome)}
              r={3}
              fill={point.treated ? "#3b82f6" : "#ef4444"}
              fillOpacity={0.6}
            />
          ))}
          
          {/* Group means */}
          <circle cx={xScale("pre")} cy={yScale(groupMeans.preControl)} r={8} fill="#ef4444" stroke="#dc2626" strokeWidth={2} />
          <circle cx={xScale("post")} cy={yScale(groupMeans.postControl)} r={8} fill="#ef4444" stroke="#dc2626" strokeWidth={2} />
          <circle cx={xScale("pre")} cy={yScale(groupMeans.preTreat)} r={8} fill="#3b82f6" stroke="#2563eb" strokeWidth={2} />
          <circle cx={xScale("post")} cy={yScale(groupMeans.postTreat)} r={8} fill="#3b82f6" stroke="#2563eb" strokeWidth={2} />
          
          {/* Trend lines */}
          <line 
            x1={xScale("pre")} y1={yScale(groupMeans.preControl)}
            x2={xScale("post")} y2={yScale(groupMeans.postControl)}
            stroke="#ef4444" strokeWidth={3}
          />
          <line 
            x1={xScale("pre")} y1={yScale(groupMeans.preTreat)}
            x2={xScale("post")} y2={yScale(groupMeans.postTreat)}
            stroke="#3b82f6" strokeWidth={3}
          />
          
          {/* Counterfactual line (dashed) */}
          <line 
            x1={xScale("pre")} y1={yScale(groupMeans.preTreat)}
            x2={xScale("post")} y2={yScale(groupMeans.preTreat + (groupMeans.postControl - groupMeans.preControl))}
            stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,5" opacity={0.7}
          />
          
          {/* Labels */}
          <text x={xScale("pre")} y={innerH + 25} textAnchor="middle" className="text-sm font-medium fill-slate-700">
            Pre-Policy
          </text>
          <text x={xScale("post")} y={innerH + 25} textAnchor="middle" className="text-sm font-medium fill-slate-700">
            Post-Policy
          </text>
          <text 
            x={-35} y={innerH / 2} 
            textAnchor="middle" 
            transform={`rotate(-90, -35, ${innerH / 2})`}
            className="text-sm font-medium fill-slate-700"
          >
            Outcome
          </text>
          
          {/* Legend */}
          <g transform={`translate(${innerW - 120}, 20)`}>
            <circle cx={10} cy={5} r={5} fill="#ef4444" />
            <text x={20} y={9} className="text-xs fill-slate-700">Control Group</text>
            <circle cx={10} cy={25} r={5} fill="#3b82f6" />
            <text x={20} y={29} className="text-xs fill-slate-700">Treatment Group</text>
            <line x1={5} y1={45} x2={15} y2={45} stroke="#3b82f6" strokeWidth={2} strokeDasharray="2,2" />
            <text x={20} y={49} className="text-xs fill-slate-700">Counterfactual</text>
          </g>
          
        </g>
      </svg>
    </div>
  );
}

export default function DiDLab() {
  const [treatmentEffect, setTreatmentEffect] = useState(5);
  const [baselineDiff, setBaselineDiff] = useState(0);
  const [timeTrend, setTimeTrend] = useState(2);
  const [showCode, setShowCode] = useState(false);

  // Generate data based on parameters
  const data = useMemo(() => 
    generateData(treatmentEffect, baselineDiff, timeTrend), 
    [treatmentEffect, baselineDiff, timeTrend]
  );

  // Run regression
  const results = useMemo(() => runDiDRegression(data), [data]);

  const handleCopyCode = useCallback(() => {
    const stataCode = `* Difference-in-Differences Analysis
clear all

* Generate sample data (replace with your actual dataset)
use "your_data.dta", clear

* Basic DiD regression: outcome on treatment*post interaction
regress outcome i.treated##i.post, vce(robust)

* Extract treatment effect
lincom 1.treated#1.post

* Display group means for verification
tabstat outcome, by(treated post) statistics(mean)

* Event study specification (if multiple periods available)
* regress outcome i.treated##i.period, vce(cluster id)`;
    
    navigator.clipboard.writeText(stataCode);
  }, []);

  const resetToDefaults = useCallback(() => {
    setTreatmentEffect(5);
    setBaselineDiff(0);
    setTimeTrend(2);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
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

        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Difference-in-Differences Lab
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Explore how DiD identifies causal effects by comparing changes over time between treatment and control groups. 
            Adjust parameters to see how parallel trends and treatment timing affect your estimates.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Experiment Controls</h2>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    True Treatment Effect: <span className="text-blue-600">{treatmentEffect}</span>
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="15"
                    step="0.5"
                    value={treatmentEffect}
                    onChange={(e) => setTreatmentEffect(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-10</span>
                    <span>15</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    The actual causal effect of the policy intervention
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Baseline Group Difference: <span className="text-amber-600">{baselineDiff}</span>
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={baselineDiff}
                    onChange={(e) => setBaselineDiff(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-10</span>
                    <span>10</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Pre-existing difference between treatment and control groups
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Common Time Trend: <span className="text-green-600">{timeTrend}</span>
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="8"
                    step="0.5"
                    value={timeTrend}
                    onChange={(e) => setTimeTrend(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-5</span>
                    <span>8</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Change over time that affects both groups equally (parallel trends)
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Quick Experiments</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setTreatmentEffect(0); setBaselineDiff(0); setTimeTrend(0); }}
                    className="w-full p-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    No Effects Scenario
                  </button>
                  <button
                    onClick={() => { setTreatmentEffect(8); setBaselineDiff(-3); setTimeTrend(4); }}
                    className="w-full p-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                  >
                    Strong Treatment Effect
                  </button>
                  <button
                    onClick={() => { setTreatmentEffect(2); setBaselineDiff(5); setTimeTrend(-2); }}
                    className="w-full p-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                  >
                    Challenging Identification
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            
            {/* Visualization */}
            <DiDChart data={data} />

            {/* Results */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">DiD Regression Results</h3>
              
              {/* Key Results */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {results.didEstimate.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">DiD Estimate</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Estimated treatment effect
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.abs(results.didEstimate - treatmentEffect).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Estimation Error</div>
                  <div className="text-xs text-slate-600 mt-1">
                    |Estimate - True Effect|
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">
                    {((1 - Math.abs(results.didEstimate - treatmentEffect) / Math.max(Math.abs(treatmentEffect), 1)) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Accuracy</div>
                  <div className="text-xs text-slate-600 mt-1">
                    How close to true effect
                  </div>
                </div>
              </div>

              {/* Group Means Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left p-3 font-semibold">Group</th>
                      <th className="text-right p-3 font-semibold">Pre-Policy</th>
                      <th className="text-right p-3 font-semibold">Post-Policy</th>
                      <th className="text-right p-3 font-semibold">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium text-red-700">Control</td>
                      <td className="p-3 text-right font-mono">{results.groupMeans.preControl.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">{results.groupMeans.postControl.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">{results.secondDiff.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium text-blue-700">Treatment</td>
                      <td className="p-3 text-right font-mono">{results.groupMeans.preTreat.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">{results.groupMeans.postTreat.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">{results.firstDiff.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50 font-semibold">
                      <td className="p-3">Difference-in-Differences</td>
                      <td className="p-3 text-right">—</td>
                      <td className="p-3 text-right">—</td>
                      <td className="p-3 text-right font-mono text-blue-700">{results.didEstimate.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-xs text-slate-600">
                <strong>DiD Logic:</strong> Treatment effect = Change in treatment group ({results.firstDiff.toFixed(2)}) 
                - Change in control group ({results.secondDiff.toFixed(2)}) = {results.didEstimate.toFixed(2)}
              </div>
            </div>

            {/* Interpretation Guide */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">Key DiD Concepts</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Parallel Trends Assumption</h4>
                  <p className="text-sm text-amber-700">
                    Without treatment, both groups would have followed the same time trend. 
                    The dashed line shows what would have happened to the treatment group.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Identification Strategy</h4>
                  <p className="text-sm text-amber-700">
                    DiD differences away time-invariant group differences and common time trends 
                    to isolate the causal effect of treatment.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Try This:</strong> Set baseline difference to 0 and time trend to 0. 
                  Now DiD = simple difference in post-period means. Add complexity to see why DiD is needed!
                </p>
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
                    <code>{`* Difference-in-Differences Analysis
clear all

* Load your data (replace with your actual dataset)
use "your_data.dta", clear

* Basic DiD regression: outcome on treatment*post interaction  
regress outcome i.treated##i.post, vce(robust)

* The coefficient on 1.treated#1.post is your DiD estimate
* This gives you: β₀ + β₁×treated + β₂×post + β₃×(treated×post)

* Extract treatment effect with confidence interval
lincom 1.treated#1.post

* Verify with group means (should match your calculation)
tabstat outcome, by(treated post) statistics(mean n)

* Event study specification (if multiple time periods)
* regress outcome i.treated##i.period, vce(cluster id)
* coefplot, keep(*.treated#*.period) vertical

* Test parallel trends (if pre-treatment periods available)
* regress outcome i.treated##i.year if year <= policy_year, vce(cluster id)
* test interaction coefficients = 0`}</code>
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
          <h3 className="text-2xl font-bold mb-4">Ready for More Advanced Methods?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Try our other interactive labs to master instrumental variables, regression discontinuity, 
            and panel fixed effects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/labs/iv"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Try IV Lab Next
            </Link>
            <Link
              href="/concepts/difference-in-differences"
              className="px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold"
            >
              Learn DiD Theory
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}