import type { ElementType } from 'react';
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
  MessageSquare,
  LayoutGrid,
} from "lucide-react";

export type ComponentVariant = {
  id: string;
  label: string;
  usageCode: string;
  /** Key used to look up this variant's demo in componentDemos */
  demoKey: string;
};

export type ComponentItem = {
  slug: string;
  name: string;
  description: string;
  installCmd: string;
  icon: ElementType; // Lucide icon
  category?: string;
  props?: { name: string; type: string; default?: string; description: string }[];
  usageCode?: string;
  /** When set, the page renders a synced tab switcher for both preview and code */
  variants?: ComponentVariant[];
};

export const componentsList: ComponentItem[] = [
  {
    slug: "moving-border",
    name: "Moving Border",
    description: "SVG-path-tracing animated border that orbits a button or card.",
    installCmd: "npx uniqueui add moving-border",
    icon: Sparkles,
    category: "Effects & Animations",
    props: [
      {
        "name": "borderRadius",
        "type": "string",
        "description": "The radius for rounding the button edges and the orbiting path."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "The label or content displayed inside the button."
      },
      {
        "name": "as",
        "type": "React.ElementType",
        "description": "The HTML element tag to use for the button wrapper (e.g., 'button', 'div')."
      },
      {
        "name": "containerClassName",
        "type": "string",
        "description": "Add CSS classes to the outermost container."
      },
      {
        "name": "borderClassName",
        "type": "string",
        "description": "Add CSS classes directly to the moving animated SVG border."
      },
      {
        "name": "duration",
        "type": "number",
        "description": "Time in milliseconds to complete one full orbit around the border."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Add CSS classes to the inner content layer."
      }
    ],
    usageCode: `import { Button } from "@/components/ui/moving-border";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-6 items-center justify-center p-10">
      <Button
        borderRadius="1.75rem"
        className="bg-zinc-950 text-white border-neutral-200 dark:border-slate-800"
      >
        Click me
      </Button>
      <Button
        borderRadius="1rem"
        className="bg-zinc-950 text-white border-neutral-200 dark:border-slate-800"
        containerClassName="h-12 w-48"
      >
        Rounded Button
      </Button>
    </div>
  );
}`
  },
  {
    slug: "typewriter-text",
    name: "Typewriter Text",
    description:
      "Character-by-character typing with blinking cursor, configurable speed, and delete-retype loop.",
    installCmd: "npx uniqueui add typewriter-text",
    icon: Terminal,
    category: "Text",
    props: [
      {
        "name": "words",
        "type": "string[]",
        "description": "An array of words or phrases to be typed out sequentially."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Add CSS classes to the text container."
      },
      {
        "name": "cursorClassName",
        "type": "string",
        "description": "Add CSS classes to customize the blinking cursor span."
      },
      {
        "name": "typingSpeed",
        "type": "number",
        "description": "Delay in milliseconds between typing each character."
      },
      {
        "name": "deletingSpeed",
        "type": "number",
        "description": "Delay in milliseconds between deleting each character."
      },
      {
        "name": "delayBetweenWords",
        "type": "number",
        "description": "Pause duration before erasing a completed word to type the next."
      },
      {
        "name": "loop",
        "type": "boolean",
        "description": "Whether the typewriter sequence should repeat infinitely."
      },
      {
        "name": "cursor",
        "type": "boolean",
        "description": "Controls the visibility of the blinking cursor at the end of the text."
      }
    ],
    usageCode: `import { TypewriterText } from "@/components/ui/typewriter-text";

export default function Example() {
  return (
    <div className="space-y-6 text-center p-10">
      <div className="text-3xl font-bold text-white">
        I love{" "}
        <TypewriterText
          words={["React", "TypeScript", "Motion", "Tailwind", "UniqueUI"]}
          className="text-purple-400"
          typingSpeed={100}
          deletingSpeed={60}
        />
      </div>
      <div className="text-lg text-neutral-400">
        <TypewriterText
          words={[
            "Building amazing user interfaces...",
            "With beautiful animations...",
            "That stand out from the crowd.",
          ]}
          typingSpeed={50}
          deletingSpeed={30}
          delayBetweenWords={2000}
        />
      </div>
    </div>
  );
}`
  },
  {
    slug: "3d-tilt-card",
    name: "3D Tilt Card",
    description:
      "Perspective-shifting card that tilts toward the cursor with parallax layers and glare overlay.",
    installCmd: "npx uniqueui add 3d-tilt-card",
    icon: Layers,
    category: "Cards",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "The element(s) suspended inside the 3D card layout."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Tailwind configuration applied directly to the physical card."
      },
      {
        "name": "containerClassName",
        "type": "string",
        "description": "Tailwind bounds defining the invisible hover hit-box."
      },
      {
        "name": "tiltMaxDeg",
        "type": "number",
        "description": "The maximum angle the card aggressively pitches on hover."
      },
      {
        "name": "perspective",
        "type": "number",
        "description": "The CSS perspective depth in pixels determining 3D deformation strength."
      },
      {
        "name": "scale",
        "type": "number",
        "description": "Float multiplier for card scaling when hovered (e.g. 1.05)."
      },
      {
        "name": "glare",
        "type": "boolean",
        "description": "Enable a dynamic radial-gradient glare sweep that tracks the pointer."
      },
      {
        "name": "glareMaxOpacity",
        "type": "number",
        "description": "Max brightness (0 to 1) for the dynamic glare effect."
      }
    ],
    usageCode: `import { TiltCard } from "@/components/ui/3d-tilt-card";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-8 items-center justify-center p-10 text-white">
      <TiltCard className="w-72 bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-2">Hover me</h3>
        <p className="text-neutral-400 text-sm">
          Move your cursor over this card to see the 3D tilt effect with glare.
        </p>
        <div className="mt-4 h-24 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-neutral-700/50" />
      </TiltCard>
      <TiltCard
        tiltMaxDeg={25}
        glare={true}
        className="w-72 bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-800/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-2 text-purple-200">Extra Tilt</h3>
        <p className="text-purple-300/60 text-sm">
          This card has a stronger tilt angle for a more dramatic effect.
        </p>
        <div className="mt-4 flex gap-2">
          <div className="h-12 w-12 rounded-lg bg-purple-500/20 border border-purple-500/30" />
          <div className="h-12 w-12 rounded-lg bg-pink-500/20 border border-pink-500/30" />
          <div className="h-12 w-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30" />
        </div>
      </TiltCard>
    </div>
  );
}`
  },
  {
    slug: "spotlight-card",
    name: "Spotlight Card",
    description:
      "Card with a radial spotlight that follows the mouse cursor across its surface.",
    installCmd: "npx uniqueui add spotlight-card",
    icon: MousePointer,
    category: "Cards",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "Components visible on the card."
      },
      {
        "name": "className",
        "type": "string",
        "description": "CSS classes for sizing and styling the card layout."
      },
      {
        "name": "spotlightColor",
        "type": "string",
        "description": "The hex/rgba color code used for the center cursor glow."
      },
      {
        "name": "spotlightSize",
        "type": "number",
        "description": "Diameter width/height of the gradient spotlight in pixels."
      }
    ],
    usageCode: `import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function Example() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10 text-white text-left">
      <SpotlightCard>
        <h3 className="text-xl font-bold mb-2">Hover for spotlight</h3>
        <p className="text-neutral-400 text-sm">
          Move your mouse over the card to reveal a tracking spotlight effect.
        </p>
      </SpotlightCard>
      <SpotlightCard spotlightColor="rgba(232, 121, 249, 0.1)" spotlightSize={300}>
        <h3 className="text-xl font-bold mb-2">Custom spotlight</h3>
        <p className="text-neutral-400 text-sm">
          Different color and size for the spotlight effect.
        </p>
      </SpotlightCard>
    </div>
  );
}`
  },
  {
    slug: "aurora-background",
    name: "Aurora Background",
    description:
      "Flowing aurora borealis gradient animation using layered blurred blobs.",
    installCmd: "npx uniqueui add aurora-background",
    icon: Sparkles,
    category: "Backgrounds",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "Content elements layered above the animated aurora gradient background."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Additional CSS configuration applied to the background container."
      },
      {
        "name": "showRadialGradient",
        "type": "boolean",
        "description": "Apply a radial vignette mask to focus attention towards the center."
      }
    ],
    usageCode: `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Example() {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 h-[400px] w-full relative text-white">
      <AuroraBackground className="min-h-0 h-full rounded-xl">
        <div className="text-center z-10 w-full">
          <h3 className="text-3xl font-bold mb-2 tracking-tight">Aurora Background</h3>
          <p className="text-neutral-400">Beautiful animated gradients</p>
        </div>
      </AuroraBackground>
    </div>
  );
}`
  },
  {
    slug: "animated-tabs",
    name: "Animated Tabs",
    description:
      "Tab bar with a sliding pill that morphs between active tabs using layout animation.",
    installCmd: "npx uniqueui add animated-tabs",
    icon: Layers,
    category: "Navigation & Overlays",
    props: [
      {
        "name": "tabs",
        "type": "{",
        "description": "Array of tab configurations establishing navigation schema."
      },
      {
        "name": "id",
        "type": "string",
        "description": "A unique identifier used strictly for layout animations."
      },
      {
        "name": "label",
        "type": "string",
        "description": "The string/node rendered on the clickable tab button."
      },
      {
        "name": "content",
        "type": "React.ReactNode",
        "description": "The DOM payload rendered below when this tab is selected."
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
    <div className="max-w-md mx-auto p-10">
      <AnimatedTabs
        tabs={[
          {
            id: "design",
            label: "Design",
            content: (
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm">
                Build stunning interfaces with our design system. Every component is crafted with
                attention to detail.
              </div>
            ),
          },
          {
            id: "animate",
            label: "Animate",
            content: (
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm">
                Add life to your UI with spring-physics animations powered by Motion.dev.
              </div>
            ),
          },
          {
            id: "ship",
            label: "Ship",
            content: (
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm">
                Deploy with confidence. All components are production-ready and accessible.
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}`
  },
  {
    slug: "magnetic-button",
    name: "Magnetic Button",
    description:
      "Button that stretches toward the cursor when nearby and snaps back with spring physics.",
    installCmd: "npx uniqueui add magnetic-button",
    icon: MousePointer,
    category: "Effects & Animations",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "The internal content of the button."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Style overrides appended to the interactive boundary."
      },
      {
        "name": "magneticStrength",
        "type": "number",
        "description": "Float determining how fast/far the button lerps toward the cursor."
      },
      {
        "name": "magneticRadius",
        "type": "number",
        "description": "Pixel radius extending outward from the button where gravity begins."
      },
      {
        "name": "onClick",
        "type": "() => void",
        "description": "Standard click event handler."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "description": "Disables interaction and magnetic gravitational pull."
      }
    ],
    usageCode: `import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-8 items-center justify-center p-20 text-white">
      <MagneticButton>Hover near me</MagneticButton>
      <MagneticButton
        magneticStrength={0.5}
        magneticRadius={200}
        className="bg-gradient-to-b from-purple-700 to-purple-900"
      >
        Stronger pull
      </MagneticButton>
    </div>
  );
}`
  },
  {
    slug: "infinite-marquee",
    name: "Infinite Marquee",
    description:
      "Seamless infinite-scrolling ticker with pause-on-hover and variable speed.",
    installCmd: "npx uniqueui add infinite-marquee",
    icon: ScrollText,
    category: "Effects & Animations",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "Individual cards, images, or elements you want scrolling seamlessly."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Styling classes mapping to the outer tracking viewport."
      },
      {
        "name": "speed",
        "type": "number",
        "description": "Scrolling velocity, representing translation pixels per second."
      },
      {
        "name": "direction",
        "type": "\"left\" | \"right\"",
        "description": "Horizontal (left/right) scroll direction."
      },
      {
        "name": "pauseOnHover",
        "type": "boolean",
        "description": "Temporarily pause the animation sequence when a user points at the element."
      },
      {
        "name": "gap",
        "type": "number",
        "description": "Consistent spacing separating each repeated instance loop."
      }
    ],
    usageCode: `import { InfiniteMarquee, MarqueeItem } from "@/components/ui/infinite-marquee";

export default function Example() {
  return (
    <div className="space-y-6 w-full p-10 overflow-hidden">
      <InfiniteMarquee speed={30}>
        {[
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind",
          "Motion",
          "UniqueUI",
          "Vercel",
          "Node.js",
        ].map((item) => (
          <MarqueeItem key={item}>
            <span className="text-sm font-medium text-neutral-300">{item}</span>
          </MarqueeItem>
        ))}
      </InfiniteMarquee>
      <InfiniteMarquee speed={20} direction="right">
        {[
          "⚡ Fast",
          "🎨 Beautiful",
          "♿ Accessible",
          "📱 Responsive",
          "🔧 Customizable",
          "🚀 Production Ready",
        ].map((item) => (
          <MarqueeItem key={item} className="bg-purple-950/30 border-purple-800/50">
            <span className="text-sm font-medium text-purple-300">{item}</span>
          </MarqueeItem>
        ))}
      </InfiniteMarquee>
    </div>
  );
}`
  },
  {
    slug: "scroll-reveal",
    name: "Scroll Reveal",
    description:
      "Elements animate into view when they enter the viewport, with 6 animation presets.",
    installCmd: "npx uniqueui add scroll-reveal",
    icon: ScrollText,
    category: "Effects & Animations",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "The DOM elements to animate into view upon scrolling."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Styling classes mapping to the outer tracking viewport."
      },
      {
        "name": "animation",
        "type": "AnimationPreset",
        "description": "The specific animation choreography preset (e.g. 'fade-up', 'scale-in')."
      },
      {
        "name": "delay",
        "type": "number",
        "description": "Delay in seconds before the animation begins."
      },
      {
        "name": "duration",
        "type": "number",
        "description": "Duration in seconds for the reveal animation."
      },
      {
        "name": "threshold",
        "type": "number",
        "description": "Intersection ratio (0-1) required to trigger the reveal."
      },
      {
        "name": "once",
        "type": "boolean",
        "description": "Whether the element should hide and re-animate when scrolled out and back in."
      }
    ],
    usageCode: `import { ScrollReveal, ScrollRevealGroup } from "@/components/ui/scroll-reveal";

export default function Example() {
  return (
    <div className="p-10 text-white">
      <ScrollRevealGroup
        animation="fade-up"
        staggerDelay={0.15}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {["fade-up", "scale", "blur"].map((preset) => (
          <div
            key={preset}
            className="p-6 rounded-lg bg-neutral-900/50 border border-neutral-800 text-center"
          >
            <div className="text-lg font-semibold mb-1 text-neutral-200">{preset}</div>
            <p className="text-neutral-500 text-xs">Scroll to reveal</p>
          </div>
        ))}
      </ScrollRevealGroup>
    </div>
  );
}`
  },
  {
    slug: "skeleton-shimmer",
    name: "Skeleton Shimmer",
    description:
      "Skeleton loading placeholders with animated shimmer gradient sweep and pulse fade.",
    installCmd: "npx uniqueui add skeleton-shimmer",
    icon: Loader2,
    category: "Effects & Animations",
    props: [
      {
        "name": "className",
        "type": "string",
        "description": "Additional CSS configuration applied to the background container."
      },
      {
        "name": "width",
        "type": "string | number",
        "description": "Explicit CSS width for the placeholder element."
      },
      {
        "name": "height",
        "type": "string | number",
        "description": "Explicit CSS height for the placeholder element."
      },
      {
        "name": "rounded",
        "type": "\"sm\" | \"md\" | \"lg\" | \"xl\" | \"full\"",
        "description": "Tailwind border-radius abstraction class string (e.g. 'md', 'full')."
      },
      {
        "name": "count",
        "type": "number",
        "description": "Number of consecutive skeleton items to iterate."
      },
      {
        "name": "gap",
        "type": "number",
        "description": "Spacing separating consecutive skeleton layers."
      }
    ],
    usageCode: `import { SkeletonShimmer, SkeletonCard } from "@/components/ui/skeleton-shimmer";

export default function Example() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10 w-full text-white">
      <SkeletonCard />
      <div className="space-y-4 p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
        <SkeletonShimmer width="80%" height={20} rounded="md" />
        <SkeletonShimmer count={4} height={14} />
        <div className="flex gap-3">
          <SkeletonShimmer width={100} height={36} rounded="lg" />
          <SkeletonShimmer width={100} height={36} rounded="lg" />
        </div>
      </div>
    </div>
  );
}`
  },
  {
    slug: "morphing-modal",
    name: "Morphing Modal",
    description:
      "Modal that expands from the trigger element with spring physics and backdrop blur.",
    installCmd: "npx uniqueui add morphing-modal",
    icon: Maximize2,
    category: "Navigation & Overlays",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "The payload rendering inside the physical boundaries of the modal dialog box."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Tailwind definitions passing specific sizes and visuals onto the dialog constraint."
      },
      {
        "name": "layoutId",
        "type": "string",
        "description": "Unique arbitrary string utilized by Framer Motion to tie trigger layout transitions."
      },
      {
        "name": "onClick",
        "type": "() => void",
        "description": "Description coming soon"
      }
    ],
    usageCode: `"use client";
import { useState } from "react";
import { MorphingModal, MorphingModalTrigger } from "@/components/ui/morphing-modal";

export default function Example() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-center p-20">
        <MorphingModalTrigger
          layoutId="modal-demo"
          onClick={() => setModalOpen(true)}
          className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors max-w-xs text-white"
        >
          <h3 className="text-lg font-bold mb-2">Click to open modal</h3>
          <p className="text-neutral-400 text-sm">
            This card morphs into a modal with spring physics.
          </p>
        </MorphingModalTrigger>
      </div>
      <MorphingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        layoutId="modal-demo"
      >
        <div className="pt-4 text-white">
          <h3 className="text-2xl font-bold mb-4">Morphing Modal</h3>
          <p className="text-neutral-400 mb-6">
            This modal expands from the trigger element with spring-based animation. It supports
            Escape key to close, click-outside to dismiss, and an animated close button.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-medium"
            >
              Got it
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </MorphingModal>
    </>
  );
}`
  },
  {
    slug: "gradient-text-reveal",
    name: "Gradient Text Reveal",
    description:
      "Word-by-word text reveal with gradient coloring and blur-to-clear spring animation.",
    installCmd: "npx uniqueui add gradient-text-reveal",
    icon: Palette,
    category: "Text",
    props: [
      {
        "name": "text",
        "type": "string",
        "description": "The exact sentence paragraph targeted for staggered rendering."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Add CSS classes mapping typographic configurations."
      },
      {
        "name": "gradientFrom",
        "type": "string",
        "description": "Color indicating the start coordinate mapping of the visual gradient ramp."
      },
      {
        "name": "gradientTo",
        "type": "string",
        "description": "Terminal color definition ending the textual mask gradient."
      },
      {
        "name": "staggerDelay",
        "type": "number",
        "description": "Seconds mapping the offset differential delay evaluating subsequent sequential words."
      },
      {
        "name": "duration",
        "type": "number",
        "description": "Metric representation detailing exact sequence total span (measured in seconds)."
      },
      {
        "name": "once",
        "type": "boolean",
        "description": "Prevent re-evaluating the intersection layout and permanently mark complete once run."
      },
      {
        "name": "as",
        "type": "\"h1\" | \"h2\" | \"h3\" | \"h4\" | \"p\" | \"span\"",
        "description": "Explicit HTML element defining correct semantics matching the parent boundary box."
      }
    ],
    usageCode: `import { GradientTextReveal } from "@/components/ui/gradient-text-reveal";

