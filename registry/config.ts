// Define type locally to avoid circular dependency or build issues with cli package
export type Registry = Array<{
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content?: string }>;
    tailwindConfig?: Record<string, any>;
}>;

const cnUtilFile = {
    path: "utils/cn.ts",
    type: "registry:util",
    content: "import { type ClassValue, clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs: ClassValue[]) {\n    return twMerge(clsx(inputs));\n}\n",
};

export const registry: Registry = [
    {
        name: "moving-border",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            {
                path: "moving-border/component.tsx",
                type: "registry:ui",
            },
            cnUtilFile,
        ],
        tailwindConfig: {
            theme: {
                extend: {
                    animation: {
                        "border-spin": "border-spin 3s linear infinite",
                    },
                    keyframes: {
                        "border-spin": {
                            "100%": {
                                transform: "rotate(-360deg)",
                            },
                        },
                    },
                },
            },
        },
    },
    {
        name: "typewriter-text",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "typewriter-text/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "3d-tilt-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "3d-tilt-card/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "spotlight-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "spotlight-card/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "aurora-background",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "aurora-background/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "animated-tabs",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "animated-tabs/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "magnetic-button",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "magnetic-button/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "infinite-marquee",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "infinite-marquee/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "scroll-reveal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "scroll-reveal/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "skeleton-shimmer",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "skeleton-shimmer/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "morphing-modal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "morphing-modal/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    // ─── Phase 2 — Core Library ───
    {
        name: "animated-glowing-text-outline",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "animated-glowing-text-outline/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "gradient-text-reveal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "gradient-text-reveal/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "scramble-text",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "scramble-text/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "meteors-card",
        dependencies: ["clsx", "tailwind-merge"],
        files: [
            { path: "meteors-card/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
        tailwindConfig: {
            theme: {
                extend: {
                    animation: {
                        meteor: "meteor 5s linear infinite",
                    },
                    keyframes: {
                        meteor: {
                            "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
                            "70%": { opacity: "1" },
                            "100%": { transform: "rotate(215deg) translateX(-500px)", opacity: "0" },
                        },
                    },
                },
            },
        },
    },
    {
        name: "flip-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "flip-card/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "dot-grid-background",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "dot-grid-background/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "floating-dock",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "floating-dock/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "confetti-burst",
        dependencies: ["clsx", "tailwind-merge"],
        files: [
            { path: "confetti-burst/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "drawer-slide",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "drawer-slide/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "notification-stack",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "notification-stack/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "animated-timeline",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "animated-timeline/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "nested-comments",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "nested-comments/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "hover-reveal-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "hover-reveal-card/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "bento-grid",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "bento-grid/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "horizontal-scroll-gallery",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "horizontal-scroll-gallery/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    // ─── Phase 3 — Premium & Polish  ───
    {
        name: "particle-field",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "particle-field/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "interactive-cursor",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "interactive-cursor/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "radial-menu",
        dependencies: ["motion", "lucide-react", "clsx", "tailwind-merge"],
        files: [
            { path: "radial-menu/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "cursor-trail",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "cursor-trail/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "pen-cursor",
        dependencies: ["clsx", "tailwind-merge"],
        files: [
            { path: "pen-cursor/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "glow-hero-section",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "glow-hero-section/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "morphing-card-stack",
        dependencies: ["motion", "lucide-react", "clsx", "tailwind-merge"],
        files: [
            {
                path: "morphing-card-stack/component.tsx",
                type: "registry:ui",
            },
            cnUtilFile,
        ],
    },
    {
        name: "limelight-nav",
        dependencies: ["motion", "lucide-react", "clsx", "tailwind-merge"],
        files: [
            { path: "limelight-nav/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "data-table",
        dependencies: ["lucide-react", "clsx", "tailwind-merge"],
        files: [
            { path: "data-table/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "multi-step-auth-card",
        dependencies: ["motion", "lucide-react", "clsx", "tailwind-merge"],
        files: [
            { path: "multi-step-auth-card/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    // ─── Phase 4 — Hero & Text Effects  ───
    {
        name: "shiny-text",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "shiny-text/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "blur-reveal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "blur-reveal/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "count-up",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "count-up/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "border-beam",
        dependencies: ["clsx", "tailwind-merge"],
        files: [
            { path: "border-beam/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "ripple",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "ripple/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "word-rotate",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "word-rotate/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "lightspeed",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "lightspeed/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "shooting-stars-grid",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "shooting-stars-grid/component.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
];
