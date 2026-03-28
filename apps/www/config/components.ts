import type { ElementType } from "react";
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
  Table,
  Pen,
  Shield,
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
  props?: {
    name: string;
    type: string;
    default?: string;
    description: string;
  }[];
  usageCode?: string;
  /** When set, the page renders a synced tab switcher for both preview and code */
  variants?: ComponentVariant[];
};

export const componentsList: ComponentItem[] = [
  {
    slug: "animated-glowing-text-outline",
    name: "Animated Glowing Text",
    description: "Animated SVG drawing trace outline over shimmering text characters.",
    installCmd: "npx uniqueui add animated-glowing-text-outline",
    icon: Sparkles,
    category: "Text",
    props: [
      {
        name: "text",
        type: "string",
        default: '"Hello World"',
        description: "The text content to be displayed.",
      },
      {
        name: "fontSize",
        type: "number | string",
        default: "80",
        description: "The font size of the text.",
      },
      {
        name: "fontWeight",
        type: "string | number",
        default: "900",
        description: "The CSS font-weight of the text.",
      },
      {
        name: "textColor",
        type: "string",
        default: '"#080808"',
        description: "Fill color of the text face.",
      },
      {
        name: "outlineColor",
        type: "string",
        default: '"#333333"',
        description: "The default color of the text stroke outline.",
      },
      {
        name: "colors",
        type: "string[]",
        default: '["#ffaa40", "#9c40ff", "#ffaa40"]',
        description: "Array of colors forming the animated gradient sweep.",
      },
      {
        name: "outlineWidth",
        type: "number | string",
        default: '"2px"',
        description: "Width of the stroke outline.",
      },
      {
        name: "animationDuration",
        type: "number",
        default: "4",
        description: "Duration of the stroke-drawing animation for a SINGLE character (in seconds).",
      },
      {
        name: "staggerDelay",
        type: "number",
        default: "0.15",
        description: "Delay between each character starting to draw (in seconds).",
      },
      {
        name: "dashArray",
        type: "number",
        default: "1000",
        description: "Length of the SVG stroke dash array. Tune this higher for longer paths.",
      },
    ],
    usageCode: `import GlowingTextOutline from "@/components/ui/animated-glowing-text-outline";

export default function Example() {
  return (
    <div className="flex justify-center p-10 bg-black rounded-xl">
      <GlowingTextOutline 
        text="Hello World" 
        colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
        animationDuration={5}
      />
    </div>
  );
}`,
  },
  {
    slug: "moving-border",
    name: "Moving Border",
    description:
      "SVG-path-tracing animated border that orbits a button or card.",
    installCmd: "npx uniqueui add moving-border",
    icon: Sparkles,
    category: "Effects & Animations",
    props: [
      {
        name: "theme",
        type: '"light" | "dark"',
        description: "Visual theme; light or dark. Default: dark.",
      },
      {
        name: "borderRadius",
        type: "string",
        description:
          "The radius for rounding the button edges and the orbiting path.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "The label or content displayed inside the button.",
      },
      {
        name: "as",
        type: "React.ElementType",
        description:
          "The HTML element tag to use for the button wrapper (e.g., 'button', 'div').",
      },
      {
        name: "containerClassName",
        type: "string",
        description: "Add CSS classes to the outermost container.",
      },
      {
        name: "borderClassName",
        type: "string",
        description:
          "Add CSS classes directly to the moving animated SVG border.",
      },
      {
        name: "duration",
        type: "number",
        description:
          "Time in milliseconds to complete one full orbit around the border.",
      },
      {
        name: "className",
        type: "string",
        description: "Add CSS classes to the inner content layer.",
      },
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
}`,
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
        name: "theme",
        type: '"light" | "dark"',
        description: "Visual theme; light or dark. Default: dark.",
      },
      {
        name: "words",
        type: "string[]",
        description:
          "An array of words or phrases to be typed out sequentially.",
      },
      {
        name: "className",
        type: "string",
        description: "Add CSS classes to the text container.",
      },
      {
        name: "cursorClassName",
        type: "string",
        description: "Add CSS classes to customize the blinking cursor span.",
      },
      {
        name: "typingSpeed",
        type: "number",
        description: "Delay in milliseconds between typing each character.",
      },
      {
        name: "deletingSpeed",
        type: "number",
        description: "Delay in milliseconds between deleting each character.",
      },
      {
        name: "delayBetweenWords",
        type: "number",
        description:
          "Pause duration before erasing a completed word to type the next.",
      },
      {
        name: "loop",
        type: "boolean",
        description:
          "Whether the typewriter sequence should repeat infinitely.",
      },
      {
        name: "cursor",
        type: "boolean",
        description:
          "Controls the visibility of the blinking cursor at the end of the text.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description: "The element(s) suspended inside the 3D card layout.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Tailwind configuration applied directly to the physical card.",
      },
      {
        name: "containerClassName",
        type: "string",
        description: "Tailwind bounds defining the invisible hover hit-box.",
      },
      {
        name: "tiltMaxDeg",
        type: "number",
        description:
          "The maximum angle the card aggressively pitches on hover.",
      },
      {
        name: "perspective",
        type: "number",
        description:
          "The CSS perspective depth in pixels determining 3D deformation strength.",
      },
      {
        name: "scale",
        type: "number",
        description:
          "Float multiplier for card scaling when hovered (e.g. 1.05).",
      },
      {
        name: "glare",
        type: "boolean",
        description:
          "Enable a dynamic radial-gradient glare sweep that tracks the pointer.",
      },
      {
        name: "glareMaxOpacity",
        type: "number",
        description: "Max brightness (0 to 1) for the dynamic glare effect.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description: "Components visible on the card.",
      },
      {
        name: "className",
        type: "string",
        description: "CSS classes for sizing and styling the card layout.",
      },
      {
        name: "spotlightColor",
        type: "string",
        description: "The hex/rgba color code used for the center cursor glow.",
      },
      {
        name: "spotlightSize",
        type: "number",
        description:
          "Diameter width/height of the gradient spotlight in pixels.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description:
          "Content elements layered above the animated aurora gradient background.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Additional CSS configuration applied to the background container.",
      },
      {
        name: "showRadialGradient",
        type: "boolean",
        description:
          "Apply a radial vignette mask to focus attention towards the center.",
      },
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
}`,
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
        name: "tabs",
        type: "{",
        description:
          "Array of tab configurations establishing navigation schema.",
      },
      {
        name: "id",
        type: "string",
        description: "A unique identifier used strictly for layout animations.",
      },
      {
        name: "label",
        type: "string",
        description: "The string/node rendered on the clickable tab button.",
      },
      {
        name: "content",
        type: "React.ReactNode",
        description:
          "The DOM payload rendered below when this tab is selected.",
      },
      {
        name: "className",
        type: "string",
        description: "Description coming soon",
      },
      {
        name: "tabClassName",
        type: "string",
        description: "Description coming soon",
      },
      {
        name: "activeTabClassName",
        type: "string",
        description: "Description coming soon",
      },
      {
        name: "contentClassName",
        type: "string",
        description: "Description coming soon",
      },
      {
        name: "onChange",
        type: "(id: string) => void",
        description: "Description coming soon",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description: "The internal content of the button.",
      },
      {
        name: "className",
        type: "string",
        description: "Style overrides appended to the interactive boundary.",
      },
      {
        name: "magneticStrength",
        type: "number",
        description:
          "Float determining how fast/far the button lerps toward the cursor.",
      },
      {
        name: "magneticRadius",
        type: "number",
        description:
          "Pixel radius extending outward from the button where gravity begins.",
      },
      {
        name: "onClick",
        type: "() => void",
        description: "Standard click event handler.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disables interaction and magnetic gravitational pull.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description:
          "Individual cards, images, or elements you want scrolling seamlessly.",
      },
      {
        name: "className",
        type: "string",
        description: "Styling classes mapping to the outer tracking viewport.",
      },
      {
        name: "speed",
        type: "number",
        description:
          "Scrolling velocity, representing translation pixels per second.",
      },
      {
        name: "direction",
        type: '"left" | "right"',
        description: "Horizontal (left/right) scroll direction.",
      },
      {
        name: "pauseOnHover",
        type: "boolean",
        description:
          "Temporarily pause the animation sequence when a user points at the element.",
      },
      {
        name: "gap",
        type: "number",
        description:
          "Consistent spacing separating each repeated instance loop.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description: "The DOM elements to animate into view upon scrolling.",
      },
      {
        name: "className",
        type: "string",
        description: "Styling classes mapping to the outer tracking viewport.",
      },
      {
        name: "animation",
        type: "AnimationPreset",
        description:
          "The specific animation choreography preset (e.g. 'fade-up', 'scale-in').",
      },
      {
        name: "delay",
        type: "number",
        description: "Delay in seconds before the animation begins.",
      },
      {
        name: "duration",
        type: "number",
        description: "Duration in seconds for the reveal animation.",
      },
      {
        name: "threshold",
        type: "number",
        description: "Intersection ratio (0-1) required to trigger the reveal.",
      },
      {
        name: "once",
        type: "boolean",
        description:
          "Whether the element should hide and re-animate when scrolled out and back in.",
      },
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
}`,
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
        name: "className",
        type: "string",
        description:
          "Additional CSS configuration applied to the background container.",
      },
      {
        name: "width",
        type: "string | number",
        description: "Explicit CSS width for the placeholder element.",
      },
      {
        name: "height",
        type: "string | number",
        description: "Explicit CSS height for the placeholder element.",
      },
      {
        name: "rounded",
        type: '"sm" | "md" | "lg" | "xl" | "full"',
        description:
          "Tailwind border-radius abstraction class string (e.g. 'md', 'full').",
      },
      {
        name: "count",
        type: "number",
        description: "Number of consecutive skeleton items to iterate.",
      },
      {
        name: "gap",
        type: "number",
        description: "Spacing separating consecutive skeleton layers.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description:
          "The payload rendering inside the physical boundaries of the modal dialog box.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Tailwind definitions passing specific sizes and visuals onto the dialog constraint.",
      },
      {
        name: "layoutId",
        type: "string",
        description:
          "Unique arbitrary string utilized by Framer Motion to tie trigger layout transitions.",
      },
      {
        name: "onClick",
        type: "() => void",
        description: "Description coming soon",
      },
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
}`,
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
        name: "text",
        type: "string",
        description:
          "The exact sentence paragraph targeted for staggered rendering.",
      },
      {
        name: "className",
        type: "string",
        description: "Add CSS classes mapping typographic configurations.",
      },
      {
        name: "gradientFrom",
        type: "string",
        description:
          "Color indicating the start coordinate mapping of the visual gradient ramp.",
      },
      {
        name: "gradientTo",
        type: "string",
        description:
          "Terminal color definition ending the textual mask gradient.",
      },
      {
        name: "staggerDelay",
        type: "number",
        description:
          "Seconds mapping the offset differential delay evaluating subsequent sequential words.",
      },
      {
        name: "duration",
        type: "number",
        description:
          "Metric representation detailing exact sequence total span (measured in seconds).",
      },
      {
        name: "once",
        type: "boolean",
        description:
          "Prevent re-evaluating the intersection layout and permanently mark complete once run.",
      },
      {
        name: "as",
        type: '"h1" | "h2" | "h3" | "h4" | "p" | "span"',
        description:
          "Explicit HTML element defining correct semantics matching the parent boundary box.",
      },
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
}`,
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
        name: "text",
        type: "string",
        description:
          "The target string the scramble transition eventually resolves into.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Standard Tailwind configuration for typographic adjustment.",
      },
      {
        name: "speed",
        type: "number",
        description: "Multiplier scaling the character mutation flip rate.",
      },
      {
        name: "scrambleDuration",
        type: "number",
        description:
          "Duration the sequence spends generating noise before revealing real characters.",
      },
      {
        name: "triggerOnView",
        type: "boolean",
        description:
          "Wait until intersection observers detect the element on screen before starting.",
      },
      {
        name: "once",
        type: "boolean",
        description:
          "Lock the transition state as resolved after completing one full loop.",
      },
      {
        name: "characterSet",
        type: "string",
        description:
          "A custom dictionary string configuring the alphabet the noise generator selects from.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description:
          "The payload rendering above the background particle effect.",
      },
      {
        name: "className",
        type: "string",
        description: "Layout configurations for the wrapping card boundary.",
      },
      {
        name: "meteorCount",
        type: "number",
        description:
          "Total integer quantity defining maximum concurrent active meteor particles.",
      },
      {
        name: "meteorColor",
        type: "string",
        description:
          "Hex string establishing the primary focal styling of light trails.",
      },
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
}`,
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
        name: "front",
        type: "React.ReactNode",
        description: "The leading visible standard interface node.",
      },
      {
        name: "back",
        type: "React.ReactNode",
        description: "The trailing hidden secondary information node.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Overarching classes driving constraints on the 3D rotating canvas.",
      },
      {
        name: "frontClassName",
        type: "string",
        description: "Granular overrides for the un-rotated visual state.",
      },
      {
        name: "backClassName",
        type: "string",
        description:
          "Granular overrides targeting the inverted 180-degree state representation.",
      },
      {
        name: "trigger",
        type: '"hover" | "click"',
        description:
          "Enum literal targeting 'hover' execution or explicit 'click' toggles.",
      },
      {
        name: "direction",
        type: '"horizontal" | "vertical"',
        description:
          "Axis orientation literal mapping rotation logic to 'horizontal' vs 'vertical'.",
      },
      {
        name: "perspective",
        type: "number",
        description:
          "Z-depth translation simulating three-dimensional depth stretching.",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description:
          "Components mapped into the z-index layer visually above the matrix.",
      },
      {
        name: "className",
        type: "string",
        description: "Container abstraction classes.",
      },
      {
        name: "dotColor",
        type: "string",
        description:
          "Color code controlling the default un-illuminated grid representation.",
      },
      {
        name: "dotSize",
        type: "number",
        description:
          "Diameter specifying visual footprint density of single grid intersections.",
      },
      {
        name: "gap",
        type: "number",
        description:
          "Vector translation pixel count separating independent grid items.",
      },
      {
        name: "hoverRadius",
        type: "number",
        description:
          "Spread area around the cursor triggering focus interactions.",
      },
      {
        name: "hoverScale",
        type: "number",
        description:
          "Float magnitude expanding intersections actively caught inside the hover bounds.",
      },
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
}`,
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
        name: "items",
        type: "{",
        description:
          "Array defining mapping configuration objects containing icons and references.",
      },
      {
        name: "id",
        type: "string",
        description:
          "A unique mapping identifier referencing the component node.",
      },
      {
        name: "icon",
        type: "React.ReactNode",
        description: "The SVG image rendered actively on the dock interface.",
      },
      {
        name: "label",
        type: "string",
        description:
          "String payload rendered inside the expanding tooltip layout.",
      },
      {
        name: "onClick",
        type: "() => void",
        description:
          "Routine capturing specific explicit interactions mapped to the dock region.",
      },
      {
        name: "href",
        type: "string",
        description:
          "Link routing path if the interface object encapsulates an anchor tag natively.",
      },
      {
        name: "className",
        type: "string",
        description: "Description coming soon",
      },
      {
        name: "iconSize",
        type: "number",
        description: "Description coming soon",
      },
      {
        name: "maxScale",
        type: "number",
        description: "Description coming soon",
      },
      {
        name: "magneticRange",
        type: "number",
        description: "Description coming soon",
      },
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
}`,
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
        name: "children",
        type: "React.ReactNode",
        description:
          "Trigger element wrapped by the particle generation effect zone.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Styling configurations for the interaction wrapper logic container.",
      },
      {
        name: "particleCount",
        type: "number",
        description:
          "Quantity multiplier defining how many fragments evaluate per execution.",
      },
      {
        name: "colors",
        type: "string[]",
        description:
          "Array defining hex code palettes defining sequential particle rendering.",
      },
      {
        name: "spread",
        type: "number",
        description:
          "Radiant measurement indicating geometric angle variance for throwing trajectories.",
      },
      {
        name: "duration",
        type: "number",
        description: "Timer limit capping maximum gravity simulation lifetime.",
      },
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
}`,
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
        name: "isOpen",
        type: "boolean",
        description: "React state abstraction determining visible rendering.",
      },
      {
        name: "onClose",
        type: "() => void",
        description:
          "Method triggered when dismiss actions evaluation (drag, backdrop, external limit).",
      },
      {
        name: "children",
        type: "React.ReactNode",
        description: "Content rendered inside the active sliding sheet.",
      },
      {
        name: "position",
        type: "DrawerPosition",
        description:
          "Anchoring enumeration bounding left, right, top, or bottom screen edges.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Specific styling modifiers passing onto the physical sliding panel.",
      },
      {
        name: "overlayClassName",
        type: "string",
        description:
          "Specific styling modifiers passing onto the dimming backdrop.",
      },
      {
        name: "width",
        type: "string",
        description:
          "CSS explicit translation sizing left/right sliding panels.",
      },
      {
        name: "height",
        type: "string",
        description:
          "CSS explicit translation sizing top/bottom sliding panels.",
      },
      {
        name: "dragToClose",
        type: "boolean",
        description:
          "Map touch swiping events onto gesture recognizers supporting drag dismiss.",
      },
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
}`,
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
        name: "className",
        type: "string",
        description: "CSS attributes tailoring the absolute container.",
      },
      {
        name: "position",
        type: '"top-right" | "top-left" | "bottom-right" | "bottom-left"',
        description:
          "Screen coordinate literal dictating orientation constraints.",
      },
      {
        name: "maxVisible",
        type: "number",
        description:
          "Limit quantity threshold managing physical screen stack instances.",
      },
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
}`,
  },
  {
    slug: "animated-timeline",
    name: "Animated Timeline",
    description:
      "Scroll-triggered timeline with 4 distinct Motion.dev animation variants: vertical spring, horizontal growing line, alternating cards, and numbered steps.",
    installCmd: "npx uniqueui add animated-timeline",
    icon: Clock,
    category: "Effects & Animations",
    props: [
      {
        name: "items",
        type: "TimelineItem[]",
        description:
          "Ordered array of timeline items (id, title, description, date, color, icon).",
      },
      {
        name: "variant",
        type: '"vertical" | "horizontal" | "cards" | "steps"',
        description: 'Layout and animation style. Defaults to "vertical".',
      },
      {
        name: "lineColor",
        type: "string",
        description:
          "Connecting line color. Defaults to rgba(255,255,255,0.08).",
      },
      {
        name: "className",
        type: "string",
        description: "Additional classes on the root wrapper.",
      },
    ],
    variants: [
      {
        id: "vertical",
        label: "Vertical",
        demoKey: "animated-timeline/vertical",
        usageCode: `import { AnimatedTimeline } from "@/components/ui/animated-timeline";

