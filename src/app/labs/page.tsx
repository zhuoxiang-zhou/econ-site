// "use client";

// import Link from "next/link";
// import { motion } from "framer-motion";
// import { FlaskConical, Play, ArrowRight, Zap, BookOpen, Clock } from "lucide-react";

// type Lab = {
//   slug: string;
//   title: string;
//   blurb: string;
//   badge?: string;
//   difficulty: "Beginner" | "Intermediate" | "Advanced";
//   duration: string;
//   icon: string;
//   methods: string[];
// };

// const LABS: Lab[] = [
//   {
//     slug: "ols",
//     title: "OLS Sandbox",
//     blurb: "Interactive regression playground with real-time coefficient updates, residual plots, and robust standard errors.",
//     badge: "Start here",
//     difficulty: "Beginner",
//     duration: "10-15 min",
//     icon: "📊",
//     methods: ["Linear Regression", "Robust SEs", "R-squared"]
//   },
//   {
//     slug: "iv",
//     title: "Instrumental Variables Lab",
//     blurb: "Explore instrument strength and exclusion restrictions. Watch first-stage F-statistics change in real-time.",
//     difficulty: "Intermediate", 
//     duration: "15-20 min",
//     icon: "🔧",
//     methods: ["2SLS", "First-stage", "Weak instruments"]
//   },
//   {
//     slug: "did",
//     title: "Difference-in-Differences",
//     blurb: "Manipulate treatment timing and group composition. Visualize parallel trends assumptions and event studies.",
//     difficulty: "Intermediate",
//     duration: "20-25 min", 
//     icon: "📈",
//     methods: ["DiD", "Event study", "Parallel trends"]
//   },
//   {
//     slug: "rd",
//     title: "Regression Discontinuity",
//     blurb: "Adjust cutoffs and bandwidths dynamically. See how local treatment effects change around thresholds.",
//     difficulty: "Intermediate",
//     duration: "25-30 min",
//     icon: "📏", 
//     methods: ["Sharp RD", "Bandwidth", "Local effects"]
//   },
//   {
//     slug: "fe",
//     title: "Panel Fixed Effects",
//     blurb: "Compare within and between variation. Experiment with clustering and two-way fixed effects models.",
//     difficulty: "Intermediate",
//     duration: "20-25 min",
//     icon: "🔒",
//     methods: ["Panel data", "Fixed effects", "Clustering"]
//   },
// ];

// function DifficultyBadge({ level }: { level: string }) {
//   const colors = {
//     "Beginner": "bg-green-100 text-green-700 border-green-200",
//     "Intermediate": "bg-amber-100 text-amber-700 border-amber-200", 
//     "Advanced": "bg-red-100 text-red-700 border-red-200"
//   };
  
//   return (
//     <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colors[level as keyof typeof colors]}`}>
//       {level}
//     </span>
//   );
// }

// export default function EnhancedLabsIndex() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       <div className="max-w-6xl mx-auto px-4 py-12">
        
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.6 }}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg mb-6"
//           >
//             <FlaskConical size={16} className="text-blue-600" />
//             <span className="text-sm font-medium text-slate-700">Interactive Learning</span>
//           </motion.div>

//           <motion.h1
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.1 }}
//             className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
//           >
//             Regression Labs
//           </motion.h1>
          
//           <motion.p
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8"
//           >
//             Master econometric methods through hands-on experimentation. Each lab provides 
//             interactive tools to build intuition, explore assumptions, and see how 
//             specification choices affect your results in real-time.
//           </motion.p>

//           {/* Quick Stats */}
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.3 }}
//             className="flex flex-wrap justify-center gap-6 py-4 px-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
//           >
//             <div className="text-center">
//               <div className="text-2xl font-bold text-blue-600">{LABS.length}</div>
//               <div className="text-sm text-slate-600">Interactive Labs</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-purple-600">Real-time</div>
//               <div className="text-sm text-slate-600">Results</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-emerald-600">100%</div>
//               <div className="text-sm text-slate-600">Browser-based</div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Labs Grid */}
//         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
//           {LABS.map((lab, i) => (
//             <motion.div
//               key={lab.slug}
//               initial={{ y: 30, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
//               whileHover={{ y: -5, transition: { duration: 0.2 } }}
//             >
//               <Link href={`/labs/${lab.slug}`}>
//                 <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  
//                   {/* Gradient Header */}
//                   <div
//                     className="absolute inset-x-0 top-0 h-1"
//                     style={{
//                       background:
//                         i % 4 === 0
//                           ? "linear-gradient(90deg,#3b82f6,#8b5cf6)"
//                           : i % 4 === 1
//                           ? "linear-gradient(90deg,#f59e0b,#ef4444)"
//                           : i % 4 === 2
//                           ? "linear-gradient(90deg,#10b981,#06b6d4)"
//                           : "linear-gradient(90deg,#ec4899,#f97316)",
//                     }}
//                   />

