import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface StreamingProgressProps {
    message: string;
    progress: number;
}

export function StreamingProgress({ message, progress }: StreamingProgressProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{message}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                    className="h-full"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
