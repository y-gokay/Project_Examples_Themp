/** @type {import('next').NextConfig} */

function getImageRemoteFromApiUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const rawPublicImageBase =
    process.env.NEXT_PUBLIC_API_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3000";

  const apiUrl =
    rawPublicImageBase.startsWith("/") && siteUrl
      ? `${siteUrl.replace(/\/$/, "")}${rawPublicImageBase}`
      : rawPublicImageBase;
  try {
    const u = new URL(apiUrl);
    return {
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      port: u.port || "",
    };
  } catch {
    return { protocol: "http", hostname: "localhost", port: "3000" };
  }
}

const {
  protocol: apiProtocol,
  hostname: apiHostname,
  port: apiPort,
} = getImageRemoteFromApiUrl();

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    // Dev ortamında görselleri optimize etmeden kullan
    unoptimized: process.env.NODE_ENV === "development",
    // API'den gelen görseller için external domain
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        port: apiPort,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Image format optimizasyonu
    formats: ["image/avif", "image/webp"],
    // Minimum kalite (performans için)
    minimumCacheTTL: 60,
  },
  // Compiler optimizasyonları
  compiler: {
    // Production'da console.log'ları kaldır
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Experimental optimizasyonlar
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Production build optimizasyonları
  productionBrowserSourceMaps: false,
};

export default nextConfig;
