"use client";
import React from "react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function ToasterWrapper() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: resolvedTheme === "dark" ? '#18181b' : 'var(--surface)',
          border: `1px solid ${resolvedTheme === "dark" ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
          color: resolvedTheme === "dark" ? '#fff' : 'var(--foreground)'
        }
      }}
    />
  );
}
