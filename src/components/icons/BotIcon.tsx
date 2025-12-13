import { cn } from "@/lib/utils";

export function BotIcon({ className }: { className?: string }) {
    return (
        <div className={cn("w-full h-full rounded-full p-2 flex items-center justify-center", className)} style={{ background: 'linear-gradient(135deg, var(--accent), #3b82f6)' }}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* AI Brain Icon */}
                <path
                    d="M50 15 C30 15 20 25 20 40 C20 45 22 48 25 50 C22 52 20 55 20 60 C20 75 30 85 50 85 C70 85 80 75 80 60 C80 55 78 52 75 50 C78 48 80 45 80 40 C80 25 70 15 50 15 Z"
                    fill="white"
                    opacity="0.3"
                />
                {/* Neural connections */}
                <circle cx="35" cy="35" r="4" fill="white" />
                <circle cx="65" cy="35" r="4" fill="white" />
                <circle cx="35" cy="55" r="4" fill="white" />
                <circle cx="65" cy="55" r="4" fill="white" />
                <circle cx="50" cy="45" r="5" fill="white" />
                <circle cx="50" cy="70" r="4" fill="white" />
                {/* Connection lines */}
                <line x1="35" y1="35" x2="50" y2="45" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="65" y1="35" x2="50" y2="45" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="35" y1="55" x2="50" y2="45" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="65" y1="55" x2="50" y2="45" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="50" y1="45" x2="50" y2="70" stroke="white" strokeWidth="2" opacity="0.6" />
                {/* Code brackets */}
                <path d="M25 25 L20 30 L25 35" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M75 25 L80 30 L75 35" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
        </div>
    );
}
