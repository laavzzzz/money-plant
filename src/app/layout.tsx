import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner"; // Premium toast notifications
import { ThemeProvider } from "../components/theme-provider"; // For Night Vibe
import PageTransition from "../components/page-transition"; // For smooth page swaps
import { cn } from "@/lib/utils";
import "./globals.css";

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
  metadataBase: new URL("https://moneyplant.dev"), // Change to your real domain
  
  // Social Media Previews (OpenGraph)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moneyplant.dev",
    siteName: "MoneyPlant",
    title: "MoneyPlant 🌿 | Stop Spending, Start Growing",
    description: "Vibe-coded finance for the next generation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MoneyPlant Preview" }],
  },
  
  // Twitter / X Integration
  twitter: {
    card: "summary_large_image",
    title: "MoneyPlant 🌿",
    description: "Your wealth is a plant. Don't let it wither.",
    images: ["/og-image.png"],
  },

  // Apple & PWA Optimization
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
  viewportFit: "cover", // Vital for iPhone notches
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
        {/* 🌙 THEME PROVIDER: Wraps everything for Night Vibe support */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* 🎨 BACKGROUND AURA */}
          <div className="vibe-canvas fixed inset-0" aria-hidden="true" />

          {/* 🚀 MAIN APP STRUCTURE */}
          <div className="relative flex min-h-[100dvh] flex-col">
            {/* 🎬 PAGE TRANSITIONS: Adds smooth fade/slide between routes */}
            <PageTransition>
              <main className="flex-1 relative z-10">
                {children}
              </main>
            </PageTransition>

            {/* 📱 SAFE AREA SPACING (Bottom Nav clearance) */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>

          {/* 🔔 PREMIUM TOASTS: For Level Ups, Success, and Errors */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: "glass-panel !rounded-[24px] !border-none !shadow-xl !font-bold",
              style: { background: 'var(--glass-bg)', color: 'var(--text-main)' }
            }}
          />
        </ThemeProvider>

        {/* 🏗️ SVG FILTER SYSTEM (Internal rendering engine for UI effects) */}
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
          <defs>
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Custom mask for rounded squircle icons */}
            <clipPath id="squirclePath" clipPathUnits="objectBoundingBox">
              <path d="M .5,0 C .1,0 0,.1 0,.5 0,.9 .1,1 .5,1 .9,1 1,.9 1,.5 1,.1 .9,0 .5,0 Z" />
            </clipPath>
          </defs>
        </svg>
      </body>
    </html>
  );
}