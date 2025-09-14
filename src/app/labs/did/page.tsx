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
import { ArrowLeft, Play, Copy, RefreshCw, AlertTriangle } from "lucide-react";

// Simple linear algebra functions
function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function runDiDRegression(data: PolicyData[]) {
  // Basic DiD with post-policy periods only
  const postData = data.filter(d => d.period >= 0);
  const preData = data.filter(d => d.period < 0);
  
  // Calculate group means for pre and post
  const preTreat = preData.filter(d => d.treated).map(d => d.outcome);
  const preControl = preData.filter(d => !d.treated).map(d => d.outcome);
  const postTreat = postData.filter(d => d.treated).map(d => d.outcome);
  const postControl = postData.filter(d => !d.treated).map(d => d.outcome);
  
  const meanPreTreat = mean(preTreat);
  const meanPreControl = mean(preControl);
  const meanPostTreat = mean(postTreat);
  const meanPostControl = mean(postControl);
  
  // Calculate DiD estimate
  const firstDiff = meanPostTreat - meanPreTreat;
  const secondDiff = meanPostControl - meanPreControl;
  const didEstimate = firstDiff - secondDiff;
  
  // Pre-trends test: calculate differential trends in pre-periods
  const prePeriods = [-3, -2, -1];
  const preTrendData = data.filter(d => prePeriods.includes(d.period));
  
  let preTrendTest = 0;
  if (preTrendData.length > 0) {
    // Calculate slope difference between treatment and control in pre-periods
    const treatPre = preTrendData.filter(d => d.treated);
    const controlPre = preTrendData.filter(d => !d.treated);
    
    // Simple slope calculation for each group
    const treatSlope = calculateSlope(treatPre);
    const controlSlope = calculateSlope(controlPre);
    
    preTrendTest = Math.abs(treatSlope - controlSlope);
  }
  
  return {
    didEstimate,
    firstDiff,
    secondDiff,
    groupMeans: {
      preTreat: meanPreTreat,
      preControl: meanPreControl,
      postTreat: meanPostTreat,
      postControl: meanPostControl
    },
    preTrendTest,
    preTrendViolation: preTrendTest > 1.0 // Threshold for violation
  };
}

function calculateSlope(data: PolicyData[]) {
  if (data.length === 0) return 0;
  
  const periods = data.map(d => d.period);
  const outcomes = data.map(d => d.outcome);
  
  const meanPeriod = mean(periods);
  const meanOutcome = mean(outcomes);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < data.length; i++) {
    numerator += (periods[i] - meanPeriod) * (outcomes[i] - meanOutcome);
    denominator += (periods[i] - meanPeriod) ** 2;
  }
  
  return denominator === 0 ? 0 : numerator / denominator;
}

type PolicyData = {
  id: number;
  treated: boolean;
  period: number;
  outcome: number;
  group: string;
};

