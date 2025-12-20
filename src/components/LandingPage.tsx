"use client";

import Link from "next/link";
import { ArrowRight, Github, Mail, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/06 via-green-500/03 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/04 via-emerald-500/06 to-transparent pointer-events-none" />

      <header className="relative z-10 backdrop-blur-sm" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyan-400" aria-hidden="true" />
            <span className="text-xl font-bold">RepoInfo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-3 py-2 rounded-md hover:bg-white/2 text-muted">Log In</Link>
            <Link href="/signup" className="px-3 py-2 rounded-md" style={{ background: 'linear-gradient(90deg,var(--gradient-start), var(--gradient-end))', color: 'white' }}>Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(112,221,181,0.06)', border: '1px solid rgba(112,221,181,0.08)' }}>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm" style={{ color: 'var(--accent)' }}>Now Available</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--foreground), rgba(59,130,246,0.7))' }}>
              Your Specialized Coding Assistant
            </h1>

            <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--muted)' }}>
              Analyze codebases, understand project architecture, and get expert guidance on dependencies, features, and workflows.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button onClick={async () => {
                try {
                  const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
                  if (res.ok) {
                    window.location.href = '/discover';
                  } else {
                    window.location.href = '/login';
                  }
                } catch (e) {
                  window.location.href = '/login';
                }
              }} className="px-8 py-6 text-lg rounded-md inline-flex items-center" style={{ background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))', color: 'white' }}>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="px-8 py-6 text-lg rounded-md inline-flex items-center" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent' }}>
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 transition-all rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.08), rgba(6,182,212,0.06))' }}>
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Structure Analysis</h3>
              <p style={{ color: 'var(--muted)' }}>Deep insights into your project architecture and code organization</p>
            </div>

            <div className="p-6 transition-all rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.06), rgba(236,72,153,0.06))' }}>
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Suggestions</h3>
              <p style={{ color: 'var(--muted)' }}>Get intelligent recommendations for dependencies and best practices</p>
            </div>

            <div className="p-6 transition-all rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.06), rgba(16,185,129,0.06))' }}>
                <ArrowRight className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Workflow Automation</h3>
              <p style={{ color: 'var(--muted)' }}>Streamline your development process with automated insights</p>
            </div>
          </div>

          <div className="mt-20 rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-bold mb-6">What can RepoInfo help you with?</h2>
            <ul className="space-y-4" style={{ color: 'var(--muted)' }}>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" /> <span>Code structure and architecture analysis</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" /> <span>Dependencies and setup guidance</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" /> <span>Specific features and functionality documentation</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2" /> <span>User flows and workflows optimization</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2" /> <span>File generation and code modifications</span></li>
            </ul>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
            <p className="mb-8" style={{ color: 'var(--muted)' }}>Join thousands of developers using RepoInfo</p>
            <button onClick={async () => {
                try {
                  const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
                  if (res.ok) {
                    window.location.href = '/discover';
                  } else {
                    window.location.href = '/login';
                  }
                } catch (e) {
                  window.location.href = '/login';
                }
              }} className="px-10 py-6 text-lg rounded-md inline-flex items-center" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(236,72,153,1))', color: 'white' }}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 text-center" style={{ color: 'var(--muted)' }}>
          <p>&copy; 2025 RepoInfo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
