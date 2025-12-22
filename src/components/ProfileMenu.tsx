"use client";
import React, { useState, useRef } from "react";
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ProfileMenuProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export default function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

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

  // Real-time billing / quota info
  const [remaining, setRemaining] = useState<number | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);

  const fetchBilling = async () => {
    try {
      setBillingLoading(true);
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('visitor_id', visitorId);
      }
      const res = await fetch(`/api/billing/check?visitorId=${encodeURIComponent(visitorId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data) {
        setBillingData(data);
        if (typeof data.remaining === 'number') setRemaining(data.remaining);
        if (typeof data.allowed === 'boolean') setAllowed(data.allowed);
      }
    } catch (e) {
      console.warn('Failed to fetch billing status', e);
    } finally {
      setBillingLoading(false);
    }
  };

  // Poll billing info every 30 seconds
  React.useEffect(() => {
    fetchBilling();
    const id = setInterval(fetchBilling, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white/60 to-white/30 dark:from-zinc-800 dark:to-zinc-700 hover:opacity-95 border border-gray-200 dark:border-zinc-700 text-foreground font-medium shadow-sm focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        style={{ minWidth: 40 }}
      >
        {/* Avatar with initials */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center font-semibold">{(user.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
        {/* Remaining badge */}
        {remaining !== null && (
          <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center text-[11px] font-semibold leading-none rounded-full px-1.5 py-0.5 ${allowed === false ? 'bg-red-500 text-white' : 'bg-cyan-500 text-white'}`} title={`Remaining queries: ${remaining}`}>
            {remaining}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-72 bg-card-bg border border-border rounded-xl shadow-2xl z-50 p-4"
          style={{ minWidth: 260 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center font-semibold text-lg">{(user.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{user.name}</div>
              <div className="text-sm text-muted truncate">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 py-2 px-1 rounded-md" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleTheme()} aria-label="Toggle theme" className="inline-flex items-center gap-2 px-3 py-1 rounded-md hover:bg-white/5 transition">
                  { (resolvedTheme || theme) === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-500" /> }
                  <span className="text-sm">{(resolvedTheme || theme) === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
                <div className="text-xs text-muted ml-2">Theme</div>
              </div>
            </div>
            <a href="/account" className="text-sm text-muted hover:underline">Manage</a>
          </div>

          {/* Billing / usage info */}
          <div className="mt-3 p-3 rounded-md" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Usage</div>
              <div className="text-xs text-muted">Live</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Remaining queries</div>
              <div className="text-sm font-semibold">{billingLoading ? '…' : (remaining !== null ? remaining : '—')}</div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm">Status</div>
              <div className={`text-sm font-semibold ${allowed === false ? 'text-red-500' : 'text-green-500'}`}>{billingLoading ? '…' : (allowed === false ? 'Limited' : (allowed === true ? 'Active' : '—'))}</div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a href={`/pricing${billingData && billingData.visitorId ? `?visitorId=${encodeURIComponent(billingData.visitorId)}` : ''}`} className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm">Upgrade</a>
              <a href="/billing" className="px-3 py-2 rounded-md border border-border text-sm text-muted">Billing</a>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              className="flex-1 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm focus:outline-none"
              onClick={onLogout}
            >
              Logout
            </button>
            <a href="/settings" className="px-4 py-2 rounded-md border border-border text-sm text-muted flex items-center justify-center">Settings</a>
          </div>
        </div>
      )}
    </div>
  );
}