export default function Example() {
  return (
    <div className="space-y-8 text-center p-10 text-white">
      <GradientTextReveal
        text="Build stunning interfaces with UniqueUI"
        as="h3"
        className="text-3xl font-bold justify-center"
      />
      <GradientTextReveal
        text="Beautiful animated components for modern web apps"
        gradientFrom="#6366f1"
        gradientTo="#06b6d4"
        className="text-lg justify-center"
      />
    </div>
  );
}`
  },
  {
    slug: "scramble-text",
    name: "Scramble Text",
    description:
      "Matrix-style text scramble effect that resolves characters left-to-right.",
    installCmd: "npx uniqueui add scramble-text",
    icon: Type,
    category: "Text",
    props: [
      {
        "name": "text",
        "type": "string",
        "description": "The target string the scramble transition eventually resolves into."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Standard Tailwind configuration for typographic adjustment."
      },
      {
        "name": "speed",
        "type": "number",
        "description": "Multiplier scaling the character mutation flip rate."
      },
      {
        "name": "scrambleDuration",
        "type": "number",
        "description": "Duration the sequence spends generating noise before revealing real characters."
      },
      {
        "name": "triggerOnView",
        "type": "boolean",
        "description": "Wait until intersection observers detect the element on screen before starting."
      },
      {
        "name": "once",
        "type": "boolean",
        "description": "Lock the transition state as resolved after completing one full loop."
      },
      {
        "name": "characterSet",
        "type": "string",
        "description": "A custom dictionary string configuring the alphabet the noise generator selects from."
      }
    ],
    usageCode: `import { ScrambleText } from "@/components/ui/scramble-text";

