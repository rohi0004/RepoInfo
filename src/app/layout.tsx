import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import JsonLd from "./components/json-ld";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";
import ToasterWrapper from "../components/ToasterWrapper";
import ClientProfileMenuWrapper from "../components/ClientProfileMenuWrapper";

export const viewport: Viewport = {
  themeColor: "#7979cfff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://repoinfo.in"),
  applicationName: "RepoInfo",
  title: {
    default: "RepoInfo - Stop reading it! Start talking to it!",
    template: "%s | RepoInfo",
  },
  description: "Agentic CAG-powered analysis for GitHub repositories and developer profiles. Chat with your codebase, generate visual flowcharts, uncover deep insights, detect vulnerabilities, and accelerate development with AI-driven repository intelligence.",
  keywords: [
    "agentic AI",
    "compositional agentic generation",
    "github repo visualizer",
    "codebase analysis",
    "ai code assistant",
    "repository flowcharts",
    "code intelligence",
    "github repo chat",
    "repository chat",
    "code understanding",
    "developer tools",
    "static analysis",
    "vulnerability detection",
  ],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: "RepoInfo",
    statusBarStyle: "black-translucent",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RepoInfo - Stop reading it! Start talking to it!",
    description: "Agentic CAG-powered analysis for GitHub repositories. Chat with your codebase, generate visual flowcharts, uncover deep insights, and accelerate development with AI-driven repository intelligence.",
    url: "https://repoinfo.in",
    siteName: "RepoInfo",
    images: [
      {
        url: "/RepoInfo.png",
        width: 1200,
        height: 630,
        alt: "RepoInfo AI - GitHub Repository Visualizer and Chat",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoInfo - Stop reading it! Start talking to it!",
    description: "Agentic CAG-powered analysis for GitHub repositories. Chat with your codebase, generate visual flowcharts, uncover deep insights, and accelerate development.",
    images: ["/RepoInfo.png"],
    creator: "@RepoInfo",
  },
  verification: {
    google: "6vgb5PZvNQbUwcjBZdlnovgxPqVn-H_m4gIYIctRcns",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Note: Add search engine verification tokens for `repoinfo.in` here when available.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/RepoInfo.png" />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <JsonLd />
        <ThemeProviderWrapper>
          <div className="relative min-h-screen">
            {/* Profile button at top right */}
            {/* Profile menu removed from global layout; will be placed only on repo page */}
            {children}
          </div>
          <ToasterWrapper />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
