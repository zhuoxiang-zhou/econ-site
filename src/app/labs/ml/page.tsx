"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Copy, RefreshCw, Zap, GitBranch, Brain } from "lucide-react";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardize(arr: number[]) {
  const m = mean(arr);
  const std = Math.sqrt(arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length);
  return arr.map(x => (x - m) / (std || 1));
}

// ============================================================================
// LASSO REGRESSION
// ============================================================================

interface LassoResult {
  coefficients: number[];
  intercept: number;
  predictions: number[];
  numNonZero: number;
}

function fitLasso(
  X: number[][], 
  y: number[], 
  lambda: number, 
  iterations: number = 100
): LassoResult {
  const n = X.length;
  const p = X[0].length;
  
  // Initialize coefficients
  let beta = new Array(p).fill(0);
  let intercept = mean(y);
  
  // Standardize features
  const X_std = X.map(row => standardize(row));
  const y_centered = y.map(yi => yi - intercept);
  
  // Coordinate descent
  for (let iter = 0; iter < iterations; iter++) {
    for (let j = 0; j < p; j++) {
      // Compute partial residual
      let r = y_centered.map((yi, i) => {
        let pred = 0;
        for (let k = 0; k < p; k++) {
          if (k !== j) pred += beta[k] * X_std[i][k];
        }
        return yi - pred;
      });
      
      // Compute correlation
      let rho = 0;
      for (let i = 0; i < n; i++) {
        rho += X_std[i][j] * r[i];
      }
      rho /= n;
      
      // Soft thresholding
      if (rho > lambda) {
        beta[j] = rho - lambda;
      } else if (rho < -lambda) {
        beta[j] = rho + lambda;
      } else {
        beta[j] = 0;
      }
    }
  }
  
  // Make predictions
  const predictions = X_std.map(row => {
    let pred = intercept;
    for (let j = 0; j < p; j++) {
      pred += beta[j] * row[j];
    }
    return pred;
  });
  
  const numNonZero = beta.filter(b => Math.abs(b) > 0.001).length;
  
  return { coefficients: beta, intercept, predictions, numNonZero };
}

// ============================================================================
// DECISION TREE
// ============================================================================

interface TreeNode {
  isLeaf: boolean;
  prediction?: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  samples?: number;
}

interface TreeResult {
  tree: TreeNode;
  predictions: number[];
  depth: number;
}

