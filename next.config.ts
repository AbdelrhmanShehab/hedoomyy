import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
    // Optimise images for SEO: serve WebP/AVIF where supported
    formats: ["image/avif", "image/webp"],
  },

  // Security + SEO headers applied to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing (security + SEO signal)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Stop pages from being framed (clickjacking protection)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Force HTTPS for 1 year (Strict-Transport-Security)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Basic XSS protection header
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Prevent referrer leakage on external links
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Explicitly tell Googlebot NOT to index private pages
      {
        source: "/(checkout|account|favorites|confirmation|admin)(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
