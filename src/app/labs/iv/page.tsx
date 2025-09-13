// src/app/labs/iv/page.tsx
import Link from "next/link";

export default function IVLab() {
  return (
    <div className="py-10">
      <div className="text-sm mb-3">
        <Link href="/labs" className="opacity-70 hover:opacity-100">
          ← Back to Labs
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Instrumental Variables (2SLS) Lab</h1>
      <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
        Explore relevance and exclusion. Try changing first-stage strength and
        see how the 2SLS estimate and its SEs respond. (Coming soon.)
      </p>

      <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
        <p className="text-sm">
          🚧 This lab is a placeholder. You can start by showing a tiny generated
          dataset with columns <code>y, x, z</code> and a first-stage regression, then compute a
          2SLS estimate. I can scaffold that when you’re ready.
        </p>
      </div>
    </div>
  );
}