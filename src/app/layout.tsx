import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";
import PageTransition from "../components/page-transition";
import AppProviders from "../components/providers/AppProviders";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// --- ADVANCED SEO & BRANDING ---
export const metadata: Metadata = {
  title: {
    default: "MoneyPlant 🌿 | Vibe Your Way to Wealth",
    template: "%s | MoneyPlant",
  },
  description: "The gamified, AI-powered expense tracker for Gen Z. Grow your wealth, dodge the Fanum Tax, and level up your life.",
  keywords: ["Expense Tracker", "Gen Z Finance", "Gamified Savings", "MoneyPlant", "Fintech"],
  authors: [{ name: "MoneyPlant Team" }],
  creator: "Ananya Sharma",
  metadataBase: new URL("https://moneyplant.dev"),
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moneyplant.dev",
    siteName: "MoneyPlant",
    title: "MoneyPlant 🌿 | Stop Spending, Start Growing",
    description: "Vibe-coded finance for the next generation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MoneyPlant Preview" }],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "MoneyPlant 🌿",
    description: "Your wealth is a plant. Don't let it wither.",
    images: ["/og-image.png"],
  },

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoneyPlant",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDF6" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-[100dvh] font-sans antialiased selection:bg-primary/30",
          "overflow-x-hidden transition-colors duration-500",
          plusJakarta.variable,
          "grain-overlay" 
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* 🎨 GLOBAL BACKGROUND ENGINE */}
          <div className="vibe-canvas fixed inset-0 z-0" aria-hidden="true" />

          {/* 🚀 MAIN APP STRUCTURE */}
          <AppProviders>
            <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
              <PageTransition>
                <main className="flex-1 relative z-10 w-full">{children}</main>
              </PageTransition>
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </AppProviders>

          {/* 🔔 PREMIUM TOAST NOTIFICATIONS */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: "glass-panel !rounded-[28px] !border-none !shadow-2xl !font-bold !px-6 !py-4",
              style: { 
                background: 'rgba(255, 255, 255, 0.4)', 
                backdropFilter: 'blur(20px)',
                color: 'var(--text-main)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }
            }}
          />
        </ThemeProvider>

        {/* 🏗️ SVG RENDERING ENGINE (Effects & Masks) */}
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
          <defs>
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <clipPath id="squirclePath" clipPathUnits="objectBoundingBox">
              <path d="M .5,0 C .1,0 0,.1 0,.5 0,.9 .1,1 .5,1 .9,1 1,.9 1,.5 1,.1 .9,0 .5,0 Z" />
            </clipPath>
          </defs>
        </svg>
      </body>
    </html>
  );
}