const items = [
  { id: "1", title: "Project Kickoff",   description: "Scope defined and team assembled.",             color: "#a855f7", date: "Jan 2026" },
  { id: "2", title: "Design Phase",      description: "Wireframes and component system finalised.",    color: "#6366f1", date: "Jan 2026" },
  { id: "3", title: "Dev Sprint",        description: "Core components built and tested end-to-end.", color: "#ec4899", date: "Feb 2026" },
  { id: "4", title: "Public Launch",     description: "CLI published and registry live.",             color: "#10b981", date: "Feb 2026" },
];

export default function Example() {
  return (
    <div className="max-w-sm mx-auto p-6 w-full">
      <AnimatedTimeline items={items} variant="vertical" lineColor="#3f3f46" />
    </div>
  );
}`,
      },
      {
        id: "horizontal",
        label: "Horizontal",
        demoKey: "animated-timeline/horizontal",
        usageCode: `import { AnimatedTimeline } from "@/components/ui/animated-timeline";

const items = [
  { id: "1", title: "Kickoff",  description: "Scope agreed.",          color: "#a855f7", date: "Jan" },
  { id: "2", title: "Design",   description: "Wireframes done.",       color: "#6366f1", date: "Jan" },
  { id: "3", title: "Build",    description: "Components shipped.",    color: "#ec4899", date: "Feb" },
  { id: "4", title: "Launch",   description: "Registry live.",         color: "#10b981", date: "Feb" },
];

