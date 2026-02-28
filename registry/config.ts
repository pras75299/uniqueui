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
                path: "moving-border.tsx",
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
            { path: "typewriter-text.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "3d-tilt-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "3d-tilt-card.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "spotlight-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "spotlight-card.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "aurora-background",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "aurora-background.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "animated-tabs",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "animated-tabs.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "magnetic-button",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "magnetic-button.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "infinite-marquee",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "infinite-marquee.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "scroll-reveal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "scroll-reveal.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "skeleton-shimmer",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "skeleton-shimmer.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "morphing-modal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "morphing-modal.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    // ─── Phase 2 — Core Library ───
    {
        name: "gradient-text-reveal",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "gradient-text-reveal.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "scramble-text",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "scramble-text.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "meteors-card",
        dependencies: ["clsx", "tailwind-merge"],
        files: [
            { path: "meteors-card.tsx", type: "registry:ui" },
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
            { path: "flip-card.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "dot-grid-background",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "dot-grid-background.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "floating-dock",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "floating-dock.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "confetti-burst",
        dependencies: ["clsx", "tailwind-merge"],
        files: [
            { path: "confetti-burst.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "drawer-slide",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "drawer-slide.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "notification-stack",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "notification-stack.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "animated-timeline",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "animated-timeline.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "nested-comments",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "nested-comments.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
    {
        name: "hover-reveal-card",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            { path: "hover-reveal-card.tsx", type: "registry:ui" },
            cnUtilFile,
        ],
    },
];