function fitDecisionTree(
  X: number[][], 
  y: number[], 
  maxDepth: number = 3,
  minSamples: number = 5
): TreeResult {
  
  function buildTree(indices: number[], depth: number): TreeNode {
    const ySubset = indices.map(i => y[i]);
    const meanY = mean(ySubset);
    
    // Stop conditions
    if (depth >= maxDepth || indices.length < minSamples) {
      return {
        isLeaf: true,
        prediction: meanY,
        samples: indices.length
      };
    }
    
    // Find best split
    let bestFeature = 0;
    let bestThreshold = 0;
    let bestGain = -Infinity;
    
    const p = X[0].length;
    for (let feature = 0; feature < p; feature++) {
      const values = indices.map(i => X[i][feature]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
      
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        
        const leftIndices = indices.filter(idx => X[idx][feature] <= threshold);
        const rightIndices = indices.filter(idx => X[idx][feature] > threshold);
        
        if (leftIndices.length === 0 || rightIndices.length === 0) continue;
        
        const leftY = leftIndices.map(i => y[i]);
        const rightY = rightIndices.map(i => y[i]);
        
        // Variance reduction
        const parentVar = ySubset.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
        const leftMean = mean(leftY);
        const rightMean = mean(rightY);
        const leftVar = leftY.reduce((sum, yi) => sum + (yi - leftMean) ** 2, 0);
        const rightVar = rightY.reduce((sum, yi) => sum + (yi - rightMean) ** 2, 0);
        
        const gain = parentVar - leftVar - rightVar;
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }
    
    if (bestGain <= 0) {
      return {
        isLeaf: true,
        prediction: meanY,
        samples: indices.length
      };
    }
    
    // Split data
    const leftIndices = indices.filter(idx => X[idx][bestFeature] <= bestThreshold);
    const rightIndices = indices.filter(idx => X[idx][bestFeature] > bestThreshold);
    
    return {
      isLeaf: false,
      feature: bestFeature,
      threshold: bestThreshold,
      left: buildTree(leftIndices, depth + 1),
      right: buildTree(rightIndices, depth + 1),
      samples: indices.length
    };
  }
  
  function predict(node: TreeNode, x: number[]): number {
    if (node.isLeaf) {
      return node.prediction!;
    }
    if (x[node.feature!] <= node.threshold!) {
      return predict(node.left!, x);
    } else {
      return predict(node.right!, x);
    }
  }
  
  function getDepth(node: TreeNode): number {
    if (node.isLeaf) return 1;
    return 1 + Math.max(getDepth(node.left!), getDepth(node.right!));
  }
  
  const indices = Array.from({ length: X.length }, (_, i) => i);
  const tree = buildTree(indices, 0);
  const predictions = X.map(x => predict(tree, x));
  const depth = getDepth(tree);
  
  return { tree, predictions, depth };
}

// ============================================================================
// NEURAL NETWORK
// ============================================================================

interface NeuralNetResult {
  predictions: number[];
  weights: number[][][];
  biases: number[][];
  loss: number;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
}

function relu(x: number): number {
  return Math.max(0, x);
}

function fitNeuralNetwork(
  X: number[][],
  y: number[],
  hiddenSize: number = 5,
  learningRate: number = 0.01,
  epochs: number = 100
): NeuralNetResult {
  const n = X.length;
  const inputSize = X[0].length;
  
  // Normalize y
  const yMean = mean(y);
  const yStd = Math.sqrt(y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0) / n);
  const yNorm = y.map(yi => (yi - yMean) / (yStd || 1));
  
  // Initialize weights (Xavier initialization)
  const w1: number[][] = Array.from({ length: inputSize }, () =>
    Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * 2 / Math.sqrt(inputSize))
  );
  const b1: number[] = new Array(hiddenSize).fill(0);
  
  const w2: number[][] = Array.from({ length: hiddenSize }, () =>
    [(Math.random() - 0.5) * 2 / Math.sqrt(hiddenSize)]
  );
  const b2: number[] = [0];
  
  // Training
  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;
    
    for (let i = 0; i < n; i++) {
      const x = X[i];
      const target = yNorm[i];
      
      // Forward pass
      const hidden = new Array(hiddenSize);
      for (let h = 0; h < hiddenSize; h++) {
        let sum = b1[h];
        for (let j = 0; j < inputSize; j++) {
          sum += x[j] * w1[j][h];
        }
        hidden[h] = relu(sum);
      }
      
      let output = b2[0];
      for (let h = 0; h < hiddenSize; h++) {
        output += hidden[h] * w2[h][0];
      }
      
      // Loss
      const error = output - target;
      totalLoss += error * error;
      
      // Backward pass
      const dOutput = 2 * error;
      
      // Output layer gradients
      for (let h = 0; h < hiddenSize; h++) {
        w2[h][0] -= learningRate * dOutput * hidden[h];
      }
      b2[0] -= learningRate * dOutput;
      
      // Hidden layer gradients
      for (let h = 0; h < hiddenSize; h++) {
        const dHidden = dOutput * w2[h][0] * (hidden[h] > 0 ? 1 : 0);
        for (let j = 0; j < inputSize; j++) {
          w1[j][h] -= learningRate * dHidden * x[j];
        }
        b1[h] -= learningRate * dHidden;
      }
    }
  }
  
  // Final predictions
  const predictions = X.map(x => {
    const hidden = new Array(hiddenSize);
    for (let h = 0; h < hiddenSize; h++) {
      let sum = b1[h];
      for (let j = 0; j < inputSize; j++) {
        sum += x[j] * w1[j][h];
      }
      hidden[h] = relu(sum);
    }
    
    let output = b2[0];
    for (let h = 0; h < hiddenSize; h++) {
      output += hidden[h] * w2[h][0];
    }
    
    return output * (yStd || 1) + yMean;
  });
  
  const loss = predictions.reduce((sum, pred, i) => sum + (pred - y[i]) ** 2, 0) / n;
  
  return {
    predictions,
    weights: [w1, w2],
    biases: [b1, b2],
    loss
  };
}