export default function Example() {
  return (
    <div className="p-6 w-full overflow-x-auto">
      <AnimatedTimeline items={items} variant="horizontal" lineColor="#3f3f46" />
    </div>
  );
}`,
      },
      {
        id: "cards",
        label: "Cards",
        demoKey: "animated-timeline/cards",
        usageCode: `import { AnimatedTimeline } from "@/components/ui/animated-timeline";

const items = [
  { id: "1", title: "Project Kickoff",   description: "Scope defined and team assembled.",             color: "#a855f7", date: "Jan 2026" },
  { id: "2", title: "Design Phase",      description: "Wireframes and component system finalised.",    color: "#6366f1", date: "Jan 2026" },
  { id: "3", title: "Dev Sprint",        description: "Core components built and tested end-to-end.", color: "#ec4899", date: "Feb 2026" },
  { id: "4", title: "Public Launch",     description: "CLI published and registry live.",             color: "#10b981", date: "Feb 2026" },
];

export default function Example() {
  return (
    <div className="max-w-lg mx-auto p-6 w-full">
      <AnimatedTimeline items={items} variant="cards" lineColor="#3f3f46" />
    </div>
  );
}`,
      },
      {
        id: "steps",
        label: "Steps",
        demoKey: "animated-timeline/steps",
        usageCode: `import { AnimatedTimeline } from "@/components/ui/animated-timeline";

const items = [
  { id: "1", title: "Install the CLI",        description: "Run npx uniqueui init in your project.",         color: "#a855f7" },
  { id: "2", title: "Add a component",        description: "Run npx uniqueui add animated-timeline.",        color: "#6366f1" },
  { id: "3", title: "Import and customise",   description: "Use variant, color, and date props as needed.",  color: "#ec4899" },
  { id: "4", title: "Ship to production",     description: "Zero runtime dependency — fully your code.",     color: "#10b981" },
];

