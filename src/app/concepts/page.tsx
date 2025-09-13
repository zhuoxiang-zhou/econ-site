// // src/app/concepts/page.tsx
// "use client";

// import { useMemo, useState } from "react";

// // --- tiny helper ---
// function CopyButton({ text }: { text: string }) {
//   const [copied, setCopied] = useState(false);
//   return (
//     <button
//       onClick={async () => {
//         await navigator.clipboard.writeText(text);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1000);
//       }}
//       className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm transition"
//       aria-label="Copy Stata snippet"
//       title="Copy Stata snippet"
//     >
//       {copied ? "Copied!" : "Copy"}
//     </button>
//   );
// }

// // --- content model ---
// type Card = {
//   key: string;
//   title: string;
//   tags: string[];
//   intuition: string;
//   gotcha: string;
//   checks: string[];
//   stata: string;
// };

// const CARDS: Card[] = [
//   {
//     key: "ols",
//     title: "OLS (Simple Regression)",
//     tags: ["OLS", "Robust SE"],
//     intuition:
//       "Fits a line that minimizes squared residuals: best linear predictor of Y from X under the Gauss–Markov conditions.",
//     gotcha:
//       "Report uncertainty: use robust standard errors when errors are heteroskedastic; high R² ≠ causal.",
//     checks: [
//       "Look for outliers/leverage; plot residuals vs. fitted.",
//       "If Y is log, interpret β as approx. % change: 100*(exp(β)−1).",
//       "Always state the identifying assumption (exogeneity).",
//     ],
//     stata: `* OLS with robust SEs
// reg y x1 x2, vce(robust)

// * log outcome interpretation (if ln_y is used)
// reg ln_y x1 x2, vce(robust)
// display "Percent effect of x1 = " 100*(exp(_b[x1]) - 1)`,
//   },
//   {
//     key: "mr",
//     title: "Multiple Regression & Controls",
//     tags: ["Controls", "Confounding"],
//     intuition:
//       "Controls soak up confounders so the remaining variation in X is closer to as-good-as-random.",
//     gotcha:
//       "Bad controls (post-treatment or mediators) bias estimates; watch functional form.",
//     checks: [
//       "Justify each control; avoid post-treatment variables.",
//       "Try alternative sets of controls to show robustness.",
//       "Nonlinearities? Add polynomials or bins if justified.",
//     ],
//     stata: `* Multiple regression with selected controls
// reg y treat age agesq i.region, vce(robust)

// * NOTE: avoid including variables affected by 'treat'`,
//   },
//   {
//     key: "iv",
//     title: "Instrumental Variables (2SLS)",
//     tags: ["IV", "2SLS"],
//     intuition:
//       "Use Z that moves X but affects Y only through X (exclusion). First-stage relevance is essential.",
//     gotcha:
//       "Weak instruments → big bias; always show first-stage F and justify exclusion in words.",
//     checks: [
//       "Report first-stage F (rule of thumb: >10).",
//       "Argue exclusion with a causal diagram or narrative.",
//       "If multiple instruments, check over-ID (Hansen/Sargan).",
//     ],
//     stata: `* IV / 2SLS
// ivregress 2sls y (x = z) w1 w2, vce(robust)
// estat firststage
// * if multiple instruments
// * estat overid`,
//   },
//   {
//     key: "did",
//     title: "Difference-in-Differences",
//     tags: ["DiD", "Event study"],
//     intuition:
//       "Identifies effects from differential changes over time; needs a parallel-trends assumption.",
//     gotcha:
//       "Check pretrends; group composition and staggered timing can matter.",
//     checks: [
//       "Plot pre-period effects (event study).",
//       "Check for treatment timing heterogeneity issues.",
//       "State why parallel trends is plausible.",
//     ],
//     stata: `* Two-period DiD
// reg y i.treat##i.post, vce(robust)

