// Define type locally to avoid circular dependency or build issues with cli package
export type Registry = Array<{
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content?: string }>;
    tailwindConfig?: Record<string, any>;
}>;


export const registry: Registry = [
    {
        name: "moving-border",
        dependencies: ["motion", "clsx", "tailwind-merge"],
        files: [
            {
                path: "moving-border.tsx",
                type: "registry:ui",
            },
            {
                path: "utils/cn.ts",   // We might need to handle utils extraction or just embed it.
                // For now, I embedded cn in the file, but in a real app
                // we should likely ship a utils file.
                // The user asked to "Start by generating the directory structure".
                // Let's assume for this specific component, we embedded it or it doesn't need external utils file update yet.
                // But wait, the component code I wrote has embedded `cn`.
                type: "registry:util",
                content: "export function cn(...classes: (string | undefined | null | false)[]) { return classes.filter(Boolean).join(' '); }"
            }
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
];
