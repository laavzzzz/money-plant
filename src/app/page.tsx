"use client";

import React, { useCallback, useRef, memo } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Sparkles, TrendingUp, Zap, ArrowUpRight, Leaf, Shield, Trophy } from "lucide-react";
import MoneyBackground from "../../MoneyBackground";

// ============================================================================
// SYSTEM TYPE DEFINITIONS
// ============================================================================

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badgeText: string;
  gradientClass: string;
}

interface ReviewItem {
  id: string;
  text: string;
  name: string;
  role: string;
  avatarSeed: string;
}

interface MetricItem {
  value: string;
  label: string;
}

// ============================================================================
// IMMUTABLE STATIC DATA CONSTANTS
// ============================================================================

const CONFIG_METRICS: MetricItem[] = [
  { value: "$4.2M+", label: "Wealth Cultivated" },
  { value: "89K+", label: "Active Gardeners" },
  { value: "4.9★", label: "App Vibe Rating" },
];

const FEATURES_DATA: FeatureItem[] = [
  {
    id: "feat-aura",
    icon: <Zap className="w-6 h-6" aria-hidden="true" />,
    title: "Aura Tracking Engine",
    desc: "Gamified financial status monitoring. Every consistent micro-saving milestone instantly builds your global character ranking.",
    badgeText: "POPULAR QUEST",
    gradientClass: "from-amber-400 to-orange-500",
  },
  {
    id: "feat-garden",
    icon: <TrendingUp className="w-6 h-6" aria-hidden="true" />,
    title: "The Garden Nexus",
    desc: "Your primary liquid cash accounts are biologically simulated. Automate deposits to watch your sanctuary expand, or dodge the structural decay of skipped goals.",
    badgeText: "REAL-TIME SIM",
    gradientClass: "from-emerald-400 to-teal-500",
  },
  {
    id: "feat-gear",
    icon: <Sparkles className="w-6 h-6" aria-hidden="true" />,
    title: "Rare Cosmetic Gear",
    desc: "Convert high-streak savings multipliers into exclusive dashboard themes, unique avatars, and custom interface layouts to show off on the leaderboard.",
    badgeText: "LIMITED EDITION",
    gradientClass: "from-purple-400 to-indigo-600",
  },
];

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "rev-1",
    text: "MoneyPlant translated boring spreadsheet accounting into an absolute visual masterpiece. My portfolio garden is thriving, and my savings discipline is completely locked in.",
    name: "Nia",
    role: "Full-Stack Student",
    avatarSeed: "nia",
  },
  {
    id: "rev-2",
    text: "The aura streak multipliers completely rewired how I look at daily micro-transactions. Bypassing unneeded subscriptions to maintain my rank feels incredible.",
    name: "Jax",
    role: "Creative Freelancer",
    avatarSeed: "jax",
  },
  {
    id: "rev-3",
    text: "Clean components, zero bloated interaction tracking, and an interface that directly mirrors elite interactive experiences. This is the future of retail capital management.",
    name: "Mia",
    role: "Product Designer",
    avatarSeed: "mia",
  },
  {
    id: "rev-4",
    text: "An absolute masterclass in user engagement strategy. The gamified milestones make capital building highly addictive. Best financial tooling shift I've ever made.",
    name: "Theo",
    role: "SaaS Founder",
    avatarSeed: "theo",
  },
];

// ============================================================================
// HARDWARE-ACCELERATED ANIMATION ORCHESTRATION
// ============================================================================

const FADE_IN_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// ============================================================================
// OPTIMIZED ISOLATED MEMO SUB-COMPONENTS
// ============================================================================

const FeatureCard = memo(({ icon, title, desc, badgeText, gradientClass }: FeatureItem) => (
  <motion.div
    variants={FADE_IN_UP_VARIANTS}
    whileHover={{ y: -6 }}
    className="p-8 bg-var(--bg-accent) rounded-[32px] border border-white/5 shadow-xl flex flex-col items-start text-left group transition-shadow hover:shadow-2xl relative overflow-hidden"
  >
    <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-var(--text-light) uppercase">
      {badgeText}
    </div>
    <div className={`mb-6 p-4 rounded-2xl text-white bg-gradient-to-br ${gradientClass} shadow-lg group-hover:scale-110 transition-transform duration-300 transform-gpu`}>
      {icon}
    </div>
    <h3 className="font-black text-xl mb-3 uppercase tracking-tighter text-var(--text-main)">
      {title}
    </h3>
    <p className="text-var(--text-light) text-sm font-medium leading-relaxed">
      {desc}
    </p>
  </motion.div>
));
FeatureCard.displayName = "FeatureCard";

