// src/app/labs/did/page.tsx
import Link from "next/link";

export default function DiDLab() {
  return (
    <div className="py-10">
      <div className="text-sm mb-3">
        <Link href="/labs" className="opacity-70 hover:opacity-100">
          ← Back to Labs
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Difference-in-Differences Lab</h1>
      <p className="text-sm text-neutral-700 mt-2 max-w-2xl">
        Toggle treatment timing and pretrends to see how the DiD estimate
        changes. (Coming soon.)
      </p>
      <div className="border rounded-2xl p-5 mt-6 bg-neutral-50">
        <p className="text-sm">
          🚧 Placeholder. We’ll add a tiny panel generator and a simple DiD
          regression with “parallel trends” on/off.
        </p>
      </div>
    </div>
  );
}