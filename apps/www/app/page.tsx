"use client";

import { motion } from "motion/react";
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
import { Check, Copy, Terminal, Ghost, Sparkles, Layers, MousePointer, ScrollText, Loader2, Maximize2, Palette, Type, Flame, RotateCw, Grid3x3, Anchor, PartyPopper, PanelRight, Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotifications();

  const copyCommand = () => {
    navigator.clipboard.writeText("npm i -g uniqueui-cli && uniqueui init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-950 text-white selection:bg-purple-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex p-4 md:p-8 pt-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md pb-6 pt-8 font-bold text-neutral-400 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-neutral-900/30 lg:p-4">
          UniqueUI &nbsp;
          <span className="font-normal text-neutral-500">v1.0.0</span>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 text-neutral-400 hover:text-white transition-colors"
            href="https://github.com/pras75299/uniqueui"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <span className="font-bold text-lg text-white">Prashant</span>
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center mt-20 lg:mt-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 mb-6 inline-block">
            Beta Release 0.1.0
          </span>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 tracking-tight mb-4">
            Build Interfaces <br />That Stand Out.
          </h1>
          <div className="mt-2 mb-8 text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto flex items-center justify-center gap-2 flex-wrap">
            <span>Beautiful, animated</span>
            <TypewriterText
              words={["components", "buttons", "cards", "modals", "backgrounds"]}
              className="text-purple-400 font-semibold"
            />
            <span>for modern web apps.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
          <div className="relative flex items-center bg-black rounded-lg leading-none">
            <div className="flex items-center px-6 py-4">
              <Terminal className="w-5 h-5 mr-3 text-neutral-400" />
              <code className="font-mono text-sm text-neutral-300">
                npm i -g uniqueui-cli && uniqueui init
              </code>
            </div>
            <button
              onClick={copyCommand}
              className="p-4 hover:bg-neutral-900 rounded-r-lg transition-colors border-l border-neutral-800"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-neutral-400" />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="z-10 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-3 lg:text-left gap-8 mt-24 px-4">
        <Card
          title="Install"
          description="Get started quickly by installing our CLI tool globally on your machine."
          icon={<Terminal className="w-6 h-6" />}
        />
        <Card
          title="Add Components"
          description="Add components to your project with a single command. No complex setup."
          icon={<Ghost className="w-6 h-6" />}
        />
        <Card
          title="Customizable"
          description="Built on top of Tailwind CSS and Motion.dev. Fully customizable and accessible."
          icon={<Sparkles className="w-6 h-6" />}
        />
      </div>

      {/* ========== COMPONENT SHOWCASE ========== */}
      <div className="w-full max-w-6xl mt-32 relative z-10 px-4 space-y-24">
        <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
          Component Showcase
        </h2>

        {/* 1. Moving Border */}
        <ShowcaseSection
          title="Moving Border"
          description="SVG-path-tracing animated border that orbits a button or card."
          installCmd="uniqueui add moving-border"
          icon={<Sparkles className="w-5 h-5" />}
        >
          <div className="flex flex-wrap gap-6 items-center justify-center">
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
        </ShowcaseSection>

        {/* 2. Typewriter Text */}
        <ShowcaseSection
          title="Typewriter Text"
          description="Character-by-character typing with blinking cursor, configurable speed, and delete-retype loop."
          installCmd="uniqueui add typewriter-text"
          icon={<Terminal className="w-5 h-5" />}
        >
          <div className="space-y-6 text-center">
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
                words={["Building amazing user interfaces...", "With beautiful animations...", "That stand out from the crowd."]}
                typingSpeed={50}
                deletingSpeed={30}
                delayBetweenWords={2000}
              />
            </div>
          </div>
        </ShowcaseSection>

        {/* 3. 3D Tilt Card */}
        <ShowcaseSection
          title="3D Tilt Card"
          description="Perspective-shifting card that tilts toward the cursor with parallax layers and glare overlay."
          installCmd="uniqueui add 3d-tilt-card"
          icon={<Layers className="w-5 h-5" />}
        >
          <div className="flex flex-wrap gap-8 items-center justify-center">
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
        </ShowcaseSection>

        {/* 4. Spotlight Card */}
        <ShowcaseSection
          title="Spotlight Card"
          description="Card with a radial spotlight that follows the mouse cursor across its surface."
          installCmd="uniqueui add spotlight-card"
          icon={<MousePointer className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotlightCard>
              <h3 className="text-xl font-bold mb-2">Hover for spotlight</h3>
              <p className="text-neutral-400 text-sm">Move your mouse over the card to reveal a tracking spotlight effect.</p>
            </SpotlightCard>
            <SpotlightCard spotlightColor="rgba(232, 121, 249, 0.1)" spotlightSize={300}>
              <h3 className="text-xl font-bold mb-2">Custom spotlight</h3>
              <p className="text-neutral-400 text-sm">Different color and size for the spotlight effect.</p>
            </SpotlightCard>
          </div>
        </ShowcaseSection>

        {/* 5. Aurora Background */}
        <ShowcaseSection
          title="Aurora Background"
          description="Flowing aurora borealis gradient animation using layered blurred blobs."
          installCmd="uniqueui add aurora-background"
          icon={<Sparkles className="w-5 h-5" />}
        >
          <div className="rounded-xl overflow-hidden border border-neutral-800 h-[300px]">
            <AuroraBackground className="min-h-0 h-full rounded-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Aurora Background</h3>
                <p className="text-neutral-400">Beautiful animated gradients</p>
              </div>
            </AuroraBackground>
          </div>
        </ShowcaseSection>

        {/* 6. Animated Tabs */}
        <ShowcaseSection
          title="Animated Tabs"
          description="Tab bar with a sliding pill that morphs between active tabs using layout animation."
          installCmd="uniqueui add animated-tabs"
          icon={<Layers className="w-5 h-5" />}
        >
          <div className="max-w-md mx-auto">
            <AnimatedTabs
              tabs={[
                {
                  id: "design",
                  label: "Design",
                  content: (
                    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm">
                      Build stunning interfaces with our design system. Every component is crafted with attention to detail.
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
        </ShowcaseSection>

        {/* 7. Magnetic Button */}
        <ShowcaseSection
          title="Magnetic Button"
          description="Button that stretches toward the cursor when nearby and snaps back with spring physics."
          installCmd="uniqueui add magnetic-button"
          icon={<MousePointer className="w-5 h-5" />}
        >
          <div className="flex flex-wrap gap-8 items-center justify-center">
            <MagneticButton>Hover near me</MagneticButton>
            <MagneticButton magneticStrength={0.5} magneticRadius={200} className="bg-gradient-to-b from-purple-700 to-purple-900">
              Stronger pull
            </MagneticButton>
          </div>
        </ShowcaseSection>

        {/* 8. Infinite Marquee */}
        <ShowcaseSection
          title="Infinite Marquee"
          description="Seamless infinite-scrolling ticker with pause-on-hover and variable speed."
          installCmd="uniqueui add infinite-marquee"
          icon={<ScrollText className="w-5 h-5" />}
        >
          <div className="space-y-6">
            <InfiniteMarquee speed={30}>
              {["React", "Next.js", "TypeScript", "Tailwind", "Motion", "UniqueUI", "Vercel", "Node.js"].map((item) => (
                <MarqueeItem key={item}>
                  <span className="text-sm font-medium text-neutral-300">{item}</span>
                </MarqueeItem>
              ))}
            </InfiniteMarquee>
            <InfiniteMarquee speed={20} direction="right">
              {["⚡ Fast", "🎨 Beautiful", "♿ Accessible", "📱 Responsive", "🔧 Customizable", "🚀 Production Ready"].map((item) => (
                <MarqueeItem key={item} className="bg-purple-950/30 border-purple-800/50">
                  <span className="text-sm font-medium text-purple-300">{item}</span>
                </MarqueeItem>
              ))}
            </InfiniteMarquee>
          </div>
        </ShowcaseSection>

        {/* 9. Scroll Reveal */}
        <ShowcaseSection
          title="Scroll Reveal"
          description="Elements animate into view when they enter the viewport, with 6 animation presets."
          installCmd="uniqueui add scroll-reveal"
          icon={<ScrollText className="w-5 h-5" />}
        >
          <ScrollRevealGroup animation="fade-up" staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </ShowcaseSection>

        {/* 10. Skeleton Shimmer */}
        <ShowcaseSection
          title="Skeleton Shimmer"
          description="Skeleton loading placeholders with animated shimmer gradient sweep and pulse fade."
          installCmd="uniqueui add skeleton-shimmer"
          icon={<Loader2 className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </ShowcaseSection>

        {/* 11. Morphing Modal */}
        <ShowcaseSection
          title="Morphing Modal"
          description="Modal that expands from the trigger element with spring physics and backdrop blur."
          installCmd="uniqueui add morphing-modal"
          icon={<Maximize2 className="w-5 h-5" />}
        >
          <div className="flex items-center justify-center">
            <MorphingModalTrigger
              layoutId="modal-demo"
              onClick={() => setModalOpen(true)}
              className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors max-w-xs"
            >
              <h3 className="text-lg font-bold mb-2">Click to open modal</h3>
              <p className="text-neutral-400 text-sm">This card morphs into a modal with spring physics.</p>
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
                This modal expands from the trigger element with spring-based animation. 
                It supports Escape key to close, click-outside to dismiss, and 
                an animated close button.
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
        </ShowcaseSection>

        {/* 12. Gradient Text Reveal */}
        <ShowcaseSection
          title="Gradient Text Reveal"
          description="Word-by-word text reveal with gradient coloring and blur-to-clear spring animation."
          installCmd="uniqueui add gradient-text-reveal"
          icon={<Palette className="w-5 h-5" />}
        >
          <div className="space-y-8 text-center">
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
        </ShowcaseSection>

        {/* 13. Scramble Text */}
        <ShowcaseSection
          title="Scramble Text"
          description="Matrix-style text scramble effect that resolves characters left-to-right."
          installCmd="uniqueui add scramble-text"
          icon={<Type className="w-5 h-5" />}
        >
          <div className="space-y-6 text-center">
            <ScrambleText
              text="UNIQUEUI COMPONENTS"
              className="text-3xl font-bold tracking-wider"
            />
            <ScrambleText
              text="Hover to scramble again"
              triggerOnView={false}
              className="text-lg text-neutral-400 cursor-pointer"
            />
          </div>
        </ShowcaseSection>

        {/* 14. Meteors Card */}
        <ShowcaseSection
          title="Meteors Card"
          description="Card with animated meteor/shooting star particles falling through the background."
          installCmd="uniqueui add meteors-card"
          icon={<Flame className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MeteorsCard>
              <h3 className="text-xl font-bold mb-2">Meteors Effect</h3>
              <p className="text-neutral-400 text-sm">Watch the shooting stars fall through this card&apos;s background.</p>
            </MeteorsCard>
            <MeteorsCard meteorColor="#a855f7" meteorCount={30}>
              <h3 className="text-xl font-bold mb-2 text-purple-200">Purple Meteors</h3>
              <p className="text-purple-300/60 text-sm">Custom colored meteors with extra density.</p>
            </MeteorsCard>
          </div>
        </ShowcaseSection>

        {/* 15. Flip Card */}
        <ShowcaseSection
          title="Flip Card"
          description="3D card flip with spring physics, supporting hover or click triggers."
          installCmd="uniqueui add flip-card"
          icon={<RotateCw className="w-5 h-5" />}
        >
          <div className="flex flex-wrap gap-8 items-center justify-center">
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
        </ShowcaseSection>

        {/* 16. Dot Grid Background */}
        <ShowcaseSection
          title="Dot Grid Background"
          description="Interactive dot-grid pattern with a glowing cursor-following effect."
          installCmd="uniqueui add dot-grid-background"
          icon={<Grid3x3 className="w-5 h-5" />}
        >
          <DotGridBackground className="rounded-xl h-[250px] flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Interactive Dots</h3>
              <p className="text-neutral-400">Move your cursor around</p>
            </div>
          </DotGridBackground>
        </ShowcaseSection>

        {/* 17. Floating Dock */}
        <ShowcaseSection
          title="Floating Dock"
          description="macOS-style dock with magnetic scaling, spring physics, and tooltips."
          installCmd="uniqueui add floating-dock"
          icon={<Anchor className="w-5 h-5" />}
        >
          <div className="flex items-center justify-center">
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
        </ShowcaseSection>

        {/* 18. Confetti Burst */}
        <ShowcaseSection
          title="Confetti Burst"
          description="Click-triggered confetti particle explosion with customizable colors and physics."
          installCmd="uniqueui add confetti-burst"
          icon={<PartyPopper className="w-5 h-5" />}
        >
          <div className="flex items-center justify-center">
            <ConfettiBurst className="rounded-xl p-12 border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors cursor-pointer">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">🎉 Click me!</h3>
                <p className="text-neutral-400 text-sm">Click anywhere on this card for confetti</p>
              </div>
            </ConfettiBurst>
          </div>
        </ShowcaseSection>

        {/* 19. Drawer Slide */}
        <ShowcaseSection
          title="Drawer Slide"
          description="Slide-out drawer panel with drag-to-dismiss, spring physics, and backdrop blur."
          installCmd="uniqueui add drawer-slide"
          icon={<PanelRight className="w-5 h-5" />}
        >
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
            <p className="text-neutral-400 mb-4">This drawer slides in from the right with spring physics. You can drag it to dismiss.</p>
            <button
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm"
            >
              Close Drawer
            </button>
          </DrawerSlide>
        </ShowcaseSection>

        {/* 20. Notification Stack */}
        <ShowcaseSection
          title="Notification Stack"
          description="Stacked toast notifications with auto-dismiss progress, sliding animations, and multiple types."
          installCmd="uniqueui add notification-stack"
          icon={<Bell className="w-5 h-5" />}
        >
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
                  type === "success" && "bg-green-900/50 border border-green-800/50 hover:bg-green-900/80 text-green-300",
                  type === "error" && "bg-red-900/50 border border-red-800/50 hover:bg-red-900/80 text-red-300",
                  type === "warning" && "bg-yellow-900/50 border border-yellow-800/50 hover:bg-yellow-900/80 text-yellow-300",
                  type === "info" && "bg-blue-900/50 border border-blue-800/50 hover:bg-blue-900/80 text-blue-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          <NotificationStack
            notifications={notifications}
            onRemove={removeNotification}
          />
        </ShowcaseSection>

        {/* 21. Animated Timeline */}
        <ShowcaseSection
          title="Animated Timeline"
          description="Scroll-triggered timeline with staggered spring animations for each node."
          installCmd="uniqueui add animated-timeline"
          icon={<Clock className="w-5 h-5" />}
        >
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
        </ShowcaseSection>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-32 mb-16 px-4 relative z-10">
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
          <p>
            Built with ❤️ by{" "}
            <a href="https://github.com/pras75299" className="text-neutral-300 hover:text-white transition-colors">
              Prashant
            </a>
          </p>
          <p className="mt-2 text-neutral-600">
            UniqueUI — 70 animated components for modern web apps.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ─── Reusable Showcase Section ─── */
function ShowcaseSection({
  title,
  description,
  installCmd,
  icon,
  children,
}: {
  title: string;
  description: string;
  installCmd: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <ScrollReveal animation="fade-up" threshold={0.1}>
      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-neutral-500 text-sm mt-1">{description}</p>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-8">
          {children}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-400 max-w-fit">
          <Terminal className="w-3.5 h-3.5" />
          <span>{installCmd}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(installCmd);
            }}
            className="ml-2 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </ScrollReveal>
  );
}

/* ─── Feature Card ─── */
function Card({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group rounded-lg border border-neutral-800 bg-neutral-950/50 px-5 py-8 transition-colors hover:border-neutral-700 hover:bg-neutral-900/50"
    >
      <div className="mb-4 inline-block rounded-lg bg-neutral-900 p-3 text-neutral-200 group-hover:text-white">
        {icon}
      </div>
      <h2 className="mb-3 text-2xl font-semibold">
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className="m-0 max-w-[30ch] text-sm opacity-50">{description}</p>
    </motion.div>
  );
}