export default function Example() {
  return (
    <div className="space-y-6 text-center p-10 text-white">
      <ScrambleText text="UNIQUEUI COMPONENTS" className="text-3xl font-bold tracking-wider text-emerald-400" />
      <ScrambleText
        text="Hover to scramble again"
        triggerOnView={false}
        className="text-lg text-neutral-400 cursor-pointer"
      />
    </div>
  );
}`
  },
  {
    slug: "meteors-card",
    name: "Meteors Card",
    description:
      "Card with animated meteor/shooting star particles falling through the background.",
    installCmd: "npx uniqueui add meteors-card",
    icon: Flame,
    category: "Cards",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "The payload rendering above the background particle effect."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Layout configurations for the wrapping card boundary."
      },
      {
        "name": "meteorCount",
        "type": "number",
        "description": "Total integer quantity defining maximum concurrent active meteor particles."
      },
      {
        "name": "meteorColor",
        "type": "string",
        "description": "Hex string establishing the primary focal styling of light trails."
      }
    ],
    usageCode: `import { MeteorsCard } from "@/components/ui/meteors-card";

export default function Example() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10 text-white">
      <MeteorsCard className="h-full">
        <h3 className="text-xl font-bold mb-2">Meteors Effect</h3>
        <p className="text-neutral-400 text-sm">
          Watch the shooting stars fall through this card's background.
        </p>
      </MeteorsCard>
      <MeteorsCard meteorColor="#a855f7" meteorCount={30} className="h-full">
        <h3 className="text-xl font-bold mb-2 text-purple-200">Purple Meteors</h3>
        <p className="text-purple-300/60 text-sm">Custom colored meteors with extra density.</p>
      </MeteorsCard>
    </div>
  );
}`
  },
  {
    slug: "flip-card",
    name: "Flip Card",
    description:
      "3D card flip with spring physics, supporting hover or click triggers.",
    installCmd: "npx uniqueui add flip-card",
    icon: RotateCw,
    category: "Cards",
    props: [
      {
        "name": "front",
        "type": "React.ReactNode",
        "description": "The leading visible standard interface node."
      },
      {
        "name": "back",
        "type": "React.ReactNode",
        "description": "The trailing hidden secondary information node."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Overarching classes driving constraints on the 3D rotating canvas."
      },
      {
        "name": "frontClassName",
        "type": "string",
        "description": "Granular overrides for the un-rotated visual state."
      },
      {
        "name": "backClassName",
        "type": "string",
        "description": "Granular overrides targeting the inverted 180-degree state representation."
      },
      {
        "name": "trigger",
        "type": "\"hover\" | \"click\"",
        "description": "Enum literal targeting 'hover' execution or explicit 'click' toggles."
      },
      {
        "name": "direction",
        "type": "\"horizontal\" | \"vertical\"",
        "description": "Axis orientation literal mapping rotation logic to 'horizontal' vs 'vertical'."
      },
      {
        "name": "perspective",
        "type": "number",
        "description": "Z-depth translation simulating three-dimensional depth stretching."
      }
    ],
    usageCode: `import { FlipCard } from "@/components/ui/flip-card";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-8 items-center justify-center p-10 text-white">
      <FlipCard
        className="w-60 h-40"
        front={
          <div className="flex items-center justify-center h-full bg-zinc-900 rounded-xl border border-zinc-800">
            <p className="text-lg font-bold">Hover to flip →</p>
          </div>
        }
        back={
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl">
            <p className="text-lg font-bold text-purple-200">Back side! ✨</p>
          </div>
        }
      />
      <FlipCard
        className="w-60 h-40"
        trigger="click"
        front={
          <div className="flex items-center justify-center h-full bg-zinc-900 rounded-xl border border-zinc-800">
            <p className="text-lg font-bold">Click to flip</p>
          </div>
        }
        back={
          <div className="flex items-center justify-center h-full bg-zinc-800 rounded-xl border border-zinc-700">
            <p className="text-lg font-bold text-green-400">Click again!</p>
          </div>
        }
      />
    </div>
  );
}`
  },
  {
    slug: "dot-grid-background",
    name: "Dot Grid Background",
    description:
      "Interactive dot-grid pattern with a glowing cursor-following effect.",
    installCmd: "npx uniqueui add dot-grid-background",
    icon: Grid3x3,
    category: "Backgrounds",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "Components mapped into the z-index layer visually above the matrix."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Container abstraction classes."
      },
      {
        "name": "dotColor",
        "type": "string",
        "description": "Color code controlling the default un-illuminated grid representation."
      },
      {
        "name": "dotSize",
        "type": "number",
        "description": "Diameter specifying visual footprint density of single grid intersections."
      },
      {
        "name": "gap",
        "type": "number",
        "description": "Vector translation pixel count separating independent grid items."
      },
      {
        "name": "hoverRadius",
        "type": "number",
        "description": "Spread area around the cursor triggering focus interactions."
      },
      {
        "name": "hoverScale",
        "type": "number",
        "description": "Float magnitude expanding intersections actively caught inside the hover bounds."
      }
    ],
    usageCode: `import { DotGridBackground } from "@/components/ui/dot-grid-background";