const ReviewCard = memo(({ review }: { review: ReviewItem }) => (
  <div className="min-w-[340px] max-w-[340px] shrink-0 rounded-[28px] border border-white/5 bg-var(--glass-bg) p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between transform-gpu">
    <p className="text-var(--text-main) text-sm font-medium leading-relaxed mb-6 italic opacity-95">
      “{review.text}”
    </p>
    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
      <div className="w-10 h-10 rounded-full bg-var(--bg-accent) border border-white/10 flex items-center justify-center font-black text-xs text-primary uppercase">
        {review.name.substring(0, 2)}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-var(--text-light) font-extrabold">
          {review.role}
        </div>
        <div className="text-md font-black text-var(--text-main)">
          {review.name}
        </div>
      </div>
    </div>
  </div>
));
ReviewCard.displayName = "ReviewCard";

// ============================================================================
// MAIN PRODUCTION WORKSPACE LANDING GRAPHIC
// ============================================================================

export default function LandingPage() {
  const vibePreviewRef = useRef<HTMLDivElement>(null);

  const scrollToVibePreview = useCallback(() => {
    if (!vibePreviewRef.current) return;
    vibePreviewRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-var(--text-main) overflow-hidden relative selection:bg-primary/30">
      {/* Interactive Render Canvas Pipeline Layer */}
      <MoneyBackground />

      {/* ================= HEADER NAVIGATION NAVIGATION ================= */}
      <header role="banner" className="relative z-50 max-w-7xl mx-auto p-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 text-2xl font-black italic tracking-tighter"
        >
          <Leaf size={28} className="text-primary animate-vibe-float transform-gpu" aria-hidden="true" />
          <span className="text-gradient">MONEYPLANT</span>
        </motion.div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-5 py-2.5 font-bold text-sm text-var(--text-light) hover:text-var(--text-main) transition-colors rounded-xl focus-visible:outline-2"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-var(--text-main) text-var(--bg-main) rounded-xl font-extrabold text-sm shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 transform-gpu"
          >
            Join the Squad
          </Link>
        </div>
      </header>

      {/* ================= HERO INTRO CANVAS SECTION ================= */}
      <main id="primary-hero-layout" className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
        <motion.section
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Internal Beta Version Badge Element */}
          <motion.div
            variants={FADE_IN_UP_VARIANTS}
            className="mb-6 px-4 py-1.5 bg-var(--bg-accent) border border-white/5 rounded-full shadow-inner flex items-center gap-2 text-xs font-bold tracking-wider text-var(--text-light) uppercase"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>SEASON 1 PROTOCOL ALIVE</span>
          </motion.div>

          <motion.h1
            variants={FADE_IN_UP_VARIANTS}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.92] mb-8 text-var(--text-main) uppercase"
          >
            Stop Saving<br />
            <span className="text-gradient italic">Start Growing</span>
          </motion.h1>

          <motion.p
            variants={FADE_IN_UP_VARIANTS}
            className="max-w-2xl text-var(--text-light) font-medium text-lg md:text-xl mb-12 leading-relaxed"
          >
            The retail finance engine that models your real-world portfolio like a native RPG ecosystem. Build your garden sandbox, cultivate structural aura, and claim level 99 sovereign wealth.
          </motion.p>

          {/* Core App Engagement CTAs Grid */}
          <motion.div
            variants={FADE_IN_UP_VARIANTS}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md shadow-2xl rounded-[32px] p-2 bg-var(--bg-accent)/40 border border-white/5 backdrop-blur-md"
          >
            <Link
              href="/login"
              className="flex-1 group bg-primary text-black font-black py-4 px-6 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 transform-gpu text-sm"
            >
              CLAIM YOUR SEED{" "}
              <ArrowUpRight
                size={18}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                aria-hidden="true"
              />
            </Link>
            <button
              type="button"
              onClick={scrollToVibePreview}
              className="flex-1 bg-var(--bg-main) border border-white/10 text-var(--text-main) font-black py-4 px-6 rounded-2xl hover:bg-var(--bg-accent) transition-colors text-sm"
            >
              EXPLORE MECHANICS
            </button>
          </motion.div>

          {/* Data Analytic Platform Metrics Banner */}
          <motion.div
            variants={FADE_IN_UP_VARIANTS}
            className="mt-16 grid grid-cols-3 gap-4 md:gap-12 border-y border-white/5 py-6 w-full max-w-3xl"
          >
            {CONFIG_METRICS.map((metric, idx) => (
              <div key={`metric-${idx}`} className="text-center">
                <div className="text-2xl md:text-4xl font-black tracking-tight text-var(--text-main)">
                  {metric.value}
                </div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-var(--text-light) mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* ================= BENTO GRAPHICS COMPONENT MATRIX ================= */}
        <section
          ref={vibePreviewRef}
          id="vibe-preview-anchor"
          className="mt-32 w-full scroll-mt-12"
        >
          <div className="flex flex-col items-center mb-12">
            <Shield size={24} className="text-primary mb-3" aria-hidden="true" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-var(--text-light)">
              SYSTEM ARCHITECTURE SPEC SHEET
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
            {FEATURES_DATA.map((feat) => (
              <FeatureCard key={feat.id} {...feat} />
            ))}
          </div>
        </section>
      </main>

      {/* ================= CONTINUOUS RUNTIME REVIEW PIPELINE ================= */}
      <section className="relative z-10 py-24 bg-var(--bg-accent)/30 border-y border-white/5 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-var(--text-light) mb-3">
            VERIFIED FEEDBACK LOOPS
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-var(--text-main) uppercase">
            STORY LOADS FROM THE FIELD
          </h2>
        </div>

        {/* Seamless Hardware-Accelerated Continuous Track */}
        <div className="overflow-hidden flex w-full relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-20 before:bg-gradient-to-r before:from-var(--bg-main) before:to-transparent before:z-20 after:absolute after:right-0 after:after:top-0 after:bottom-0 after:w-20 after:bg-gradient-to-l after:from-var(--bg-main) after:to-transparent after:z-20">
          <motion.div
            className="flex gap-6 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: "max-content" }}
          >
            {REVIEWS_DATA.concat(REVIEWS_DATA).map((review, index) => (
              <ReviewCard key={`review-node-${review.id}-${index}`} review={review} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= PLATFORM FOOTER ENVIRONMENT ================= */}
      <footer role="contentinfo" className="relative z-10 py-20 px-6 border-t border-white/5 bg-var(--bg-main)">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-var(--text-light) font-bold">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 text-2xl font-black italic tracking-tighter text-var(--text-main) mb-6">
              <Leaf size={26} className="text-primary" aria-hidden="true" />
              <span>MONEYPLANT</span>
            </div>
            <p className="font-medium max-w-sm mb-6 leading-relaxed text-var(--text-light)">
              The sovereign wealth-building sandbox core framework. Automate capital preservation metrics, level up asset-allocation metrics, and secure long-term market positions.
            </p>
            <div className="flex gap-3" aria-label="Social platform directory profiles">
              <span className="w-10 h-10 rounded-xl bg-var(--bg-accent) border border-white/5 flex items-center justify-center text-var(--text-main) hover:border-primary/40 transition-colors cursor-pointer text-xs transform-gpu hover:scale-105">𝕏</span>
              <span className="w-10 h-10 rounded-xl bg-var(--bg-accent) border border-white/5 flex items-center justify-center text-var(--text-main) hover:border-primary/40 transition-colors cursor-pointer text-xs transform-gpu hover:scale-105">👾</span>
              <span className="w-10 h-10 rounded-xl bg-var(--bg-accent) border border-white/5 flex items-center justify-center text-var(--text-main) hover:border-primary/40 transition-colors cursor-pointer text-xs transform-gpu hover:scale-105">🐙</span>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase text-[11px] tracking-widest text-var(--text-main) mb-6">
              Deployment Quests
            </h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li className="hover:text-primary cursor-pointer transition-colors">Aura Ranking Masterboard</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Garden Macro Mechanics</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Sovereign Vault Crypts</li>
              <li className="hover:text-primary cursor-pointer transition-colors">System Patch Releases</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-[11px] tracking-widest text-var(--text-main) mb-6">
              Platform Governance
            </h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li className="hover:text-primary cursor-pointer transition-colors">Data Privacy Protocols</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service Manifest</li>
              <li className="hover:text-primary cursor-pointer transition-colors">System Security Disclosures</li>
            </ul>
          </div>
        </div>

        {/* Global Operational Status Infrastructure Bar */}
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-var(--text-light) uppercase tracking-[0.4em]">
            OPTIMIZED FOR THE 1% OF MAIN CHARACTERS
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-var(--text-light) uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
            CORE SUBSYSTEMS PRODUCTION READY
          </div>
        </div>
      </footer>
    </div>
  );
}