export default function Example() {
  return (
    <div className="max-w-sm mx-auto p-6 w-full">
      <AnimatedTimeline items={items} variant="steps" />
    </div>
  );
}`,
      },
    ],
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
        description:
          "Array of top-level comment objects, each optionally containing a `replies` array for nested threading.",
      },
      {
        name: "maxDepth",
        type: "number",
        default: "4",
        description:
          "Maximum nesting depth allowed before disabling the Reply button to prevent infinite threading.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Additional CSS classes applied to the root wrapper element.",
      },
      {
        name: "accentColor",
        type: "string",
        default: '"#8b5cf6"',
        description:
          "Hex or CSS color used for reply badge highlights and interactive accent elements.",
      },
      {
        name: "onReply",
        type: "(commentId: string, content: string) => void",
        description:
          "Callback fired when a user submits a reply, receiving the parent comment ID and reply text.",
      },
      {
        name: "onLike",
        type: "(commentId: string) => void",
        description:
          "Callback fired when a user likes a comment, receiving the comment ID.",
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
}`,
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
        name: "image",
        type: "string",
        description: "URL of the image displayed as the card's primary visual.",
      },
      {
        name: "imageAlt",
        type: "string",
        description: "Accessible alt text attached to the img element.",
      },
      {
        name: "tag",
        type: "string",
        description:
          "Small uppercase label rendered above the heading in both states.",
      },
      {
        name: "title",
        type: "string",
        description:
          "Primary headline text displayed in both the default and reveal states.",
      },
      {
        name: "subtitle",
        type: "string",
        description:
          "Supporting line shown beneath the title in the default state and as a footer in the reveal panel.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Extended body copy that appears only inside the slide-up hover panel.",
      },
      {
        name: "ctaText",
        type: "string",
        description:
          "Call-to-action label rendered at the bottom of the hover panel.",
      },
      {
        name: "href",
        type: "string",
        description:
          "When supplied the wrapper renders as an anchor element pointing to this URL.",
      },
      {
        name: "accentColor",
        type: "string",
        description:
          "Hex or CSS colour driving the tag, CTA text, and border-glow accent.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Tailwind utility classes forwarded onto the outermost card wrapper.",
      },
      {
        name: "imageHeight",
        type: "number",
        description:
          "Pixel height reserved for the image section before the content area.",
      },
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
}`,
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
        name: "title",
        type: "string",
        description: "Headline text displayed at the bottom of the card.",
      },
      {
        name: "description",
        type: "string",
        description: "Supporting body text shown beneath the title.",
      },
      {
        name: "icon",
        type: "React.ReactNode",
        description:
          "Icon element rendered inside a pill at the top of the card.",
      },
      {
        name: "background",
        type: "React.ReactNode",
        description:
          "Optional decorative layer (image, gradient, SVG) rendered behind the content.",
      },
      {
        name: "cta",
        type: "string",
        description: "Call-to-action label that slides up into view on hover.",
      },
      {
        name: "href",
        type: "string",
        description: "When supplied the card renders as an anchor element.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Grid span and sizing classes forwarded to the cell wrapper, e.g. col-span-2 or row-span-2.",
      },
      {
        name: "spinBorder",
        type: "boolean",
        description:
          "Enable the spinning conic-gradient border effect (same technique as the hero button). Replaces the static border.",
      },
      {
        name: "spinBorderColors",
        type: "[string, string]",
        description:
          'Two hex/CSS color values for the conic gradient. Defaults to ["#E2CBFF", "#393BB2"] (purple–indigo).',
      },
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
}`,
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
  {
    slug: "particle-field",
    name: "Particle Field",
    description:
      "Canvas-based floating particles with mouse-repulsion physics and responsive connecting lines.",
    installCmd: "npx uniqueui add particle-field",
    icon: Sparkles,
    category: "Backgrounds",
    props: [
      {
        name: "particleCount",
        type: "number",
        description: "The number of particles rendered dynamically.",
      },
      {
        name: "particleColor",
        type: "string",
        description:
          "The hex color code for the particles and connecting lines.",
      },
      {
        name: "speed",
        type: "number",
        description: "The base movement speed multiplier.",
      },
      {
        name: "interactionRadius",
        type: "number",
        description: "The pixel radius for the mouse repulsion event.",
      },
    ],
    usageCode: `import { ParticleField } from "@/components/ui/particle-field";

export default function Example() {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 h-[400px] w-full relative bg-neutral-950">
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
          Hover Around
        </h3>
      </div>
      <ParticleField 
        particleCount={120}
        particleColor="#a855f7"
        speed={0.5}
      />
    </div>
  );
}`,
  },
  {
    slug: "horizontal-scroll-gallery",
    name: "Horizontal Scroll Gallery",
    description:
      "Converts vertical scroll into horizontal movement with momentum physics for immersive galleries.",
    installCmd: "npx uniqueui add horizontal-scroll-gallery",
    icon: Layers,
    category: "Effects & Animations",
    props: [
      {
        name: "items",
        type: "React.ReactNode[]",
        description:
          "Array of React nodes (e.g. images, cards) to map across the horizontal track.",
      },
      {
        name: "direction",
        type: '"left" | "right"',
        description: "Direction the track moves when the user scrolls down.",
      },
      {
        name: "itemClassName",
        type: "string",
        description: "Common classes applied to every individual container.",
      },
    ],
    usageCode: `import { HorizontalScrollGallery } from "@/components/ui/horizontal-scroll-gallery";

export default function Example() {
  const images = [
    <img key="1" src="https://images.unsplash.com/photo-1682687982501-1e58f8108c6b" alt="Landscape 1" className="object-cover w-full h-full" />,
    <img key="2" src="https://images.unsplash.com/photo-1682687220063-4742bd7fd538" alt="Landscape 2" className="object-cover w-full h-full" />,
    <img key="3" src="https://images.unsplash.com/photo-1682687981922-7b55dbb3086b" alt="Landscape 3" className="object-cover w-full h-full" />,
    <div key="4" className="w-full h-full bg-neutral-900 flex items-center justify-center p-8 text-center text-white">
      <h3 className="text-4xl font-bold">End of Gallery</h3>
    </div>
  ];
  return (
    <HorizontalScrollGallery items={images} />
  );
}`,
  },
  {
    slug: "radial-menu",
    name: "Radial Menu",
    description:
      "Circular flyout menu that bursts items outward from a center trigger with staggered spring animation.",
    installCmd: "npx uniqueui add radial-menu",
    icon: Palette,
    category: "Navigation & Overlays",
    props: [
      {
        name: "items",
        type: "RadialMenuItem[]",
        description:
          "Array of item configurations representing the burst actions.",
      },
      {
        name: "radius",
        type: "number",
        description:
          "Distance in pixels each item travels from the trigger center.",
      },
      {
        name: "startAngle",
        type: "number",
        description:
          "The starting angle for the radial arc (e.g. -90 for top).",
      },
      {
        name: "endAngle",
        type: "number",
        description: "The concluding angle for the radial arc.",
      },
      {
        name: "staggerDelay",
        type: "number",
        description: "Staggering time multiplier between cascading children.",
      },
    ],
    usageCode: `import { RadialMenu } from "@/components/ui/radial-menu";
import { User, Settings, Mail, Bell } from "lucide-react";

export default function Example() {
  const menuItems = [
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
    { id: "messages", label: "Messages", icon: <Mail className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <div className="h-[400px] w-full flex items-center justify-center">
      <RadialMenu items={menuItems} radius={120} />
    </div>
  );
}`,
  },
  {
    slug: "cursor-trail",
    name: "Cursor Trail",
    description:
      "Glowing trail that follows the cursor with decay physics, like a sparkler or comet tail.",
    installCmd: "npx uniqueui add cursor-trail",
    icon: LayoutGrid,
    category: "Cursor Effects",
    props: [
      {
        name: "color",
        type: "string",
        description: "The color of the trail particles.",
      },
      {
        name: "trailLength",
        type: "number",
        description: "Maximum number of particles rendering concurrently.",
      },
      {
        name: "size",
        type: "number",
        description: "Base size of the trailing particle dots.",
      },
      {
        name: "decayDuration",
        type: "number",
        description:
          "How long it takes for a drawn particle to fade and shrink out.",
      },
    ],
    usageCode: `import { CursorTrail } from "@/components/ui/cursor-trail";

export default function Example() {
  return (
    <div className="h-[400px] w-full relative bg-neutral-950 overflow-hidden flex items-center justify-center">
      <h3 className="text-white text-2xl font-bold uppercase tracking-widest pointer-events-none">
        Move your mouse
      </h3>
      
      {/* Ensures it captures pointer events across the block but doesn't block the content */}
      <CursorTrail 
        color="#a855f7"
        size={14}
        trailLength={25}
        decayDuration={0.6}
      />
    </div>
  );
}`,
  },
  {
    slug: "pen-cursor",
    name: "Pen Cursor",
    description:
      "Physics-driven ribbon trail rendered on canvas — a chain of linked points follows the mouse with spring-damping inertia, width scales with speed, and colors interpolate head-to-tail. Inspired by obsidianassembly.com.",
    installCmd: "npx uniqueui add pen-cursor",
    icon: Pen,
    category: "Cursor Effects",
    props: [
      {
        name: "trailLength",
        type: "number",
        description: "Number of chain-linked trail points. Default 60.",
      },
      {
        name: "maxWidth",
        type: "number",
        description: "Maximum ribbon width in px (scales with speed). Default 1.",
      },
      {
        name: "minWidth",
        type: "number",
        description: "Minimum ribbon width in px at the tail. Default 1.",
      },
      {
        name: "damping",
        type: "number",
        description: "Spring damping for the head point (0–1). Default 0.6.",
      },
      {
        name: "speedInfluence",
        type: "number",
        description: "How much mouse speed widens the ribbon (0–1). Default 0.9.",
      },
      {
        name: "colorHead",
        type: "string",
        description: 'RGB string for the ribbon head color. Default "159, 175, 155" (sage green).',
      },
      {
        name: "colorTail",
        type: "string",
        description: 'RGB string for the ribbon tail color. Default "198, 167, 106" (warm gold).',
      },
      {
        name: "alphaHead",
        type: "number",
        description: "Opacity at the ribbon head (0–1). Default 0.9.",
      },
      {
        name: "alphaTail",
        type: "number",
        description: "Opacity at the ribbon tail (0–1). Default 0.",
      },
      {
        name: "hideSystemCursor",
        type: "boolean",
        description: "Hide the system cursor while mounted. Default false.",
      },
      {
        name: "containerRef",
        type: "RefObject<HTMLElement | null>",
        description:
          "Optional. Limits drawing to this element; parent should be `relative`. Omit for full-window tracking.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes on the canvas element.",
      },
    ],
    usageCode: `import { useRef } from "react";
import { PenCursor } from "@/components/ui/pen-cursor";

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className="h-[400px] w-full relative bg-neutral-950 overflow-hidden flex items-center justify-center"
    >
      <h3 className="text-white text-2xl font-bold uppercase tracking-widest pointer-events-none">
        Move your mouse
      </h3>
      <PenCursor
        containerRef={containerRef}
        trailLength={40}
        maxWidth={1}
        colorHead="159, 175, 155"
        colorTail="198, 167, 106"
        alphaHead={0.95}
        damping={0.55}
      />
    </div>
  );
}`,
  },
  {
    slug: "glow-hero-section",
    name: "Glow Hero Section",
    description:
      "Physics-driven hero section with an interactive aqueous mesh canvas, spring-based motion text entrance, and fully configurable badge, heading, description, colors, and dimensions.",
    installCmd: "npx uniqueui add glow-hero-section",
    icon: Sparkles,
    category: "Backgrounds",
    props: [
      {
        name: "className",
        type: "string",
        description: "Extra CSS classes applied to the root container.",
      },
      {
        name: "height",
        type: "string",
        default: '"h-[520px]"',
        description:
          'Tailwind height class for the component, e.g. "h-screen" or "h-[600px]".',
      },
      {
        name: "badge",
        type: "string | null",
        default: '"Decentralized · Environmental · Protocol"',
        description:
          "Text shown in the badge above the heading. Pass null to hide the badge entirely.",
      },
      {
        name: "heading",
        type: "string",
        default: '"The Gaia Protocol"',
        description: "Main heading text.",
      },
      {
        name: "description",
        type: "string",
        default: '"A decentralized framework..."',
        description: "Subheading / description paragraph beneath the heading.",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: '"#f0f4f0"',
        description:
          "CSS background color of the container behind the mesh canvas.",
      },
      {
        name: "meshColorStart",
        type: "string",
        default: '"rgba(255, 122, 0, 0.45)"',
        description:
          "Start color of the linear gradient applied to mesh lines.",
      },
      {
        name: "meshColorEnd",
        type: "string",
        default: '"rgba(50, 205, 50, 0.45)"',
        description: "End color of the linear gradient applied to mesh lines.",
      },
      {
        name: "meshOpacity",
        type: "number",
        default: "0.6",
        description: "Overall opacity of the mesh canvas layer (0–1).",
      },
      {
        name: "gridSize",
        type: "number",
        default: "30",
        description:
          "Pixel size of each mesh grid cell. Smaller = denser mesh.",
      },
      {
        name: "mouseRadius",
        type: "number",
        default: "150",
        description:
          "Radius in pixels within which mouse movement repels mesh grid points.",
      },
    ],
    variants: [
      {
        id: "default",
        label: "Default",
        demoKey: "glow-hero-section/default",
        usageCode: `import GlowHeroSection from "@/components/ui/glow-hero-section";

export default function Example() {
  return (
    <GlowHeroSection
      height="h-[520px]"
      badge="Decentralized · Environmental · Protocol"
      heading="The Gaia Protocol"
      description="A decentralized framework for global environmental synthesis, powered by a living, self-organizing data network."
      backgroundColor="#f0f4f0"
      meshColorStart="rgba(255, 122, 0, 0.45)"
      meshColorEnd="rgba(50, 205, 50, 0.45)"
      meshOpacity={0.6}
      gridSize={30}
      mouseRadius={150}
    />
  );
}`,
      },
      {
        id: "dark",
        label: "Dark Theme",
        demoKey: "glow-hero-section/dark",
        usageCode: `import GlowHeroSection from "@/components/ui/glow-hero-section";

export default function Example() {
  return (
    <GlowHeroSection
      backgroundColor="#0a0a0f"
      meshColorStart="rgba(139, 92, 246, 0.5)"
      meshColorEnd="rgba(6, 182, 212, 0.5)"
      badge="Next-Gen · Web · Components"
      heading="UniqueUI"
      description="Premium animated React components, copy-paste ready."
      gridSize={40}
      mouseRadius={200}
    />
  );
}`,
      },
      {
        id: "no-badge",
        label: "No Badge",
        demoKey: "glow-hero-section/no-badge",
        usageCode: `import GlowHeroSection from "@/components/ui/glow-hero-section";

export default function Example() {
  return (
    <GlowHeroSection
      badge={null}
      heading="Build Interfaces That Stand Out"
      description="Drop-in animated components powered by Motion.dev and Tailwind CSS."
    />
  );
}`,
      },
    ],
  },
  {
    slug: "limelight-nav",
    name: "Limelight Nav",
    description:
      "Adaptive fluid navigation bar with a limelight spotlight and spring-animated tabs.",
    installCmd: "npx uniqueui add limelight-nav",
    icon: Layers,
    category: "Navigation & Overlays",
    props: [
      {
        name: "items",
        type: "NavItem[]",
        description:
          "Array of navigation items containing id, icon, label, and onClick.",
      },
      {
        name: "defaultActiveIndex",
        type: "number",
        default: "0",
        description: "Initial active tab index.",
      },
      {
        name: "limelightColor",
        type: "string",
        default: '"#a855f7"',
        description:
          "The CSS color passed inline to define the spotlight glow.",
      },
      {
        name: "className",
        type: "string",
        description: "Styles applied to the container.",
      },
    ],
    variants: [
      {
        id: "default",
        label: "Default",
        demoKey: "limelight-nav/default",
        usageCode: `import { LimelightNav } from "@/components/ui/limelight-nav";
import { Home, Compass, Bell } from "lucide-react";

export default function Example() {
  return (
    <div className="flex items-center justify-center p-12 h-[300px] w-full bg-neutral-950 rounded-xl border border-neutral-800">
      <LimelightNav 
        limelightColor="#a855f7"
        items={[
          { id: '1', icon: <Home />, label: 'Home' },
          { id: '2', icon: <Compass />, label: 'Explore' },
          { id: '3', icon: <Bell />, label: 'Notifications' }
        ]}
      />
    </div>
  );
}`,
      },
      {
        id: "custom",
        label: "Custom",
        demoKey: "limelight-nav/custom",
        usageCode: `import { LimelightNav } from "@/components/ui/limelight-nav";
import { Home, Bookmark, PlusCircle, User, Settings } from "lucide-react";

export default function Example() {
  return (
    <div className="flex items-center justify-center p-12 h-[300px] w-full bg-neutral-950 rounded-xl border border-neutral-800">
      <LimelightNav 
        limelightColor="#06b6d4"
        className="bg-neutral-900/50"
        items={[
          { id: '1', icon: <Home />, label: 'Home' },
          { id: '2', icon: <Bookmark />, label: 'Bookmarks' },
          { id: '3', icon: <PlusCircle />, label: 'Add' },
          { id: '4', icon: <User />, label: 'Profile' },
          { id: '5', icon: <Settings />, label: 'Settings' }
        ]}
      />
    </div>
  );
}`,
      },
    ],
  },
  {
    slug: "data-table",
    name: "Data Table",
    description:
      "Configurable data table with optional column freeze (left/right), customizable header and body colors and backgrounds, optional borders, and optional sortable columns.",
    installCmd: "npx uniqueui add data-table",
    icon: Table,
    category: "Data & Layout",
    props: [
      {
        name: "columns",
        type: "DataTableColumn[]",
        description:
          "Column definitions: key, label, and optional sortKey for sortable columns.",
      },
      {
        name: "data",
        type: "Record<string, React.ReactNode>[]",
        description: "Row data; each row is an object keyed by column key.",
      },
      {
        name: "freezeColumns",
        type: '"none" | "left" | "right" | "both"',
        default: '"none"',
        description:
          "Which columns to freeze when horizontally scrolling: none, left, right, or both sides.",
      },
      {
        name: "freezeCount",
        type: "number",
        default: "1",
        description:
          'With freezeColumns "left" or "both": columns frozen on the left. With freezeColumns "right" only: columns frozen on the right (freezeRightCount is not used).',
      },
      {
        name: "freezeRightCount",
        type: "number",
        default: "1",
        description:
          'With freezeColumns "both": columns frozen on the right (left side uses freezeCount). Ignored when freezeColumns is "none", "left", or "right".',
      },
      {
        name: "paginated",
        type: "boolean",
        default: "false",
        description: "Enable built-in pagination controls.",
      },
      {
        name: "pageSize",
        type: "number",
        default: "8",
        description: "Number of rows per page when paginated is true.",
      },
      {
        name: "pageSizeOptions",
        type: "number[]",
        description: "Optional list of page sizes to show in a selector.",
      },
      {
        name: "initialPage",
        type: "number",
        default: "1",
        description: "Initial page index (1-based) when paginated is true.",
      },
      {
        name: "onPageChange",
        type: "(page: number, pageSize: number) => void",
        description: "Called when the current page or page size changes.",
      },
      {
        name: "paginationPreviousLabel",
        type: "React.ReactNode",
        description:
          "Previous-page control content; defaults to a left chevron icon.",
      },
      {
        name: "paginationNextLabel",
        type: "React.ReactNode",
        description:
          "Next-page control content; defaults to a right chevron icon.",
      },
      {
        name: "getRowKey",
        type: "(row, index) => React.Key",
        description:
          "Optional stable key per row for React reconciliation (sort, pagination). Defaults to row.id / row.key when string or number, else a generated key.",
      },
      {
        name: "headerTextColor",
        type: "string",
        description: "Tailwind class for header text, e.g. text-neutral-900.",
      },
      {
        name: "bodyTextColor",
        type: "string",
        description: "Tailwind class for body cell text.",
      },
      {
        name: "headerBackground",
        type: "string",
        description:
          "Tailwind class for header background, e.g. bg-neutral-100.",
      },
      {
        name: "bodyBackground",
        type: "string",
        description: "Tailwind class for body background.",
      },
      {
        name: "border",
        type: "boolean",
        default: "false",
        description: "Whether to show table and cell borders.",
      },
      {
        name: "sortable",
        type: "boolean",
        default: "false",
        description:
          "Whether column headers with sortKey are clickable to sort.",
      },
      {
        name: "onSort",
        type: '(key: string, direction: "asc" | "desc") => void',
        description: "Callback when sort changes (for controlled use).",
      },
      {
        name: "className",
        type: "string",
        description: "Additional classes on the root wrapper.",
      },
      {
        name: "theme",
        type: '"light" | "dark"',
        default: '"dark"',
        description:
          "Theme for default header/body colors when not overridden.",
      },
    ],
    variants: [
      {
        id: "default",
        label: "Default",
        demoKey: "data-table/default",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
];
const data = [
  { name: "Alex Kim", role: "Engineer", email: "alex@example.com", department: "Platform", status: "Active", joined: "2023-01" },
  { name: "Sara Chen", role: "Designer", email: "sara@example.com", department: "Product", status: "Active", joined: "2023-03" },
  { name: "Jordan Lee", role: "PM", email: "jordan@example.com", department: "Growth", status: "Away", joined: "2023-06" },
  { name: "Maya Patel", role: "Engineer", email: "maya@example.com", department: "Platform", status: "Active", joined: "2024-01" },
  { name: "Ryan Wu", role: "Designer", email: "ryan@example.com", department: "Product", status: "Away", joined: "2024-02" },
  { name: "Priya Shah", role: "PM", email: "priya@example.com", department: "Growth", status: "Active", joined: "2024-04" },
  { name: "Sam Rivera", role: "Engineer", email: "sam@example.com", department: "Platform", status: "Active", joined: "2024-05" },
  { name: "Jess Taylor", role: "Designer", email: "jess@example.com", department: "Product", status: "Active", joined: "2024-06" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable columns={columns} data={data} paginated pageSize={5} theme="dark" />
    </div>
  );
}`,
      },
      {
        id: "freeze-left",
        label: "Freeze left",
        demoKey: "data-table/freeze-left",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "region", label: "Region" },
  { key: "joined", label: "Joined" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];
const data = [
  { id: "1", name: "Alex Kim", email: "alex@example.com", role: "Engineer", department: "Platform", region: "West", joined: "2023-01", status: "Active", actions: "Edit · View" },
  { id: "2", name: "Sara Chen", email: "sara@example.com", role: "Designer", department: "Product", region: "East", joined: "2023-03", status: "Active", actions: "Edit · View" },
  { id: "3", name: "Jordan Lee", email: "jordan@example.com", role: "PM", department: "Growth", region: "Central", joined: "2023-06", status: "Away", actions: "Edit · View" },
  { id: "4", name: "Maya Patel", email: "maya@example.com", role: "Engineer", department: "Platform", region: "West", joined: "2024-01", status: "Active", actions: "Edit · View" },
  { id: "5", name: "Ryan Wu", email: "ryan@example.com", role: "Designer", department: "Product", region: "East", joined: "2024-02", status: "Away", actions: "Edit · View" },
  { id: "6", name: "Priya Shah", email: "priya@example.com", role: "PM", department: "Growth", region: "Central", joined: "2024-04", status: "Active", actions: "Edit · View" },
  { id: "7", name: "Sam Rivera", email: "sam@example.com", role: "Engineer", department: "Platform", region: "West", joined: "2024-05", status: "Active", actions: "Edit · View" },
  { id: "8", name: "Jess Taylor", email: "jess@example.com", role: "Designer", department: "Product", region: "East", joined: "2024-06", status: "Active", actions: "Edit · View" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable
        columns={columns}
        data={data}
        freezeColumns="left"
        freezeCount={2}
        paginated
        pageSize={5}
        theme="dark"
      />
    </div>
  );
}`,
      },
      {
        id: "freeze-right",
        label: "Freeze right",
        demoKey: "data-table/freeze-right",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "region", label: "Region" },
  { key: "status", label: "Status" },
  { key: "email", label: "Email" },
  { key: "joined", label: "Joined" },
  { key: "lastActive", label: "Last active" },
  { key: "actions", label: "Actions" },
];
const data = [
  { name: "Alex Kim", role: "Engineer", department: "Platform", region: "West", status: "Active", email: "alex@example.com", joined: "2023-01", lastActive: "2024-03", actions: "Edit · View" },
  { name: "Sara Chen", role: "Designer", department: "Product", region: "East", status: "Active", email: "sara@example.com", joined: "2023-03", lastActive: "2024-03", actions: "Edit · View" },
  { name: "Jordan Lee", role: "PM", department: "Growth", region: "Central", status: "Away", email: "jordan@example.com", joined: "2023-06", lastActive: "2024-02", actions: "Edit · View" },
  { name: "Maya Patel", role: "Engineer", department: "Platform", region: "West", status: "Active", email: "maya@example.com", joined: "2024-01", lastActive: "2024-03", actions: "Edit · View" },
  { name: "Ryan Wu", role: "Designer", department: "Product", region: "East", status: "Away", email: "ryan@example.com", joined: "2024-02", lastActive: "2024-01", actions: "Edit · View" },
  { name: "Priya Shah", role: "PM", department: "Growth", region: "Central", status: "Active", email: "priya@example.com", joined: "2024-04", lastActive: "2024-03", actions: "Edit · View" },
  { name: "Sam Rivera", role: "Engineer", department: "Platform", region: "West", status: "Active", email: "sam@example.com", joined: "2024-05", lastActive: "2024-03", actions: "Edit · View" },
  { name: "Jess Taylor", role: "Designer", department: "Product", region: "East", status: "Active", email: "jess@example.com", joined: "2024-06", lastActive: "2024-03", actions: "Edit · View" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable
        columns={columns}
        data={data}
        freezeColumns="right"
        freezeCount={1}
        paginated
        pageSize={5}
        theme="dark"
      />
    </div>
  );
}`,
      },
      {
        id: "freeze-both",
        label: "Freeze both",
        demoKey: "data-table/freeze-both",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "region", label: "Region" },
  { key: "joined", label: "Joined" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];
const data = [
  { id: "1", name: "Alex Kim", email: "alex@example.com", role: "Engineer", department: "Platform", region: "West", joined: "2023-01", status: "Active", actions: "Edit · View" },
  { id: "2", name: "Sara Chen", email: "sara@example.com", role: "Designer", department: "Product", region: "East", joined: "2023-03", status: "Active", actions: "Edit · View" },
  { id: "3", name: "Jordan Lee", email: "jordan@example.com", role: "PM", department: "Growth", region: "Central", joined: "2023-06", status: "Away", actions: "Edit · View" },
  { id: "4", name: "Maya Patel", email: "maya@example.com", role: "Engineer", department: "Platform", region: "West", joined: "2024-01", status: "Active", actions: "Edit · View" },
  { id: "5", name: "Ryan Wu", email: "ryan@example.com", role: "Designer", department: "Product", region: "East", joined: "2024-02", status: "Away", actions: "Edit · View" },
  { id: "6", name: "Priya Shah", email: "priya@example.com", role: "PM", department: "Growth", region: "Central", joined: "2024-04", status: "Active", actions: "Edit · View" },
  { id: "7", name: "Sam Rivera", email: "sam@example.com", role: "Engineer", department: "Platform", region: "West", joined: "2024-05", status: "Active", actions: "Edit · View" },
  { id: "8", name: "Jess Taylor", email: "jess@example.com", role: "Designer", department: "Product", region: "East", joined: "2024-06", status: "Active", actions: "Edit · View" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable
        columns={columns}
        data={data}
        freezeColumns="both"
        freezeCount={2}
        freezeRightCount={1}
        paginated
        pageSize={5}
        theme="dark"
      />
    </div>
  );
}`,
      },
      {
        id: "bordered",
        label: "Bordered",
        demoKey: "data-table/bordered",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
];
const data = [
  { name: "Alex Kim", role: "Engineer", email: "alex@example.com", department: "Platform", status: "Active", joined: "2023-01" },
  { name: "Sara Chen", role: "Designer", email: "sara@example.com", department: "Product", status: "Active", joined: "2023-03" },
  { name: "Jordan Lee", role: "PM", email: "jordan@example.com", department: "Growth", status: "Away", joined: "2023-06" },
  { name: "Maya Patel", role: "Engineer", email: "maya@example.com", department: "Platform", status: "Active", joined: "2024-01" },
  { name: "Ryan Wu", role: "Designer", email: "ryan@example.com", department: "Product", status: "Away", joined: "2024-02" },
  { name: "Priya Shah", role: "PM", email: "priya@example.com", department: "Growth", status: "Active", joined: "2024-04" },
  { name: "Sam Rivera", role: "Engineer", email: "sam@example.com", department: "Platform", status: "Active", joined: "2024-05" },
  { name: "Jess Taylor", role: "Designer", email: "jess@example.com", department: "Product", status: "Active", joined: "2024-06" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable columns={columns} data={data} border paginated pageSize={5} theme="dark" />
    </div>
  );
}`,
      },
      {
        id: "sortable",
        label: "Sortable",
        demoKey: "data-table/sortable",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "name", label: "Name", sortKey: "name" },
  { key: "role", label: "Role", sortKey: "role" },
  { key: "department", label: "Department", sortKey: "department" },
  { key: "joined", label: "Joined", sortKey: "joined" },
  { key: "status", label: "Status", sortKey: "status" },
];
const data = [
  { name: "Jordan Lee", role: "PM", department: "Growth", joined: "2024-03", status: "Away" },
  { name: "Alex Kim", role: "Engineer", department: "Platform", joined: "2024-01", status: "Active" },
  { name: "Sara Chen", role: "Designer", department: "Product", joined: "2024-02", status: "Active" },
  { name: "Maya Patel", role: "Engineer", department: "Platform", joined: "2023-11", status: "Active" },
  { name: "Ryan Wu", role: "Designer", department: "Product", joined: "2024-05", status: "Away" },
  { name: "Priya Shah", role: "PM", department: "Growth", joined: "2023-08", status: "Active" },
  { name: "Sam Rivera", role: "Engineer", department: "Platform", joined: "2024-06", status: "Active" },
  { name: "Jess Taylor", role: "Designer", department: "Product", joined: "2023-09", status: "Active" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable columns={columns} data={data} sortable paginated pageSize={5} theme="dark" />
    </div>
  );
}`,
      },
      {
        id: "custom-colors",
        label: "Custom colors",
        demoKey: "data-table/custom-colors",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
];
const data = [
  { name: "Alex Kim", role: "Engineer", email: "alex@example.com", department: "Platform", status: "Active", joined: "2023-01" },
  { name: "Sara Chen", role: "Designer", email: "sara@example.com", department: "Product", status: "Active", joined: "2023-03" },
  { name: "Jordan Lee", role: "PM", email: "jordan@example.com", department: "Growth", status: "Away", joined: "2023-06" },
  { name: "Maya Patel", role: "Engineer", email: "maya@example.com", department: "Platform", status: "Active", joined: "2024-01" },
  { name: "Ryan Wu", role: "Designer", email: "ryan@example.com", department: "Product", status: "Away", joined: "2024-02" },
  { name: "Priya Shah", role: "PM", email: "priya@example.com", department: "Growth", status: "Active", joined: "2024-04" },
  { name: "Sam Rivera", role: "Engineer", email: "sam@example.com", department: "Platform", status: "Active", joined: "2024-05" },
  { name: "Jess Taylor", role: "Designer", email: "jess@example.com", department: "Product", status: "Active", joined: "2024-06" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable
        columns={columns}
        data={data}
        headerTextColor="text-purple-900"
        bodyTextColor="text-neutral-800"
        headerBackground="bg-purple-100"
        bodyBackground="bg-purple-50/50"
        paginated
        pageSize={5}
        border
        theme="dark"
      />
    </div>
  );
}`,
      },
      {
        id: "full",
        label: "Full options",
        demoKey: "data-table/full",
        usageCode: `import { DataTable } from "@/components/ui/data-table";

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name", sortKey: "name" },
  { key: "role", label: "Role", sortKey: "role" },
  { key: "department", label: "Dept" },
  { key: "region", label: "Region" },
  { key: "joined", label: "Joined" },
  { key: "actions", label: "Actions" },
];
const data = [
  { id: "1", name: "Jordan Lee", role: "PM", department: "Growth", region: "Central", joined: "2023-06", actions: "Edit" },
  { id: "2", name: "Alex Kim", role: "Engineer", department: "Platform", region: "West", joined: "2023-01", actions: "Edit" },
  { id: "3", name: "Sara Chen", role: "Designer", department: "Product", region: "East", joined: "2023-03", actions: "Edit" },
  { id: "4", name: "Maya Patel", role: "Engineer", department: "Platform", region: "West", joined: "2024-01", actions: "Edit" },
  { id: "5", name: "Ryan Wu", role: "Designer", department: "Product", region: "East", joined: "2024-02", actions: "Edit" },
  { id: "6", name: "Priya Shah", role: "PM", department: "Growth", region: "Central", joined: "2024-04", actions: "Edit" },
  { id: "7", name: "Sam Rivera", role: "Engineer", department: "Platform", region: "West", joined: "2024-05", actions: "Edit" },
  { id: "8", name: "Jess Taylor", role: "Designer", department: "Product", region: "East", joined: "2024-06", actions: "Edit" },
];

