"use client";
import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from "react";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize FingerprintJS or use a simpler identifier
    const initializeVisitorId = async () => {
      try {
        // Try to load FingerprintJS if available
        if (typeof window !== 'undefined' && (window as any).FingerprintJS) {
          const fpPromise = (window as any).FingerprintJS.load();
          const fp = await fpPromise;
          const result = await fp.get();
          setVisitorId(result.visitorId);
        } else {
          // Fallback: use a combination of browser fingerprint
          const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset()
          ].join('|');
          
          const visitorIdHash = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(fingerprint)
          );
          const hashArray = Array.from(new Uint8Array(visitorIdHash));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setVisitorId(hashHex.substring(0, 32));
        }
      } catch (error) {
        console.error('Error initializing visitor ID:', error);
      }
    };

    initializeVisitorId();
  }, []);

  // Store visitorId in a global context so other components can access it
  useEffect(() => {
    if (visitorId && typeof window !== 'undefined') {
      (window as any).__visitorId = visitorId;
    }
  }, [visitorId]);

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system"
      enableSystem={true}
      storageKey="repoinfo-theme"
    >
      {children}
    </ThemeProvider>
  );
}
