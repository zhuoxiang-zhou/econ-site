// src/app/labs/rd/page.tsx
import Link from "next/link";

export default function RDLab() {
  return (
    <div className="py-10">
      <div className="text-sm mb-3">
        <Link href="/labs" className="opacity-70 hover:opacity-100">
          ← Back to Labs
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Regression Discontinuity Lab</h1>
      <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
        Move the cutoff and bandwidth; check local effects and balance. (Coming soon.)
      </p>
      <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
        <p className="text-sm">
          🚧 Placeholder. We’ll add a simple plot and local linear fit near a
          threshold with sliders for cutoff and bandwidth.
        </p>
      </div>
    </div>
  );
}