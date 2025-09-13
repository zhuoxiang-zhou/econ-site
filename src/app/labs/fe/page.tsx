// src/app/labs/fe/page.tsx
import Link from "next/link";

export default function FELab() {
  return (
    <div className="py-10">
      <div className="text-sm mb-3">
        <Link href="/labs" className="opacity-70 hover:opacity-100">
          ← Back to Labs
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Panels: Fixed Effects Lab</h1>
      <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
        Within-unit comparisons and the importance of clustered SEs. (Coming soon.)
      </p>
      <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
        <p className="text-sm">
          🚧 Placeholder. We’ll add a toy panel and show how unit FE and
          clustering change the results.
        </p>
      </div>
    </div>
  );
}