// Generate sample data with multiple periods
function generateData(
  treatmentEffect: number,
  baselineDiff: number,
  timeTrend: number,
  preTrend: number = 0,
  noise: number = 2
): PolicyData[] {
  const data: PolicyData[] = [];
  let id = 1;
  
  const periods = [-3, -2, -1, 0, 1, 2]; // 3 pre-periods, 3 post-periods
  const controlBaseline = 50;
  
  for (const treated of [false, true]) {
    for (const period of periods) {
      for (let i = 0; i < 20; i++) {
        let outcome = controlBaseline;
        
        // Add baseline difference for treatment group
        if (treated) {
          outcome += baselineDiff;
        }
        
        // Add common time trend
        outcome += timeTrend * period;
        
        // Add differential pre-trend for treatment group (violations)
        if (treated && period < 0) {
          outcome += preTrend * Math.abs(period);
        }
        
        // Add treatment effect (only for treated units in post periods)
        if (treated && period >= 0) {
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

// Enhanced chart component
function DiDChart({ 
  data, 
  width = 700, 
  height = 450 
}: {
  data: PolicyData[];
  width?: number;
  height?: number;
}) {
  const margin = { top: 40, right: 80, bottom: 60, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Calculate period means
  const periodMeans = useMemo(() => {
    const periods = [-3, -2, -1, 0, 1, 2];
    const means: Record<string, Record<number, number>> = {
      Treatment: {},
      Control: {}
    };
    
    periods.forEach(period => {
      const treatData = data.filter(d => d.treated && d.period === period);
      const controlData = data.filter(d => !d.treated && d.period === period);
      
      means.Treatment[period] = treatData.length > 0 ? mean(treatData.map(d => d.outcome)) : 0;
      means.Control[period] = controlData.length > 0 ? mean(controlData.map(d => d.outcome)) : 0;
    });
    
    return means;
  }, [data]);

  const yMin = Math.min(...data.map(d => d.outcome)) - 5;
  const yMax = Math.max(...data.map(d => d.outcome)) + 5;
  
  const xScale = (period: number) => ((period + 3) / 5) * innerW;
  const yScale = (y: number) => innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const periods = [-3, -2, -1, 0, 1, 2];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold mb-4 text-center">DiD with Pre-trends Analysis</h3>
      <svg width={width} height={height} className="border rounded">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Policy implementation line */}
          <line 
            x1={xScale(-0.5)} y1={0}
            x2={xScale(-0.5)} y2={innerH}
            stroke="#f97316" strokeWidth={2} strokeDasharray="5,5"
          />
          <text 
            x={xScale(-0.5)} y={-5}
            textAnchor="middle" 
            className="text-xs fill-orange-600 font-medium"
          >
            Policy Start
          </text>
          
          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#666" strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#666" strokeWidth={1} />
          
          {/* Scatter points */}
          {data.map((point, i) => (
            <circle
              key={i}
              cx={xScale(point.period)}
              cy={yScale(point.outcome)}
              r={2.5}
              fill={point.treated ? "#3b82f6" : "#ef4444"}
              fillOpacity={point.period >= 0 ? 0.7 : 0.4}
            />
          ))}
          
          {/* Period means */}
          {periods.map(period => (
            <g key={period}>
              <circle 
                cx={xScale(period)} 
                cy={yScale(periodMeans.Control[period])} 
                r={6} 
                fill="#ef4444" 
                stroke="#dc2626" 
                strokeWidth={2} 
              />
              <circle 
                cx={xScale(period)} 
                cy={yScale(periodMeans.Treatment[period])} 
                r={6} 
                fill="#3b82f6" 
                stroke="#2563eb" 
                strokeWidth={2} 
              />
            </g>
          ))}
          
          {/* Trend lines */}
          {periods.slice(0, -1).map(period => {
            const nextPeriod = periods[periods.indexOf(period) + 1];
            return (
              <g key={`line-${period}`}>
                {/* Control line */}
                <line 
                  x1={xScale(period)} y1={yScale(periodMeans.Control[period])}
                  x2={xScale(nextPeriod)} y2={yScale(periodMeans.Control[nextPeriod])}
                  stroke="#ef4444" strokeWidth={3}
                />
                {/* Treatment line */}
                <line 
                  x1={xScale(period)} y1={yScale(periodMeans.Treatment[period])}
                  x2={xScale(nextPeriod)} y2={yScale(periodMeans.Treatment[nextPeriod])}
                  stroke="#3b82f6" strokeWidth={3}
                />
              </g>
            );
          })}
          
          {/* Counterfactual (extrapolate pre-trend) */}
          <line 
            x1={xScale(-0.5)} y1={yScale(periodMeans.Treatment[-1])}
            x2={xScale(2)} y2={yScale(periodMeans.Treatment[-1] + (periodMeans.Control[2] - periodMeans.Control[-1]))}
            stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,5" opacity={0.7}
          />
          
          {/* X-axis labels */}
          {periods.map(period => (
            <text 
              key={period}
              x={xScale(period)} 
              y={innerH + 20} 
              textAnchor="middle" 
              className="text-xs font-medium fill-slate-700"
            >
              {period}
            </text>
          ))}
          
          <text x={innerW / 2} y={innerH + 40} textAnchor="middle" className="text-sm font-medium fill-slate-700">
            Periods Relative to Policy Implementation
          </text>
          
          {/* Y-axis label */}
          <text 
            x={-40} y={innerH / 2} 
            textAnchor="middle" 
            transform={`rotate(-90, -40, ${innerH / 2})`}
            className="text-sm font-medium fill-slate-700"
          >
            Outcome
          </text>
          
          {/* Legend */}
          <g transform={`translate(${innerW - 140}, 20)`}>
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

export default function EnhancedDiDLab() {
  const [treatmentEffect, setTreatmentEffect] = useState(5);
  const [baselineDiff, setBaselineDiff] = useState(0);
  const [timeTrend, setTimeTrend] = useState(1);
  const [preTrend, setPreTrend] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const data = useMemo(() => 
    generateData(treatmentEffect, baselineDiff, timeTrend, preTrend), 
    [treatmentEffect, baselineDiff, timeTrend, preTrend]
  );

  const results = useMemo(() => runDiDRegression(data), [data]);

  const handleCopyCode = useCallback(() => {
    const stataCode = `* Difference-in-Differences with Pre-trends Test
clear all
use "your_data.dta", clear

* Basic DiD regression
regress outcome i.treated##i.post, vce(robust)
lincom 1.treated#1.post

* Event study specification for pre-trends test
regress outcome i.treated##ib(-1).period, vce(cluster id)

* Test for pre-trends (joint test of pre-period interactions)
test 1.treated#-3.period 1.treated#-2.period

* Plot coefficients
coefplot, keep(*.treated#*.period) vertical ///
    title("Event Study Plot") xtitle("Periods Relative to Treatment")

* Alternative: manual group means calculation
tabstat outcome, by(treated period) statistics(mean)`;
    
    navigator.clipboard.writeText(stataCode);
  }, []);

  const resetToDefaults = useCallback(() => {
    setTreatmentEffect(5);
    setBaselineDiff(0);
    setTimeTrend(1);
    setPreTrend(0);
  }, []);

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
            Enhanced DiD Lab: Pre-trends Testing
          </h1>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto">
            Explore Difference-in-Differences with multiple time periods. Test the crucial parallel trends assumption 
            by examining pre-treatment trends and see how violations affect your causal estimates.
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
                <h2 className="text-lg font-semibold text-slate-800">Controls</h2>
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
                    Treatment Effect: <span className="text-blue-600">{treatmentEffect}</span>
                  </label>
                  <input
                    type="range"
                    min="-8"
                    max="12"
                    step="0.5"
                    value={treatmentEffect}
                    onChange={(e) => setTreatmentEffect(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-8</span>
                    <span>12</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Baseline Difference: <span className="text-amber-600">{baselineDiff}</span>
                  </label>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="0.5"
                    value={baselineDiff}
                    onChange={(e) => setBaselineDiff(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-8</span>
                    <span>8</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Common Time Trend: <span className="text-green-600">{timeTrend}</span>
                  </label>
                  <input
                    type="range"
                    min="-3"
                    max="5"
                    step="0.5"
                    value={timeTrend}
                    onChange={(e) => setTimeTrend(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-3</span>
                    <span>5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Differential Pre-trend: <span className="text-red-600">{preTrend}</span>
                  </label>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.2"
                    value={preTrend}
                    onChange={(e) => setPreTrend(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-3</span>
                    <span>3</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Violation of parallel trends in pre-periods
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Quick Scenarios</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setTreatmentEffect(6); setBaselineDiff(0); setTimeTrend(1); setPreTrend(0); }}
                    className="w-full p-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                  >
                    Valid DiD
                  </button>
                  <button
                    onClick={() => { setTreatmentEffect(4); setBaselineDiff(2); setTimeTrend(1); setPreTrend(1.5); }}
                    className="w-full p-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                  >
                    Pre-trend Violation
                  </button>
                  <button
                    onClick={() => { setTreatmentEffect(0); setBaselineDiff(0); setTimeTrend(0); setPreTrend(2); }}
                    className="w-full p-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                  >
                    False Positive Risk
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
            
            <DiDChart data={data} />

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Results & Diagnostics</h3>
              
              {/* Pre-trends Alert */}
              {results.preTrendViolation && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-red-800">Pre-trends Violation Detected</div>
                    <div className="text-sm text-red-700 mt-1">
                      Differential trend = {results.preTrendTest.toFixed(2)}. Parallel trends assumption may be violated.
                      DiD estimate may be biased.
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {results.didEstimate.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">DiD Estimate</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.abs(results.didEstimate - treatmentEffect).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Bias</div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-700">
                    {results.preTrendTest.toFixed(2)}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">Pre-trend Test</div>
                </div>

                <div className={`rounded-lg p-4 border ${results.preTrendViolation ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className={`text-2xl font-bold ${results.preTrendViolation ? 'text-red-700' : 'text-green-700'}`}>
                    {results.preTrendViolation ? "FAIL" : "PASS"}
                  </div>
                  <div className={`text-sm font-medium ${results.preTrendViolation ? 'text-red-600' : 'text-green-600'}`}>
                    Parallel Trends
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Group Means</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Pre-Treatment (Control):</span>
                      <span className="font-mono">{results.groupMeans.preControl.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pre-Treatment (Treated):</span>
                      <span className="font-mono">{results.groupMeans.preTreat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Post-Treatment (Control):</span>
                      <span className="font-mono">{results.groupMeans.postControl.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Post-Treatment (Treated):</span>
                      <span className="font-mono">{results.groupMeans.postTreat.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">DiD Calculation</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Change in Treatment:</span>
                      <span className="font-mono">{results.firstDiff.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change in Control:</span>
                      <span className="font-mono">{results.secondDiff.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-semibold">
                      <span>Difference-in-Differences:</span>
                      <span className="font-mono text-blue-700">{results.didEstimate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">Understanding Pre-trends</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Why Pre-trends Matter</h4>
                  <p className="text-sm text-amber-700">
                    DiD assumes treatment and control groups would follow parallel trends without intervention. 
                    Pre-treatment periods let us test this assumption.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">What to Look For</h4>
                  <p className="text-sm text-amber-700">
                    Before policy implementation, the two groups should have similar slopes. 
                    Differential pre-trends suggest the assumption is violated.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Try This:</strong> Set differential pre-trend to 2.0 and see how it biases your DiD estimate 
                  even when the true treatment effect is 0!
                </p>
              </div>
            </div>

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
                    <code>{`* Difference-in-Differences with Pre-trends Test
clear all
use "your_data.dta", clear

* Basic DiD regression (simple two-period case)
regress outcome i.treated##i.post, vce(robust)
lincom 1.treated#1.post

* Event study specification for pre-trends test
* Use period -1 as base (omitted) category
regress outcome i.treated##ib(-1).period, vce(cluster id)

* Test for pre-trends (joint test of pre-period interactions)
test 1.treated#-3.period 1.treated#-2.period

* Plot coefficients to visualize event study
coefplot, keep(*.treated#*.period) vertical ///
    yline(0, lcolor(red) lpattern(dash)) ///
    xline(3.5, lcolor(orange) lpattern(dash)) ///
    title("Event Study: Treatment Effects Over Time") ///
    xtitle("Periods Relative to Treatment") ///
    ytitle("Treatment Effect") ///
    addplot(line @b @at if @at < 3.5, lcolor(blue) lpattern(dash))

* Alternative: manual calculation of group means
preserve
collapse (mean) outcome, by(treated period)
reshape wide outcome, i(period) j(treated)
generate diff = outcome1 - outcome0
list
restore

* Robustness: different specifications
* regress outcome treated##c.period, vce(robust)
* regress outcome i.treated##(c.period c.period#c.period), vce(cluster id)`}</code>
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
          <h3 className="text-2xl font-bold mb-4">Master More Causal Inference Methods</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Now that you understand DiD and pre-trends testing, explore other quasi-experimental methods 
            for identifying causal effects when randomization is not possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/labs/rd"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Try Regression Discontinuity
            </Link>
            <Link
              href="/labs/iv"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Explore Instrumental Variables
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