// * Event study (panel)
// * xtset id year
// * reghdfe y i.year##i.treat, absorb(id) vce(cluster id)`,
//   },
//   {
//     key: "rd",
//     title: "Regression Discontinuity",
//     tags: ["RD"],
//     intuition:
//       "Local randomization at a cutoff yields local treatment effects near the threshold.",
//     gotcha:
//       "Bandwidth choice, balance around cutoff, and manipulation checks (McCrary) matter.",
//     checks: [
//       "Report robustness across bandwidths & polynomials.",
//       "Test covariate balance near the cutoff.",
//       "Check for bunching/manipulation at the threshold.",
//     ],
//     stata: `* Sharp RD with rdrobust (if installed)
// * ssc install rdrobust, replace
// rdrobust y r, c(50)

// * Manual local linear (illustrative)
// * keep if inrange(r, 45, 55)
// * gen D = r >= 50
// * gen dist = r - 50
// * regress y c.D c.dist##c.D, vce(robust)`,
//   },
//   {
//     key: "fe",
//     title: "Panels: Fixed Effects",
//     tags: ["Panel", "FE", "Clustered SE"],
//     intuition:
//       "Within-unit comparisons remove time-invariant bias; cluster SEs at the unit level.",
//     gotcha:
//       "Serial correlation inflates precision if not clustered; beware dynamic FE bias with short panels.",
//     checks: [
//       "Cluster at the correct level (often unit).",
//       "Consider two-way FE (unit & year) to absorb shocks.",
//       "If treatment varies over time, consider event-study.",
//     ],
//     stata: `* Two-way FE (id and year)
// * ssc install reghdfe, replace
// reghdfe y x1 x2, absorb(id year) vce(cluster id)

// * One absorb + time dummies
// * areg y x1 x2 i.year, absorb(id) vce(cluster id)`,
//   },
// ];

// // --- pill component ---
// function Tag({ t, active, onClick }: { t: string; active: boolean; onClick: () => void }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`text-xs px-3 py-1 rounded-full border transition ${
//         active ? "bg-black text-white" : "bg-white hover:bg-neutral-50"
//       } border-black/10`}
//     >
//       {t}
//     </button>
//   );
// }

// export default function Concepts() {
//   const [q, setQ] = useState("");
//   const [tag, setTag] = useState<string>("All");
//   const [open, setOpen] = useState<string | null>(null);

//   const allTags = useMemo(
//     () => ["All", ...Array.from(new Set(CARDS.flatMap((c) => c.tags)))],
//     []
//   );

//   const filtered = useMemo(() => {
//     return CARDS.filter((c) => {
//       const hitTag = tag === "All" || c.tags.includes(tag);
//       const hay = (c.title + " " + c.intuition + " " + c.gotcha + " " + c.tags.join(" "))
//         .toLowerCase();
//       const hitQ = hay.includes(q.trim().toLowerCase());
//       return hitTag && hitQ;
//     });
//   }, [q, tag]);

//   return (
//     <div className="py-10">
//       <h1 className="text-2xl font-semibold mb-4">Concept Cards</h1>

//       {/* Search + tags */}
//       <div className="flex flex-col md:flex-row gap-3 md:items-center mb-5">
//         <input
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           placeholder="Search (e.g., 'robust', 'IV', 'parallel trends')"
//           className="flex-1 border rounded-xl px-3 py-2 text-sm"
//         />
//         <div className="flex flex-wrap gap-2">
//           {allTags.map((t) => (
//             <Tag key={t} t={t} active={t === tag} onClick={() => setTag(t)} />
//           ))}
//         </div>
//       </div>

//       {/* Cards */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {filtered.map((c, idx) => (
//           <article
//             key={c.key}
//             className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white"
//           >
//             {/* gradient top border */}
//             <div
//               className="absolute inset-x-0 top-0 h-1 opacity-70"
//               style={{
//                 background:
//                   idx % 3 === 0
//                     ? "linear-gradient(90deg,#60a5fa,#f472b6)"
//                     : idx % 3 === 1
//                     ? "linear-gradient(90deg,#f59e0b,#ef4444)"
//                     : "linear-gradient(90deg,#34d399,#60a5fa)",
//               }}
//             />

