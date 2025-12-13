"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md backdrop-blur border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        aria-label="Toggle theme"
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md backdrop-blur border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? (
          <Sun className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        ) : (
          <Moon className="w-5 h-5" style={{ color: 'var(--muted)' }} />
        )}
      </button>
    </div>
  );
}
