// src/app/labs/page.tsx
"use client";

import Link from "next/link";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  badge?: string;
};

const LABS: Lab[] = [
  {
    slug: "ols",
    title: "OLS Sandbox",
    blurb:
      "Play with a tiny dataset and see how coefficients and robust SEs behave.",
    badge: "Start here",
  },
  {
    slug: "iv",
    title: "Instrumental Variables (2SLS)",
    blurb:
      "Simulate relevance vs. exclusion and watch first-stage F-stat move.",
  },
  {
    slug: "did",
    title: "Difference-in-Differences",
    blurb:
      "Change treatment timing and check how parallel trends affects estimates.",
  },
  {
    slug: "rd",
    title: "Regression Discontinuity",
    blurb:
      "Move the cutoff/bandwidth and inspect local treatment effects.",
  },
  {
    slug: "fe",
    title: "Panels: Fixed Effects",
    blurb:
      "Within-unit comparisons, clustering at the unit level, and two-way FE.",
  },
];

export default function LabsIndex() {
  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold">Regression Labs</h1>
      <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
        Lightweight, concept-first labs to build intuition. Open a lab to try a
        toy example and see how assumptions and specification choices change the
        result. (Everything is small and fast—perfect for class or self-study.)
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {LABS.map((l, i) => (
          <Link
            key={l.slug}
            href={`/labs/${l.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white hover:shadow-sm transition"
          >
            {/* subtle gradient accent */}
            <div
              className="absolute inset-x-0 top-0 h-1 opacity-70"
              style={{
                background:
                  i % 3 === 0
                    ? "linear-gradient(90deg,#60a5fa,#f472b6)"
                    : i % 3 === 1
                    ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                    : "linear-gradient(90deg,#34d399,#60a5fa)",
              }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <h2 className="font-semibold">{l.title}</h2>
                {l.badge ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-neutral-50">
                    {l.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-neutral-700 mt-2">{l.blurb}</p>
              <div className="mt-4 text-sm font-medium opacity-70 group-hover:opacity-100">
                Open →
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-neutral-500 mt-6">
        Tip: Each lab page links back here from the top-left breadcrumb.
      </p>
    </div>
  );
}