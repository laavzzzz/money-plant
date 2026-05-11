// 🎨 CSS & Style Modules
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

// 🖼️ Static Assets & Media
declare module "*.svg" {
  import React = require("react");
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

// 🎬 Animations & Interactive
declare module "*.json" {
  const value: any;
  export default value;
}

// Support for Lottie files specifically if stored as .lottie
declare module "*.lottie" {
  const content: string;
  export default content;
}

// 🔮 Next.js Specific Global Types
declare type Theme = "light" | "dark" | "system";

interface Window {
  // Add any custom window properties here if you use global scripts
  ethereum?: any; 
}