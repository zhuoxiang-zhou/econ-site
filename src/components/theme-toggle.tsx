"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = (theme ?? resolvedTheme) === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-3 py-1.5 hover:shadow-sm"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="text-xs">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}