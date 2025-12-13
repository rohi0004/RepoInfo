"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, MapPin, Link as LinkIcon, Github } from "lucide-react";
import { UserIcon } from "@/components/icons/UserIcon";

interface DeveloperCardProps {
    username: string;
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    blog?: string;
}

export function DeveloperCard({ username, name, avatar, bio, location, blog }: DeveloperCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4 group"
        >
            <div className="relative rounded-xl p-5 transition-all duration-300" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {/* Gradient glow on hover */}
                <div className="absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500" style={{ background: 'var(--accent)' }} />

                <div className="relative flex gap-4">
                    {/* Avatar */}
                    <img
                        src={avatar || `https://github.com/${username}.png`}
                        alt={username}
                        className="w-16 h-16 rounded-full border-2"
                        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                        onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <div className="hidden w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--accent)' }}>
                        <UserIcon className="w-full h-full text-white" />
                    </div>

                    <div className="flex-1">
                        {/* Name & Username */}
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                            {name || username}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>@{username}</p>

                        {/* Bio */}
                        {bio && (
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{bio}</p>
                        )}

                        {/* Additional info */}
                        <div className="flex flex-wrap gap-3 text-xs mb-4" style={{ color: 'var(--muted)' }}>
                            {location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {location}
                                </span>
                            )}
                            {blog && (
                                <a
                                    href={blog}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 transition-colors hover:opacity-70"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    <LinkIcon className="w-3 h-3" />
                                    {blog.replace(/https?:\/\//, '').slice(0, 30)}
                                </a>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <Link
                                href={`/chat?q=${username}`}
                                className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors text-center hover:opacity-90"
                                style={{ background: 'var(--accent)' }}
                            >
                                View Profile
                            </Link>
                            <a
                                href={`https://github.com/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 hover:opacity-80"
                                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                            >
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
