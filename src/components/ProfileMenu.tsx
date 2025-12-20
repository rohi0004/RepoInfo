"use client";
import React, { useState, useRef } from "react";

interface ProfileMenuProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export default function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-medium shadow-sm focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Profile menu"
        style={{ minWidth: 40 }}
      >
        {/* User circle icon (SVG) */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user-circle"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="4"/><path d="M6 18c1.5-2 4.5-2 6 0"/></svg>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="mb-3">
            <div className="font-semibold text-gray-900 text-base">{user.name}</div>
            <div className="text-gray-500 text-sm">{user.email}</div>
          </div>
          <div className="mb-3">
            {/* Theme switcher inside profile dropdown */}
            <React.Suspense fallback={null}>
              {typeof window !== 'undefined' && (() => {
                const ThemeToggle = require("./ThemeToggle").default;
                return <ThemeToggle />;
              })()}
            </React.Suspense>
          </div>
          <div className="flex gap-2 justify-end">
            {/* Placeholder for Delete button if needed */}
            <button
              className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm focus:outline-none"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
