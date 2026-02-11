"use client";

import { Button } from "@/components/ui/moving-border";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { TiltCard } from "@/components/ui/3d-tilt-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { InfiniteMarquee, MarqueeItem } from "@/components/ui/infinite-marquee";
import { ScrollReveal, ScrollRevealGroup } from "@/components/ui/scroll-reveal";
import { SkeletonShimmer, SkeletonCard } from "@/components/ui/skeleton-shimmer";
import { MorphingModal, MorphingModalTrigger } from "@/components/ui/morphing-modal";
import { GradientTextReveal } from "@/components/ui/gradient-text-reveal";
import { ScrambleText } from "@/components/ui/scramble-text";
import { MeteorsCard } from "@/components/ui/meteors-card";
import { FlipCard } from "@/components/ui/flip-card";
import { DotGridBackground } from "@/components/ui/dot-grid-background";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { DrawerSlide } from "@/components/ui/drawer-slide";
import { NotificationStack, useNotifications } from "@/components/ui/notification-stack";
import { AnimatedTimeline } from "@/components/ui/animated-timeline";
import { useState } from "react";
import {
  Ghost,
  Sparkles,
  Layers,
  ScrollText,
  Terminal,
  Bell,
  Check,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for notifications demo
function NotificationDemo() {
  const { notifications, addNotification, removeNotification } = useNotifications();
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {(["success", "error", "warning", "info"] as const).map((type) => (
          <button
            key={type}
            onClick={() =>
              addNotification({
                title: `${type.charAt(0).toUpperCase() + type.slice(1)} notification`,
                description: "This is a demo notification that auto-dismisses.",
                type,
                duration: 4000,
              })
            }
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              type === "success" &&
                "bg-green-900/50 border border-green-800/50 hover:bg-green-900/80 text-green-300",
              type === "error" &&
                "bg-red-900/50 border border-red-800/50 hover:bg-red-900/80 text-red-300",
              type === "warning" &&
                "bg-yellow-900/50 border border-yellow-800/50 hover:bg-yellow-900/80 text-yellow-300",
              type === "info" &&
                "bg-blue-900/50 border border-blue-800/50 hover:bg-blue-900/80 text-blue-300"
            )}
          >
            {type}
          </button>
        ))}
      </div>
      <NotificationStack notifications={notifications} onRemove={removeNotification} />
    </div>
  );
}

// Helper for Modal Demo
function ModalDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-center">
        <MorphingModalTrigger
          layoutId="modal-demo"
          onClick={() => setModalOpen(true)}
          className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors max-w-xs"
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
        <div className="pt-4">
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
}

// Helper for Drawer Demo
function DrawerDemo() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-center">
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-medium"
        >
          Open Drawer
        </button>
      </div>
      <DrawerSlide isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <h3 className="text-xl font-bold mb-4">Drawer Content</h3>
        <p className="text-neutral-400 mb-4">
          This drawer slides in from the right with spring physics. You can drag it to dismiss.
        </p>
        <button
          onClick={() => setDrawerOpen(false)}
          className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm"
        >
          Close Drawer
        </button>
      </DrawerSlide>
    </>
  );
}

