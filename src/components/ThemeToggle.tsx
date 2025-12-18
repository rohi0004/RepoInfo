"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load theme preference from server on mount (only once)
  useEffect(() => {
    if (!mounted) return;

    const loadThemePreference = async () => {
      try {
        const visitorId = (window as any).__visitorId;
        const url = visitorId 
          ? `/api/preferences/theme?visitorId=${visitorId}`
          : '/api/preferences/theme';
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Only load if theme is not already set locally
          const currentTheme = localStorage.getItem('repoinfo-theme');
          if (data.theme && !currentTheme) {
            setTheme(data.theme);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    // Small delay to ensure visitorId is set
    const timer = setTimeout(loadThemePreference, 500);
    return () => clearTimeout(timer);
  }, [mounted, setTheme]);

  const handleThemeChange = async (newTheme: string) => {
    // Update theme locally first for immediate feedback
    setTheme(newTheme);
    
    // Sync to server in background (don't block UI)
    setSyncing(true);
    
    // Use a small timeout to prevent rapid clicks
    setTimeout(async () => {
      try {
        const visitorId = (window as any).__visitorId;
        await fetch('/api/preferences/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme: newTheme,
            visitorId
          }),
        });
      } catch (error) {
        console.error('Error syncing theme preference:', error);
      } finally {
        setSyncing(false);
      }
    }, 100);
  };

  const isDark = resolvedTheme === "dark";

  // Check if we're on the chat page
  const isChatPage = pathname?.startsWith('/chat');

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={isChatPage ? "fixed top-4 right-4 z-50" : "fixed bottom-4 left-4 z-50"}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md backdrop-blur border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />
      </div>
    );
  }

  return (
    <div className={isChatPage ? "fixed top-4 right-4 z-50" : "fixed bottom-4 left-4 z-50"}>
      <button
        aria-label="Toggle theme"
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md backdrop-blur border transition-opacity"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          opacity: syncing ? 0.7 : 1,
        }}
        onClick={() => handleThemeChange(isDark ? "light" : "dark")}
        disabled={syncing}
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
