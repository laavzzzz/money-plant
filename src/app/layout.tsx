import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";
import PageTransition from "../components/page-transition";
import AppProviders from "../components/providers/AppProviders";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

// ============================================================================
// SYSTEM FONT ENGINE ARCHITECTURE
// ============================================================================

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  adjustFontFallback: true,
});

// ============================================================================
// ADVANCED ENTERPRISE SEO, GRAPH SCHEMA, & APPS PACKAGING
// ============================================================================

const SERVER_ENV_URL = process.env.NEXT_PUBLIC_APP_URL || "https://moneyplant.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SERVER_ENV_URL),
  title: {
    default: "MoneyPlant 🌿 | Vibe Your Way to Wealth",
    template: "%s | MoneyPlant",
  },
  description: "The gamified, AI-powered expense tracker for Gen Z. Grow your wealth, dodge the Fanum Tax, and level up your life.",
  keywords: [
    "Expense Tracker", 
    "Gen Z Finance", 
    "Gamified Savings", 
    "MoneyPlant", 
    "Fintech", 
    "AI Wealth Coach",
    "Personal Finance Application"
  ],
  authors: [{ name: "MoneyPlant Development Team Core", url: SERVER_ENV_URL }],
  creator: "Ananya Sharma",
  publisher: "MoneyPlant Technologies Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SERVER_ENV_URL,
    siteName: "MoneyPlant",
    title: "MoneyPlant 🌿 | Stop Spending, Start Growing",
    description: "Finance for the next generation. Automate savings, track targets, and level up your strategy.",
    images: [
      { 
        url: "/og-image.png", 
        width: 1200, 
        height: 630, 
        alt: "MoneyPlant Gamified Application Platform Dashboard Workspace" 
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MoneyPlantDev",
    creator: "@AnanyaSharma",
    title: "MoneyPlant 🌿 | Automated Financial Tracking Workspace",
    description: "Your wealth is a complex ecosystem. Grow your portfolio, compete on leaderboards, and bypass the budget tax.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoneyPlant",
  },
  alternates: {
    canonical: SERVER_ENV_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFDFD" },
    { media: "(prefers-color-scheme: dark)", color: "#FFFFFF" }, // Locked parameters match light engine constants
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// ============================================================================
// INTERFACE MODULE PROPS
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// SYSTEM WORKSPACE ROOT ARCHITECTURE
// ============================================================================

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={cn("h-full scroll-smooth", plusJakarta.variable)}
      data-theme="light"
    >
      <body
        className={cn(
          "min-h-[100dvh] w-full font-sans antialiased",
          "selection:bg-cyan-400/20 selection:text-slate-900",
          "overflow-x-hidden grain-overlay transform-gpu"
        )}
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--text-body-prose)"
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Dynamic Background Mesh Engine (GPU Accelerated Core Isolation) */}
          <div className="aurora-canvas-container" aria-hidden="true">
            <div className="glow-top-left-turquoise" />
            <div className="glow-top-right-cyan" />
            <div className="glow-bottom-left-mint" />
            <div className="glow-bottom-right-blue" />
          </div>

          {/* Secure NextAuth Identity Validation Engine & Financial Application Context */}
          <AppProviders>
            <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden transform-gpu">
              <PageTransition>
                <main id="main-content-anchor" role="main" className="flex-1 relative z-10 w-full">
                  {children}
                </main>
              </PageTransition>
              
              {/* Native iOS/Android Core Navigation Bar Padding Safeguard */}
              <div className="h-[env(safe-area-inset-bottom)] pointer-events-none w-full" aria-hidden="true" />
            </div>
          </AppProviders>

          {/* Premium High-Contrast Toast Notification Layer Interface */}
          <Toaster 
            position="top-center"
            expand={false}
            richColors
            closeButton
            toastOptions={{
              className: "glass-panel !rounded-[24px] !border border-white/80 !px-6 !py-4 !shadow-2xl font-sans font-bold text-sm",
              style: {
                background: "var(--glass-bg)",
                color: "var(--text-navy-deep)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)"
              }
            }}
          />
        </ThemeProvider>

        {/* Dynamic SVG Filter Pipeline Infrastructure */}
        <svg className="pointer-events-none absolute h-0 w-0 opacity-0 select-none hidden" aria-hidden="true">
          <defs>
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
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