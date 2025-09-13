// // src/app/resources/page.tsx
// "use client";

// export default function ResourcesPage() {
//   return (
//     <main className="max-w-4xl mx-auto px-6 py-12">
//       <h1 className="text-2xl font-semibold mb-4">Resources</h1>
//       <p className="text-neutral-700 mb-8">
//         Useful references, datasets, and links for studying econometrics.
//       </p>

//       {/* Textbooks */}
//       <section className="mb-10">
//         <h2 className="text-lg font-medium mb-3">📚 Core Textbooks</h2>
//         <ul className="list-disc list-inside space-y-2 text-sm">
//           <li>
//             Jeffrey M. Wooldridge – <i>Introductory Econometrics: A Modern Approach</i> (7th ed.){" "}
//             <a
//               href="https://www.academia.edu/49732662/Introductory_Econometrics_7E_2020_"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               [PDF]
//             </a>
//           </li>
//           <li>
//             Joshua D. Angrist & Jörn-Steffen Pischke – <i>Mastering ’Metrics</i> (2014){" "}
//             <a
//               href="https://masteringmetrics.com"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               [Website]
//             </a>
//           </li>
//           <li>
//             Joshua D. Angrist & Jörn-Steffen Pischke – <i>Mostly Harmless Econometrics</i> (2008){" "}
//             <a
//               href="https://www.mostlyharmlesseconometrics.com/"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               [Companion site]
//             </a>
//           </li>
//         </ul>
//       </section>

//       {/* Online tools */}
//       <section className="mb-10">
//         <h2 className="text-lg font-medium mb-3">🌐 Useful Websites</h2>
//         <ul className="list-disc list-inside space-y-2 text-sm">
//           <li>
//             <a
//               href="https://www.stata.com/"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               Stata official site
//             </a>{" "}
//             – software, manuals, tutorials.
//           </li>
//           <li>
//             <a
//               href="https://www.aeaweb.org/journals"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               AEA Journals
//             </a>{" "}
//             – source of many applied econometrics papers.
//           </li>
//           <li>
//             <a
//               href="https://ourworldindata.org/"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               Our World in Data
//             </a>{" "}
//             – free, clean datasets for projects.
//           </li>
//           <li>
//             <a
//               href="https://dataverse.harvard.edu/"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               Harvard Dataverse
//             </a>{" "}
//             – large collection of research datasets.
//           </li>
//         </ul>
//       </section>

//       {/* Course syllabi
//       <section className="mb-10">
//         <h2 className="text-lg font-medium mb-3">📄 Course Materials</h2>
//         <ul className="list-disc list-inside space-y-2 text-sm">
//           <li>
//             <Link href="/syllabus">Applied Econometrics (ISSCAD) – Fall 2025 syllabus</Link>
//           </li>
//           <li>
//             <Link href="/syllabus">Intermediate Econometrics (Undergrad, PKU) – Fall 2025 syllabus</Link>
//           </li>
//           <li>
//             <a
//               href="/TA Guidance Econometrics.md"
//               target="_blank"
//               className="text-blue-600 hover:underline"
//             >
//               TA Guidance Notes
//             </a>
//           </li>
//         </ul>
//       </section> */}

//       <footer className="text-xs text-neutral-500 mt-12">
//         This page collects open educational resources. Please use institutional access
//         for copyrighted textbooks where required.
//       </footer>
//     </main>
//   );
// }


"use client";

import Link from "next/link";

