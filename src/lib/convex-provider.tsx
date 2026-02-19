"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";
const IS_CONFIGURED = !!process.env.NEXT_PUBLIC_CONVEX_URL;

// Singleton client - created once at module level
const convexClient = new ConvexReactClient(CONVEX_URL);

function SetupBanner() {
  if (IS_CONFIGURED) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-4 py-2.5 rounded-lg max-w-xs shadow-lg">
      <div className="font-semibold mb-1">⚠️ Convex not configured</div>
      <div className="text-amber-400/80 leading-relaxed">
        Run <code className="bg-black/20 px-1 rounded font-mono">npx convex dev</code> then set{" "}
        <code className="bg-black/20 px-1 rounded font-mono">NEXT_PUBLIC_CONVEX_URL</code>.
      </div>
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convexClient}>
      {children}
      <SetupBanner />
    </ConvexProvider>
  );
}
