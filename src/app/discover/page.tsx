"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight, Loader2, Search, Info } from "lucide-react";
import { fetchGitHubData, fetchUserRepos } from "../actions";
import { CAGBadge } from "@/components/CAGBadge";
import { RepoCard } from "@/components/RepoCard";
import { ProjectInfoModal } from "@/components/ProjectInfoModal";
import Image from "next/image";
import { personaBlueprints } from "@/lib/feature-blueprints";

export default function Discover() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [showUserRepos, setShowUserRepos] = useState(false);
  const [error, setError] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activePersona, setActivePersona] = useState(personaBlueprints[0].id);
  const selectedPersona = personaBlueprints.find((persona) => persona.id === activePersona) ?? personaBlueprints[0];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        // Allow unauthenticated visitors to access /discover (guest/trial mode).
        // If the user is authenticated, mark auth as checked; otherwise still mark checked
        // so the page renders for guests without forcing a redirect to login.
        if (!cancelled) setAuthChecked(true);
      } catch (err) {
        // On error, allow guest access instead of redirecting to login.
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setShowUserRepos(false);
    setUserRepos([]);

    try {
      let parsedInput = input.trim();
      const githubUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\s?#]+?)(?:\.git)?(?:\/|$|\s|\?|#)/i;
      const urlMatch = parsedInput.match(githubUrlPattern);

      if (urlMatch) {
        // If it's a repo URL, go to repo chat as before
        const [, owner, repo] = urlMatch;
        parsedInput = `${owner}/${repo}`;
        const result = await fetchGitHubData(parsedInput);
        if (result.error) {
          setError(result.error);
        } else {
          router.push(`/${encodeURIComponent(parsedInput)}`);
        }
        setLoading(false);
        return;
      }

      // If input is username only (no slash), show user repos below
      if (!parsedInput.includes("/")) {
        const repos = await fetchUserRepos(parsedInput);
        if (repos && repos.length > 0) {
          setUserRepos(repos);
          setShowUserRepos(true);
        } else {
          setError("No public repositories found for this user.");
        }
        setLoading(false);
        return;
      }

      // Otherwise, treat as repo search (username/repo)
      const result = await fetchGitHubData(parsedInput);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/${encodeURIComponent(parsedInput)}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col overflow-x-hidden relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {!authChecked ? (
        <section className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </section>
      ) : null}
      <ProjectInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsInfoOpen(true)}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          color: 'var(--accent)'
        }}
        title="Project Information"
      >
        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>

      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:p-4 relative overflow-hidden z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center text-center  w-full px-4"
        >
          <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-2xl blur-md opacity-60 transition-opacity duration-500" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl p-4 flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 20px rgba(59,130,246,0.06)' }}>
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path d="M50 15 C30 15 20 25 20 40 C20 45 22 48 25 50 C22 52 20 55 20 60 C20 75 30 85 50 85 C70 85 80 75 80 60 C80 55 78 52 75 50 C78 48 80 45 80 40 C80 25 70 15 50 15 Z" fill="url(#brainGradient)" opacity="0.2" />
                <circle cx="35" cy="35" r="4" fill="url(#brainGradient)" />
                <circle cx="65" cy="35" r="4" fill="url(#brainGradient)" />
                <circle cx="35" cy="55" r="4" fill="url(#brainGradient)" />
                <circle cx="65" cy="55" r="4" fill="url(#brainGradient)" />
                <circle cx="50" cy="45" r="5" fill="url(#brainGradient)" />
                <circle cx="50" cy="70" r="4" fill="url(#brainGradient)" />
                <line x1="35" y1="35" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="65" y1="35" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="35" y1="55" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="65" y1="55" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="50" y1="45" x2="50" y2="70" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <path d="M25 25 L20 30 L25 35" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M75 25 L80 30 L75 35" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to bottom, var(--foreground), var(--foreground))' }}>
            RepoInfo
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 max-w-lg mx-auto font-medium px-2" style={{ color: 'var(--foreground)' }}>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), #3b82f6)' }}>Unlock any codebase</span> with AI-powered insights.
          </p>
          <p className="text-xs sm:text-sm md:text-base mb-8 sm:mb-12 max-w-lg mx-auto px-2" style={{ color: 'var(--muted)' }}>
            Chat with repositories, analyze code quality, and understand complex projects instantly.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-xl relative group px-2">
            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-xl transition-all duration-300" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(15,23,42,0.04)' }}>
              <div className="flex-1 flex items-center gap-2 px-1 sm:px-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  ref={inputRef}
                  placeholder="username or username/repo or GitHub URL"
                  className="flex-1 border-none outline-none py-2 sm:py-3 text-xs sm:text-sm md:text-base w-full min-w-0"
                  style={{ background: 'transparent', color: 'var(--foreground)' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 shrink-0 hover:scale-105"
                style={{ background: 'linear-gradient(90deg,var(--accent),#3b82f6)', color: '#fff', boxShadow: '0 8px 30px rgba(59,130,246,0.12)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-500 text-sm">{error}</motion.p>
          )}

          <div className="w-full max-w-5xl mt-12">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Feature blueprints for your repo</h2>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>
                Choose a persona and drop a ready-made prompt into the search bar.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
              {personaBlueprints.map((persona) => {
                const Icon = persona.icon;
                const isActive = persona.id === selectedPersona.id;

                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setActivePersona(persona.id)}
                    className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all"
                    style={{
                      border: '1px solid var(--border)',
                      background: isActive ? 'rgba(112,221,181,0.12)' : 'var(--surface)',
                      color: isActive ? 'var(--accent)' : 'var(--muted)'
                    }}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {persona.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {selectedPersona.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl p-4 sm:p-6 h-full flex flex-col"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm mb-4" style={{ color: 'var(--muted)' }}>{feature.detail}</p>
                  <div className="rounded-xl p-3 mb-4 flex-1" style={{ border: '1px solid var(--border)', background: 'rgba(12,18,28,0.4)' }}>
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--muted)' }}>
                      Example prompt
                    </p>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {feature.prompt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(feature.prompt);
                      inputRef.current?.focus();
                    }}
                    className="mt-auto px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(90deg,var(--accent),#3b82f6)', color: '#fff' }}
                  >
                    Use this prompt
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Repositories Card View */}
          {showUserRepos && userRepos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl mx-auto mt-8"
            >
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--accent)' }}>
                Public Repositories <span className="text-sm font-normal text-zinc-400">({userRepos.length} repositories)</span>
              </h2>
                <div
                className="flex flex-col gap-4 max-h-[420px] overflow-y-auto overflow-x-hidden w-full max-w-full invisible-scrollbar"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  background: 'transparent',
                  scrollbarWidth: 'none' as any, // Firefox
                  msOverflowStyle: 'none' as any, // IE 10+
                }}
                >
                {userRepos.slice(0, 20).map((repo, idx) => (
                  <div
                  key={repo.repo}
                  className="transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
                  style={{ zIndex: 2 }}
                  onClick={() => router.push(`/${encodeURIComponent(input.trim())}/${encodeURIComponent(repo.repo)}`)}
                  >
                  <RepoCard
                    name={repo.repo}
                    owner={input.trim()}
                    description={repo.description}
                    stars={repo.stars}
                    forks={repo.forks}
                    language={repo.language}
                  />
                  </div>
                ))}
                <style jsx>{`
                  .invisible-scrollbar {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE 10+ */
                  }

                  .invisible-scrollbar::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                    display: none;
                  }

                  .invisible-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                  }
                `}</style>
                </div>
              {userRepos.length > 4 && (
                <div className="text-xs text-center mt-2 text-zinc-400">Scroll to see more repositories</div>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepoInfo", applicationCategory: "DeveloperApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "RepoInfo is an intelligent repository analysis platform that leverages Context Augmented Generation (CAG) to help developers understand codebases, analyze dependencies, and get instant insights through AI-powered conversations.", aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "120" } }) }} />
    </main>
  );
}