//             <div className="p-5">
//               <div className="flex items-start justify-between gap-3">
//                 <h2 className="text-lg font-semibold">{c.title}</h2>
//                 <div className="flex gap-2">
//                   <CopyButton text={c.stata} />
//                   <button
//                     onClick={() => setOpen((o) => (o === c.key ? null : c.key))}
//                     className="text-xs px-2 py-1 rounded-md border border-black/10 hover:shadow-sm transition"
//                     aria-expanded={open === c.key}
//                   >
//                     {open === c.key ? "Hide checks" : "More"}
//                   </button>
//                 </div>
//               </div>

//               <p className="mt-2 text-sm">
//                 <span className="font-medium">Intuition:</span> {c.intuition}
//               </p>
//               <p className="mt-2 text-sm">
//                 <span className="font-medium">Gotcha:</span> {c.gotcha}
//               </p>

//               {/* reveal section */}
//               <div
//                 className={`transition-[max-height,opacity] duration-300 ease-out ${
//                   open === c.key ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//                 } overflow-hidden`}
//               >
//                 <div className="mt-4 grid gap-3 md:grid-cols-2">
//                   <div className="border rounded-xl p-3">
//                     <h3 className="font-medium text-sm mb-2">Checks</h3>
//                     <ul className="text-sm list-disc pl-5 space-y-1">
//                       {c.checks.map((s, i) => (
//                         <li key={i}>{s}</li>
//                       ))}
//                     </ul>
//                   </div>
//                   <div className="border rounded-xl p-3">
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="font-medium text-sm">Stata pattern</h3>
//                       <CopyButton text={c.stata} />
//                     </div>
//                     <pre className="text-xs whitespace-pre-wrap bg-neutral-50 rounded-lg p-3 border overflow-x-auto">
//                       <code>{c.stata}</code>
//                     </pre>
//                   </div>
//                 </div>
//               </div>

//               {/* tags */}
//               <div className="mt-4 flex flex-wrap gap-2">
//                 {c.tags.map((t) => (
//                   <span
//                     key={t}
//                     className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-neutral-50"
//                   >
//                     {t}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </article>
//         ))}
//       </div>

//       {/* Empty state */}
//       {filtered.length === 0 && (
//         <div className="text-sm text-neutral-600 mt-10">
//           No matches. Try a different keyword or tag.
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, ExternalLink, Copy, ChevronRight, BookOpen, TrendingUp, Zap } from "lucide-react";

// --- tiny helper ---
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }}
      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
      aria-label="Copy Stata snippet"
      title="Copy Stata snippet"
    >
      <Copy size={12} />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// --- content model ---
type Card = {
  key: string;
  title: string;
  tags: string[];
  intuition: string;
  gotcha: string;
  checks: string[];
  stata: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
};

