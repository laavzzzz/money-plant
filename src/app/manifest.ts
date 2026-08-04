/**
 * @fileoverview Progressive Web Application (PWA) Manifest Configuration
 * @description Enterprise-grade Next.js App Router Web App Manifest generator.
 * Fully compliant with W3C Web App Manifest specification, WebHint rules,
 * and Google Lighthouse PWA audit standards.
 * 
 * @module app/manifest
 * @version 2.0.0
 */

import type { MetadataRoute } from "next";

// ============================================================================
// SYSTEM CONSTANTS & DESIGN TOKENS
// ============================================================================

/** Core Application Metadata */
const APP_CONFIG = {
  id: "com.moneyplant.app",
  name: "Money Plant Application",
  shortName: "MoneyPlant",
  description: "Gamified financial tracker, smart expense manager, and automated savings portal.",
  startUrl: "/",
  scope: "/",
  lang: "en-US",
  dir: "ltr" as const,
  display: "standalone" as const,
  orientation: "portrait-primary" as const,
  categories: ["finance", "utilities", "productivity", "lifestyle"],
  backgroundColor: "#050505", // Deep Onyx / Gen Z Dark Aesthetics
  themeColor: "#eab308",       // Money Yellow / Gold Accent
} as const;

// ============================================================================
// MANIFEST FACTORY FUNCTION
// ============================================================================

/**
 * Generates the production Web App Manifest file served at `/manifest.webmanifest`
 * 
 * @returns {MetadataRoute.Manifest} W3C-compliant Web App Manifest Object
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: APP_CONFIG.id,
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.shortName,
    description: APP_CONFIG.description,
    start_url: APP_CONFIG.startUrl,
    scope: APP_CONFIG.scope,
    display: APP_CONFIG.display,
    orientation: APP_CONFIG.orientation,
    background_color: APP_CONFIG.backgroundColor,
    theme_color: APP_CONFIG.themeColor,
    lang: APP_CONFIG.lang,
    dir: APP_CONFIG.dir,
    categories: [...APP_CONFIG.categories],
    prefer_related_applications: false,

    /* ========================================================================
       MULTI-PLATFORM ICON SUITE (Android, iOS, Windows, macOS)
       ======================================================================== */
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    /* ========================================================================
       OS-LEVEL APPLICATION SHORTCUTS (Right-Click / Long-Press Actions)
       ======================================================================== */
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View financial summary and active metrics",
        url: "/dashboard",
        icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Add Expense",
        short_name: "Add",
        description: "Quickly record a new transaction",
        url: "/tracker?action=new",
        icons: [{ src: "/icons/shortcut-add.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Savings Portal",
        short_name: "Savings",
        description: "Track money plant growth and savings goals",
        url: "/savings",
        icons: [{ src: "/icons/shortcut-savings.png", sizes: "192x192", type: "image/png" }],
      },
    ],

    /* ========================================================================
       RICH INSTALLATION PROMPT PREVIEWS (Chromium Install Banner)
       ======================================================================== */
    screenshots: [
      {
        src: "/screenshots/desktop-dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Money Plant Analytics Dashboard",
      },
      {
        src: "/screenshots/mobile-tracker.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Gamified Expense Tracker & Growth Vault",
      },
    ],
  };
}