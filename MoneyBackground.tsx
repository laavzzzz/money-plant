"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

const MONEY_EMOJIS = ["💰", "💸", "💵", "🪙", "💹", "💎"];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function initialSpotlightPosition() {
  return { xp: 50, yp: 50, hue: 120 };
}

/**
 * A professional landing page background that features:
 * 1. A cursor-following spotlight.
 * 2. Background color shifting (Green to Purple) based on mouse X position.
 * 3. Floating parallax money elements that drift as the user moves.
 */
export default function MoneyBackground() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Spring physics for butter-smooth movement
  const springConfig = { damping: 40, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 🎨 COLOR CHANGING: Maps mouse X position to a Hue (120 = Green, 280 = Purple)
  const bgHue = useTransform(smoothX, [0, 2000], [120, 280]);
  const bgColor = useTransform(bgHue, (h) => `hsla(${h}, 40%, 4%, 1)`);

  // 🔦 SPOTLIGHT: Radial gradient following the cursor
  const spotlight = useTransform(
    [smoothX, smoothY, bgHue],
    ([x, y, h]: number[]) => {
      const screenW = mounted ? window.innerWidth : 1920;
      const screenH = mounted ? window.innerHeight : 1080;
      const xp = (x / screenW) * 100;
      const yp = (y / screenH) * 100;
      const hue = h;
      return `radial-gradient(800px circle at ${xp}% ${yp}%, hsla(${hue}, 60%, 30%, 0.25), transparent 80%)`;
    }
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }}
      className="fixed inset-0 -z-10 overflow-hidden select-none pointer-events-none transition-colors duration-700"
    >
      {/* The Cursor Spotlight Glow */}
      <motion.div 
        style={{ backgroundImage: spotlight }} 
        className="absolute inset-0"
      />

      {/* Floating Money Parallax Elements */}
      {Array.from({ length: 18 }).map((_, i) => (
        <FloatingMoney key={i} index={i} mouseX={smoothX} mouseY={smoothY} mounted={mounted} />
      ))}

      {/* Noise Texture Overlay for a premium feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://res.cloudinary.com/dqr6idss5/image/upload/v1708512151/noise_ovyn2m.png')]" />
    </motion.div>
  );
}

function FloatingMoney({ 
  index, 
  mouseX, 
  mouseY,
  mounted,
}: { index: number; mouseX: MotionValue<number>; mouseY: MotionValue<number>; mounted: boolean }) {
  const config = useMemo(() => {
    const random = seededRandom(1234 + index * 17);
    return {
      x: random() * 100,
      y: random() * 100,
      emoji: MONEY_EMOJIS[index % MONEY_EMOJIS.length],
      depth: 0.04 + random() * 0.12,
      size: 14 + random() * 20,
      rotation: random() * 45 - 22.5,
    };
  }, [index]);

  // Map cursor position to parallax offset with a "magnetic" pull when close
  const x = useTransform([mouseX, mouseY], ([latestX, latestY]: number[]) => {
    const screenW = mounted ? window.innerWidth : 1920;
    const screenH = mounted ? window.innerHeight : 1080;
    const baseX = (config.x / 100) * screenW;
    const baseY = (config.y / 100) * screenH;

    const dx = latestX - baseX;
    const dy = latestY - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const repelForce = Math.pow(Math.max(0, 1 - distance / 500), 2) * 0.8;
    return baseX + (latestX - screenW / 2) * config.depth - dx * repelForce;
  });

  const y = useTransform([mouseX, mouseY], ([latestX, latestY]: number[]) => {
    const screenH = mounted ? window.innerHeight : 1080;
    const screenW = mounted ? window.innerWidth : 1920;
    const baseX = (config.x / 100) * screenW;
    const baseY = (config.y / 100) * screenH;

    const dx = latestX - baseX;
    const dy = latestY - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const repelForce = Math.pow(Math.max(0, 1 - distance / 500), 2) * 0.8;
    return baseY + (latestY - screenH / 2) * config.depth - dy * repelForce;
  });

  return (
    <motion.div
      style={{ x, y, fontSize: config.size, rotate: config.rotation }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.4, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 2, ease: "easeOut" }}
      className="absolute filter blur-[0.5px] pointer-events-none"
    >
      {config.emoji}
    </motion.div>
  );
}