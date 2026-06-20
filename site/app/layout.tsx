import type { Metadata } from "next";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const archivo = Archivo({
  weight: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
const jet = JetBrains_Mono({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-jet",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Netflix Companion — Your Netflix, supercharged",
  description:
    "A Chrome extension that auto-skips Netflix intros, recaps and prompts, and adds seek, picture-in-picture, playback speed, volume boost and keyboard shortcuts — right inside the player.",
  icons: { icon: "/assets/icon128.png" },
  openGraph: {
    title: "Netflix Companion",
    description:
      "Auto-skip, seek, speed, volume boost and keyboard shortcuts for the Netflix player.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable} ${jet.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