export default function Example() {
  return (
    <div className="w-full p-6">
      <DataTable
        columns={columns}
        data={data}
        freezeColumns="left"
        freezeCount={1}
        headerTextColor="text-neutral-100"
        bodyTextColor="text-neutral-300"
        headerBackground="bg-neutral-800"
        bodyBackground="bg-neutral-950"
        border
        sortable
        paginated
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={(page, pageSize) =>
          console.log("page changed", page, "pageSize", pageSize)
        }
        theme="dark"
      />
    </div>
  );
}`,
      },
    ],
  },
  {
    slug: "morphing-card-stack",
    name: "Morphing Card Stack",
    description:
      "An interactive collection of cards that smoothly layout-morphs between Stack, Grid, and List configurations using Framer Motion springs.",
    installCmd: "npx uniqueui add morphing-card-stack",
    icon: Layers,
    category: "Cards",
    props: [
      {
        name: "cards",
        type: "CardData[]",
        description:
          "Array of CardData containing id, title, description, icon, and optional color.",
      },
      {
        name: "defaultLayout",
        type: '"stack" | "grid" | "list"',
        default: '"stack"',
        description: "Initial layout mode configuration.",
      },
      {
        name: "onCardClick",
        type: "(card: CardData) => void",
        description: "Callback function triggered when clicking a card.",
      },
    ],
    variants: [
      {
        id: "default",
        label: "Default",
        demoKey: "morphing-card-stack/default",
        usageCode: `import { MorphingCardStack } from "@/components/ui/morphing-card-stack";
