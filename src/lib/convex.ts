import { ConvexReactClient } from "convex/react";

let convexClient: ConvexReactClient | null = null;

export function getConvexUrl() {
  const pick = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
  const fromImportMeta = (() => {
    try {
      return pick((import.meta as any)?.env?.VITE_CONVEX_URL);
    } catch {
      return undefined;
    }
  })();
  // DEBUG: log what the client sees
  if (typeof window !== "undefined") {
    console.log("[DEBUG] import.meta.env in client:", (import.meta as any).env);
    console.log("[DEBUG] fromImportMeta:", fromImportMeta);
  }
  const url =
    fromImportMeta ?? pick(process.env.VITE_CONVEX_URL) ?? pick(process.env.CONVEX_URL);
  if (!url) {
    throw new Error(
      "Missing Convex deployment URL. Set VITE_CONVEX_URL (or CONVEX_URL) in your environment.",
    );
  }
  return url;
}

export function getConvexClient() {
  if (!convexClient) {
    const url = getConvexUrl();
    convexClient = new ConvexReactClient(url);
    if (!(convexClient as any).url) {
      (convexClient as any).url = url;
    }
  }
  return convexClient;
}
