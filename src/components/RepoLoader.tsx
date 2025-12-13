"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitBranch, Loader2, CheckCircle2, FileCode, AlertCircle } from "lucide-react";
import { RepoLayout } from "./RepoLayout";
import { fetchGitHubData } from "@/app/actions";
import type { GitHubRepo } from "@/lib/types";
import Link from "next/link";

interface LoadingStep {
    id: string;
    message: string;
    status: "loading" | "complete" | "error";
}

interface RepoLoaderProps {
    query: string;
}

export function RepoLoader({ query }: RepoLoaderProps) {
    const [steps, setSteps] = useState<LoadingStep[]>([]);
    const [repoData, setRepoData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRepo();
    }, [query]);

    const updateStep = (id: string, status: "loading" | "complete" | "error", message?: string) => {
        setSteps((prev) => {
            const existing = prev.find((s) => s.id === id);
            if (existing) {
                return prev.map((s) =>
                    s.id === id ? { ...s, status, message: message || s.message } : s
                );
            }
            return [...prev, { id, message: message || "", status }];
        });
    };

    const loadRepo = async () => {
        try {
            // Step 1: Fetch repo data
            updateStep("fetch", "loading", `Fetching repository ${query}...`);
            const data = await fetchGitHubData(query);

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.type !== "repo") {
                throw new Error("Not a repository");
            }

            const repo = data.data as GitHubRepo;
            let fileTree = data.fileTree as any[];
            const hiddenFiles = data.hiddenFiles || [];

            // Validate file tree
            if (!fileTree) {
                fileTree = [];
            }

            console.log(`Fetched repository ${query} with ${fileTree.length} files`);
            updateStep("fetch", "complete", `Repository data fetched (${fileTree.length} files)`);

            // Step 2: Analyze structure
            updateStep("analyze", "loading", `Analyzing ${fileTree.length} files...`);

            // Simulate a brief delay for analysis visualization
            await new Promise(resolve => setTimeout(resolve, 800));

            updateStep("analyze", "complete", "File structure analyzed");

            // Step 3: Prepare environment
            updateStep("env", "loading", "Preparing chat environment...");
            await new Promise(resolve => setTimeout(resolve, 500));
            updateStep("env", "complete", "Ready to chat");

            setRepoData({ repo, fileTree, hiddenFiles });

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message === "User not found"
                ? `GitHub user/org for "${query}" not found`
                : err.message === "Repository not found"
                    ? `Repository "${query}" not found`
                    : err.message;

            setError(errorMessage);
            updateStep("error", "error", errorMessage);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h1 className="text-2xl font-bold">Error Loading Repository</h1>
                <p style={{ color: 'var(--muted)' }}>{error}</p>
                <Link href="/" className="mt-4 px-6 py-3 rounded-lg transition-colors" style={{ background: 'var(--accent)', color: '#fff' }}>
                    Back to Home
                </Link>
            </div>
        );
    }

    if (!repoData) {
        return (
            <div className="flex items-center justify-center h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                <div className="max-w-md w-full p-8">
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-2xl"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
                            <GitBranch className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">Loading Repository</h2>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>{query}</p>
                    </div>

                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-lg"
                                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
                                {step.status === "loading" && (
                                    <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: 'var(--accent)' }} />
                                )}
                                {step.status === "complete" && (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                )}
                                {step.status === "error" && (
                                    <FileCode className="w-5 h-5 text-red-500 shrink-0" />
                                )}
                                <span className="text-sm" style={{ color: 'var(--foreground)' }}>{step.message}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <RepoLayout
            fileTree={repoData.fileTree}
            repoName={repoData.repo.full_name}
            owner={repoData.repo.owner.login}
            repo={repoData.repo.name}
            hiddenFiles={repoData.hiddenFiles}
            repoData={repoData.repo}
        />
    );
}
