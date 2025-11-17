import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permitir orígenes de desarrollo adicionales para recursos de Next (/_next/*)
  // Esto evita la advertencia de "Cross origin request detected" cuando accedes
  // al servidor de desarrollo desde otra máquina en la LAN (por ejemplo, tu móvil).
  // Añade aquí otras URLs si usas más dispositivos en la red.
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.156:3000"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],

    "/*": ["./node_modules/.prisma/client/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "sandbox-api.openpay.mx",
      },
    ],
  },
};

export default nextConfig;