function ResourceCard({ title, items }: { title: string; items: Array<{ name: string; description: string; link?: string; badge?: string }> }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
        {title}
      </h2>
      <div className="grid gap-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-slate-800">{item.name}</h3>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-2">{item.description}</p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Visit Resource <span>↗</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EnhancedResourcesPage() {
  const textbooks = [
    {
      name: "Introductory Econometrics: A Modern Approach (7th ed.)",
      description: "Jeffrey M. Wooldridge - The gold standard undergraduate textbook with clear explanations and practical examples. Covers OLS, IV, panel data, and limited dependent variables.",
      link: "https://www.cengage.com/c/introductory-econometrics-a-modern-approach-7e-wooldridge",
      badge: "Undergraduate"
    },
    {
      name: "Mastering 'Metrics: The Path from Cause to Effect",
      description: "Joshua Angrist & Jörn-Steffen Pischke - Accessible introduction to causal inference with real-world examples. Perfect for understanding the 'why' behind econometric methods.",
      link: "https://masteringmetrics.com",
      badge: "Beginner Friendly"
    },
    {
      name: "Mostly Harmless Econometrics",
      description: "Joshua Angrist & Jörn-Steffen Pischke - Advanced treatment of causal inference methods. Essential for understanding modern applied econometrics research.",
      link: "https://www.mostlyharmlesseconometrics.com/",
      badge: "Graduate"
    },
    {
      name: "Econometric Analysis (8th ed.)",
      description: "William H. Greene - Comprehensive graduate-level treatment covering both theory and applications. Excellent reference for advanced techniques.",
      link: "https://www.pearson.com/en-us/subject-catalog/p/econometric-analysis/P200000005900",
      badge: "Graduate"
    },
    {
      name: "Causal Inference: The Mixtape",
      description: "Scott Cunningham - Modern approach to causal inference with code examples in Stata, R, and Python. Free online version available.",
      link: "https://mixtape.scunning.com/",
      badge: "Free Online"
    }
  ];

  const software = [
    {
      name: "Stata",
      description: "Industry standard for econometrics with excellent documentation and built-in commands for most econometric methods. Student licenses available.",
      link: "https://www.stata.com/",
      badge: "Proprietary"
    },
    {
      name: "R + RStudio",
      description: "Free, open-source statistical software with powerful econometric packages (fixest, plm, AER). Steep learning curve but very flexible.",
      link: "https://www.r-project.org/",
      badge: "Free"
    },
    {
      name: "Python (pandas, statsmodels, linearmodels)",
      description: "General-purpose programming language with growing econometrics capabilities. Great for data manipulation and machine learning integration.",
      link: "https://www.python.org/",
      badge: "Free"
    },
    {
      name: "Gretl",
      description: "Free, user-friendly econometrics software with GUI interface. Good alternative to Stata for basic econometric analysis.",
      link: "http://gretl.sourceforge.net/",
      badge: "Free"
    }
  ];

  const datasets = [
    {
      name: "Our World in Data",
      description: "Clean, well-documented datasets on global development, health, education, and economics. Perfect for student projects and replication exercises.",
      link: "https://ourworldindata.org/",
      badge: "Free"
    },
    {
      name: "Harvard Dataverse",
      description: "Repository of research datasets from published papers. Excellent for replication studies and learning from real research.",
      link: "https://dataverse.harvard.edu/",
      badge: "Academic"
    },
    {
      name: "IPUMS (Integrated Public Use Microdata)",
      description: "Harmonized census and survey data from around the world. Essential for demographic and labor economics research.",
      link: "https://www.ipums.org/",
      badge: "Registration Required"
    },
    {
      name: "Federal Reserve Economic Data (FRED)",
      description: "US macroeconomic time series data from the St. Louis Fed. Easy-to-use interface with direct download options.",
      link: "https://fred.stlouisfed.org/",
      badge: "Free"
    },
    {
      name: "World Bank Open Data",
      description: "Development indicators, poverty data, and country statistics. Great for cross-country comparisons and development economics.",
      link: "https://data.worldbank.org/",
      badge: "Free"
    },
    {
      name: "OECD Data",
      description: "Economic indicators and policy data from developed countries. High-quality data with good documentation.",
      link: "https://data.oecd.org/",
      badge: "Free"
    }
  ];

  const journals = [
    {
      name: "American Economic Review (AER)",
      description: "Top-tier economics journal with high-quality empirical papers showcasing best practices in econometric analysis.",
      link: "https://www.aeaweb.org/journals/aer",
      badge: "Top 5"
    },
    {
      name: "Quarterly Journal of Economics (QJE)",
      description: "Prestigious journal publishing influential economics research with sophisticated econometric methods.",
      link: "https://academic.oup.com/qje",
      badge: "Top 5"
    },
    {
      name: "Journal of Econometrics",
      description: "Leading journal for econometric theory and applications. Essential for understanding methodological developments.",
      link: "https://www.sciencedirect.com/journal/journal-of-econometrics",
      badge: "Methods Focus"
    },
    {
      name: "Journal of Applied Econometrics",
      description: "Applied econometrics with replication requirements. Great for learning practical implementation of methods.",
      link: "https://onlinelibrary.wiley.com/journal/10991255",
      badge: "Applied"
    },
    {
      name: "Journal of Business & Economic Statistics",
      description: "Bridge between statistics and economics with practical applications and methodological innovations.",
      link: "https://www.tandfonline.com/toc/ubes20/current",
      badge: "Stats Focus"
    }
  ];

  const onlineResources = [
    {
      name: "Causal Inference Bootcamp (Brady Neal)",
      description: "Free video course covering modern causal inference methods with mathematical rigor and practical examples.",
      link: "https://www.bradyneal.com/causal-inference-course",
      badge: "Video Course"
    },
    {
      name: "MIT 14.32 Applied Econometrics",
      description: "Complete course materials including lectures, problem sets, and datasets from MIT's graduate econometrics course.",
      link: "https://economics.mit.edu/courses/14-32-econometrics-spring-2007",
      badge: "MIT"
    },
    {
      name: "Library of Statistical Techniques (LOST)",
      description: "Comprehensive guide to implementing econometric methods in different software packages with code examples.",
      link: "https://lost-stats.github.io/",
      badge: "Code Examples"
    },
    {
      name: "Econometrics Academy (YouTube)",
      description: "High-quality video tutorials covering econometric theory and Stata implementation. Great for visual learners.",
      link: "https://www.youtube.com/@econometricsacademy",
      badge: "YouTube"
    },
    {
      name: "Programming for Economists",
      description: "Course materials teaching programming skills essential for modern econometric research using Python and R.",
      link: "https://www.programmingforeconomists.com/",
      badge: "Programming"
    }
  ];

  const blogs = [
    {
      name: "Andrew Gelman's Blog",
      description: "Statistical modeling, causal inference, and research design insights from a leading statistician. Practical advice for applied researchers.",
      link: "https://andrewgelman.com/",
      badge: "Statistics"
    },
    {
      name: "The Effect",
      description: "Nick Huntington-Klein's comprehensive guide to research design and causal inference with practical examples and code.",
      link: "https://theeffectbook.net/",
      badge: "Causal Inference"
    },
    {
      name: "Data Colada",
      description: "Critical analysis of research methods and statistical practices. Great for learning what not to do in empirical research.",
      link: "http://datacolada.org/",
      badge: "Research Methods"
    },
    {
      name: "Marginal Revolution",
      description: "Tyler Cowen and Alex Tabarrok's economics blog featuring discussions of recent research and policy applications.",
      link: "https://marginalrevolution.com/",
      badge: "Economics"
    }
  ];

  const practicalTools = [
    {
      name: "LaTeX Templates for Economics",
      description: "Professional LaTeX templates for economics papers, including AER and QJE formats. Essential for academic writing.",
      link: "https://www.latextemplates.com/cat/academic-journals",
      badge: "LaTeX"
    },
    {
      name: "RegHD FE (High-Dimensional Fixed Effects)",
      description: "Stata package for efficiently estimating models with multiple fixed effects. Essential for panel data analysis.",
      link: "https://scorreia.com/software/reghdfe/",
      badge: "Stata Package"
    },
    {
      name: "RD Robust",
      description: "Stata/R packages for regression discontinuity analysis with optimal bandwidth selection and robust inference.",
      link: "https://rdpackages.github.io/",
      badge: "RD Analysis"
    },
    {
      name: "Difference-in-Differences Resources",
      description: "Collection of recent DiD papers, code, and methodological developments. Includes staggered treatment designs.",
      link: "https://asjadnaqvi.github.io/DiD/",
      badge: "DiD Methods"
    },
    {
      name: "OSF (Open Science Framework)",
      description: "Platform for sharing research materials, data, and code. Promotes transparency and reproducibility in research.",
      link: "https://osf.io/",
      badge: "Research Sharing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Econometrics Resources
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive collection of textbooks, software, datasets, journals, and tools 
            for learning and practicing econometrics at all levels.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-slate-800 mb-3">📍 Quick Navigation</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "📚 Textbooks", href: "#textbooks" },
              { label: "💻 Software", href: "#software" },
              { label: "📊 Datasets", href: "#datasets" },
              { label: "📰 Journals", href: "#journals" },
              { label: "🎓 Online Courses", href: "#online" },
              { label: "✍️ Blogs", href: "#blogs" },
              { label: "🔧 Tools", href: "#tools" }
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Resource Sections */}
        <div id="textbooks">
          <ResourceCard title="📚 Essential Textbooks" items={textbooks} />
        </div>

        <div id="software">
          <ResourceCard title="💻 Software & Programming" items={software} />
        </div>

        <div id="datasets">
          <ResourceCard title="📊 Data Sources" items={datasets} />
        </div>

        <div id="journals">
          <ResourceCard title="📰 Key Journals" items={journals} />
        </div>

        <div id="online">
          <ResourceCard title="🎓 Online Learning" items={onlineResources} />
        </div>

        <div id="blogs">
          <ResourceCard title="✍️ Influential Blogs & Websites" items={blogs} />
        </div>

        <div id="tools">
          <ResourceCard title="🔧 Practical Tools" items={practicalTools} />
        </div>

        {/* Study Path Recommendations */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">🎯 Recommended Learning Paths</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-700 mb-3">📖 Undergraduate Path</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                <li>Start with Wooldridge textbook</li>
                <li>Learn Stata or R for implementation</li>
                <li>Practice with Our World in Data datasets</li>
                <li>Read Mastering 'Metrics for intuition</li>
                <li>Explore AER papers for real applications</li>
              </ol>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-700 mb-3">🎓 Graduate Path</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                <li>Master Mostly Harmless Econometrics</li>
                <li>Take Brady Neal's Causal Inference course</li>
                <li>Learn advanced Stata packages (reghdfe, rdrobust)</li>
                <li>Read Journal of Econometrics methodological papers</li>
                <li>Practice replication using Harvard Dataverse</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Tips for Success */}
        <section className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">💡 Tips for Success</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-700 mb-2">📊 Practice with Real Data</h3>
              <p className="text-sm text-amber-700">
                Don't just read about methods - implement them using actual datasets. Start with clean data from Our World in Data.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-700 mb-2">🔄 Replicate Published Results</h3>
              <p className="text-sm text-amber-700">
                Find papers with available data and code, then try to reproduce their main results. This builds practical skills.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-700 mb-2">📝 Document Everything</h3>
              <p className="text-sm text-amber-700">
                Keep detailed notes, save your code, and document your data sources. Good habits early will save time later.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="text-sm text-slate-600 mb-4">
            <strong>Note:</strong> This collection focuses on open educational resources and freely available materials. 
            Please use institutional access for copyrighted textbooks and journal articles where required.
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/labs" className="text-blue-600 hover:underline font-medium">
              ← Back to Labs
            </Link>
            <span className="text-slate-400">•</span>
            <Link href="/ai-stata" className="text-blue-600 hover:underline font-medium">
              AI-Stata Guide →
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}