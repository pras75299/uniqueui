"use client";

import { Button } from "@/components/ui/moving-border";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { TiltCard } from "@/components/ui/3d-tilt-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { InfiniteMarquee, MarqueeItem } from "@/components/ui/infinite-marquee";
import { ScrollRevealGroup } from "@/components/ui/scroll-reveal";
import {
  SkeletonShimmer,
  SkeletonCard,
} from "@/components/ui/skeleton-shimmer";
import {
  MorphingModal,
  MorphingModalTrigger,
} from "@/components/ui/morphing-modal";
import { GradientTextReveal } from "@/components/ui/gradient-text-reveal";
import { ScrambleText } from "@/components/ui/scramble-text";
import { MagneticText } from "@/components/ui/magnetic-text";
import { MeteorsCard } from "@/components/ui/meteors-card";
import { FlipCard } from "@/components/ui/flip-card";
import { DotGridBackground } from "@/components/ui/dot-grid-background";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { DrawerSlide } from "@/components/ui/drawer-slide";
import {
  NotificationStack,
  useNotifications,
} from "@/components/ui/notification-stack";
import { AnimatedTimeline } from "@/components/ui/animated-timeline";
import { NestedComments } from "@/components/ui/nested-comments";
import type { Comment } from "@/components/ui/nested-comments";
import { HoverRevealCard } from "@/components/ui/hover-reveal-card";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { ParticleField } from "@/components/ui/particle-field";
import { HorizontalScrollGallery } from "@/components/ui/horizontal-scroll-gallery";
import { RadialMenu } from "@/components/ui/radial-menu";
import { CursorTrail } from "@/components/ui/cursor-trail";
import Image from "next/image";
import { PenCursor } from "@/components/ui/pen-cursor";
import { InteractiveCursor } from "@/components/ui/interactive-cursor";
import GlowHeroSection from "@/components/ui/glow-hero-section";
import { LimelightNav } from "@/components/ui/limelight-nav";
import { MorphingCardStack } from "@/components/ui/morphing-card-stack";
import { MiniMacKeyboard } from "@/components/ui/mini-mac-keyboard";
import { MultiStepAuthCard } from "@/components/ui/multi-step-auth-card";
import { DataTable } from "@/components/ui/data-table";
import GlowingTextOutline from "@/components/ui/animated-glowing-text-outline";
import { ShinyText } from "@/components/ui/shiny-text";
import { OutlinedMegaMark } from "@/components/ui/outlined-mega-mark";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { CountUp } from "@/components/ui/count-up";
import { BorderBeam } from "@/components/ui/border-beam";
import { Ripple } from "@/components/ui/ripple";
import { WordRotate } from "@/components/ui/word-rotate";
import { ShootingStarsGrid } from "@/components/ui/shooting-stars-grid";
import { DynamicInfo } from "@/components/ui/dynamic-info";
import { MacbookMock } from "@/components/ui/macbook-mock";
import { LiquidGlassPanel } from "@/components/ui/liquid-glass-panel";
import { ShaderMeshGradient } from "@/components/ui/shader-mesh-gradient";
import { ChromaticAberrationReveal } from "@/components/ui/chromatic-aberration-reveal";
import { IridescentFoilButton } from "@/components/ui/iridescent-foil-button";
import { KineticVariableHeadline } from "@/components/ui/kinetic-variable-headline";
import { CausticLightCard } from "@/components/ui/caustic-light-card";
import { RefractiveCursorLens } from "@/components/ui/refractive-cursor-lens";
import { AmbientGlowCard } from "@/components/ui/ambient-glow-card";
import { ReferencePulseHero } from "@/components/ui/hero-reference-pulse";
import { IridescentSweepHero } from "@/components/ui/hero-iridescent-sweep";
import { LiquidAuroraMeshHero } from "@/components/ui/hero-liquid-aurora-mesh";
import { NoiseDotFieldHero } from "@/components/ui/hero-noise-dot-field";
import { LogoMarqueeHero } from "@/components/ui/hero-logo-marquee";
import { MagneticLettersHero } from "@/components/ui/hero-magnetic-letters";
import { TerminalHero } from "@/components/ui/hero-terminal";
import { FlowFieldHero } from "@/components/ui/hero-flow-field";
import { RadialBurstHero } from "@/components/ui/hero-radial-burst";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  Ghost,
  Sparkles,
  Layers,
  ScrollText,
  Terminal,
  Zap,
  Shield,
  Globe,
  Home as HomeIcon,
  Bookmark,
  PlusCircle,
  User,
  Settings,
  Compass,
  Bell,
  Palette,
  Clock,
  Link2,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DemoThemeProps = { theme?: "light" | "dark" };