// ============================================================================
// DATA GENERATION
// ============================================================================

type DataType = "linear" | "nonlinear" | "sparse";

function generateData(
  n: number = 200,
  dataType: DataType = "linear",
  numFeatures: number = 10
): { X: number[][], y: number[], trueFeatures: number[] } {
  const X: number[][] = [];
  const y: number[] = [];
  
  // True coefficients (only first 3 are non-zero for sparse case)
  const trueCoefs = Array.from({ length: numFeatures }, (_, i) => 
    i < 3 ? (Math.random() - 0.5) * 4 : 0
  );
  
  for (let i = 0; i < n; i++) {
    const row = Array.from({ length: numFeatures }, () => (Math.random() - 0.5) * 4);
    X.push(row);
    
    let yi = 0;
    
    if (dataType === "linear") {
      // Linear relationship
      yi = row[0] * 3 + row[1] * 2 + row[2] * 1.5;
    } else if (dataType === "nonlinear") {
      // Nonlinear relationship
      yi = Math.sin(row[0] * 2) * 3 + row[1] * row[1] * 2 + Math.abs(row[2]) * 1.5;
    } else if (dataType === "sparse") {
      // Sparse (most features irrelevant)
      yi = row[0] * 3 + row[1] * 2 + row[2] * 1.5;
    }
    
    // Add noise
    yi += (Math.random() - 0.5) * 2;
    y.push(yi);
  }
  
  return { X, y, trueFeatures: [0, 1, 2] };
}

// ============================================================================
// VISUALIZATION COMPONENTS
// ============================================================================

function ModelPlot({ 
  y, 
  predictions, 
  title,
  color = "#3b82f6"
}: {
  y: number[];
  predictions: number[];
  title: string;
  color?: string;
}) {
  const width = 320;
  const height = 280;
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  
  const allValues = [...y, ...predictions];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal;
  
  const xScale = (i: number) => (i / y.length) * innerW;
  const yScale = (val: number) => innerH - ((val - minVal + range * 0.1) / (range * 1.2)) * innerH;
  
  // Calculate R²
  const yMean = mean(y);
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - predictions[i]) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold text-sm mb-2 text-center">{title}</h4>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <line
              key={frac}
              x1={0} y1={innerH * frac}
              x2={innerW} y2={innerH * frac}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}
          
          {/* Actual values (dots) */}
          {y.map((yi, i) => (
            <circle
              key={`actual-${i}`}
              cx={xScale(i)}
              cy={yScale(yi)}
              r={3}
              fill="#94a3b8"
              opacity={0.6}
            />
          ))}
          
          {/* Predictions (line) */}
          <path
            d={predictions.map((pred, i) => 
              `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(pred)}`
            ).join(' ')}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          
          {/* Axes */}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#475569" strokeWidth={2} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="#475569" strokeWidth={2} />
          
          {/* Labels */}
          <text x={innerW / 2} y={innerH + 30} textAnchor="middle" className="text-xs fill-slate-600">
            Observations
          </text>
          <text x={-innerH / 2} y={-35} textAnchor="middle" transform="rotate(-90)" className="text-xs fill-slate-600">
            Value
          </text>
          
        </g>
      </svg>
      <div className="text-center mt-2">
        <span className="text-xs font-mono text-slate-600">
          R² = {r2.toFixed(3)}
        </span>
      </div>
    </div>
  );
}

