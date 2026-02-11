import {
    Sparkles,
    Terminal,
    Layers,
    MousePointer,
    ScrollText,
    Loader2,
    Maximize2,
    Palette,
    Type,
    Flame,
    RotateCw,
    Grid3x3,
    Anchor,
    PartyPopper,
    PanelRight,
    Bell,
    Clock,
} from "lucide-react";

export type ComponentItem = {
    slug: string;
    name: string;
    description: string;
    installCmd: string;
    icon: any; // Lucide icon
};

export const componentsList: ComponentItem[] = [
    {
        slug: "moving-border",
        name: "Moving Border",
        description: "SVG-path-tracing animated border that orbits a button or card.",
        installCmd: "uniqueui add moving-border",
        icon: Sparkles,
    },
    {
        slug: "typewriter-text",
        name: "Typewriter Text",
        description:
            "Character-by-character typing with blinking cursor, configurable speed, and delete-retype loop.",
        installCmd: "uniqueui add typewriter-text",
        icon: Terminal,
    },
    {
        slug: "3d-tilt-card",
        name: "3D Tilt Card",
        description:
            "Perspective-shifting card that tilts toward the cursor with parallax layers and glare overlay.",
        installCmd: "uniqueui add 3d-tilt-card",
        icon: Layers,
    },
    {
        slug: "spotlight-card",
        name: "Spotlight Card",
        description:
            "Card with a radial spotlight that follows the mouse cursor across its surface.",
        installCmd: "uniqueui add spotlight-card",
        icon: MousePointer,
    },
    {
        slug: "aurora-background",
        name: "Aurora Background",
        description:
            "Flowing aurora borealis gradient animation using layered blurred blobs.",
        installCmd: "uniqueui add aurora-background",
        icon: Sparkles,
    },
    {
        slug: "animated-tabs",
        name: "Animated Tabs",
        description:
            "Tab bar with a sliding pill that morphs between active tabs using layout animation.",
        installCmd: "uniqueui add animated-tabs",
        icon: Layers,
    },
    {
        slug: "magnetic-button",
        name: "Magnetic Button",
        description:
            "Button that stretches toward the cursor when nearby and snaps back with spring physics.",
        installCmd: "uniqueui add magnetic-button",
        icon: MousePointer,
    },
    {
        slug: "infinite-marquee",
        name: "Infinite Marquee",
        description:
            "Seamless infinite-scrolling ticker with pause-on-hover and variable speed.",
        installCmd: "uniqueui add infinite-marquee",
        icon: ScrollText,
    },
    {
        slug: "scroll-reveal",
        name: "Scroll Reveal",
        description:
            "Elements animate into view when they enter the viewport, with 6 animation presets.",
        installCmd: "uniqueui add scroll-reveal",
        icon: ScrollText,
    },
    {
        slug: "skeleton-shimmer",
        name: "Skeleton Shimmer",
        description:
            "Skeleton loading placeholders with animated shimmer gradient sweep and pulse fade.",
        installCmd: "uniqueui add skeleton-shimmer",
        icon: Loader2,
    },
    {
        slug: "morphing-modal",
        name: "Morphing Modal",
        description:
            "Modal that expands from the trigger element with spring physics and backdrop blur.",
        installCmd: "uniqueui add morphing-modal",
        icon: Maximize2,
    },
    {
        slug: "gradient-text-reveal",
        name: "Gradient Text Reveal",
        description:
            "Word-by-word text reveal with gradient coloring and blur-to-clear spring animation.",
        installCmd: "uniqueui add gradient-text-reveal",
        icon: Palette,
    },
    {
        slug: "scramble-text",
        name: "Scramble Text",
        description:
            "Matrix-style text scramble effect that resolves characters left-to-right.",
        installCmd: "uniqueui add scramble-text",
        icon: Type,
    },
    {
        slug: "meteors-card",
        name: "Meteors Card",
        description:
            "Card with animated meteor/shooting star particles falling through the background.",
        installCmd: "uniqueui add meteors-card",
        icon: Flame,
    },
    {
        slug: "flip-card",
        name: "Flip Card",
        description:
            "3D card flip with spring physics, supporting hover or click triggers.",
        installCmd: "uniqueui add flip-card",
        icon: RotateCw,
    },
    {
        slug: "dot-grid-background",
        name: "Dot Grid Background",
        description:
            "Interactive dot-grid pattern with a glowing cursor-following effect.",
        installCmd: "uniqueui add dot-grid-background",
        icon: Grid3x3,
    },
    {
        slug: "floating-dock",
        name: "Floating Dock",
        description:
            "macOS-style dock with magnetic scaling, spring physics, and tooltips.",
        installCmd: "uniqueui add floating-dock",
        icon: Anchor,
    },
    {
        slug: "confetti-burst",
        name: "Confetti Burst",
        description:
            "Click-triggered confetti particle explosion with customizable colors and physics.",
        installCmd: "uniqueui add confetti-burst",
        icon: PartyPopper,
    },
    {
        slug: "drawer-slide",
        name: "Drawer Slide",
        description:
            "Slide-out drawer panel with drag-to-dismiss, spring physics, and backdrop blur.",
        installCmd: "uniqueui add drawer-slide",
        icon: PanelRight,
    },
    {
        slug: "notification-stack",
        name: "Notification Stack",
        description:
            "Stacked toast notifications with auto-dismiss progress, sliding animations, and multiple types.",
        installCmd: "uniqueui add notification-stack",
        icon: Bell,
    },
    {
        slug: "animated-timeline",
        name: "Animated Timeline",
        description:
            "Scroll-triggered timeline with staggered spring animations for each node.",
        installCmd: "uniqueui add animated-timeline",
        icon: Clock,
    },
];
