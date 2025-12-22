"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || undefined;
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: formData.email, password: formData.password, name })
      });

      if (res.status === 201) {
        router.push('/login');
        return;
      }

      if (res.status === 409) {
        setError('User already exists. Try logging in.');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data?.message || 'Signup failed');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/06 via-green-500/03 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/04 via-emerald-500/06 to-transparent pointer-events-none" />

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left feature panel - gradient background in light/dark modes */}
        <aside className="hidden md:flex flex-col px-12 py-24 feature-aside text-white">
          <div className="max-w-md text-left mx-auto">
            <div className="mb-8">
              <div className="font-bold text-xl">RepoInfo</div>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold feature-heading-gradient mb-8">Access repository intelligence instantly</h2>

            <div className="space-y-4">
              <div className="feature-card">
                <p className="text-sm">Conduct deep code structure analysis to understand architecture</p>
              </div>
              <div className="feature-card">
                <p className="text-sm">Get smart suggestions for dependencies and best practices</p>
              </div>
              <div className="feature-card">
                <p className="text-sm">Automate workflows and generate code or documentation snippets</p>
              </div>
              <div className="feature-card">
                <p className="text-sm">Receive guided walkthroughs for onboarding and feature discovery</p>
              </div>
            </div>

            <p className="mt-10 text-sm text-muted">Trusted by thousands of developers to quickly understand complex projects.</p>
          </div>
        </aside>

        {/* Right form panel */}
        <section className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg mx-auto">
            

            <div className="rounded-2xl p-10 mx-auto" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(2,6,23,0.45)' }}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(6,182,212,0.06))' }}>
                  <User className="w-8 h-8 text-purple-400" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p style={{ color: 'var(--muted)' }}>Sign up to analyze repositories, get suggestions, and automate workflows.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block" style={{ color: 'var(--muted)' }}>First Name</label>
                    <input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-md py-3 px-3 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }} placeholder="First name" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block" style={{ color: 'var(--muted)' }}>Last Name</label>
                    <input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-md py-3 px-3 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }} placeholder="Last name" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block" style={{ color: 'var(--muted)' }}>Work Email</label>
                  <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-md py-3 px-3 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }} placeholder="you@company.com" required />
                </div>

                <div>
                  <label htmlFor="designation" className="block" style={{ color: 'var(--muted)' }}>Designation</label>
                  <input id="designation" className="w-full rounded-md py-3 px-3 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }} placeholder="e.g. Engineering Manager" />
                </div>

                <div>
                  <label htmlFor="password" className="block" style={{ color: 'var(--muted)' }}>Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-md py-3 px-3 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }} placeholder="Create a password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block" style={{ color: 'var(--muted)' }}>Confirm Password</label>
                  <div className="relative">
                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full rounded-md py-3 px-3 mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }} placeholder="Confirm password" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-md font-semibold" style={{ background: 'linear-gradient(90deg,#0ea5a9,#10b981)', color: 'white', boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}>{loading ? 'Creating account...' : 'Get Started Free'}</button>
                  {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
                </div>
              </form>

              <p className="text-center mt-6" style={{ color: 'var(--muted)' }}>Already have an account? <Link href="/login" style={{ color: 'var(--accent)' }}>Sign in</Link></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
