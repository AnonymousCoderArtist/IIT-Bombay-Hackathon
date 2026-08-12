import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  manifest: {
    name: "Smart Campus",
    short_name: "SmartCampus",
    description: "Smart Campus Management Platform",
    theme_color: "#0f3460",
    background_color: "#1a1a2e",
    display: "standalone",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default nextConfig;
