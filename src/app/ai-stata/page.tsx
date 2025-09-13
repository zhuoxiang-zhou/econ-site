"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

/* ---------- Enhanced UI primitives ---------- */
function Pill({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "accent" }) {
  const baseClasses = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors";
  const variantClasses = {
    default: "border border-slate-200 bg-white text-slate-700 shadow-sm",
    accent: "bg-blue-100 text-blue-700 border border-blue-200"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium text-slate-700"
      aria-label="Copy to clipboard"
    >
      {copied ? "✓ Copied" : "📋 Copy"}
    </button>
  );
}

function CodeBlock({ code, caption, language = "stata" }: { code: string; caption?: string; language?: string }) {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono font-semibold text-slate-600">
            {caption || `${language.toUpperCase()} code`}
          </div>
          <Pill variant="accent">{language}</Pill>
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="text-sm leading-relaxed overflow-x-auto p-4 bg-white">
        <code className="text-slate-800">{code}</code>
      </pre>
    </div>
  );
}

/* ---------- Navigation with active section tracking ---------- */
function TableOfContents({ sections }: { sections: { id: string; label: string; description?: string }[] }) {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: "-20% 0% -70% 0%",
        threshold: 0.1
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="sticky top-6 h-fit bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span>🧭</span> Navigation
        </h3>
        <p className="text-xs text-slate-600 mt-1">Jump to any section</p>
      </div>
      
      <div className="p-2 max-h-[70vh] overflow-y-auto">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`block rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group ${
              activeSection === section.id
                ? "bg-blue-100 text-blue-800 font-medium border-l-2 border-blue-500"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                activeSection === section.id ? "bg-blue-500" : "bg-slate-300 group-hover:bg-slate-400"
              }`} />
              {section.label}
            </div>
            {section.description && (
              <div className="text-xs text-slate-500 mt-0.5 pl-4">
                {section.description}
              </div>
            )}
          </a>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        💡 <strong>Quick start?</strong> Jump to{" "}
        <a href="#recipes" className="text-blue-600 hover:underline font-medium">
          Code Recipes
        </a>
      </div>
    </nav>
  );
}

