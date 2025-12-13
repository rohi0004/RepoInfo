"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight, Loader2, Search, Info } from "lucide-react";
import { fetchGitHubData } from "./actions";
import { CAGBadge } from "@/components/CAGBadge";
import { ProjectInfoModal } from "@/components/ProjectInfoModal";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Parse input to handle both formats: "owner/repo" and full GitHub URLs
      let parsedInput = input.trim();
      
      // Check if input is a GitHub URL
      const githubUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\s?#]+)/i;
      const urlMatch = parsedInput.match(githubUrlPattern);
      
      if (urlMatch) {
        // Extract owner and repo from URL
        const [, owner, repo] = urlMatch;
        parsedInput = `${owner}/${repo}`;
      }

      const result = await fetchGitHubData(parsedInput);

      if (result.error) {
        setError(result.error);
      } else {
        // Store data in localStorage or pass via query params/state manager
        // For simplicity, we'll use query params for the ID and fetch again or use a context
        // Let's just navigate to /chat with the query
        router.push(`/chat?q=${encodeURIComponent(parsedInput)}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col overflow-x-hidden relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <ProjectInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Info Icon - Top Right Corner */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsInfoOpen(true)}
        className="fixed top-6 right-6 z-40 p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          color: 'var(--accent)'
        }}
        title="Project Information"
      >
        <Info className="w-5 h-5" />
      </motion.button>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center text-center max-w-2xl w-full px-4"
        >
          <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl p-4 flex items-center justify-center" style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
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
                {/* AI Brain Icon */}
                <path
                  d="M50 15 C30 15 20 25 20 40 C20 45 22 48 25 50 C22 52 20 55 20 60 C20 75 30 85 50 85 C70 85 80 75 80 60 C80 55 78 52 75 50 C78 48 80 45 80 40 C80 25 70 15 50 15 Z"
                  fill="url(#brainGradient)"
                  opacity="0.2"
                />
                {/* Neural connections */}
                <circle cx="35" cy="35" r="4" fill="url(#brainGradient)" />
                <circle cx="65" cy="35" r="4" fill="url(#brainGradient)" />
                <circle cx="35" cy="55" r="4" fill="url(#brainGradient)" />
                <circle cx="65" cy="55" r="4" fill="url(#brainGradient)" />
                <circle cx="50" cy="45" r="5" fill="url(#brainGradient)" />
                <circle cx="50" cy="70" r="4" fill="url(#brainGradient)" />
                {/* Connection lines */}
                <line x1="35" y1="35" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="65" y1="35" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="35" y1="55" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="65" y1="55" x2="50" y2="45" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                <line x1="50" y1="45" x2="50" y2="70" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.6" />
                {/* Code brackets */}
                <path d="M25 25 L20 30 L25 35" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M75 25 L80 30 L75 35" stroke="url(#brainGradient)" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to bottom, var(--foreground), var(--foreground))' }}>
            RepoInfo
          </h1>

          {/* CAG Badge (Below Title) */}
          {/* <CAGBadge /> */}

          <p className="text-base sm:text-lg md:text-xl mb-3 max-w-lg mx-auto font-medium" style={{ color: 'var(--foreground)' }}>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), #3b82f6)' }}>Unlock any codebase</span> with AI-powered insights.
          </p>
          <p className="text-sm md:text-base mb-12 max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
            Chat with repositories, analyze code quality, and understand complex projects instantly.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-xl relative group">
            <div className="flex items-center gap-2 p-2 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl" style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
              <div className="flex-1 flex items-center gap-2 px-2">
                <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="username/repo or GitHub URL"
                  className="flex-1 border-none outline-none py-3 text-sm md:text-base w-full min-w-0"
                  style={{ background: 'transparent', color: 'var(--foreground)' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 shrink-0 hover:scale-105"
                style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 14px 0 rgba(112, 221, 181, 0.4)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </form>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}


        </motion.div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "RepoInfo",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
            "description": "RepoInfo is an intelligent repository analysis platform that leverages Context Augmented Generation (CAG) to help developers understand codebases, analyze dependencies, and get instant insights through AI-powered conversations.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "120",
            },
          }),
        }}
      />
    </main>
  );
}