export default function Example() {
  return (
    <div className="p-10 w-full text-white">
      <DotGridBackground className="rounded-xl h-[300px] flex items-center justify-center w-full">
        <div className="text-center z-10 w-full relative">
          <h3 className="text-2xl font-bold mb-2">Interactive Dots</h3>
          <p className="text-neutral-400">Move your cursor around</p>
        </div>
      </DotGridBackground>
    </div>
  );
}`
  },
  {
    slug: "floating-dock",
    name: "Floating Dock",
    description:
      "macOS-style dock with magnetic scaling, spring physics, and tooltips.",
    installCmd: "npx uniqueui add floating-dock",
    icon: Anchor,
    category: "Navigation & Overlays",
    props: [
      {
        "name": "items",
        "type": "{",
        "description": "Array defining mapping configuration objects containing icons and references."
      },
      {
        "name": "id",
        "type": "string",
        "description": "A unique mapping identifier referencing the component node."
      },
      {
        "name": "icon",
        "type": "React.ReactNode",
        "description": "The SVG image rendered actively on the dock interface."
      },
      {
        "name": "label",
        "type": "string",
        "description": "String payload rendered inside the expanding tooltip layout."
      },
      {
        "name": "onClick",
        "type": "() => void",
        "description": "Routine capturing specific explicit interactions mapped to the dock region."
      },
      {
        "name": "href",
        "type": "string",
        "description": "Link routing path if the interface object encapsulates an anchor tag natively."
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
    <div className="flex items-center justify-center p-20 text-white">
      <FloatingDock
        items={[
          { id: "home", icon: <span className="text-xl">🏠</span>, label: "Home" },
          { id: "search", icon: <span className="text-xl">✨</span>, label: "Search" },
          { id: "layers", icon: <span className="text-xl">📚</span>, label: "Layers" },
          { id: "scroll", icon: <span className="text-xl">📜</span>, label: "Scroll" },
          { id: "terminal", icon: <span className="text-xl">💻</span>, label: "Terminal" },
        ]}
      />
    </div>
  );
}`
  },
  {
    slug: "confetti-burst",
    name: "Confetti Burst",
    description:
      "Click-triggered confetti particle explosion with customizable colors and physics.",
    installCmd: "npx uniqueui add confetti-burst",
    icon: PartyPopper,
    category: "Effects & Animations",
    props: [
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "Trigger element wrapped by the particle generation effect zone."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Styling configurations for the interaction wrapper logic container."
      },
      {
        "name": "particleCount",
        "type": "number",
        "description": "Quantity multiplier defining how many fragments evaluate per execution."
      },
      {
        "name": "colors",
        "type": "string[]",
        "description": "Array defining hex code palettes defining sequential particle rendering."
      },
      {
        "name": "spread",
        "type": "number",
        "description": "Radiant measurement indicating geometric angle variance for throwing trajectories."
      },
      {
        "name": "duration",
        "type": "number",
        "description": "Timer limit capping maximum gravity simulation lifetime."
      }
    ],
    usageCode: `import { ConfettiBurst } from "@/components/ui/confetti-burst";

export default function Example() {
  return (
    <div className="flex items-center justify-center p-20 text-white">
      <ConfettiBurst className="rounded-xl p-12 border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors cursor-pointer">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">🎉 Click me!</h3>
          <p className="text-neutral-400 text-sm">Click anywhere on this card for confetti</p>
        </div>
      </ConfettiBurst>
    </div>
  );
}`
  },
  {
    slug: "drawer-slide",
    name: "Drawer Slide",
    description:
      "Slide-out drawer panel with drag-to-dismiss, spring physics, and backdrop blur.",
    installCmd: "npx uniqueui add drawer-slide",
    icon: PanelRight,
    category: "Navigation & Overlays",
    props: [
      {
        "name": "isOpen",
        "type": "boolean",
        "description": "React state abstraction determining visible rendering."
      },
      {
        "name": "onClose",
        "type": "() => void",
        "description": "Method triggered when dismiss actions evaluation (drag, backdrop, external limit)."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "description": "Content rendered inside the active sliding sheet."
      },
      {
        "name": "position",
        "type": "DrawerPosition",
        "description": "Anchoring enumeration bounding left, right, top, or bottom screen edges."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Specific styling modifiers passing onto the physical sliding panel."
      },
      {
        "name": "overlayClassName",
        "type": "string",
        "description": "Specific styling modifiers passing onto the dimming backdrop."
      },
      {
        "name": "width",
        "type": "string",
        "description": "CSS explicit translation sizing left/right sliding panels."
      },
      {
        "name": "height",
        "type": "string",
        "description": "CSS explicit translation sizing top/bottom sliding panels."
      },
      {
        "name": "dragToClose",
        "type": "boolean",
        "description": "Map touch swiping events onto gesture recognizers supporting drag dismiss."
      }
    ],
    usageCode: `"use client";
import { useState } from "react";
import { DrawerSlide } from "@/components/ui/drawer-slide";

export default function Example() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-center p-20">
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors font-medium"
        >
          Open Drawer
        </button>
      </div>
      <DrawerSlide isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <h3 className="text-xl font-bold mb-4 text-white">Drawer Content</h3>
        <p className="text-neutral-400 mb-4">
          This drawer slides in from the right with spring physics. You can drag it to dismiss.
        </p>
        <button
          onClick={() => setDrawerOpen(false)}
          className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors text-sm"
        >
          Close Drawer
        </button>
      </DrawerSlide>
    </>
  );
}`
  },
  {
    slug: "notification-stack",
    name: "Notification Stack",
    description:
      "Stacked toast notifications with auto-dismiss progress, sliding animations, and multiple types.",
    installCmd: "npx uniqueui add notification-stack",
    icon: Bell,
    category: "Navigation & Overlays",
    props: [
      {
        "name": "className",
        "type": "string",
        "description": "CSS attributes tailoring the absolute container."
      },
      {
        "name": "position",
        "type": "\"top-right\" | \"top-left\" | \"bottom-right\" | \"bottom-left\"",
        "description": "Screen coordinate literal dictating orientation constraints."
      },
      {
        "name": "maxVisible",
        "type": "number",
        "description": "Limit quantity threshold managing physical screen stack instances."
      }
    ],
    usageCode: `"use client";
import { NotificationStack, useNotifications } from "@/components/ui/notification-stack";

export default function Example() {
  const { notifications, addNotification, removeNotification } = useNotifications();
  return (
    <div className="flex flex-col items-center gap-4 w-full p-20">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {(["success", "error", "warning", "info"] as const).map((type) => (
          <button
            key={type}
            onClick={() =>
              addNotification({
                title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} notification\`,
                description: "This is a demo notification that auto-dismisses.",
                type,
                duration: 4000,
              })
            }
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize text-white bg-neutral-800 hover:bg-neutral-700"
          >
            {type}
          </button>
        ))}
      </div>
      <NotificationStack notifications={notifications} onRemove={removeNotification} />
    </div>
  );
}`
  },
  {
    slug: "animated-timeline",
    name: "Animated Timeline",
    description:
      "Scroll-triggered timeline with staggered spring animations for each node.",
    installCmd: "npx uniqueui add animated-timeline",
    icon: Clock,
    category: "Effects & Animations",
    props: [
      {
        "name": "items",
        "type": "TimelineItem[]",
        "description": "Ordered JSON object sequence defining steps parsing chronological evaluation."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Global CSS structure overrides for the list grouping wrapper."
      },
      {
        "name": "lineColor",
        "type": "string",
        "description": "Vector stroke color defining the connection axis layout."
      },
      {
        "name": "orientation",
        "type": "\"vertical\" | \"horizontal\"",
        "description": "Directional bias translating objects explicitly 'horizontal' or natively 'vertical'."
      }
    ],
    usageCode: `import { AnimatedTimeline } from "@/components/ui/animated-timeline";

export default function Example() {
  return (
    <div className="max-w-sm mx-auto p-4 w-full text-white">
      <AnimatedTimeline
        items={[
          { id: "1", title: "Project Kickoff",   description: "Scope defined and team assembled.",              color: "#a855f7", date: "Jan 2026" },
          { id: "2", title: "Design Phase",       description: "Wireframes and component system finalised.",     color: "#6366f1", date: "Jan 2026" },
          { id: "3", title: "Development Sprint", description: "Core components built and tested end-to-end.",  color: "#ec4899", date: "Feb 2026" },
          { id: "4", title: "Public Launch",      description: "CLI published and registry live.",              color: "#10b981", date: "Feb 2026" },
        ]}
        lineColor="#3f3f46"
      />
    </div>
  );
}`
  },
  {
    slug: "nested-comments",
    name: "Nested Comments",
    description:
      "Threaded comment section with infinite nesting, animated expand/collapse, inline reply composer, and spring-physics like button.",
    installCmd: "npx uniqueui add nested-comments",
    icon: MessageSquare,
    category: "Social & Interaction",
    props: [
      {
        name: "comments",
        type: "Comment[]",
        description: "Array of top-level comment objects, each optionally containing a `replies` array for nested threading.",
      },
      {
        name: "maxDepth",
        type: "number",
        default: "4",
        description: "Maximum nesting depth allowed before disabling the Reply button to prevent infinite threading.",
      },
      {
        name: "className",
        type: "string",
        description: "Additional CSS classes applied to the root wrapper element.",
      },
      {
        name: "accentColor",
        type: "string",
        default: '"#8b5cf6"',
        description: "Hex or CSS color used for reply badge highlights and interactive accent elements.",
      },
      {
        name: "onReply",
        type: "(commentId: string, content: string) => void",
        description: "Callback fired when a user submits a reply, receiving the parent comment ID and reply text.",
      },
      {
        name: "onLike",
        type: "(commentId: string) => void",
        description: "Callback fired when a user likes a comment, receiving the comment ID.",
      },
    ],
    usageCode: `import { NestedComments } from "@/components/ui/nested-comments";
import type { Comment } from "@/components/ui/nested-comments";

const comments: Comment[] = [
  {
    id: "1",
    author: "Alex Kim",
    content: "This component is incredible! The animations feel so natural.",
    timestamp: "2 hours ago",
    likes: 14,
    replies: [
      {
        id: "1-1",
        author: "Sarah Chen",
        content: "Agreed! The collapse animation is especially smooth.",
        timestamp: "1 hour ago",
        likes: 6,
        replies: [
          {
            id: "1-1-1",
            author: "Alex Kim",
            content: "Thanks! Motion.dev's layout animations make it effortless.",
            timestamp: "45 min ago",
            likes: 3,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    author: "Jordan Lee",
    content: "Love the inline reply box with keyboard shortcuts. Very intuitive UX.",
    timestamp: "3 hours ago",
    likes: 9,
  },
];

export default function Example() {
  return (
    <div className="p-6 bg-neutral-950 rounded-xl min-h-[400px]">
      <NestedComments
        comments={comments}
        maxDepth={4}
        accentColor="#8b5cf6"
        onReply={(id, content) => console.log("Reply to", id, ":", content)}
        onLike={(id) => console.log("Liked", id)}
      />
    </div>
  );
}`
  },
  {
    slug: "hover-reveal-card",
    name: "Hover Reveal Card",
    description:
      "Card that displays an image with teaser content, then slides up a full details panel on hover with staggered Motion.dev animations.",
    installCmd: "npx uniqueui add hover-reveal-card",
    icon: Layers,
    category: "Cards",
    props: [
      {
        "name": "image",
        "type": "string",
        "description": "URL of the image displayed as the card's primary visual."
      },
      {
        "name": "imageAlt",
        "type": "string",
        "description": "Accessible alt text attached to the img element."
      },
      {
        "name": "tag",
        "type": "string",
        "description": "Small uppercase label rendered above the heading in both states."
      },
      {
        "name": "title",
        "type": "string",
        "description": "Primary headline text displayed in both the default and reveal states."
      },
      {
        "name": "subtitle",
        "type": "string",
        "description": "Supporting line shown beneath the title in the default state and as a footer in the reveal panel."
      },
      {
        "name": "description",
        "type": "string",
        "description": "Extended body copy that appears only inside the slide-up hover panel."
      },
      {
        "name": "ctaText",
        "type": "string",
        "description": "Call-to-action label rendered at the bottom of the hover panel."
      },
      {
        "name": "href",
        "type": "string",
        "description": "When supplied the wrapper renders as an anchor element pointing to this URL."
      },
      {
        "name": "accentColor",
        "type": "string",
        "description": "Hex or CSS colour driving the tag, CTA text, and border-glow accent."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Tailwind utility classes forwarded onto the outermost card wrapper."
      },
      {
        "name": "imageHeight",
        "type": "number",
        "description": "Pixel height reserved for the image section before the content area."
      }
    ],
    usageCode: `import { HoverRevealCard } from "@/components/ui/hover-reveal-card";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-6 items-start justify-center p-10">
      <HoverRevealCard
        image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80"
        imageAlt="People at a conference table"
        tag="AI"
        title="AI for inclusive growth: Leadership lessons from Davos"
        subtitle="Article"
        description="What are the practical ways to ensure AI expands opportunity, strengthens resilience and supports a more inclusive, equitable future?"
        ctaText="Read the article →"
        accentColor="#6366f1"
        imageHeight={220}
        className="w-72"
      />
    </div>
  );
}`
  },
  {
    slug: "bento-grid",
    name: "Bento Grid",
    description:
      "Responsive masonry-style grid layout with staggered scroll-reveal entrance, hover border glow, and icon scale animations per cell.",
    installCmd: "npx uniqueui add bento-grid",
    icon: LayoutGrid,
    category: "Cards",
    props: [
      {
        "name": "title",
        "type": "string",
        "description": "Headline text displayed at the bottom of the card."
      },
      {
        "name": "description",
        "type": "string",
        "description": "Supporting body text shown beneath the title."
      },
      {
        "name": "icon",
        "type": "React.ReactNode",
        "description": "Icon element rendered inside a pill at the top of the card."
      },
      {
        "name": "background",
        "type": "React.ReactNode",
        "description": "Optional decorative layer (image, gradient, SVG) rendered behind the content."
      },
      {
        "name": "cta",
        "type": "string",
        "description": "Call-to-action label that slides up into view on hover."
      },
      {
        "name": "href",
        "type": "string",
        "description": "When supplied the card renders as an anchor element."
      },
      {
        "name": "className",
        "type": "string",
        "description": "Grid span and sizing classes forwarded to the cell wrapper, e.g. col-span-2 or row-span-2."
      },
      {
        "name": "spinBorder",
        "type": "boolean",
        "description": "Enable the spinning conic-gradient border effect (same technique as the hero button). Replaces the static border."
      },
      {
        "name": "spinBorderColors",
        "type": "[string, string]",
        "description": "Two hex/CSS color values for the conic gradient. Defaults to [\"#E2CBFF\", \"#393BB2\"] (purple–indigo)."
      }
    ],
    usageCode: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Sparkles, Zap, Shield, Globe } from "lucide-react";