export type DemoComponent = React.ComponentType<DemoThemeProps>;

// Helper for notifications demo
function NotificationDemo({ theme = "dark" }: DemoThemeProps) {
  const { notifications, addNotification, removeNotification } =
    useNotifications();
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {(["success", "error", "warning", "info"] as const).map((type) => (
          <button
            key={type}
            onClick={() =>
              addNotification({
                title: `${
                  type.charAt(0).toUpperCase() + type.slice(1)
                } notification`,
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
                "bg-blue-900/50 border border-blue-800/50 hover:bg-blue-900/80 text-blue-300",
            )}
          >
            {type}
          </button>
        ))}
      </div>
      <NotificationStack
        theme={theme}
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

function InteractiveCursorDemo({ theme = "dark" }: DemoThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[440px] w-full flex items-center justify-center overflow-hidden rounded-xl border",
        isDark
          ? "bg-neutral-950 border-neutral-800"
          : "bg-neutral-50 border-neutral-200",
      )}
    >
      {/* Ambient center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(168,85,247,0.08) 0%, transparent 80%)"
            : "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(124,58,237,0.06) 0%, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-8 select-none">
        {/* Eyebrow label */}
        <span
          className={cn(
            "text-[11px] font-mono tracking-[0.2em] uppercase pointer-events-none",
            isDark ? "text-purple-400/70" : "text-purple-600/70",
          )}
        >
          Spring Physics · Magnetic Snap · Click Particles
        </span>

        {/* Heading */}
        <h3
          className={cn(
            "text-4xl font-bold tracking-tight pointer-events-none",
            isDark
              ? "bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent"
              : "bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-transparent",
          )}
        >
          Interactive Cursor
        </h3>

        {/* Description */}
        <p
          className={cn(
            "max-w-xs text-sm leading-relaxed pointer-events-none",
            isDark ? "text-neutral-500" : "text-neutral-500",
          )}
        >
          Move inside this card. Hover buttons to see magnetic pull. Click
          anywhere for burst particles.
        </p>

        {/* Button row — each one is a magnetic target */}
        <div className="flex items-center gap-3 mt-1">
          <button
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-colors",
              isDark
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white",
            )}
          >
            Primary
          </button>
          <button
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors",
              isDark
                ? "border-neutral-700 text-neutral-300 hover:border-purple-500 hover:text-purple-300"
                : "border-neutral-300 text-neutral-600 hover:border-purple-400 hover:text-purple-700",
            )}
          >
            Secondary
          </button>
          <button
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-colors",
              isDark
                ? "text-neutral-500 hover:text-neutral-200"
                : "text-neutral-400 hover:text-neutral-800",
            )}
          >
            Ghost
          </button>
        </div>

        {/* Hint */}
        <p
          className={cn(
            "text-[11px] pointer-events-none mt-1",
            isDark ? "text-neutral-700" : "text-neutral-400",
          )}
        >
          Pass{" "}
          <code className={isDark ? "text-neutral-500" : "text-neutral-500"}>
            hideSystemCursor
          </code>{" "}
          to fully replace the native cursor
        </p>
      </div>

      <InteractiveCursor
        containerRef={containerRef}
        hideSystemCursor={false}
        color={isDark ? "#a855f7" : "#7c3aed"}
        clickColor={isDark ? "#c084fc" : "#8b5cf6"}
        trailColor={
          isDark ? "rgba(168, 85, 247, 0.35)" : "rgba(124, 58, 237, 0.25)"
        }
        glow={true}
        particleEffect={true}
        magneticPull={true}
      />
    </div>
  );
}