function TreeVisualization({ tree, maxDepth }: { tree: TreeNode, maxDepth: number }) {
  const width = 320;
  const height = 240;
  
  function renderNode(
    node: TreeNode, 
    x: number, 
    y: number, 
    width: number, 
    depth: number
  ): JSX.Element[] {
    const elements: JSX.Element[] = [];
    const nodeKey = `${x}-${y}-${depth}`;
    
    if (node.isLeaf) {
      elements.push(
        <g key={nodeKey}>
          <rect
            x={x - 20}
            y={y - 12}
            width={40}
            height={24}
            rx={4}
            fill="#10b981"
            opacity={0.8}
          />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            className="text-xs fill-white font-semibold"
          >
            {node.prediction?.toFixed(1)}
          </text>
        </g>
      );
    } else {
      const childWidth = width / 2;
      const childY = y + 50;
      const leftX = x - width / 4;
      const rightX = x + width / 4;
      
      // Lines to children
      elements.push(
        <line
          key={`${nodeKey}-left`}
          x1={x}
          y1={y + 12}
          x2={leftX}
          y2={childY - 12}
          stroke="#64748b"
          strokeWidth={2}
        />
      );
      elements.push(
        <line
          key={`${nodeKey}-right`}
          x1={x}
          y1={y + 12}
          x2={rightX}
          y2={childY - 12}
          stroke="#64748b"
          strokeWidth={2}
        />
      );
      
      // Decision node
      elements.push(
        <g key={nodeKey}>
          <rect
            x={x - 25}
            y={y - 12}
            width={50}
            height={24}
            rx={4}
            fill="#3b82f6"
            opacity={0.9}
          />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            className="text-xs fill-white font-semibold"
          >
            X{node.feature! + 1} ≤ {node.threshold?.toFixed(1)}
          </text>
        </g>
      );
      
      // Recurse
      if (node.left) {
        elements.push(...renderNode(node.left, leftX, childY, childWidth, depth + 1));
      }
      if (node.right) {
        elements.push(...renderNode(node.right, rightX, childY, childWidth, depth + 1));
      }
    }
    
    return elements;
  }
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold text-sm mb-2 text-center">Tree Structure</h4>
      <svg width={width} height={height}>
        {renderNode(tree, width / 2, 30, width, 0)}
      </svg>
    </div>
  );
}

