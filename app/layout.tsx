import type { Metadata, Viewport } from "next";
import { Lexend, Literata, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { THEME_SCRIPT } from "@/components/ui/Theme";

// self-hosted at build time (works offline too); latin-ext covers ğ ş ı İ
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const lexend = Lexend({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-lexend", display: "swap" });
const literata = Literata({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-literata", display: "swap" });

export const metadata: Metadata = {
  title: "Tavşan · Hızlı Okuma Akademisi",
  description:
    "Okuma hızını anlamayı kaybetmeden geliştiren; tepki süresi, dikkat, hafıza ve zihinsel matematiği ölçen adaptif hızlı okuma akademisi.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF4F5" },
    { media: "(prefers-color-scheme: dark)", color: "#07161C" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${jakarta.variable} ${lexend.variable} ${literata.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* applies the saved theme before first paint (no flash) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