/* ---------- Enhanced Section component ---------- */
function Section({ 
  id, 
  title, 
  badge, 
  description, 
  children 
}: { 
  id: string; 
  title: string; 
  badge?: string; 
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {badge && <Pill variant="accent">{badge}</Pill>}
        </div>
        {description && (
          <p className="text-slate-600 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

/* ---------- Content data ---------- */
const promptTemplate = `Role: You are a careful Stata tutor for undergraduate econometrics.

Context:
- Study question and identification strategy: <1–2 lines>
- Dataset name: <e.g., wagepanel.dta>
- Variables (name : type : meaning):
  - wage : numeric : log hourly wage
  - educ : numeric : years of schooling
  - exper : numeric : years of experience
  - id, year : panel identifiers
- Assumptions / SEs: <e.g., cluster at id; robust>
- Output format: Stata code only, with short comments. Use explicit prefixes (xtset, ivregress, etc.). No placeholder variables.

Task:
- Write Stata code to accomplish: <task>
- Include: data load, minimal cleaning (few lines), model, SEs, brief postestimation.
- Constraints: no interactive prompts; set seed when simulating; avoid deprecated commands.

Return: A single code block.`;

const codeRecipes = [
  {
    title: "OLS with Robust Standard Errors",
    description: "Basic linear regression with heteroskedasticity-robust standard errors",
    code: `* OLS with robust SEs
clear all
use "wagepanel.dta", clear

* Basic data exploration
describe wage educ exper
summarize wage educ exper, detail

* OLS with robust (Huber-White) standard errors
regress wage educ exper, vce(robust)

* Store results for later comparison
estimates store ols_robust

* Effect size interpretation for log wages
* If wage is log-transformed, uncomment:
* regress lnwage educ exper, vce(robust)
* display "Return to schooling (%) = " 100*(exp(_b[educ])-1)`
  },
  {
    title: "Instrumental Variables (2SLS)",
    description: "Two-stage least squares with endogenous regressors",
    code: `* IV / 2SLS: wage on educ instrumented by quarter-of-birth
clear all
use "wage_iv.dta", clear

* Check instrument relevance
regress educ qob exper age, vce(robust)
test qob

* 2SLS estimation
ivregress 2sls wage (educ = qob) exper age, vce(robust)

* First-stage diagnostics
estat firststage
* Rule of thumb: F-stat > 10 for strong instrument

* Over-identification test (if multiple instruments)
* estat overid`
  },
  {
    title: "Difference-in-Differences",
    description: "Treatment effect estimation with before/after and treatment/control groups",
    code: `* Difference-in-Differences estimation
clear all
use "did_sample.dta", clear

* Variables: treat (1=treatment group), post (1=after policy), y (outcome)

* Basic DiD specification
regress y i.treat##i.post, vce(robust)

* Extract treatment effect
lincom 1.treat#1.post
display "Treatment effect: " _b[1.treat#1.post]

* Event study with multiple periods (if panel data available)
* xtset id year
* reghdfe y i.year##i.treat, absorb(id) vce(cluster id)

* Pre-trend test (parallel trends assumption)
* Keep only pre-treatment periods and test trend differences`
  },
  {
    title: "Regression Discontinuity",
    description: "Sharp RD design around a cutoff point",
    code: `* Sharp Regression Discontinuity around cutoff c=50
clear all
use "rd_sample.dta", clear

* Create treatment indicator based on cutoff
generate D = (running_var >= 50) if !missing(running_var)

* Optimal bandwidth RD (requires rdrobust package)
* ssc install rdrobust, replace
rdrobust outcome running_var, c(50)

* Manual local linear regression (for illustration)
* Restrict to bandwidth around cutoff
keep if inrange(running_var, 45, 55)

* Center running variable at cutoff
generate centered = running_var - 50

* Local linear regression
regress outcome i.D c.centered##i.D, vce(robust)

* Treatment effect is coefficient on D
lincom 1.D`
  },
  {
    title: "Panel Fixed Effects",
    description: "Two-way fixed effects with clustered standard errors",
    code: `* Panel Fixed Effects with clustering
clear all
use "panel_data.dta", clear

* Set panel structure
xtset id year

* Two-way fixed effects (requires reghdfe)
* ssc install reghdfe, replace
reghdfe wage educ exper, absorb(id year) vce(cluster id)

* Alternative: manual fixed effects
* Unit FE with year dummies
areg wage educ exper i.year, absorb(id) vce(cluster id)

* Check for serial correlation
* xtserial wage educ exper

* Test fixed effects necessity
* xtreg wage educ exper, fe
* estimates store fe
* xtreg wage educ exper, re  
* estimates store re
* hausman fe re`
  },
  {
    title: "Logistic Regression",
    description: "Binary outcome models with marginal effects",
    code: `* Logistic regression for binary outcomes
clear all
use "binary_outcome.dta", clear

* Basic logistic regression
logistic employed educ exper, vce(robust)

* Marginal effects at means
margins, dydx(*) atmeans

* Average marginal effects
margins, dydx(*)

* Predicted probabilities by education level
margins, at(educ=(10(2)18)) atmeans

* Goodness of fit
estat classification
estat gof, group(10)`
  }
];

const promptPatterns = [
  {
    category: "Scope Control",
    patterns: [
      "Return one Stata code block only; robust SEs; no graphs; minimal comments.",
      "Include data loading, estimation, and basic diagnostics only.",
      "Skip exploratory analysis; focus on the main regression."
    ]
  },
  {
    category: "Schema Matching", 
    patterns: [
      "Match these exact variable names: [paste describe output or list]",
      "Use my dataset structure: wage (numeric), educ (numeric), id (string).",
      "Variables are already cleaned; no missing value handling needed."
    ]
  },
  {
    category: "Estimator Swapping",
    patterns: [
      "Rewrite using ivregress 2sls with instrument Z; include first-stage diagnostics.",
      "Convert to fixed effects: reghdfe with unit and year absorption.",
      "Change to logistic regression with marginal effects."
    ]
  },
  {
    category: "Standard Errors",
    patterns: [
      "Cluster at id level; two-way FE for id & year.",
      "Use robust standard errors for cross-sectional data.",
      "Bootstrap standard errors with 1000 replications."
    ]
  }
];

const qcChecklist = [
  "✅ Variable names in code match dataset exactly",
  "✅ Sample restrictions are appropriate and documented", 
  "✅ Standard error choice matches research design",
  "✅ IV diagnostics: first-stage F-stat > 10",
  "✅ DiD: check pre-trends with event study",
  "✅ RD: validate bandwidth and manipulation tests",
  "✅ Panel: test for serial correlation and choose FE vs RE",
  "✅ Reproducibility: set seed, version, explicit paths"
];

/* ---------- Main component ---------- */
export default function ImprovedAIStataGuide() {
  const sections = useMemo(() => [
    { id: "overview", label: "Overview", description: "Introduction and key principles" },
    { id: "rules", label: "Golden Rules", description: "Essential guidelines for prompting" },
    { id: "template", label: "Prompt Template", description: "Copy-paste template for structured prompts" },
    { id: "recipes", label: "Code Recipes", description: "Ready-to-use Stata code examples" },
    { id: "patterns", label: "Prompt Patterns", description: "Common prompt modifications" },
    { id: "checklist", label: "QC Checklist", description: "Verification steps before publishing" },
    { id: "resources", label: "Resources", description: "Additional tools and references" }
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Pill variant="accent">📚 Complete Guide</Pill>
            <Pill>Updated 2024</Pill>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            AI → Stata: Econometrics Prompting
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transform research questions into reliable Stata code using structured prompts, 
            ready-made recipes, and systematic verification.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Pill>OLS • IV • DiD • RD • FE</Pill>
            <Pill>Robust • Clustered SEs</Pill>
            <Pill>Panel Data</Pill>
          </div>
        </div>

        {/* Main Layout: Sticky TOC + Content */}
        <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
          {/* Sticky Table of Contents */}
          <TableOfContents sections={sections} />

          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Overview */}
            <Section 
              id="overview"
              title="Getting Started"
              description="Master the art of translating econometric problems into precise Stata code through AI assistance."
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Why This Guide?</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Turn research questions into working code faster</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Avoid common pitfalls in econometric implementation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Ensure reproducible and robust results</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">What You'll Learn</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">📝</span>
                      <span>Structure effective prompts for AI models</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">🔧</span>
                      <span>Access ready-made code for common methods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✅</span>
                      <span>Verify results with systematic checklists</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Golden Rules */}
            <Section 
              id="rules"
              title="Golden Rules"
              badge="Essential"
              description="Five fundamental principles for successful AI-assisted econometric programming."
            >
              <div className="grid gap-4">
                {[
                  {
                    rule: "1. Define Your Data Schema",
                    description: "Always specify variable names, types, and meanings. Include sample size and panel structure if applicable.",
                    example: "wage: numeric (hourly wage in $), educ: numeric (years), id: string (worker ID)"
                  },
                  {
                    rule: "2. State Your Research Design",
                    description: "Clearly identify the econometric method and identification strategy.",
                    example: "OLS with robust SEs, IV using quarter-of-birth, DiD with two periods"
                  },
                  {
                    rule: "3. Specify Standard Error Treatment", 
                    description: "Match SE choice to your research design and data structure.",
                    example: "Cluster at individual level, robust for heteroskedasticity, bootstrap for complex estimators"
                  },
                  {
                    rule: "4. Request Code Only",
                    description: "Ask for executable code with minimal comments, avoiding interactive prompts or placeholders.",
                    example: "Return Stata code block only; use actual variable names; include basic diagnostics"
                  },
                  {
                    rule: "5. Ensure Reproducibility",
                    description: "Include version control, seeds, and explicit package requirements.",
                    example: "set seed 12345, ssc install reghdfe, version 17"
                  }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-slate-800 mb-2">{item.rule}</h4>
                    <p className="text-slate-700 mb-2">{item.description}</p>
                    <code className="text-sm bg-white px-2 py-1 rounded border text-blue-700">
                      {item.example}
                    </code>
                  </div>
                ))}
              </div>
            </Section>

            {/* Prompt Template */}
            <Section 
              id="template"
              title="Prompt Template"
              badge="Copy & Fill"
              description="Use this structured template to create clear, comprehensive prompts for any econometric task."
            >
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">📋 How to Use</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
                    <li>Copy the template below</li>
                    <li>Replace placeholders with your specific details</li>
                    <li>Paste into your preferred AI model (Claude, ChatGPT, etc.)</li>
                    <li>Review output using the QC checklist</li>
                  </ol>
                </div>
                <CodeBlock 
                  code={promptTemplate} 
                  caption="Universal Prompt Template"
                  language="prompt"
                />
              </div>
            </Section>

            {/* Code Recipes */}
            <Section 
              id="recipes"
              title="Ready-to-Use Code Recipes"
              description="Copy-paste Stata code for the most common econometric methods. Each recipe includes diagnostics and best practices."
            >
              <div className="grid gap-6">
                {codeRecipes.map((recipe, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{recipe.title}</h3>
                        <Pill>{`Recipe ${i + 1}`}</Pill>
                      </div>
                      <p className="text-slate-600 text-sm">{recipe.description}</p>
                    </div>
                    <div className="p-4">
                      <CodeBlock code={recipe.code} caption={recipe.title} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Prompt Patterns */}
            <Section 
              id="patterns"
              title="Prompt Modification Patterns"
              description="Common patterns for refining and adjusting your prompts to get exactly what you need."
            >
              <div className="grid md:grid-cols-2 gap-6">
                {promptPatterns.map((category, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {category.category}
                    </h3>
                    <ul className="space-y-2">
                      {category.patterns.map((pattern, j) => (
                        <li key={j} className="text-sm text-slate-700 italic bg-white p-2 rounded border-l-2 border-blue-200">
                          "{pattern}"
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            {/* QC Checklist */}
            <Section 
              id="checklist"
              title="Quality Control Checklist"
              badge="Before Publishing"
              description="Systematic verification steps to ensure your code is correct, robust, and reproducible."
            >
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <span>✅</span> Pre-Publication Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {qcChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border border-green-200">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Resources */}
            <Section 
              id="resources"
              title="Additional Resources"
              description="Helpful tools, packages, and references to enhance your econometric workflow."
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Essential Packages</h3>
                  <ul className="space-y-2 text-sm">
                    <li><code className="bg-slate-100 px-2 py-1 rounded">reghdfe</code> - High-dimensional FE</li>
                    <li><code className="bg-slate-100 px-2 py-1 rounded">rdrobust</code> - RD estimation</li>
                    <li><code className="bg-slate-100 px-2 py-1 rounded">estout</code> - Table formatting</li>
                    <li><code className="bg-slate-100 px-2 py-1 rounded">ietoolkit</code> - Impact evaluation</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Best Practices</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• Keep dated do-files</li>
                    <li>• Document data sources</li>
                    <li>• Set project-root paths</li>
                    <li>• Version control with Git</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Ethics & Attribution</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• You verify all results</li>
                    <li>• Cite your code, not the AI</li>
                    <li>• Document methodology clearly</li>
                    <li>• Share replication files</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Footer */}
            <div className="text-center py-8 text-sm text-slate-500">
              <Link href="/labs" className="text-blue-600 hover:underline font-medium">
                ← Back to Labs
              </Link>
              <span className="mx-3">•</span>
              <Link href="/resources" className="text-blue-600 hover:underline font-medium">
                More Resources →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}