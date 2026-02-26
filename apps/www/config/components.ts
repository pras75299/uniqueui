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
    icon: React.ElementType; // Lucide icon
    category?: string;
    props?: { name: string; type: string; default?: string; description: string }[];
    usageCode?: string;
};

export const componentsList: ComponentItem[] = [
      {
            slug: "moving-border",
            name: "Moving Border",
            description: "SVG-path-tracing animated border that orbits a button or card.",
            installCmd: "uniqueui add moving-border",
            icon: Sparkles,
            category: "Effects & Animations",

            props: [
      {
            "name": "borderRadius",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "as",
            "type": "React.ElementType",
            "description": "Description coming soon"
      },
      {
            "name": "containerClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "borderClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "duration",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      }
],
        usageCode: `import { Button } from "@/components/ui/moving-border";

export default function Example() {
  return (
    <Button borderRadius="1.75rem">
      Click me
    </Button>
  );
}`
    },
      {
            slug: "typewriter-text",
            name: "Typewriter Text",
            description:
                  "Character-by-character typing with blinking cursor, configurable speed, and delete-retype loop.",
            installCmd: "uniqueui add typewriter-text",
            icon: Terminal,
            category: "Text",

            props: [
      {
            "name": "words",
            "type": "string[]",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "cursorClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "typingSpeed",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "deletingSpeed",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "delayBetweenWords",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "loop",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "cursor",
            "type": "boolean",
            "description": "Description coming soon"
      }
],
        usageCode: `import { TypewriterText } from "@/components/ui/typewriter-text";

export default function Example() {
  return (
    <TypewriterText words={["Hello", "World"]} />
  );
}`
    },
      {
            slug: "3d-tilt-card",
            name: "3D Tilt Card",
            description:
                  "Perspective-shifting card that tilts toward the cursor with parallax layers and glare overlay.",
            installCmd: "uniqueui add 3d-tilt-card",
            icon: Layers,
            category: "Cards",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "containerClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "tiltMaxDeg",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "perspective",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "scale",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "glare",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "glareMaxOpacity",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { TiltCard } from "@/components/ui/3d-tilt-card";

export default function Example() {
  return (
    <TiltCard>
      Content goes here
    </TiltCard>
  );
}`
    },
      {
            slug: "spotlight-card",
            name: "Spotlight Card",
            description:
                  "Card with a radial spotlight that follows the mouse cursor across its surface.",
            installCmd: "uniqueui add spotlight-card",
            icon: MousePointer,
            category: "Cards",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "spotlightColor",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "spotlightSize",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function Example() {
  return (
    <SpotlightCard>
      Content goes here
    </SpotlightCard>
  );
}`
    },
      {
            slug: "aurora-background",
            name: "Aurora Background",
            description:
                  "Flowing aurora borealis gradient animation using layered blurred blobs.",
            installCmd: "uniqueui add aurora-background",
            icon: Sparkles,
            category: "Backgrounds",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "showRadialGradient",
            "type": "boolean",
            "description": "Description coming soon"
      }
],
        usageCode: `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Example() {
  return (
    <AuroraBackground>
      Content goes here
    </AuroraBackground>
  );
}`
    },
      {
            slug: "animated-tabs",
            name: "Animated Tabs",
            description:
                  "Tab bar with a sliding pill that morphs between active tabs using layout animation.",
            installCmd: "uniqueui add animated-tabs",
            icon: Layers,
            category: "Navigation & Overlays",

            props: [
      {
            "name": "tabs",
            "type": "{",
            "description": "Description coming soon"
      },
      {
            "name": "id",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "label",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "content",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "tabClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "activeTabClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "contentClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "onChange",
            "type": "(id: string) => void",
            "description": "Description coming soon"
      }
],
        usageCode: `import { AnimatedTabs } from "@/components/ui/animated-tabs";

export default function Example() {
  return (
    <AnimatedTabs tabs={[{ id: "1", label: "Tab 1", content: "Content 1" }]} />
  );
}`
    },
      {
            slug: "magnetic-button",
            name: "Magnetic Button",
            description:
                  "Button that stretches toward the cursor when nearby and snaps back with spring physics.",
            installCmd: "uniqueui add magnetic-button",
            icon: MousePointer,
            category: "Effects & Animations",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "magneticStrength",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "magneticRadius",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "onClick",
            "type": "() => void",
            "description": "Description coming soon"
      },
      {
            "name": "disabled",
            "type": "boolean",
            "description": "Description coming soon"
      }
],
        usageCode: `import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Example() {
  return (
    <MagneticButton>
      Content goes here
    </MagneticButton>
  );
}`
    },
      {
            slug: "infinite-marquee",
            name: "Infinite Marquee",
            description:
                  "Seamless infinite-scrolling ticker with pause-on-hover and variable speed.",
            installCmd: "uniqueui add infinite-marquee",
            icon: ScrollText,
            category: "Effects & Animations",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "speed",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "direction",
            "type": "\"left\" | \"right\"",
            "description": "Description coming soon"
      },
      {
            "name": "pauseOnHover",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "gap",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { InfiniteMarquee } from "@/components/ui/infinite-marquee";

export default function Example() {
  return (
    <InfiniteMarquee>
      Content goes here
    </InfiniteMarquee>
  );
}`
    },
      {
            slug: "scroll-reveal",
            name: "Scroll Reveal",
            description:
                  "Elements animate into view when they enter the viewport, with 6 animation presets.",
            installCmd: "uniqueui add scroll-reveal",
            icon: ScrollText,
            category: "Effects & Animations",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "animation",
            "type": "AnimationPreset",
            "description": "Description coming soon"
      },
      {
            "name": "delay",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "duration",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "threshold",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "once",
            "type": "boolean",
            "description": "Description coming soon"
      }
],
        usageCode: `import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Example() {
  return (
    <ScrollReveal>
      Content goes here
    </ScrollReveal>
  );
}`
    },
      {
            slug: "skeleton-shimmer",
            name: "Skeleton Shimmer",
            description:
                  "Skeleton loading placeholders with animated shimmer gradient sweep and pulse fade.",
            installCmd: "uniqueui add skeleton-shimmer",
            icon: Loader2,
            category: "Effects & Animations",

            props: [
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "width",
            "type": "string | number",
            "description": "Description coming soon"
      },
      {
            "name": "height",
            "type": "string | number",
            "description": "Description coming soon"
      },
      {
            "name": "rounded",
            "type": "\"sm\" | \"md\" | \"lg\" | \"xl\" | \"full\"",
            "description": "Description coming soon"
      },
      {
            "name": "count",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "gap",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";

export default function Example() {
  return (
    <SkeletonShimmer>
      Content goes here
    </SkeletonShimmer>
  );
}`
    },
      {
            slug: "morphing-modal",
            name: "Morphing Modal",
            description:
                  "Modal that expands from the trigger element with spring physics and backdrop blur.",
            installCmd: "uniqueui add morphing-modal",
            icon: Maximize2,
            category: "Navigation & Overlays",

            props: [
      {
            "name": "isOpen",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "onClose",
            "type": "() => void",
            "description": "Description coming soon"
      },
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "overlayClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "layoutId",
            "type": "string",
            "description": "Description coming soon"
      }
],
        usageCode: `import { MorphingModal } from "@/components/ui/morphing-modal";

export default function Example() {
  return (
    <MorphingModal>
      Content goes here
    </MorphingModal>
  );
}`
    },
      {
            slug: "gradient-text-reveal",
            name: "Gradient Text Reveal",
            description:
                  "Word-by-word text reveal with gradient coloring and blur-to-clear spring animation.",
            installCmd: "uniqueui add gradient-text-reveal",
            icon: Palette,
            category: "Text",

            props: [
      {
            "name": "text",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "gradientFrom",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "gradientTo",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "staggerDelay",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "duration",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "once",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "as",
            "type": "\"h1\" | \"h2\" | \"h3\" | \"h4\" | \"p\" | \"span\"",
            "description": "Description coming soon"
      }
],
        usageCode: `import { GradientTextReveal } from "@/components/ui/gradient-text-reveal";

export default function Example() {
  return (
    <GradientTextReveal>
      Content goes here
    </GradientTextReveal>
  );
}`
    },
      {
            slug: "scramble-text",
            name: "Scramble Text",
            description:
                  "Matrix-style text scramble effect that resolves characters left-to-right.",
            installCmd: "uniqueui add scramble-text",
            icon: Type,
            category: "Text",

            props: [
      {
            "name": "text",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "speed",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "scrambleDuration",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "triggerOnView",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "once",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "characterSet",
            "type": "string",
            "description": "Description coming soon"
      }
],
        usageCode: `import { ScrambleText } from "@/components/ui/scramble-text";

export default function Example() {
  return (
    <ScrambleText>
      Content goes here
    </ScrambleText>
  );
}`
    },
      {
            slug: "meteors-card",
            name: "Meteors Card",
            description:
                  "Card with animated meteor/shooting star particles falling through the background.",
            installCmd: "uniqueui add meteors-card",
            icon: Flame,
            category: "Cards",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "meteorCount",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "meteorColor",
            "type": "string",
            "description": "Description coming soon"
      }
],
        usageCode: `import { MeteorsCard } from "@/components/ui/meteors-card";

export default function Example() {
  return (
    <MeteorsCard>
      Content goes here
    </MeteorsCard>
  );
}`
    },
      {
            slug: "flip-card",
            name: "Flip Card",
            description:
                  "3D card flip with spring physics, supporting hover or click triggers.",
            installCmd: "uniqueui add flip-card",
            icon: RotateCw,
            category: "Cards",

            props: [
      {
            "name": "front",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "back",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "frontClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "backClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "trigger",
            "type": "\"hover\" | \"click\"",
            "description": "Description coming soon"
      },
      {
            "name": "direction",
            "type": "\"horizontal\" | \"vertical\"",
            "description": "Description coming soon"
      },
      {
            "name": "perspective",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { FlipCard } from "@/components/ui/flip-card";

export default function Example() {
  return (
    <FlipCard>
      Content goes here
    </FlipCard>
  );
}`
    },
      {
            slug: "dot-grid-background",
            name: "Dot Grid Background",
            description:
                  "Interactive dot-grid pattern with a glowing cursor-following effect.",
            installCmd: "uniqueui add dot-grid-background",
            icon: Grid3x3,
            category: "Backgrounds",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "dotColor",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "dotSize",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "gap",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "hoverRadius",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "hoverScale",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { DotGridBackground } from "@/components/ui/dot-grid-background";

export default function Example() {
  return (
    <DotGridBackground>
      Content goes here
    </DotGridBackground>
  );
}`
    },
      {
            slug: "floating-dock",
            name: "Floating Dock",
            description:
                  "macOS-style dock with magnetic scaling, spring physics, and tooltips.",
            installCmd: "uniqueui add floating-dock",
            icon: Anchor,
            category: "Navigation & Overlays",

            props: [
      {
            "name": "items",
            "type": "{",
            "description": "Description coming soon"
      },
      {
            "name": "id",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "icon",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "label",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "onClick",
            "type": "() => void",
            "description": "Description coming soon"
      },
      {
            "name": "href",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "iconSize",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "maxScale",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "magneticRange",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { FloatingDock } from "@/components/ui/floating-dock";

export default function Example() {
  return (
    <FloatingDock>
      Content goes here
    </FloatingDock>
  );
}`
    },
      {
            slug: "confetti-burst",
            name: "Confetti Burst",
            description:
                  "Click-triggered confetti particle explosion with customizable colors and physics.",
            installCmd: "uniqueui add confetti-burst",
            icon: PartyPopper,
            category: "Effects & Animations",

            props: [
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "particleCount",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "colors",
            "type": "string[]",
            "description": "Description coming soon"
      },
      {
            "name": "spread",
            "type": "number",
            "description": "Description coming soon"
      },
      {
            "name": "duration",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { ConfettiBurst } from "@/components/ui/confetti-burst";

export default function Example() {
  return (
    <ConfettiBurst>
      Content goes here
    </ConfettiBurst>
  );
}`
    },
      {
            slug: "drawer-slide",
            name: "Drawer Slide",
            description:
                  "Slide-out drawer panel with drag-to-dismiss, spring physics, and backdrop blur.",
            installCmd: "uniqueui add drawer-slide",
            icon: PanelRight,
            category: "Navigation & Overlays",

            props: [
      {
            "name": "isOpen",
            "type": "boolean",
            "description": "Description coming soon"
      },
      {
            "name": "onClose",
            "type": "() => void",
            "description": "Description coming soon"
      },
      {
            "name": "children",
            "type": "React.ReactNode",
            "description": "Description coming soon"
      },
      {
            "name": "position",
            "type": "DrawerPosition",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "overlayClassName",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "width",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "height",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "dragToClose",
            "type": "boolean",
            "description": "Description coming soon"
      }
],
        usageCode: `import { DrawerSlide } from "@/components/ui/drawer-slide";

export default function Example() {
  return (
    <DrawerSlide>
      Content goes here
    </DrawerSlide>
  );
}`
    },
      {
            slug: "notification-stack",
            name: "Notification Stack",
            description:
                  "Stacked toast notifications with auto-dismiss progress, sliding animations, and multiple types.",
            installCmd: "uniqueui add notification-stack",
            icon: Bell,
            category: "Navigation & Overlays",

            props: [
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "position",
            "type": "\"top-right\" | \"top-left\" | \"bottom-right\" | \"bottom-left\"",
            "description": "Description coming soon"
      },
      {
            "name": "maxVisible",
            "type": "number",
            "description": "Description coming soon"
      }
],
        usageCode: `import { NotificationStack } from "@/components/ui/notification-stack";

export default function Example() {
  return (
    <NotificationStack>
      Content goes here
    </NotificationStack>
  );
}`
    },
      {
            slug: "animated-timeline",
            name: "Animated Timeline",
            description:
                  "Scroll-triggered timeline with staggered spring animations for each node.",
            installCmd: "uniqueui add animated-timeline",
            icon: Clock,
            category: "Effects & Animations",

            props: [
      {
            "name": "items",
            "type": "TimelineItem[]",
            "description": "Description coming soon"
      },
      {
            "name": "className",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "lineColor",
            "type": "string",
            "description": "Description coming soon"
      },
      {
            "name": "orientation",
            "type": "\"vertical\" | \"horizontal\"",
            "description": "Description coming soon"
      }
],
        usageCode: `import { AnimatedTimeline } from "@/components/ui/animated-timeline";

export default function Example() {
  return (
    <AnimatedTimeline>
      Content goes here
    </AnimatedTimeline>
  );
}`
    }
];
