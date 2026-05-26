import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone bundle = single self-contained server.js + node_modules.
  // I Railway-bygget körs detta i isolerad context (apps/medborgare-v2/)
  // så vi behöver inget outputFileTracingRoot.
  output: "standalone",
};

export default nextConfig;