function PenCursorDemo({ theme = "dark" }: DemoThemeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[400px] w-full flex items-center justify-center p-12 rounded-xl overflow-hidden shadow-inner border",
        theme === "dark"
          ? "bg-neutral-950 border-neutral-800"
          : "bg-neutral-100 border-neutral-200",
      )}
    >
      <div className="text-center relative z-10 pointer-events-none select-none">
        <h3
          className={cn(
            "text-3xl font-bold bg-clip-text text-transparent mb-4",
            theme === "dark"
              ? "bg-gradient-to-br from-white to-neutral-500"
              : "bg-gradient-to-br from-neutral-900 to-neutral-600",
          )}
        >
          Ribbon trail
        </h3>
        <p
          className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}
        >
          Move your mouse — a physics-driven ribbon trails the pointer.
        </p>
      </div>
      <PenCursor
        containerRef={containerRef}
        trailLength={40}
        maxWidth={1}
        minWidth={1}
        colorHead={theme === "dark" ? "159, 175, 155" : "100, 80, 200"}
        colorTail={theme === "dark" ? "198, 167, 106" : "180, 120, 230"}
        alphaHead={0.95}
        alphaTail={0}
        damping={0.55}
        speedInfluence={0.8}
        speedMax={500}
      />
    </div>
  );
}

