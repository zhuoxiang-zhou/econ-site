// src/app/resources/page.tsx
"use client";

import Link from "next/link";

export default function ResourcesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-4">Resources</h1>
      <p className="text-neutral-700 mb-8">
        Useful references, datasets, and links for studying econometrics.
      </p>

      {/* Textbooks */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">📚 Core Textbooks</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>
            Jeffrey M. Wooldridge – <i>Introductory Econometrics: A Modern Approach</i> (7th ed.){" "}
            <a
              href="https://www.academia.edu/49732662/Introductory_Econometrics_7E_2020_"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              [PDF]
            </a>
          </li>
          <li>
            Joshua D. Angrist & Jörn-Steffen Pischke – <i>Mastering ’Metrics</i> (2014){" "}
            <a
              href="https://masteringmetrics.com"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              [Website]
            </a>
          </li>
          <li>
            Joshua D. Angrist & Jörn-Steffen Pischke – <i>Mostly Harmless Econometrics</i> (2008){" "}
            <a
              href="https://www.mostlyharmlesseconometrics.com/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              [Companion site]
            </a>
          </li>
        </ul>
      </section>

      {/* Online tools */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">🌐 Useful Websites</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>
            <a
              href="https://www.stata.com/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Stata official site
            </a>{" "}
            – software, manuals, tutorials.
          </li>
          <li>
            <a
              href="https://www.aeaweb.org/journals"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              AEA Journals
            </a>{" "}
            – source of many applied econometrics papers.
          </li>
          <li>
            <a
              href="https://ourworldindata.org/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Our World in Data
            </a>{" "}
            – free, clean datasets for projects.
          </li>
          <li>
            <a
              href="https://dataverse.harvard.edu/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Harvard Dataverse
            </a>{" "}
            – large collection of research datasets.
          </li>
        </ul>
      </section>

      {/* Course syllabi
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">📄 Course Materials</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>
            <Link href="/syllabus">Applied Econometrics (ISSCAD) – Fall 2025 syllabus</Link>
          </li>
          <li>
            <Link href="/syllabus">Intermediate Econometrics (Undergrad, PKU) – Fall 2025 syllabus</Link>
          </li>
          <li>
            <a
              href="/TA Guidance Econometrics.md"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              TA Guidance Notes
            </a>
          </li>
        </ul>
      </section> */}

      <footer className="text-xs text-neutral-500 mt-12">
        This page collects open educational resources. Please use institutional access
        for copyrighted textbooks where required.
      </footer>
    </main>
  );
}