const CARDS: Card[] = [
  {
    key: "ols",
    title: "OLS (Simple Regression)",
    tags: ["OLS", "Robust SE", "Linear"],
    difficulty: "Beginner",
    icon: "📊",
    intuition:
      "Fits a line that minimizes squared residuals: best linear predictor of Y from X under the Gauss–Markov conditions.",
    gotcha:
      "Report uncertainty: use robust standard errors when errors are heteroskedastic; high R² ≠ causal.",
    checks: [
      "Look for outliers/leverage; plot residuals vs. fitted.",
      "If Y is log, interpret β as approx. % change: 100*(exp(β)−1).",
      "Always state the identifying assumption (exogeneity).",
    ],
    stata: `* OLS with robust SEs
reg y x1 x2, vce(robust)

* log outcome interpretation (if ln_y is used)
reg ln_y x1 x2, vce(robust)
display "Percent effect of x1 = " 100*(exp(_b[x1]) - 1)`,
  },
  {
    key: "multiple-regression",
    title: "Multiple Regression & Controls",
    tags: ["Controls", "Confounding", "OLS"],
    difficulty: "Beginner",
    icon: "🎛️",
    intuition:
      "Controls soak up confounders so the remaining variation in X is closer to as-good-as-random.",
    gotcha:
      "Bad controls (post-treatment or mediators) bias estimates; watch functional form.",
    checks: [
      "Justify each control; avoid post-treatment variables.",
      "Try alternative sets of controls to show robustness.",
      "Nonlinearities? Add polynomials or bins if justified.",
    ],
    stata: `* Multiple regression with selected controls
reg y treat age agesq i.region, vce(robust)

* NOTE: avoid including variables affected by 'treat'`,
  },
  {
    key: "instrumental-variables",
    title: "Instrumental Variables (2SLS)",
    tags: ["IV", "2SLS", "Endogeneity"],
    difficulty: "Intermediate",
    icon: "🔧",
    intuition:
      "Use Z that moves X but affects Y only through X (exclusion). First-stage relevance is essential.",
    gotcha:
      "Weak instruments → big bias; always show first-stage F and justify exclusion in words.",
    checks: [
      "Report first-stage F (rule of thumb: >10).",
      "Argue exclusion with a causal diagram or narrative.",
      "If multiple instruments, check over-ID (Hansen/Sargan).",
    ],
    stata: `* IV / 2SLS
ivregress 2sls y (x = z) w1 w2, vce(robust)
estat firststage
* if multiple instruments
* estat overid`,
  },
  {
    key: "difference-in-differences",
    title: "Difference-in-Differences",
    tags: ["DiD", "Event study", "Panel"],
    difficulty: "Intermediate",
    icon: "📈",
    intuition:
      "Identifies effects from differential changes over time; needs a parallel-trends assumption.",
    gotcha:
      "Check pretrends; group composition and staggered timing can matter.",
    checks: [
      "Plot pre-period effects (event study).",
      "Check for treatment timing heterogeneity issues.",
      "State why parallel trends is plausible.",
    ],
    stata: `* Two-period DiD
reg y i.treat##i.post, vce(robust)

* Event study (panel)
* xtset id year
* reghdfe y i.year##i.treat, absorb(id) vce(cluster id)`,
  },
  {
    key: "regression-discontinuity",
    title: "Regression Discontinuity",
    tags: ["RD", "Quasi-experimental"],
    difficulty: "Advanced",
    icon: "📏",
    intuition:
      "Local randomization at a cutoff yields local treatment effects near the threshold.",
    gotcha:
      "Bandwidth choice, balance around cutoff, and manipulation checks (McCrary) matter.",
    checks: [
      "Report robustness across bandwidths & polynomials.",
      "Test covariate balance near the cutoff.",
      "Check for bunching/manipulation at the threshold.",
    ],
    stata: `* Sharp RD with rdrobust (if installed)
* ssc install rdrobust, replace
rdrobust y r, c(50)

* Manual local linear (illustrative)
* keep if inrange(r, 45, 55)
* gen D = r >= 50
* gen dist = r - 50
* regress y c.D c.dist##c.D, vce(robust)`,
  },
  {
    key: "fixed-effects",
    title: "Panels: Fixed Effects",
    tags: ["Panel", "FE", "Clustered SE"],
    difficulty: "Intermediate",
    icon: "🔒",
    intuition:
      "Within-unit comparisons remove time-invariant bias; cluster SEs at the unit level.",
    gotcha:
      "Serial correlation inflates precision if not clustered; beware dynamic FE bias with short panels.",
    checks: [
      "Cluster at the correct level (often unit).",
      "Consider two-way FE (unit & year) to absorb shocks.",
      "If treatment varies over time, consider event-study.",
    ],
    stata: `* Two-way FE (id and year)
* ssc install reghdfe, replace
reghdfe y x1 x2, absorb(id year) vce(cluster id)

* One absorb + time dummies
* areg y x1 x2 i.year, absorb(id) vce(cluster id)`,
  },
];

