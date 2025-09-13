{/* Thin vertical sidebar (desktop only) */}
<aside
  className="hidden md:block sticky md:top-1/2 md:-translate-y-1/2 md:transform h-max rounded-2xl border border-black/10 bg-white"
  aria-label="Section navigation"
>
  <ul className="flex flex-col items-center gap-2 py-3">
    {toc.map((t) => (
      <li key={t.id}>
        <a
          href={`#${t.id}`}
          title={t.label}
          aria-label={t.label}
          className="block h-9 w-9 rounded-full border border-black/10 bg-white grid place-items-center hover:shadow-sm hover:border-black/20 transition"
        >
          <span className="text-base" aria-hidden>
            {t.icon}
          </span>
        </a>
      </li>
    ))}
  </ul>
</aside>