function NetworkVisualization({ 
  inputSize, 
  hiddenSize 
}: { 
  inputSize: number, 
  hiddenSize: number 
}) {
  const width = 320;
  const height = 240;
  const layerSpacing = 100;
  const nodeRadius = 12;
  
  const inputY = Array.from({ length: Math.min(inputSize, 5) }, (_, i) => 
    height / 2 + (i - 2) * 35
  );
  const hiddenY = Array.from({ length: Math.min(hiddenSize, 5) }, (_, i) => 
    height / 2 + (i - 2) * 35
  );
  const outputY = [height / 2];
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold text-sm mb-2 text-center">Network Architecture</h4>
      <svg width={width} height={height}>
        
        {/* Connections */}
        {inputY.map((iy, i) =>
          hiddenY.map((hy, h) => (
            <line
              key={`in-${i}-h-${h}`}
              x1={60}
              y1={iy}
              x2={160}
              y2={hy}
              stroke="#cbd5e1"
              strokeWidth={1}
              opacity={0.3}
            />
          ))
        )}
        
        {hiddenY.map((hy, h) =>
          outputY.map((oy, o) => (
            <line
              key={`h-${h}-out-${o}`}
              x1={160}
              y1={hy}
              x2={260}
              y2={oy}
              stroke="#cbd5e1"
              strokeWidth={1}
              opacity={0.3}
            />
          ))
        )}
        
        {/* Input layer */}
        {inputY.map((iy, i) => (
          <circle
            key={`input-${i}`}
            cx={60}
            cy={iy}
            r={nodeRadius}
            fill="#6366f1"
            opacity={0.8}
          />
        ))}
        <text x={60} y={height - 20} textAnchor="middle" className="text-xs fill-slate-600 font-semibold">
          Input ({inputSize})
        </text>
        
        {/* Hidden layer */}
        {hiddenY.map((hy, h) => (
          <circle
            key={`hidden-${h}`}
            cx={160}
            cy={hy}
            r={nodeRadius}
            fill="#8b5cf6"
            opacity={0.8}
          />
        ))}
        <text x={160} y={height - 20} textAnchor="middle" className="text-xs fill-slate-600 font-semibold">
          Hidden ({hiddenSize})
        </text>
        
        {/* Output layer */}
        {outputY.map((oy, o) => (
          <circle
            key={`output-${o}`}
            cx={260}
            cy={oy}
            r={nodeRadius}
            fill="#ec4899"
            opacity={0.8}
          />
        ))}
        <text x={260} y={height - 20} textAnchor="middle" className="text-xs fill-slate-600 font-semibold">
          Output (1)
        </text>
        
      </svg>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MachineLearningLab() {
  const [dataType, setDataType] = useState<DataType>("linear");
  const [numFeatures, setNumFeatures] = useState(10);
  const [lambda, setLambda] = useState(0.1);
  const [maxDepth, setMaxDepth] = useState(3);
  const [hiddenSize, setHiddenSize] = useState(5);
  const [showCode, setShowCode] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"lasso" | "tree" | "neural">("lasso");
  
  // Generate data
  const data = useMemo(() => {
    return generateData(200, dataType, numFeatures);
  }, [dataType, numFeatures]);
  
  // Fit models
  const lassoResult = useMemo(() => {
    return fitLasso(data.X, data.y, lambda);
  }, [data, lambda]);
  
  const treeResult = useMemo(() => {
    return fitDecisionTree(data.X, data.y, maxDepth, 10);
  }, [data, maxDepth]);
  
  const neuralResult = useMemo(() => {
    return fitNeuralNetwork(data.X, data.y, hiddenSize, 0.01, 50);
  }, [data, hiddenSize]);
  
  const handleCopyCode = () => {
    const code = activeMethod === "lasso" 
      ? lassoCode 
      : activeMethod === "tree" 
      ? treeCode 
      : neuralCode;
    navigator.clipboard.writeText(code);
  };
  
  const handleRegenerate = () => {
    setDataType(prev => prev); // Force re-render
  };
  
  const lassoCode = `* LASSO Regression for Feature Selection
clear all
use "economic_data.dta", clear

* Install required package
* ssc install lasso2

* Prepare data: Many potential predictors
global predictors gdp_growth inflation unemployment ///
    interest_rate exchange_rate oil_price ///
    consumer_confidence manufacturing_index ///
    housing_starts trade_balance

* Run LASSO with cross-validation to select lambda
lasso2 future_income $predictors, lambda(${lambda})

* Display selected features (non-zero coefficients)
lasso2 future_income $predictors, lambda(${lambda}) lic(bic)

* Key insight: LASSO automatically performs feature selection
* by shrinking irrelevant coefficients to exactly zero
display "Lambda = ${lambda}"
display "Non-zero coefficients: ${lassoResult.numNonZero} out of ${numFeatures}"

* Compare with OLS (no regularization)
regress future_income $predictors`;

  const treeCode = `* Decision Tree for Nonlinear Relationships
clear all  
use "economic_data.dta", clear

* Decision trees handle nonlinear patterns automatically
* Install: ssc install rpart (or use Python/R for better tree support)

* For Stata, we approximate with regression splines
* Or export to Python for scikit-learn

* Python equivalent (save as tree_model.py):
"""
from sklearn.tree import DecisionTreeRegressor
import pandas as pd

df = pd.read_stata("economic_data.dta")
X = df[['gdp_growth', 'inflation', 'unemployment', ...]]
y = df['future_income']

tree = DecisionTreeRegressor(max_depth=${maxDepth}, min_samples_split=10)
tree.fit(X, y)

# Visualize tree structure
from sklearn.tree import plot_tree
plot_tree(tree, feature_names=X.columns, filled=True)
"""

* Key insight: Trees automatically discover interactions
* and thresholds without manual specification
display "Tree depth: ${maxDepth}"
display "Handles nonlinear relationships without transformation"`;

  const neuralCode = `* Neural Network for Complex Patterns
clear all
use "economic_data.dta", clear

* Neural networks in Stata (limited support)
* Better to use Python with TensorFlow/PyTorch

* Python equivalent (save as neural_net.py):
"""
import numpy as np
from sklearn.neural_network import MLPRegressor
import pandas as pd

df = pd.read_stata("economic_data.dta")
X = df[['gdp_growth', 'inflation', 'unemployment', ...]]
y = df['future_income']

# Standardize features
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit neural network
nn = MLPRegressor(
    hidden_layer_sizes=(${hiddenSize},),
    activation='relu',
    max_iter=100,
    random_state=42
)
nn.fit(X_scaled, y)

# Make predictions
predictions = nn.predict(X_scaled)
"""

* Key insight: Neural networks can learn complex,
* highly nonlinear relationships through hidden layers
display "Hidden units: ${hiddenSize}"
display "Universal approximation: can fit almost any function"`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/labs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Labs
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Machine Learning Methods
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore three powerful ML techniques: LASSO for feature selection, 
              Decision Trees for interpretability, and Neural Networks for complex patterns
            </p>
          </div>
        </motion.div>

        {/* Method Selector */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <button
            onClick={() => setActiveMethod("lasso")}
            className={`p-6 rounded-xl border-2 transition-all ${
              activeMethod === "lasso"
                ? "border-indigo-500 bg-indigo-50 shadow-lg"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            <Zap className={`mx-auto mb-3 ${activeMethod === "lasso" ? "text-indigo-600" : "text-slate-400"}`} size={32} />
            <h3 className="font-semibold text-lg mb-2">LASSO</h3>
            <p className="text-sm text-slate-600">Automatic feature selection via L1 regularization</p>
          </button>
          
          <button
            onClick={() => setActiveMethod("tree")}
            className={`p-6 rounded-xl border-2 transition-all ${
              activeMethod === "tree"
                ? "border-green-500 bg-green-50 shadow-lg"
                : "border-slate-200 bg-white hover:border-green-300"
            }`}
          >
            <GitBranch className={`mx-auto mb-3 ${activeMethod === "tree" ? "text-green-600" : "text-slate-400"}`} size={32} />
            <h3 className="font-semibold text-lg mb-2">Decision Tree</h3>
            <p className="text-sm text-slate-600">Interpretable splits for nonlinear relationships</p>
          </button>
          
          <button
            onClick={() => setActiveMethod("neural")}
            className={`p-6 rounded-xl border-2 transition-all ${
              activeMethod === "neural"
                ? "border-purple-500 bg-purple-50 shadow-lg"
                : "border-slate-200 bg-white hover:border-purple-300"
            }`}
          >
            <Brain className={`mx-auto mb-3 ${activeMethod === "neural" ? "text-purple-600" : "text-slate-400"}`} size={32} />
            <h3 className="font-semibold text-lg mb-2">Neural Network</h3>
            <p className="text-sm text-slate-600">Deep learning for complex patterns</p>
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Controls</h2>
              
              {/* Data Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Pattern
                </label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value as DataType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="linear">Linear</option>
                  <option value="nonlinear">Nonlinear</option>
                  <option value="sparse">Sparse (many irrelevant features)</option>
                </select>
              </div>
              
              {/* Number of Features */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Features: {numFeatures}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={numFeatures}
                  onChange={(e) => setNumFeatures(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Method-specific controls */}
              {activeMethod === "lasso" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Regularization (λ): {lambda.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={lambda}
                    onChange={(e) => setLambda(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Higher λ = more aggressive feature selection
                  </p>
                </div>
              )}
              
              {activeMethod === "tree" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Depth: {maxDepth}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Deeper trees = more complex patterns
                  </p>
                </div>
              )}
              
              {activeMethod === "neural" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hidden Units: {hiddenSize}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={hiddenSize}
                    onChange={(e) => setHiddenSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    More units = more learning capacity
                  </p>
                </div>
              )}
              
              {/* Regenerate Button */}
              <button
                onClick={handleRegenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
              >
                <RefreshCw size={18} />
                Regenerate Data
              </button>
              
              {/* Data Info */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-sm mb-2">Dataset Info</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Observations:</span>
                    <span className="font-mono">200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Features:</span>
                    <span className="font-mono">{numFeatures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pattern:</span>
                    <span className="font-mono capitalize">{dataType}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Results Panel */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            
            {/* LASSO Results */}
            {activeMethod === "lasso" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="text-indigo-600" size={28} />
                  <h2 className="text-2xl font-semibold">LASSO Regression</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <ModelPlot
                    y={data.y}
                    predictions={lassoResult.predictions}
                    title="Actual vs Predicted"
                    color="#6366f1"
                  />
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
                    <h3 className="font-semibold mb-4">Feature Selection</h3>
                    <div className="space-y-3">
                      {lassoResult.coefficients.map((coef, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm font-mono w-12">X{i + 1}:</span>
                          <div className="flex-1">
                            <div className="h-6 bg-slate-200 rounded overflow-hidden">
                              <div
                                className={`h-full ${Math.abs(coef) > 0.001 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                style={{ width: `${Math.min(100, Math.abs(coef) * 50)}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-sm font-mono w-16 text-right ${
                            Math.abs(coef) > 0.001 ? 'text-indigo-600 font-semibold' : 'text-slate-400'
                          }`}>
                            {coef.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white rounded border border-indigo-200">
                      <div className="text-sm font-semibold text-indigo-800">
                        Selected Features: {lassoResult.numNonZero} / {numFeatures}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {lassoResult.numNonZero === data.trueFeatures.length 
                          ? "✓ Correctly identified relevant features" 
                          : "Try adjusting λ for better selection"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5">
                  <h3 className="font-semibold text-blue-800 mb-2">Why LASSO?</h3>
                  <p className="text-sm text-blue-800">
                    LASSO (Least Absolute Shrinkage and Selection Operator) adds an L1 penalty that shrinks 
                    coefficients to <strong>exactly zero</strong>. This performs automatic feature selection, 
                    especially useful when you have many predictors but only some are truly relevant.
                  </p>
                </div>
              </div>
            )}
            
            {/* Decision Tree Results */}
            {activeMethod === "tree" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <GitBranch className="text-green-600" size={28} />
                  <h2 className="text-2xl font-semibold">Decision Tree</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <ModelPlot
                    y={data.y}
                    predictions={treeResult.predictions}
                    title="Actual vs Predicted"
                    color="#10b981"
                  />
                  
                  <TreeVisualization tree={treeResult.tree} maxDepth={maxDepth} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="text-sm font-semibold text-green-800 mb-1">Tree Depth</div>
                    <div className="text-2xl font-bold text-green-700">{treeResult.depth}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="text-sm font-semibold text-green-800 mb-1">Decision Rules</div>
                    <div className="text-2xl font-bold text-green-700">
                      {Math.pow(2, treeResult.depth) - 1}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-5">
                  <h3 className="font-semibold text-green-800 mb-2">Why Decision Trees?</h3>
                  <p className="text-sm text-green-800">
                    Decision trees automatically discover <strong>interactions</strong> and <strong>thresholds</strong> 
                    without manual specification. They're highly interpretable (you can trace any prediction) and handle 
                    nonlinear relationships naturally. Perfect for when you need explainability.
                  </p>
                </div>
              </div>
            )}
            
            {/* Neural Network Results */}
            {activeMethod === "neural" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="text-purple-600" size={28} />
                  <h2 className="text-2xl font-semibold">Neural Network</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <ModelPlot
                    y={data.y}
                    predictions={neuralResult.predictions}
                    title="Actual vs Predicted"
                    color="#a855f7"
                  />
                  
                  <NetworkVisualization inputSize={numFeatures} hiddenSize={hiddenSize} />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                    <div className="text-sm font-semibold text-purple-800 mb-1">Parameters</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {(numFeatures * hiddenSize + hiddenSize + hiddenSize + 1).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                    <div className="text-sm font-semibold text-purple-800 mb-1">Hidden Units</div>
                    <div className="text-2xl font-bold text-purple-700">{hiddenSize}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                    <div className="text-sm font-semibold text-purple-800 mb-1">MSE Loss</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {neuralResult.loss.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-5">
                  <h3 className="font-semibold text-purple-800 mb-2">Why Neural Networks?</h3>
                  <p className="text-sm text-purple-800">
                    Neural networks are <strong>universal approximators</strong> — with enough hidden units and data, 
                    they can learn almost any complex function. The hidden layer transforms features into a representation 
                    that makes the problem easier to solve. Best for high-dimensional, complex patterns.
                  </p>
                </div>
              </div>
            )}
            
            {/* Comparison Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Method Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold">Method</th>
                      <th className="text-left py-3 px-4 font-semibold">Best For</th>
                      <th className="text-left py-3 px-4 font-semibold">Interpretability</th>
                      <th className="text-left py-3 px-4 font-semibold">R²</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-indigo-600">LASSO</td>
                      <td className="py-3 px-4">Feature selection, sparse models</td>
                      <td className="py-3 px-4">⭐⭐⭐ High</td>
                      <td className="py-3 px-4 font-mono">
                        {(1 - lassoResult.predictions.reduce((sum, pred, i) => 
                          sum + (pred - data.y[i]) ** 2, 0) / 
                          data.y.reduce((sum, yi) => sum + (yi - mean(data.y)) ** 2, 0)
                        ).toFixed(3)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-green-600">Decision Tree</td>
                      <td className="py-3 px-4">Nonlinear patterns, interactions</td>
                      <td className="py-3 px-4">⭐⭐⭐ High</td>
                      <td className="py-3 px-4 font-mono">
                        {(1 - treeResult.predictions.reduce((sum, pred, i) => 
                          sum + (pred - data.y[i]) ** 2, 0) / 
                          data.y.reduce((sum, yi) => sum + (yi - mean(data.y)) ** 2, 0)
                        ).toFixed(3)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-purple-600">Neural Network</td>
                      <td className="py-3 px-4">Complex patterns, large data</td>
                      <td className="py-3 px-4">⭐ Low</td>
                      <td className="py-3 px-4 font-mono">
                        {(1 - neuralResult.predictions.reduce((sum, pred, i) => 
                          sum + (pred - data.y[i]) ** 2, 0) / 
                          data.y.reduce((sum, yi) => sum + (yi - mean(data.y)) ** 2, 0)
                        ).toFixed(3)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Code Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold">
                  {activeMethod === "lasso" ? "LASSO" : activeMethod === "tree" ? "Decision Tree" : "Neural Network"} Implementation
                </h3>
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
                    <code>
                      {activeMethod === "lasso" ? lassoCode : activeMethod === "tree" ? treeCode : neuralCode}
                    </code>
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
          className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Continue Your ML Journey</h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            You've explored three foundational ML methods. Now dive deeper into causal inference 
            and advanced econometric techniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/labs/did"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Causal Inference: DID
            </Link>
            <Link
              href="/labs/rd"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Regression Discontinuity
            </Link>
            <Link
              href="/concepts/machine-learning"
              className="px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold"
            >
              Learn ML Theory
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
