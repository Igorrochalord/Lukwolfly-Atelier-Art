import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { site } from "@/content/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", axes: ["opsz", "wdth"] });
const instrument = Instrument_Serif({ weight: "400", style: ["italic", "normal"], subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.full} — fursuits, pelúcias e artes`, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.full,
  keywords: ["fursuit", "pelúcia", "plush", "arte furry", "commission", "headshot", "badge", "ref sheet", "Brasil"],
  openGraph: { type: "website", locale: "pt_BR", siteName: site.full, title: site.full, description: site.description },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0b1215", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${instrument.variable} ${mono.variable} antialiased`}>
      <body>
        <a href="#conteudo" className="label fixed top-2 left-2 z-[100] -translate-y-[200%] rounded-full bg-lime px-4 py-2 text-ink focus:translate-y-0">
          Pular para o conteúdo
        </a>
        <MotionProvider>
          <Header />
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
