/// <reference types="lucide-react" />
/// <reference types="next" />
/// <reference types="next/navigation" />

import "lucide-react";

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

// 🎬 Animations & Interactive
declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.lottie" {
  const content: string;
  export default content;
}

// 🔮 Global Application Types
declare type Theme = "light" | "dark" | "system";

interface Window {
  ethereum?: any; 
}

// 🛠️ Lucide-React Direct Type Support
declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;
  export const ChevronRight: Icon;
  export const AtSign: Icon;
  export const PhoneCall: Icon;
  export const ArrowLeft: Icon;
  export const CheckCircle: Icon;
  // This allows any other icon name as well
  export const [key, string]: Icon;
}