// --- pill component ---
function Tag({ t, active, onClick }: { t: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
        active 
          ? "bg-blue-600 text-white border-blue-600 shadow-lg" 
          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
      }`}
    >
      {t}
    </button>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const colors = {
    "Beginner": "bg-green-100 text-green-700 border-green-200",
    "Intermediate": "bg-amber-100 text-amber-700 border-amber-200", 
    "Advanced": "bg-red-100 text-red-700 border-red-200"
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colors[level as keyof typeof colors]}`}>
      {level}
    </span>
  );
}

export default function EnhancedConcepts() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<string>("All");

  const allTags = useMemo(
    () => ["All", ...Array.from(new Set(CARDS.flatMap((c) => c.tags)))],
    []
  );

  const allDifficulties = useMemo(
    () => ["All", "Beginner", "Intermediate", "Advanced"],
    []
  );

  const filtered = useMemo(() => {
    return CARDS.filter((c) => {
      const hitTag = tag === "All" || c.tags.includes(tag);
      const hitDifficulty = difficulty === "All" || c.difficulty === difficulty;
      const hay = (c.title + " " + c.intuition + " " + c.gotcha + " " + c.tags.join(" "))
        .toLowerCase();
      const hitQ = hay.includes(q.trim().toLowerCase());
      return hitTag && hitQ && hitDifficulty;
    });
  }, [q, tag, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg mb-6"
          >
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Interactive Learning</span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
          >
            Econometric Concepts
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            Master the core methods of causal inference with interactive concept cards. 
            Each method includes intuition, common pitfalls, and ready-to-use Stata code.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search methods, techniques, or concepts..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            {/* Tag Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 6).map((t) => (
                  <Tag key={t} t={t} active={t === tag} onClick={() => setTag(t)} />
                ))}
              </div>
            </div>
            
            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Level:</span>
              <div className="flex gap-2">
                {allDifficulties.map((d) => (
                  <Tag key={d} t={d} active={d === difficulty} onClick={() => setDifficulty(d)} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="text-slate-600">
            Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of {CARDS.length} concepts
            {tag !== "All" && <span className="text-blue-600"> • {tag}</span>}
            {difficulty !== "All" && <span className="text-amber-600"> • {difficulty}</span>}
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card, idx) => (
            <motion.div
              key={card.key}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Link href={`/concepts/${card.key}`}>
                <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  {/* Gradient Header */}
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{
                      background:
                        idx % 4 === 0
                          ? "linear-gradient(90deg,#3b82f6,#8b5cf6)"
                          : idx % 4 === 1
                          ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                          : idx % 4 === 2
                          ? "linear-gradient(90deg,#10b981,#06b6d4)"
                          : "linear-gradient(90deg,#ec4899,#f97316)",
                    }}
                  />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{card.icon}</span>
                        <div>
                          <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h2>
                          <DifficultyBadge level={card.difficulty} />
                        </div>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
                      />
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Intuition</span>
                        <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                          {card.intuition}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Key Gotcha</span>
                        <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                          {card.gotcha}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                      {card.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                          +{card.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Zap size={14} />
                        <span>{card.checks.length} quality checks</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CopyButton text={card.stata} />
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          Learn More <ExternalLink size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No concepts found</h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search terms or filters to find what you are looking for.
            </p>
            <button
              onClick={() => {
                setQ("");
                setTag("All");
                setDifficulty("All");
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* Call to Action */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to Practice?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Take your understanding to the next level with hands-on regression labs 
              and AI-powered Stata code generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/labs/ols"
                className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
              >
                Try Interactive Labs
              </Link>
              <Link
                href="/ai-stata"
                className="px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold"
              >
                Generate Stata Code
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}