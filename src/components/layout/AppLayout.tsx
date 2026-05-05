"use client";

import BottomNav from "./BottomNav";
import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen gradient-bg flex justify-center relative overflow-hidden">

      {/* 🌿 BACKGROUND BLOBS (Lovable vibe) */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-yellow-200 rounded-full blur-[140px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-orange-200 rounded-full blur-[140px] opacity-30 pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[200px] h-[200px] bg-green-200 rounded-full blur-[120px] opacity-20 pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* 📱 APP WRAPPER */}
      <div className="w-full max-w-md flex flex-col min-h-screen relative z-10">

        {/* 🔝 SCROLLABLE CONTENT */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="
            flex-1
            px-4
            pt-6
            pb-28
            space-y-4
            overflow-y-auto
            scroll-smooth
          "
        >
          {children}
        </motion.main>

        {/* 🔻 FLOATING BOTTOM NAV */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}