export default function Example() {
  return (
    <div className="p-8 w-full">
      <BentoGrid className="max-w-3xl mx-auto">
        <BentoCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Beautiful animations"
          description="Every interaction is crafted with spring-physics Motion.dev animations for a premium feel."
          cta="Explore components"
          className="col-span-2"
        />
        <BentoCard
          icon={<Zap className="w-5 h-5" />}
          title="Lightning fast"
          description="Copy-paste components with zero runtime overhead."
        />
        <BentoCard
          icon={<Shield className="w-5 h-5" />}
          title="Type safe"
          description="Built with TypeScript and fully typed props."
        />
        <BentoCard
          icon={<Globe className="w-5 h-5" />}
          title="Zero lock-in"
          description="You own the code. No external runtime dependency."
          cta="Get started"
          className="col-span-2"
        />
      </BentoGrid>
    </div>
  );
}`
    ,
    variants: [
      {
        id: "features",
        label: "Features",
        demoKey: "bento-grid/features",
        usageCode: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Sparkles, Zap, Shield, Globe } from "lucide-react";

export default function Example() {
  return (
    <div className="p-8 w-full">
      <BentoGrid>
        <BentoCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Beautiful animations"
          description="Every interaction is crafted with spring-physics Motion.dev animations."
          cta="Explore components"
          className="col-span-2"
          spinBorder
          spinBorderColors={["#E2CBFF", "#393BB2"]}
        />
        <BentoCard
          icon={<Zap className="w-5 h-5" />}
          title="Lightning fast"
          description="Copy-paste components with zero runtime overhead."
          spinBorder
          spinBorderColors={["#a3e635", "#065f46"]}
        />
        <BentoCard
          icon={<Shield className="w-5 h-5" />}
          title="Type-safe props"
          description="Fully typed with TypeScript for confidence at scale."
          spinBorder
          spinBorderColors={["#67e8f9", "#1e3a5f"]}
        />
        <BentoCard
          icon={<Globe className="w-5 h-5" />}
          title="Zero lock-in"
          description="You own the code. No external runtime dependency."
          cta="Get started"
          className="col-span-2"
          spinBorder
          spinBorderColors={["#fda4af", "#9f1239"]}
        />
      </BentoGrid>
    </div>
  );
}`,
      },
      {
        id: "showcase",
        label: "Showcase",
        demoKey: "bento-grid/showcase",
        usageCode: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

export default function Example() {
  return (
    <div className="p-8 w-full">
      <BentoGrid>
        <BentoCard
          title="Aurora vibes"
          description="Layered animated gradients that feel alive."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-violet-700/30 via-fuchsia-600/15 to-cyan-600/20 animate-pulse" />
          }
          cta="View component"
          className="col-span-2"
        />
        <BentoCard
          title="Magnetic pull"
          description="Spring-physics cursor attraction."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-rose-700/25 to-orange-600/20" />
          }
        />
        <BentoCard
          title="Spotlight effect"
          description="Radial light that follows your mouse."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-sky-700/25 to-indigo-700/20" />
          }
        />
        <BentoCard
          title="Meteor storm"
          description="Shooting star particles raining through cards."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/25 to-teal-600/20" />
          }
          cta="Try it"
          className="col-span-2"
        />
      </BentoGrid>
    </div>
  );
}`,
      },
      {
        id: "stats",
        label: "Stats",
        demoKey: "bento-grid/stats",
        usageCode: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

export default function Example() {
  return (
    <div className="p-8 w-full">
      <BentoGrid className="auto-rows-[160px]">
        <BentoCard
          title="Components"
          description="Production-ready animated components"
          background={
            <div className="absolute top-4 right-4 text-6xl font-black text-white/[0.06] select-none">24</div>
          }
          icon={<span className="text-2xl font-black text-violet-400">24</span>}
        />
        <BentoCard
          title="Zero dependencies"
          description="No UniqueUI runtime in your bundle"
          background={
            <div className="absolute top-4 right-4 text-6xl font-black text-white/[0.06] select-none">0</div>
          }
          icon={<span className="text-2xl font-black text-emerald-400">0</span>}
        />
        <BentoCard
          title="Install time"
          description="Seconds from CLI to working component"
          icon={<span className="text-2xl font-black text-sky-400">~3s</span>}
        />
        <BentoCard
          title="MIT License"
          description="Open source forever. Fork it, extend it, ship it."
          cta="View on GitHub"
          className="col-span-2"
        />
        <BentoCard
          title="Tailwind compatible"
          description="v3 and v4 supported"
          icon={<span className="text-2xl font-black text-cyan-400">✓</span>}
        />
      </BentoGrid>
    </div>
  );
}`,
      },
      {
        id: "team",
        label: "Team",
        demoKey: "bento-grid/team",
        usageCode: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

const members = [
  { name: "Alex Kim",   role: "Lead Engineer",    tag: "Motion",     color: "#a855f7" },
  { name: "Sara Chen",  role: "Design Systems",   tag: "Tailwind",   color: "#6366f1" },
  { name: "Jordan Lee", role: "DX Engineer",      tag: "CLI",        color: "#ec4899" },
  { name: "Maya Patel", role: "Animations Lead",  tag: "Motion.dev", color: "#10b981" },
  { name: "Ryan Wu",    role: "Accessibility",    tag: "ARIA",       color: "#f59e0b" },
  { name: "Priya Shah", role: "TypeScript Infra", tag: "TS 5.x",    color: "#3b82f6" },
];

export default function Example() {
  return (
    <div className="p-8 w-full">
      <BentoGrid className="auto-rows-[180px]">
        {members.map((m) => (
          <BentoCard
            key={m.name}
            title={m.name}
            description={m.role}
            background={
              <div
                className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-full opacity-10"
                style={{ backgroundColor: m.color }}
              />
            }
            icon={
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: m.color + "33", border: \`1.5px solid \${m.color}66\` }}
              >
                {m.name.split(" ").map((n) => n[0]).join("")}
              </div>
            }
            cta={m.tag}
          />
        ))}
      </BentoGrid>
    </div>
  );
}`,
      },
    ],
  },
];