//                   <div className="p-6">
//                     {/* Header */}
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex items-center gap-3">
//                         <span className="text-3xl">{lab.icon}</span>
//                         <div>
//                           <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
//                             {lab.title}
//                           </h2>
//                           <div className="flex items-center gap-2 mt-1">
//                             <DifficultyBadge level={lab.difficulty} />
//                             {lab.badge && (
//                               <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium">
//                                 {lab.badge}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <ArrowRight 
//                         size={20} 
//                         className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" 
//                       />
//                     </div>

//                     {/* Description */}
//                     <p className="text-sm text-slate-700 mb-4 leading-relaxed">
//                       {lab.blurb}
//                     </p>

//                     {/* Methods Tags */}
//                     <div className="flex flex-wrap gap-2 mb-4">
//                       {lab.methods.map((method) => (
//                         <span
//                           key={method}
//                           className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
//                         >
//                           {method}
//                         </span>
//                       ))}
//                     </div>

//                     {/* Footer */}
//                     <div className="flex items-center justify-between pt-4 border-t border-slate-100">
//                       <div className="flex items-center gap-4 text-xs text-slate-500">
//                         <div className="flex items-center gap-1">
//                           <Clock size={12} />
//                           <span>{lab.duration}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Zap size={12} />
//                           <span>Interactive</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:text-blue-700">
//                         <Play size={14} />
//                         <span>Launch</span>
//                       </div>
//                     </div>
//                   </div>
//                 </article>
//               </Link>
//             </motion.div>
//           ))}
//         </div>

//         {/* Learning Path Section */}
//         <motion.div
//           initial={{ y: 30, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.8, delay: 0.8 }}
//           className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 mb-8"
//         >
//           <div className="text-center mb-6">
//             <h2 className="text-2xl font-bold text-slate-800 mb-2">Suggested Learning Path</h2>
//             <p className="text-slate-600">Follow this sequence to build your econometric intuition step by step</p>
//           </div>
          
//           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//             {[
//               { title: "Start with OLS", desc: "Master the fundamentals", color: "bg-green-100 text-green-700" },
//               { title: "Explore Controls", desc: "Understand confounding", color: "bg-blue-100 text-blue-700" },
//               { title: "Try Advanced Methods", desc: "IV, DiD, RD, FE", color: "bg-purple-100 text-purple-700" },
//               { title: "Practice Integration", desc: "Combine techniques", color: "bg-amber-100 text-amber-700" }
//             ].map((step, i) => (
//               <div key={i} className="flex items-center gap-3">
//                 <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center font-bold text-sm`}>
//                   {i + 1}
//                 </div>
//                 <div>
//                   <div className="font-semibold text-slate-800">{step.title}</div>
//                   <div className="text-sm text-slate-600">{step.desc}</div>
//                 </div>
//                 {i < 3 && <ArrowRight size={16} className="text-slate-400 hidden md:block" />}
//               </div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Call to Action */}
//         <motion.div
//           initial={{ y: 30, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.8, delay: 1.0 }}
//           className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
//         >
//           <h3 className="text-2xl font-bold mb-4">Ready to Start Experimenting?</h3>
//           <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
//             Each lab is designed to be completed in 10-30 minutes. Perfect for classroom demonstrations, 
//             self-study, or building intuition before diving into real research.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/labs/ols"
//               className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center gap-2"
//             >
//               <Play size={18} />
//               Start with OLS Lab
//             </Link>
//             <Link
//               href="/concepts"
//               className="px-8 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold flex items-center justify-center gap-2"
//             >
//               <BookOpen size={18} />
//               Review Concepts First
//             </Link>
//           </div>
//         </motion.div>

//         {/* Help Text */}
//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.8, delay: 1.2 }}
//           className="text-center mt-8"
//         >
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
//             <span className="text-xs text-slate-600">💡 <strong>Tip:</strong> Each lab includes breadcrumb navigation to easily return to this page</span>
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FlaskConical, Play, ArrowRight, Zap, BookOpen, Clock } from "lucide-react";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  badge?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  icon: string;
  methods: string[];
};

