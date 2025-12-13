import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import JsonLd from "./components/json-ld";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";
import ThemeToggle from "../components/ThemeToggle";
import ToasterWrapper from "../components/ToasterWrapper";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#7979cfff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://RepoInfo-ai.vercel.app"),
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
    url: "https://RepoInfo-ai.vercel.app",
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
  verification: {
    google: "UkRCYeGXDptF64Z3y2sS0d2AUkCSuirzjRZQJUz1iEQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <JsonLd />
          <ThemeProviderWrapper>
          {children}
          <ThemeToggle />
          <ToasterWrapper />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
