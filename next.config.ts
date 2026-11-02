import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      // film VSL i napisy mogą pochodzić z zewnętrznego hostingu wideo (adres w Ustawieniach → Oferta)
      "media-src 'self' https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["playwright-core"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // podglądy /demo, wersje online i do druku materiałów – poza indeksem wyszukiwarek
      { source: "/wiedza/:slug/:view(demo|material|druk|pdf|otworz|podsumowanie)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async rewrites() {
    return {
      // przykładowa Mapa Relacji jako materiał „Wiedza” – renderowana prawdziwym generatorem podsumowań
      beforeFiles: [
        { source: "/wiedza/przykladowa-mapa-relacji/demo", destination: "/mapa-relacji-przyklad/demo" },
        { source: "/wiedza/przykladowa-mapa-relacji/material", destination: "/mapa-relacji-przyklad/material" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
