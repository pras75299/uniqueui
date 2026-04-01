export type DocScenario = {
  title: string;
  description: string;
  code: string;
};

export type ComponentDocs = {
  slug: string;
  overview: string;
  scenarios: DocScenario[];
};

export const docsScenarios: Record<string, ComponentDocs> = {
  "typewriter-text": {
    slug: "typewriter-text",
    overview:
      "TypewriterText cycles through an array of words with a smooth typing and erasing animation. It's great for hero headings that need to convey multiple value propositions without cluttering the layout.",
    scenarios: [
      {
        title: "Hero headline rotator",
        description:
          "Swap your hero subtitle or adjective with a typewriter that cycles through your key benefits.",
        code: `import { TypewriterText } from "@/components/ui/typewriter-text";

export default function HeroHeadline() {
  return (
    <h1 className="text-5xl font-bold text-white">
      Build{" "}
      <TypewriterText
        words={["faster", "smarter", "beautifully"]}
        className="text-purple-400"
      />
      <br />
      with UniqueUI
    </h1>
  );
}`,
      },
      {
        title: "Loading / processing indicator",
        description:
          "Use a single looping word to hint that background work is in progress.",
        code: `import { TypewriterText } from "@/components/ui/typewriter-text";

export default function ProcessingBadge() {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400">
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <TypewriterText
        words={["Analyzing…", "Optimizing…", "Almost done…"]}
        typingSpeed={60}
        deletingSpeed={40}
        pauseDuration={1200}
      />
    </div>
  );
}`,
      },
      {
        title: "Feature tagline in a navbar",
        description:
          "Animate a short tagline beside your logo to keep visitors engaged right from the header.",
        code: `import { TypewriterText } from "@/components/ui/typewriter-text";

export default function NavTagline() {
  return (
    <nav className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800">
      <span className="font-bold text-white">UniqueUI</span>
      <span className="text-neutral-600">·</span>
      <TypewriterText
        words={["Copy-paste components", "Zero design system lock-in", "Motion-first"]}
        className="text-xs text-neutral-400 font-mono"
        typingSpeed={55}
      />
    </nav>
  );
}`,
      },
    ],
  },

  "aurora-background": {
    slug: "aurora-background",
    overview:
      "AuroraBackground renders a shifting, color-cycling radial gradient behind your content. It uses a CSS keyframe animation that's optimized for performance and respects prefers-reduced-motion.",
    scenarios: [
      {
        title: "Full-page hero section",
        description:
          "Wrap your entire landing hero with the aurora to create an immediate cinematic impression.",
        code: `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function HeroSection() {
  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 z-10 relative">
        <h1 className="text-6xl font-bold text-white">
          Ship beautiful UIs
        </h1>
        <p className="text-neutral-300 text-xl max-w-xl mx-auto">
          Animated components that make your product feel alive.
        </p>
        <button className="mt-6 px-8 py-3 bg-white text-black rounded-full font-semibold">
          Get started
        </button>
      </div>
    </AuroraBackground>
  );
}`,
      },
      {
        title: "Feature section banner",
        description:
          "Apply the aurora to a single section mid-page to break up a long-scrolling layout.",
        code: `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function FeatureBanner() {
  return (
    <AuroraBackground
      className="rounded-3xl overflow-hidden py-24 px-8 text-center"
      showRadialGradient={false}
    >
      <span className="text-xs uppercase tracking-widest text-purple-300 font-semibold">
        New in v2
      </span>
      <h2 className="mt-3 text-4xl font-bold text-white">
        Bento Grid layouts
      </h2>
      <p className="mt-2 text-neutral-400 max-w-md mx-auto">
        Drag-and-drop grid sections that adapt to any content type.
      </p>
    </AuroraBackground>
  );
}`,
      },
      {
        title: "CTA section with custom colors",
        description:
          "Customize the aurora colors to match your brand palette on a bottom-of-page conversion section.",
        code: `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function CTASection() {
  return (
    <AuroraBackground
      className="py-32 text-center"
      colors={["#7c3aed", "#2563eb", "#7c3aed"]}
    >
      <div className="relative z-10 space-y-6">
        <h2 className="text-5xl font-bold text-white">
          Ready to build something great?
        </h2>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-neutral-900 rounded-full font-semibold">
            Start free
          </button>
          <button className="px-6 py-3 border border-white/30 text-white rounded-full">
            View docs
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
}`,
      },
    ],
  },

  "spotlight-card": {
    slug: "spotlight-card",
    overview:
      "SpotlightCard tracks your cursor and projects a soft radial light on the card surface, creating a sense of physical depth. Ideal anywhere you need premium-feeling content cards.",
    scenarios: [
      {
        title: "Pricing tier card",
        description:
          "Make pricing options feel tactile and premium — spotlight highlights the selected plan naturally.",
        code: `import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function PricingCard() {
  return (
    <SpotlightCard theme="dark" className="p-8 max-w-sm">
      <div className="space-y-4">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
          Pro
        </span>
        <p className="text-4xl font-bold text-white">
          $29<span className="text-lg text-neutral-400">/mo</span>
        </p>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>✓ Unlimited components</li>
          <li>✓ Commercial license</li>
          <li>✓ Priority support</li>
        </ul>
        <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold transition-colors">
          Get started
        </button>
      </div>
    </SpotlightCard>
  );
}`,
      },
      {
        title: "Team member profile card",
        description:
          "Spotlight turns a standard team grid into an interactive, warm experience.",
        code: `import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function TeamMemberCard() {
  return (
    <SpotlightCard theme="dark" className="p-6 text-center">
      <img
        src="/avatar.jpg"
        alt="Prashant"
        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-white font-semibold text-lg">Prashant Kumar</h3>
      <p className="text-neutral-400 text-sm">Founder · Full-stack engineer</p>
      <div className="mt-4 flex justify-center gap-3">
        <a href="#" className="text-xs text-purple-400 hover:underline">GitHub</a>
        <a href="#" className="text-xs text-purple-400 hover:underline">Twitter</a>
      </div>
    </SpotlightCard>
  );
}`,
      },
      {
        title: "Feature highlight card",
        description:
          "Wrap each feature description in a spotlight card to make your feature grid feel alive.",
        code: `import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Zap } from "lucide-react";

export default function FeatureCard() {
  return (
    <SpotlightCard theme="dark" className="p-6">
      <div className="p-2.5 w-fit rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4">
        <Zap className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-white font-semibold mb-2">Instant installs</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">
        One CLI command drops a single-file component into your project.
        No dependency hell, no config files.
      </p>
    </SpotlightCard>
  );
}`,
      },
    ],
  },

  "morphing-modal": {
    slug: "morphing-modal",
    overview:
      "MorphingModal animates open/close with a spring-driven scale and blur, making overlays feel fluid rather than jarring. Supports a trigger element for shared-layout animations.",
    scenarios: [
      {
        title: "Confirmation dialog",
        description:
          "Use the modal for destructive actions — a focused modal prevents accidental clicks better than inline prompts.",
        code: `import { MorphingModal } from "@/components/ui/morphing-modal";
import { useState } from "react";

export default function ConfirmDelete() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm"
      >
        Delete project
      </button>

      <MorphingModal open={open} onClose={() => setOpen(false)}>
        <div className="p-6 space-y-4 max-w-sm">
          <h2 className="text-lg font-semibold text-white">Are you sure?</h2>
          <p className="text-sm text-neutral-400">
            This will permanently delete the project and all its data. This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-sm"
            >
              Cancel
            </button>
            <button className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">
              Delete
            </button>
          </div>
        </div>
      </MorphingModal>
    </>
  );
}`,
      },
      {
        title: "Image / media preview",
        description:
          "Expand a thumbnail into a full preview with a smooth morph transition.",
        code: `import { MorphingModal } from "@/components/ui/morphing-modal";
import { useState } from "react";

export default function ImagePreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src="/preview-thumb.jpg"
        alt="Preview"
        onClick={() => setOpen(true)}
        className="w-32 h-20 object-cover rounded-lg cursor-zoom-in"
      />

      <MorphingModal open={open} onClose={() => setOpen(false)}>
        <div className="p-2">
          <img
            src="/preview-full.jpg"
            alt="Full preview"
            className="max-w-2xl w-full rounded-xl object-cover"
          />
        </div>
      </MorphingModal>
    </>
  );
}`,
      },
      {
        title: "Multi-step onboarding modal",
        description:
          "Use internal state to drive a step-by-step flow inside a single modal instance.",
        code: `import { MorphingModal } from "@/components/ui/morphing-modal";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const steps = ["Welcome", "Choose plan", "You're ready"];

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <MorphingModal open={open} onClose={onClose}>
      <div className="p-8 w-full max-w-md space-y-6">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={\`h-1 flex-1 rounded-full transition-colors \${
                i <= step ? "bg-purple-500" : "bg-neutral-700"
              }\`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-bold text-white">{steps[step]}</h2>
            <p className="text-sm text-neutral-400">Step {step + 1} of {steps.length}</p>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onClose()}
          className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-medium"
        >
          {step < steps.length - 1 ? "Continue" : "Finish"}
        </button>
      </div>
    </MorphingModal>
  );
}`,
      },
    ],
  },

  "animated-tabs": {
    slug: "animated-tabs",
    overview:
      "AnimatedTabs uses a layoutId-driven underline or pill indicator to transition between tabs with a fluid spring. The active indicator follows the selected tab without a hard jump.",
    scenarios: [
      {
        title: "Settings panel",
        description:
          "A classic tab bar for separating profile, notifications, and security settings.",
        code: `import { AnimatedTabs } from "@/components/ui/animated-tabs";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
];

export default function SettingsPanel() {
  return (
    <div className="max-w-2xl space-y-6">
      <AnimatedTabs tabs={tabs} defaultTab="profile" />
      {/* Render panel content based on active tab */}
    </div>
  );
}`,
      },
      {
        title: "Dashboard content switcher",
        description:
          "Switch between weekly, monthly, and yearly data views in a dashboard.",
        code: `import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { useState } from "react";

const ranges = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "1y", label: "1 year" },
];

export default function DateRangeTabs() {
  const [range, setRange] = useState("30d");

  return (
    <div>
      <AnimatedTabs
        tabs={ranges}
        defaultTab="30d"
        onChange={setRange}
        size="sm"
      />
      <p className="mt-4 text-sm text-neutral-400">
        Showing data for: {range}
      </p>
    </div>
  );
}`,
      },
      {
        title: "Product feature showcase tabs",
        description:
          "Let marketing highlight different product features with animated tab transitions.",
        code: `import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const features = [
  { id: "speed", label: "Speed", content: "Deploy components in seconds with the CLI." },
  { id: "design", label: "Design", content: "Motion-first animations out of the box." },
  { id: "dx", label: "DX", content: "Single-file components, zero config." },
];

export default function FeatureTabs() {
  const [active, setActive] = useState("speed");
  const feature = features.find(f => f.id === active)!;

  return (
    <div className="space-y-6 max-w-lg">
      <AnimatedTabs tabs={features} defaultTab="speed" onChange={setActive} />
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-neutral-300"
        >
          {feature.content}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}`,
      },
    ],
  },

  "floating-dock": {
    slug: "floating-dock",
    overview:
      "FloatingDock renders a macOS-style icon dock with a magnetic magnification effect. Icons near the cursor scale up smoothly, making navigation feel interactive and playful.",
    scenarios: [
      {
        title: "App bottom navigation",
        description:
          "Replace a static mobile nav bar with a floating dock for a more expressive feel.",
        code: `import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Search, Bell, User, Settings } from "lucide-react";

const navItems = [
  { title: "Home", icon: <Home className="w-5 h-5" />, href: "/" },
  { title: "Search", icon: <Search className="w-5 h-5" />, href: "/search" },
  { title: "Notifications", icon: <Bell className="w-5 h-5" />, href: "/notifications" },
  { title: "Profile", icon: <User className="w-5 h-5" />, href: "/profile" },
  { title: "Settings", icon: <Settings className="w-5 h-5" />, href: "/settings" },
];

export default function AppNav() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <FloatingDock items={navItems} />
    </div>
  );
}`,
      },
      {
        title: "Social media quick-share dock",
        description:
          "A share toolbar that floats alongside article content for quick social sharing.",
        code: `import { FloatingDock } from "@/components/ui/floating-dock";
import { Twitter, Linkedin, Link2, Bookmark } from "lucide-react";

const shareItems = [
  { title: "Share on X", icon: <Twitter className="w-5 h-5" />, href: "#" },
  { title: "Share on LinkedIn", icon: <Linkedin className="w-5 h-5" />, href: "#" },
  { title: "Copy link", icon: <Link2 className="w-5 h-5" />, href: "#" },
  { title: "Bookmark", icon: <Bookmark className="w-5 h-5" />, href: "#" },
];

export default function ShareDock() {
  return (
    <aside className="fixed right-6 top-1/2 -translate-y-1/2 hidden lg:block">
      <FloatingDock items={shareItems} direction="vertical" />
    </aside>
  );
}`,
      },
      {
        title: "Document editor toolbar",
        description:
          "A compact formatting toolbar with magnification for a rich-text or canvas editor.",
        code: `import { FloatingDock } from "@/components/ui/floating-dock";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, List, Image } from "lucide-react";

const toolbarItems = [
  { title: "Bold", icon: <Bold className="w-4 h-4" />, href: "#" },
  { title: "Italic", icon: <Italic className="w-4 h-4" />, href: "#" },
  { title: "Underline", icon: <Underline className="w-4 h-4" />, href: "#" },
  { title: "Align left", icon: <AlignLeft className="w-4 h-4" />, href: "#" },
  { title: "Center", icon: <AlignCenter className="w-4 h-4" />, href: "#" },
  { title: "List", icon: <List className="w-4 h-4" />, href: "#" },
  { title: "Image", icon: <Image className="w-4 h-4" />, href: "#" },
];

export default function EditorToolbar() {
  return (
    <div className="flex justify-center py-4">
      <FloatingDock items={toolbarItems} magnification={52} distance={100} />
    </div>
  );
}`,
      },
    ],
  },

  "bento-grid": {
    slug: "bento-grid",
    overview:
      "BentoGrid lays out content cards in an asymmetric masonry-style grid inspired by Apple's design language. Each cell can span multiple columns or rows, with animated entrance and hover effects.",
    scenarios: [
      {
        title: "Product feature overview",
        description:
          "Showcase multiple features in a single glanceable grid without overwhelming the user.",
        code: `import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Zap, Shield, Code } from "lucide-react";

export default function FeatureGrid() {
  return (
    <BentoGrid>
      <BentoGridItem
        title="Blazing fast"
        description="Server-side rendered with zero layout shift."
        icon={<Zap className="w-6 h-6" />}
        className="col-span-2"
      />
      <BentoGridItem
        title="Type-safe"
        description="Full TypeScript support out of the box."
        icon={<Code className="w-6 h-6" />}
      />
      <BentoGridItem
        title="Secure by default"
        description="No external requests. Your data stays local."
        icon={<Shield className="w-6 h-6" />}
      />
    </BentoGrid>
  );
}`,
      },
      {
        title: "Personal portfolio grid",
        description:
          "Display projects, skills, and social links in an editorial bento layout.",
        code: `import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export default function PortfolioGrid() {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      <BentoGridItem
        title="UniqueUI"
        description="An open-source animated component library."
        className="col-span-2 row-span-2"
        header={
          <div className="h-40 rounded-xl bg-gradient-to-br from-purple-900 to-black" />
        }
      />
      <BentoGridItem title="React" description="5 years" />
      <BentoGridItem title="Next.js" description="3 years" />
      <BentoGridItem
        title="Open to work"
        description="Based in India · Remote-friendly"
        className="col-span-2"
      />
    </BentoGrid>
  );
}`,
      },
    ],
  },

  "scroll-reveal": {
    slug: "scroll-reveal",
    overview:
      "ScrollReveal wraps any element and fades + slides it into view when it enters the viewport using an IntersectionObserver. Zero layout shift, respects prefers-reduced-motion.",
    scenarios: [
      {
        title: "Staggered feature list",
        description:
          "Reveal bullet points one by one as the user scrolls down a features section.",
        code: `import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
  "Copy-paste single-file components",
  "Motion.dev spring animations",
  "Dark and light theme support",
  "TypeScript-first API",
];

export default function FeatureList() {
  return (
    <ul className="space-y-3">
      {features.map((feature, i) => (
        <ScrollReveal key={i} delay={i * 0.08}>
          <li className="flex items-center gap-3 text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            {feature}
          </li>
        </ScrollReveal>
      ))}
    </ul>
  );
}`,
      },
      {
        title: "Animated section headers",
        description:
          "Reveal each section heading with a subtle upward drift as the user reaches it.",
        code: `import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center space-y-3">
      <ScrollReveal>
        <h2 className="text-4xl font-bold text-white">{title}</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="text-neutral-400 max-w-xl mx-auto">{subtitle}</p>
      </ScrollReveal>
    </div>
  );
}`,
      },
    ],
  },
};
