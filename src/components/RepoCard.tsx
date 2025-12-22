import { Star, GitFork } from "lucide-react";
import Link from "next/link";
import { Card } from "./ui/card";

interface RepoCardProps {
  name: string;
  owner: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  topics?: string[];
  isHacktoberfest?: boolean;
}

export function RepoCard({
  name,
  owner,
  description,
  language,
  stars,
  forks,
  topics,
  isHacktoberfest,
}: RepoCardProps) {
  return (
    <Link href={`/${owner}/${name}`} className="block w-full max-w-3xl mx-auto min-w-0">
      <Card
        role="link"
        aria-label={`Open ${owner}/${name} in chat`}
        className="
          w-full
          p-6
          rounded-xl
          border
          transition-colors duration-200
          cursor-pointer

          bg-white/70 dark:bg-zinc-800/60
          backdrop-blur-md

          border-zinc-200/70 dark:border-zinc-600/60
          hover:border-primary/40

          hover:shadow-lg hover:shadow-primary/10
          overflow-hidden
          min-w-0
          hover:border-primary/70
        "
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">
              <span className="text-zinc-400 text-sm mr-1">{owner}/</span>
              <span>{name}</span>
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              {isHacktoberfest && (
                <span className="
                  px-2 py-0.5
                  text-xs rounded-full
                  bg-orange-200/40 dark:bg-orange-400/10
                  text-orange-600 dark:text-orange-400
                  border border-orange-300/40 dark:border-orange-400/20
                ">
                  Hacktoberfest
                </span>
              )}

              {topics && topics.length > 0 && (
                <span className="
                  px-2 py-0.5
                  text-xs rounded-full
                  bg-blue-200/40 dark:bg-blue-400/10
                  text-blue-700 dark:text-blue-300
                  border border-blue-300/40 dark:border-blue-400/20
                ">
                  {topics[0]}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-w-0 break-words">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-5 text-sm text-muted-foreground min-w-0">
            {language && (
              <div className="flex items-center gap-2">
                <span
                  className="
                    w-2.5 h-2.5 rounded-full
                    bg-emerald-300 dark:bg-emerald-400
                  "
                />
                <span>{language}</span>
              </div>
            )}

            {stars !== undefined && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 opacity-70" />
                <span>{stars}</span>
              </div>
            )}

            {forks !== undefined && (
              <div className="flex items-center gap-1.5">
                <GitFork className="w-4 h-4 opacity-70" />
                <span>{forks}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