import { Layers, Palette, Clock, Sparkles } from "lucide-react";

export default function Example() {
  return (
    <div className="flex items-center justify-center p-12 min-h-[500px] w-full bg-neutral-950 rounded-xl border border-neutral-800">
      <MorphingCardStack 
        cards={[
          {
            id: "1",
            title: "Magnetic Dock",
            description: "Cursor-responsive scaling with smooth spring animations",
            icon: <Layers className="h-5 w-5" />,
          },
          {
            id: "2",
            title: "Gradient Mesh",
            description: "Dynamic animated gradient backgrounds that follow your cursor",
            icon: <Palette className="h-5 w-5" />,
          },
          {
            id: "3",
            title: "Pulse Timeline",
            description: "Interactive timeline with animated pulse nodes",
            icon: <Clock className="h-5 w-5" />,
          },
          {
            id: "4",
            title: "Command Palette",
            description: "Radial command menu with keyboard navigation",
            icon: <Sparkles className="h-5 w-5" />,
          },
        ]} 
      />
    </div>
  );
}`,
      },
    ],
  },
  {
    slug: "multi-step-auth-card",
    name: "Multi-Step Auth Card",
    description:
      "Animation-first enterprise auth flow: email discovery, first-time and returning user paths, password create/login, and OTP verification with spring transitions between steps.",
    installCmd: "npx uniqueui add multi-step-auth-card",
    icon: Shield,
    category: "Navigation & Overlays",
    props: [
      {
        name: "className",
        type: "string",
        description: "Additional Tailwind classes for the outer card container.",
      },
      {
        name: "initialState",
        type: "AuthState",
        default: '"email"',
        description:
          'Starting step: "email" | "unregistered" | "first-time" | "create-password" | "password-login" | "otp".',
      },
      {
        name: "onStateChange",
        type: "(state: AuthState) => void",
        description: "Called whenever the active auth step changes.",
      },
      {
        name: "onSubmitEmail",
        type: "(email: string) => Promise<{ exists: boolean; registered: boolean }>",
        description:
          "If provided, drives routing after email submit; otherwise demo heuristics apply (e.g. email containing \"new\" or \"err\").",
      },
      {
        name: "onSubmitPassword",
        type: "(password: string) => Promise<boolean>",
        description:
          "Called on password login submit. Return false to stay on this step and show an error; any other return (including void) advances to OTP on success.",
      },
      {
        name: "onCreatePassword",
        type: "(password: string) => Promise<boolean>",
        description:
          "Called when saving a new password. Return false to stay on this step and show an error; otherwise advance to OTP.",
      },
      {
        name: "onSubmitOTP",
        type: "(otp: string) => Promise<boolean>",
        description:
          "Called when the user submits a six-digit code. Return false to show an invalid-code message without leaving the step.",
      },
      {
        name: "onResendOTP",
        type: "() => Promise<boolean>",
        description:
          "Optional resend handler. Return false to keep the current timer and code; on throw or false, resend count is not incremented.",
      },
      {
        name: "strings",
        type: "MultiStepAuthStringsPartial",
        description:
          "Deep-partial overrides for all UI copy; defaults are exported as MULTI_STEP_AUTH_DEFAULT_STRINGS for reference and i18n.",
      },
      {
        name: "otpResendCooldownSeconds",
        type: "number",
        default: "30",
        description: "Countdown length before the resend action is available again.",
      },
      {
        name: "otpMaxResends",
        type: "number",
        default: "3",
        description: "Maximum resend taps before the UI locks resend.",
      },
      {
        name: "demoEmailDelayMs",
        type: "number",
        default: "800",
        description: "Artificial delay after email submit when onSubmitEmail is omitted (demo mode).",
      },
      {
        name: "demoPasswordDelayMs",
        type: "number",
        default: "1000",
        description: "Artificial delay after password/OTP demo submits when the matching handler is omitted.",
      },
      {
        name: "requireTermsConsent",
        type: "boolean",
        default: "true",
        description:
          "When true, the initial email step shows a terms/privacy checkbox and blocks submit until it is checked. Set false to hide it.",
      },
    ],
    usageCode: `"use client";

import { MultiStepAuthCard } from "@/components/ui/multi-step-auth-card";

export default function Example() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <MultiStepAuthCard
        strings={{
          email: { titleSignIn: "Log in", continue: "Continue" },
        }}
        otpResendCooldownSeconds={45}
        onSubmitEmail={async (email) => {
          const res = await fetch("/api/auth/lookup", {
            method: "POST",
            body: JSON.stringify({ email }),
          }).then((r) => r.json());
          return { exists: res.exists, registered: res.registered };
        }}
      />
    </div>
  );
}`,
  },
];
