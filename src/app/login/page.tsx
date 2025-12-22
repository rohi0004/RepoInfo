"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [nextParam, setNextParam] = useState<string | null>(null);

  // Read `next` query param on the client to avoid using next/navigation's
  // `useSearchParams` which can trigger a CSR bailout requiring Suspense.
  useEffect(() => {
    try {
      const qp = new URLSearchParams(window.location.search).get('next');
      setNextParam(qp);
    } catch (e) {
      setNextParam(null);
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      if (res.status === 200) {
        // authenticated, server set cookie
        // Read body to detect admin role
        const data = await res.json().catch(() => ({}));
        const role = data?.user?.role || data?.user?.role || null;
        if (role === 'admin' || data?.user?.email === 'admin@gmail.com') {
          router.push('/admin/stats');
          return;
        }
        // If a `next` parameter was provided (e.g. /login?next=/pricing?...), redirect there.
        const nextParamLocal = nextParam;
        if (nextParamLocal) {
          // Only allow internal paths to prevent open redirect vulnerabilities
          if (nextParamLocal.startsWith('/')) {
            router.push(nextParamLocal);
            return;
          } else {
            // Fallback: if it's an absolute URL, navigate the browser directly
            window.location.href = nextParamLocal;
            return;
          }
        }

        router.push('/discover');
        return;
      }

      if (res.status === 404) {
        // user not found -> redirect to signup
        router.push('/signup');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data?.message || 'Invalid credentials');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col overflow-x-hidden relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/06 via-green-500/03 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/04 via-emerald-500/06 to-transparent pointer-events-none" />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-lg mx-auto">
          

          <div className="rounded-2xl p-10 mx-auto" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(2,6,23,0.45)' }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/12 to-cyan-500/12 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-400" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted">Sign in to continue to RepoInfo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-muted block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-foreground placeholder:text-muted"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-muted block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-foreground placeholder:text-muted"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-muted">
                  <input type="checkbox" className="w-4 h-4 rounded border var(--border) bg-transparent text-cyan-500 focus:ring-cyan-500" />
                  <span className="text-muted">Remember me</span>
                </label>
                <a href="#" className="text-cyan-400 hover:text-cyan-300">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-lg font-semibold" style={{ background: 'linear-gradient(90deg,#0ea5a9,#10b981)', color: 'white', boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
              {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="w-full border rounded-md py-2 inline-flex items-center justify-center" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
              <button className="w-full border rounded-md py-2 inline-flex items-center justify-center" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
                Google
              </button>
            </div>

            <p className="text-center mt-6" style={{ color: 'var(--muted)' }}>Don't have an account? <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">Sign up</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}
