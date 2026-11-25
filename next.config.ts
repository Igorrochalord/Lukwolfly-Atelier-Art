import type { NextConfig } from "next";

/**
 * O conteúdo vive num SQLite local (volume /data), então as páginas públicas
 * são dinâmicas (force-dynamic) e não usamos Cache Components.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Gera `.next/standalone` (servidor mínimo) para a imagem Docker. */
  output: "standalone",
  poweredByHeader: false,
  /** Modo dev acessado pelo túnel da Cloudflare (./lukwolfly.sh up --dev). */
  allowedDevOrigins: ["*.trycloudflare.com", ...(process.env.LUK_DEV_ORIGIN ? [process.env.LUK_DEV_ORIGIN] : [])],
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
