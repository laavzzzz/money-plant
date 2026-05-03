import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fonts
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Metadata (update later for SEO)
export const metadata: Metadata = {
  title: "MoneyPlant 🌿",
  description: "Grow your money like a plant",
};

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-[#fffdf6] text-gray-800 font-sans antialiased">

        {/* MAIN APP CONTAINER */}
        <div className="flex flex-col min-h-screen">

          {/* 👉 You can add Navbar here later */}
          {/* <Navbar /> */}

          {/* PAGE CONTENT */}
          <main className="flex-1">
            {children}
          </main>

          {/* 👉 Optional Footer later */}
          {/* <Footer /> */}

        </div>

      </body>
    </html>
  );
}