import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/components/register-sw";
import "./globals.css";

// Identidad "ámbar taller" (Fase 6): Barlow Semi Condensed para
// títulos/marca (referencia histórica a señalética de carretera —
// encaja con una app de vehículos), IBM Plex Sans para cuerpo, IBM Plex
// Mono para datos técnicos (VIN, matrículas, masas — ver uso de
// font-mono en toda la app).
const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WorkshopManagement",
  description: "Gestión de expedientes de homologación de vehículos",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WM",
  },
};

export const viewport: Viewport = {
  themeColor: "#16140f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