export const componentDemos: Record<string, React.ReactNode> = {
  "moving-border": (
    <div className="flex flex-wrap gap-6 items-center justify-center p-10">
      <Button
        borderRadius="1.75rem"
        className="bg-transparent text-white border-neutral-200 dark:border-slate-800"
      >
        Click me
      </Button>
      <Button
        borderRadius="1rem"
        className="bg-transparent text-white border-neutral-200 dark:border-slate-800"
        containerClassName="h-12 w-48"
      >
        Rounded Button
      </Button>
    </div>
  ),
  "typewriter-text": (
    <div className="space-y-6 text-center p-10">
      <div className="text-3xl font-bold">
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
  ),
  "3d-tilt-card": (
    <div className="flex flex-wrap gap-8 items-center justify-center p-10">
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
  ),
  "spotlight-card": (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
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
  ),
  "aurora-background": (
    <div className="rounded-xl overflow-hidden border border-neutral-800 h-[400px] w-full relative">
      <AuroraBackground className="min-h-0 h-full rounded-xl">
        <div className="text-center z-10">
          <h3 className="text-2xl font-bold mb-2">Aurora Background</h3>
          <p className="text-neutral-400">Beautiful animated gradients</p>
        </div>
      </AuroraBackground>
    </div>
  ),
  "animated-tabs": (
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
  ),
  "magnetic-button": (
    <div className="flex flex-wrap gap-8 items-center justify-center p-20">
      <MagneticButton>Hover near me</MagneticButton>
      <MagneticButton
        magneticStrength={0.5}
        magneticRadius={200}
        className="bg-gradient-to-b from-purple-700 to-purple-900"
      >
        Stronger pull
      </MagneticButton>
    </div>
  ),
  "infinite-marquee": (
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
  ),
  "scroll-reveal": (
    <div className="p-10">
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
  ),
  "skeleton-shimmer": (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
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
  ),
  "morphing-modal": <ModalDemo />,
  "gradient-text-reveal": (
    <div className="space-y-8 text-center p-10">
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
  ),
  "scramble-text": (
    <div className="space-y-6 text-center p-10">
      <ScrambleText text="UNIQUEUI COMPONENTS" className="text-3xl font-bold tracking-wider" />
      <ScrambleText
        text="Hover to scramble again"
        triggerOnView={false}
        className="text-lg text-neutral-400 cursor-pointer"
      />
    </div>
  ),
  "meteors-card": (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
      <MeteorsCard>
        <h3 className="text-xl font-bold mb-2">Meteors Effect</h3>
        <p className="text-neutral-400 text-sm">
          Watch the shooting stars fall through this card&apos;s background.
        </p>
      </MeteorsCard>
      <MeteorsCard meteorColor="#a855f7" meteorCount={30}>
        <h3 className="text-xl font-bold mb-2 text-purple-200">Purple Meteors</h3>
        <p className="text-purple-300/60 text-sm">Custom colored meteors with extra density.</p>
      </MeteorsCard>
    </div>
  ),
  "flip-card": (
    <div className="flex flex-wrap gap-8 items-center justify-center p-10">
      <FlipCard
        className="w-60 h-40"
        front={
          <div className="flex items-center justify-center h-full">
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
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-bold">Click to flip</p>
          </div>
        }
        back={
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-bold text-green-400">Click again!</p>
          </div>
        }
      />
    </div>
  ),
  "dot-grid-background": (
    <div className="p-10 w-full">
      <DotGridBackground className="rounded-xl h-[300px] flex items-center justify-center w-full">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Interactive Dots</h3>
          <p className="text-neutral-400">Move your cursor around</p>
        </div>
      </DotGridBackground>
    </div>
  ),
  "floating-dock": (
    <div className="flex items-center justify-center p-20">
      <FloatingDock
        items={[
          { id: "home", icon: <Ghost className="w-5 h-5" />, label: "Home" },
          { id: "search", icon: <Sparkles className="w-5 h-5" />, label: "Search" },
          { id: "layers", icon: <Layers className="w-5 h-5" />, label: "Layers" },
          { id: "scroll", icon: <ScrollText className="w-5 h-5" />, label: "Scroll" },
          { id: "terminal", icon: <Terminal className="w-5 h-5" />, label: "Terminal" },
        ]}
      />
    </div>
  ),
  "confetti-burst": (
    <div className="flex items-center justify-center p-20">
      <ConfettiBurst className="rounded-xl p-12 border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors cursor-pointer">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">🎉 Click me!</h3>
          <p className="text-neutral-400 text-sm">Click anywhere on this card for confetti</p>
        </div>
      </ConfettiBurst>
    </div>
  ),
  "drawer-slide": <DrawerDemo />,
  "notification-stack": <NotificationDemo />,
  "animated-timeline": (
    <div className="p-10 w-full">
        <AnimatedTimeline
            items={[
            {
                id: "1",
                title: "Project Started",
                description: "Initial setup and planning for UniqueUI component library.",
                date: "Jan 2026",
                color: "#a855f7",
            },
            {
                id: "2",
                title: "Phase 1 Components",
                description: "Built the first 11 animated components including Moving Border and Typewriter Text.",
                date: "Jan 2026",
                color: "#ec4899",
            },
            {
                id: "3",
                title: "Phase 2 Components",
                description: "Added 10 more components including Flip Card, Meteors, and Notification Stack.",
                date: "Feb 2026",
                color: "#6366f1",
            },
            {
                id: "4",
                title: "CLI & Registry",
                description: "Built the CLI tool and component registry for easy installation.",
                date: "Feb 2026",
                color: "#10b981",
            },
            ]}
        />
    </div>
  ),
};
