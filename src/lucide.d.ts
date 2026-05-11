declare module 'lucide-react' {
    import { FC, SVGProps } from 'react';
    export interface IconProps extends SVGProps<SVGSVGElement> {
        size?: string | number;
        color?: string;
        strokeWidth?: string | number;
    }
    export type Icon = FC<IconProps>;
    export const TrendingUp: Icon;
    export const Plus: Icon;
    export const ArrowUpRight: Icon;
    export const Zap: Icon;
    export const Target: Icon;
    export const Bell: Icon;
    export const Sparkles: Icon;
    export const User: Icon;
    export const Droplets: Icon;
    // Add any other icons you use here
}