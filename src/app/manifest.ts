import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WorkshopManagement",
    short_name: "WM",
    description: "Gestión de expedientes de homologación de vehículos",
    start_url: "/",
    display: "standalone",
    background_color: "#16140f",
    theme_color: "#16140f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
