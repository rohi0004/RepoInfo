import { Suspense } from "react";
import { fetchGitHubData } from "../actions";
import { ProfileLoader } from "@/components/ProfileLoader";
import { RepoLoader } from "@/components/RepoLoader";
import { RepoLayout } from "@/components/RepoLayout";
import { Loader2, AlertCircle, ArrowLeft, Github, Search } from "lucide-react";
import type { GitHubRepo } from "@/lib/types";
import Link from "next/link";
import FreeChat from '@/components/FreeChat';

export default async function ChatPage({ searchParams }: { searchParams: any }) {
    const params = await searchParams;
    const query = params?.q;

    if (!query) {
        // If the page was opened after billing success the client may include
        // a `welcome` param (e.g. /chat?welcome=1). In that case render the
        // FreeChat interface so the user can start chatting immediately.
        const welcome = params?.welcome;
        if (welcome) {
            return <FreeChat />;
        }

        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                <Search className="w-12 h-12" style={{ color: 'var(--muted)' }} />
                <h1 className="text-2xl font-bold">No Query Provided</h1>
                <p style={{ color: 'var(--muted)' }}>Please search for a GitHub user or repository</p>
                <Link href="/" className="mt-4 px-6 py-3 rounded-lg transition-colors flex items-center gap-2" style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        );
    }

    // If it's a profile query (no slash), load immediately with ProfileLoader
    if (!query.includes("/")) {
        return <ProfileLoader username={query} />;
    }

    // For repos, use RepoLoader for client-side loading
    return <RepoLoader query={query} />;
}
