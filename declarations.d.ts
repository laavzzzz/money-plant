/// <reference types="next" />
/// <reference types="next/navigation" />

// 🎨 CSS & STYLE MODULES
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

// 🖼️ STATIC ASSETS & MEDIA
declare module "*.svg" {
  import React from "react";
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

// 🎬 ANIMATIONS & INTERACTIVE (Lottie Support)
declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.lottie" {
  const content: string;
  export default content;
}

// 🔮 GLOBAL APPLICATION TYPES
declare type Theme = "light" | "dark" | "system";

interface Window {
  ethereum?: any; // For Web3/Crypto features
}