// Helper for Modal Demo
function ModalDemo({ theme = "dark" }: DemoThemeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-center">
        <MorphingModalTrigger
          theme={theme}
          layoutId="modal-demo"
          onClick={() => setModalOpen(true)}
          className={cn(
            "p-6 rounded-xl border transition-colors max-w-xs",
            theme === "dark"
              ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
              : "bg-neutral-100 border-neutral-200 hover:border-neutral-300",
          )}
        >
          <h3
            className={cn(
              "text-lg font-bold mb-2",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            Click to open modal
          </h3>
          <p
            className={cn(
              "text-sm",
              theme === "dark" ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            This card morphs into a modal with spring physics.
          </p>
        </MorphingModalTrigger>
      </div>
      <MorphingModal
        theme={theme}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        layoutId="modal-demo"
      >
        <div className="pt-4">
          <h3
            className={cn(
              "text-2xl font-bold mb-4",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            Morphing Modal
          </h3>
          <p
            className={cn(
              "mb-6",
              theme === "dark" ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            This modal expands from the trigger element with spring-based
            animation. It supports Escape key to close, click-outside to
            dismiss, and an animated close button.
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
              className={cn(
                "px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                theme === "dark"
                  ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700",
              )}
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
function DrawerDemo({ theme = "dark" }: DemoThemeProps) {
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
      <DrawerSlide
        theme={theme}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <h3
          className={cn(
            "text-xl font-bold mb-4",
            theme === "dark" ? "text-white" : "text-neutral-900",
          )}
        >
          Drawer Content
        </h3>
        <p
          className={cn(
            "mb-4",
            theme === "dark" ? "text-neutral-400" : "text-neutral-600",
          )}
        >
          This drawer slides in from the right with spring physics. You can drag
          it to dismiss.
        </p>
        <button
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors text-sm",
            theme === "dark"
              ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700",
          )}
        >
          Close Drawer
        </button>
      </DrawerSlide>
    </>
  );
}

// Helper for Nested Comments demo
const DEMO_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Alex Kim",
    content:
      "This component is incredible! The spring animations feel so natural and snappy.",
    timestamp: "2 hours ago",
    likes: 14,
    replies: [
      {
        id: "1-1",
        author: "Sarah Chen",
        content:
          "Agreed! The collapse animation is especially smooth. Love the thread lines too.",
        timestamp: "1 hour ago",
        likes: 6,
        replies: [
          {
            id: "1-1-1",
            author: "Alex Kim",
            content:
              "Thanks! Motion.dev's layout animations make nested content effortless to build.",
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
    content:
      "Love the inline reply box with ⌘+Enter shortcut. Very intuitive UX — try clicking Reply!",
    timestamp: "3 hours ago",
    likes: 9,
  },
  {
    id: "3",
    author: "Maya Patel",
    content:
      "The like button spring animation is a nice touch. Small details make a big difference.",
    timestamp: "4 hours ago",
    likes: 21,
  },
];

function NestedCommentsDemo({ theme = "dark" }: DemoThemeProps) {
  return (
    <div className="w-full p-6 overflow-y-auto max-h-[520px]">
      <NestedComments
        theme={theme}
        comments={DEMO_COMMENTS}
        maxDepth={4}
        accentColor="#8b5cf6"
      />
    </div>
  );
}

const DATA_TABLE_DEMO_LOCATIONS = [
  "San Francisco",
  "New York",
  "Chicago",
  "Seattle",
  "Austin",
  "Boston",
  "Denver",
  "Miami",
];

function withDemoLocation<T extends Record<string, unknown>>(
  rows: T[],
): (T & { location: string })[] {
  return rows.map((row, index) => {
    const existing = (row as { location?: unknown }).location;
    return {
      ...row,
      location:
        typeof existing === "string"
          ? existing
          : DATA_TABLE_DEMO_LOCATIONS[
              index % DATA_TABLE_DEMO_LOCATIONS.length
            ]!,
    };
  });
}

/** Extra wide columns for data-table freeze demos so horizontal scroll is obvious in previews. */
const DATA_TABLE_FREEZE_EXTRA_FIELDS = [
  {
    project: "Orion",
    division: "Platform core",
    site: "SF-01",
    timezone: "PT",
    costCenter: "CC-4100",
  },
  {
    project: "Nova",
    division: "Product design",
    site: "NYC-04",
    timezone: "ET",
    costCenter: "CC-2200",
  },
  {
    project: "Atlas",
    division: "Growth GTM",
    site: "CHI-02",
    timezone: "CT",
    costCenter: "CC-1800",
  },
  {
    project: "Pulse",
    division: "Platform core",
    site: "SEA-01",
    timezone: "PT",
    costCenter: "CC-4100",
  },
  {
    project: "Vertex",
    division: "Product design",
    site: "AUS-01",
    timezone: "CT",
    costCenter: "CC-3300",
  },
  {
    project: "Helix",
    division: "Growth GTM",
    site: "DEN-01",
    timezone: "MT",
    costCenter: "CC-5200",
  },
  {
    project: "Quark",
    division: "Platform core",
    site: "PDX-02",
    timezone: "PT",
    costCenter: "CC-4100",
  },
  {
    project: "Echo",
    division: "Product design",
    site: "BOS-03",
    timezone: "ET",
    costCenter: "CC-2200",
  },
] as const;

function withDemoFreezeExtras<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map((row, index) => ({
    ...row,
    ...DATA_TABLE_FREEZE_EXTRA_FIELDS[
      index % DATA_TABLE_FREEZE_EXTRA_FIELDS.length
    ],
  }));
}

/** Keep in sync with `docs.usageCode` in registry/components/hero-logo-marquee.json. */
const LOGO_MARQUEE_DEMO_LOGOS = [
  "Acme",
  "Globex",
  "Soylent",
  "Initech",
  "Hooli",
  "Umbrella",
  "Stark",
  "Wayne",
  "Cyberdyne",
  "Wonka",
  "Tyrell",
  "Aperture",
] as const;

const LOGO_MARQUEE_DEMO_SECONDARY_LOGOS = [
  "Aperture",
  "Tyrell",
  "Wonka",
  "Cyberdyne",
  "Wayne",
  "Stark",
  "Umbrella",
  "Hooli",
  "Initech",
  "Soylent",
  "Globex",
  "Acme",
] as const;

function LogoMarqueeDemoHeadline() {
  return (
    <>
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
        Trusted across teams
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        The platform shipping teams ship with.
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg">
        From scrappy seed startups to public companies — UniqueUI components
        ship in production every day.
      </p>
    </>
  );
}