const LABS: Lab[] = [
  {
    slug: "ols",
    title: "OLS Sandbox",
    blurb: "Interactive regression playground with real-time coefficient updates, residual plots, and robust standard errors.",
    badge: "Start here",
    difficulty: "Beginner",
    duration: "10-15 min",
    icon: "📊",
    methods: ["Linear Regression", "Robust SEs", "R-squared"]
  },
  {
    slug: "iv",
    title: "Instrumental Variables Lab",
    blurb: "Explore instrument strength and exclusion restrictions. Watch first-stage F-statistics change in real-time.",
    difficulty: "Intermediate", 
    duration: "15-20 min",
    icon: "🔧",
    methods: ["2SLS", "First-stage", "Weak instruments"]
  },
  {
    slug: "did",
    title: "Difference-in-Differences",
    blurb: "Manipulate treatment timing and group composition. Visualize parallel trends assumptions and event studies.",
    difficulty: "Intermediate",
    duration: "20-25 min", 
    icon: "📈",
    methods: ["DiD", "Event study", "Parallel trends"]
  },
  {
    slug: "rd",
    title: "Regression Discontinuity",
    blurb: "Adjust cutoffs and bandwidths dynamically. See how local treatment effects change around thresholds.",
    difficulty: "Intermediate",
    duration: "25-30 min",
    icon: "📏", 
    methods: ["Sharp RD", "Bandwidth", "Local effects"]
  },
  {
    slug: "fe",
    title: "Panel Fixed Effects",
    blurb: "Compare within and between variation. Experiment with clustering and two-way fixed effects models.",
    difficulty: "Intermediate",
    duration: "20-25 min",
    icon: "🔒",
    methods: ["Panel data", "Fixed effects", "Clustering"]
  },
  {
    slug: "ml",
    title: "Machine Learning Methods",
    blurb: "Explore LASSO, Decision Trees, and Neural Networks. Compare feature selection, interpretability, and predictive power.",
    badge: "New",
    difficulty: "Intermediate",
    duration: "15-20 min",
    icon: "🤖",
    methods: ["LASSO", "Decision Trees", "Neural Networks"]
  },
];

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

export default function EnhancedLabsIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg mb-6"
          >
            <FlaskConical size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Interactive Learning</span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
          >
            Regression Labs
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8"
          >
            Master econometric methods through hands-on experimentation. Each lab provides 
            interactive tools to build intuition, explore assumptions, and see how 
            specification choices affect your results in real-time.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 py-4 px-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{LABS.length}</div>
              <div className="text-sm text-slate-600">Interactive Labs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Real-time</div>
              <div className="text-sm text-slate-600">Results</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">100%</div>
              <div className="text-sm text-slate-600">Browser-based</div>
            </div>
          </motion.div>
        </div>

        {/* Labs Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {LABS.map((lab, i) => (
            <motion.div
              key={lab.slug}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Link href={`/labs/${lab.slug}`}>
                <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  
                  {/* Gradient Header */}
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{
                      background:
                        i % 4 === 0
                          ? "linear-gradient(90deg,#3b82f6,#8b5cf6)"
                          : i % 4 === 1
                          ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                          : i % 4 === 2
                          ? "linear-gradient(90deg,#10b981,#06b6d4)"
                          : "linear-gradient(90deg,#ec4899,#f97316)",
                    }}
                  />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lab.icon}</span>
                        <div>
                          <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {lab.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <DifficultyBadge level={lab.difficulty} />
                            {lab.badge && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                                {lab.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight 
                        size={20} 
                        className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" 
                      />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                      {lab.blurb}
                    </p>

                    {/* Methods Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lab.methods.map((method) => (
                        <span
                          key={method}
                          className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {method}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{lab.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap size={12} />
                          <span>Interactive</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:text-blue-700">
                        <Play size={14} />
                        <span>Launch</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Learning Path Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Suggested Learning Path</h2>
            <p className="text-slate-600">Follow this sequence to build your econometric intuition step by step</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { title: "Start with OLS", desc: "Master the fundamentals", color: "bg-green-100 text-green-700" },
              { title: "Explore Controls", desc: "Understand confounding", color: "bg-blue-100 text-blue-700" },
              { title: "Try Advanced Methods", desc: "IV, DiD, RD, FE", color: "bg-purple-100 text-purple-700" },
              { title: "Practice Integration", desc: "Combine techniques", color: "bg-amber-100 text-amber-700" }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center font-bold text-sm`}>
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{step.title}</div>
                  <div className="text-sm text-slate-600">{step.desc}</div>
                </div>
                {i < 3 && <ArrowRight size={16} className="text-slate-400 hidden md:block" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Start Experimenting?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Each lab is designed to be completed in 10-30 minutes. Perfect for classroom demonstrations, 
            self-study, or building intuition before diving into real research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/labs/ols"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Start with OLS Lab
            </Link>
            <Link
              href="/concepts"
              className="px-8 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              Review Concepts First
            </Link>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
            <span className="text-xs text-slate-600">💡 <strong>Tip:</strong> Each lab includes breadcrumb navigation to easily return to this page</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
