import { cn } from "@/lib/utils";

export function UserIcon({ className }: { className?: string }) {
    return (
        <div className={cn("w-full h-full rounded-full flex items-center justify-center", className)} style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full p-3"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* User avatar icon */}
                <circle cx="50" cy="35" r="15" fill="white" />
                <path
                    d="M 25 75 Q 25 55 50 55 Q 75 55 75 75 L 75 85 L 25 85 Z"
                    fill="white"
                />
            </svg>
        </div>
    );
}
