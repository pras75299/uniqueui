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
import { X, Globe, Link2, Bookmark } from "lucide-react";

const shareItems = [
  { title: "Share on X", icon: <X className="w-5 h-5" />, href: "#" },
  { title: "Share on LinkedIn", icon: <Globe className="w-5 h-5" />, href: "#" },
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
        code: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Zap, Shield, Code } from "lucide-react";

export default function FeatureGrid() {
  return (
    <BentoGrid>
      <BentoCard
        title="Blazing fast"
        description="Server-side rendered with zero layout shift."
        icon={<Zap className="w-6 h-6" />}
        className="col-span-2"
      />
      <BentoCard
        title="Type-safe"
        description="Full TypeScript support out of the box."
        icon={<Code className="w-6 h-6" />}
      />
      <BentoCard
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
        code: `import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

export default function PortfolioGrid() {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      <BentoCard
        title="UniqueUI"
        description="An open-source animated component library."
        className="col-span-2 row-span-2"
      />
      <BentoCard title="React" description="5 years" />
      <BentoCard title="Next.js" description="3 years" />
      <BentoCard
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

  "infinite-marquee": {
    slug: "infinite-marquee",
    overview:
      "InfiniteMarquee continuously scrolls a row of items horizontally, looping seamlessly. It's commonly used for logo strips, testimonial tickers, and feature highlights.",
    scenarios: [
      {
        title: "Client logo strip",
        description: "Showcase trusted brand logos below the hero section to build social proof.",
        code: `import { InfiniteMarquee } from "@/components/ui/infinite-marquee";

const logos = ["Vercel", "Stripe", "Linear", "Notion", "Figma", "GitHub"];

export default function LogoStrip() {
  return (
    <div className="py-12 border-y border-neutral-800">
      <InfiniteMarquee speed={30} gap={64}>
        {logos.map((name) => (
          <span key={name} className="text-lg font-semibold text-neutral-500 shrink-0">
            {name}
          </span>
        ))}
      </InfiniteMarquee>
    </div>
  );
}`,
      },
      {
        title: "Bidirectional feature ticker",
        description:
          "Two rows scrolling in opposite directions create depth and visual interest for a features section.",
        code: `import { InfiniteMarquee } from "@/components/ui/infinite-marquee";

const row1 = ["Motion.dev springs", "Copy-paste DX", "Dark mode", "TypeScript-first"];
const row2 = ["Zero config", "Tailwind CSS v4", "Single-file", "Accessible"];

export default function FeatureTicker() {
  return (
    <div className="space-y-3 py-10 overflow-hidden">
      <InfiniteMarquee speed={25} direction="left">
        {row1.map((f) => (
          <span key={f} className="px-4 py-1.5 rounded-full border border-neutral-700 text-sm text-neutral-300 shrink-0">
            {f}
          </span>
        ))}
      </InfiniteMarquee>
      <InfiniteMarquee speed={25} direction="right">
        {row2.map((f) => (
          <span key={f} className="px-4 py-1.5 rounded-full border border-purple-500/30 text-sm text-purple-300 shrink-0">
            {f}
          </span>
        ))}
      </InfiniteMarquee>
    </div>
  );
}`,
      },
    ],
  },

  "magnetic-button": {
    slug: "magnetic-button",
    overview:
      "MagneticButton adds a physics-based cursor attraction effect to any button or interactive element. As the cursor approaches, the element gently pulls toward it, creating a satisfying tactile feel.",
    scenarios: [
      {
        title: "Primary CTA button",
        description: "Apply the magnetic effect to your hero CTA to make it irresistible to click.",
        code: `import { MagneticButton } from "@/components/ui/magnetic-button";

export default function HeroCTA() {
  return (
    <div className="flex justify-center py-20">
      <MagneticButton>
        <button className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-neutral-100 transition-colors">
          Get started free →
        </button>
      </MagneticButton>
    </div>
  );
}`,
      },
      {
        title: "Icon navigation links",
        description: "Magnetic icons in a header or dock feel playful and high-quality.",
        code: `import { MagneticButton } from "@/components/ui/magnetic-button";
import { Code, X, Mail } from "lucide-react";

const socialLinks = [
  { icon: Code, href: "https://github.com", label: "GitHub" },
  { icon: X, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:hi@example.com", label: "Email" },
];

export default function SocialNav() {
  return (
    <div className="flex items-center gap-2">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <MagneticButton key={label} strength={0.4}>
          <a
            href={href}
            aria-label={label}
            className="p-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
          >
            <Icon className="w-5 h-5" />
          </a>
        </MagneticButton>
      ))}
    </div>
  );
}`,
      },
      {
        title: "Reduced-strength subtle hover",
        description: "Lower the strength for elements that should feel premium but not distracting.",
        code: `import { MagneticButton } from "@/components/ui/magnetic-button";

export default function SubtleCard() {
  return (
    <MagneticButton strength={0.25} className="block">
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-neutral-700 transition-colors">
        <h3 className="text-white font-semibold mb-2">UniqueUI Pro</h3>
        <p className="text-neutral-400 text-sm">Access all templates and premium components.</p>
      </div>
    </MagneticButton>
  );
}`,
      },
    ],
  },

  "gradient-text-reveal": {
    slug: "gradient-text-reveal",
    overview:
      "GradientTextReveal animates a gradient sweep across text as it enters the viewport — a dramatic way to introduce headlines or key phrases on scroll.",
    scenarios: [
      {
        title: "Section headline reveal",
        description: "Fire the reveal when the section scrolls into view for a cinematic entrance.",
        code: `import { GradientTextReveal } from "@/components/ui/gradient-text-reveal";

export default function SectionHeadline() {
  return (
    <div className="py-24 text-center">
      <GradientTextReveal
        text="Design that moves people."
        className="text-5xl font-bold"
        gradient="from-white via-purple-300 to-white"
      />
    </div>
  );
}`,
      },
      {
        title: "Pull quote in a blog post",
        description: "Highlight a key quote mid-article with a gradient sweep to re-engage readers.",
        code: `import { GradientTextReveal } from "@/components/ui/gradient-text-reveal";

export default function PullQuote() {
  return (
    <blockquote className="my-12 px-8 border-l-2 border-purple-500">
      <GradientTextReveal
        text="The best design is invisible — until it moves."
        className="text-2xl font-medium italic"
        gradient="from-neutral-300 via-purple-400 to-neutral-300"
        duration={1.4}
      />
    </blockquote>
  );
}`,
      },
    ],
  },

  "notification-stack": {
    slug: "notification-stack",
    overview:
      "NotificationStack renders a stacked pile of toast-style cards that animate in and collapse when dismissed. Great for live activity feeds, system alerts, or social notifications.",
    scenarios: [
      {
        title: "Live activity feed",
        description: "Push real-time events (new users, payments, deployments) into the stack.",
        code: `import { NotificationStack } from "@/components/ui/notification-stack";
import { useState } from "react";

const events = [
  { id: 1, title: "New signup", body: "prashant@example.com just joined." },
  { id: 2, title: "Payment received", body: "$49 from Stripe · Order #1042" },
  { id: 3, title: "Deploy success", body: "main → production in 34s" },
];

export default function ActivityFeed() {
  const [notifications, setNotifications] = useState(events);

  return (
    <NotificationStack
      notifications={notifications}
      onDismiss={(id) => setNotifications((n) => n.filter((x) => x.id !== id))}
    />
  );
}`,
      },
      {
        title: "Form validation errors",
        description: "Surface validation errors as dismissible stacked notices instead of inline messages.",
        code: `import { NotificationStack } from "@/components/ui/notification-stack";

const errors = [
  { id: 1, title: "Email required", body: "Please enter a valid email address." },
  { id: 2, title: "Password too short", body: "Password must be at least 8 characters." },
];

export default function FormErrors() {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <NotificationStack notifications={errors} variant="error" />
    </div>
  );
}`,
      },
    ],
  },

  "moving-border": {
    slug: "moving-border",
    overview:
      "MovingBorder traces an animated SVG path around a button or card, creating the appearance of a glowing line orbiting the element. The path speed and glow intensity are fully configurable.",
    scenarios: [
      {
        title: "Highlighted CTA button",
        description: "Draw immediate attention to a primary action with an orbiting glow border.",
        code: `import { MovingBorder } from "@/components/ui/moving-border";

export default function GlowCTA() {
  return (
    <MovingBorder duration={3000} borderRadius="9999px">
      <button className="px-8 py-3 font-semibold text-white bg-neutral-950 rounded-full">
        Start building for free
      </button>
    </MovingBorder>
  );
}`,
      },
      {
        title: "Featured pricing card",
        description: "Indicate the recommended pricing tier with a subtle moving border that stands out from static cards.",
        code: `import { MovingBorder } from "@/components/ui/moving-border";

export default function FeaturedPricingCard() {
  return (
    <MovingBorder duration={4000} borderRadius="1rem" borderClassName="bg-[radial-gradient(var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent">
      <div className="p-8 bg-neutral-950 rounded-2xl min-w-[280px] space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
          Most popular
        </span>
        <p className="text-4xl font-bold text-white">
          $29<span className="text-lg text-neutral-400">/mo</span>
        </p>
        <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium">
          Get started
        </button>
      </div>
    </MovingBorder>
  );
}`,
      },
    ],
  },

  "glow-hero-section": {
    slug: "glow-hero-section",
    overview:
      "GlowHeroSection is a full-width hero component with a customizable radial glow effect behind the content. It combines a gradient background, centered text hierarchy, and optional CTA buttons into one production-ready section.",
    scenarios: [
      {
        title: "SaaS product landing hero",
        description: "The most common pattern — headline, subheadline, and two CTA buttons over a dark glowing background.",
        code: `import GlowHeroSection from "@/components/ui/glow-hero-section";
import Link from "next/link";

export default function LandingHero() {
  return (
    <GlowHeroSection
      badge="Now in public beta"
      title="Ship cinematic UI in minutes"
      subtitle="Copy-paste animated React components powered by motion.dev and Tailwind CSS."
      glowColor="purple"
    >
      <div className="flex gap-4 justify-center mt-8">
        <Link href="/components" className="px-7 py-3.5 bg-white text-black rounded-full font-semibold">
          Browse components
        </Link>
        <a href="https://github.com/pras75299/uniqueui" className="px-7 py-3.5 border border-neutral-700 text-white rounded-full">
          Star on GitHub
        </a>
      </div>
    </GlowHeroSection>
  );
}`,
      },
      {
        title: "Open-source project hero",
        description: "Show contributor count and GitHub stars as social proof badges inside the glow hero.",
        code: `import GlowHeroSection from "@/components/ui/glow-hero-section";
import { Star, Users } from "lucide-react";

export default function OpenSourceHero() {
  return (
    <GlowHeroSection
      title="Built in the open."
      subtitle="Every component is MIT-licensed and community-maintained."
      glowColor="blue"
    >
      <div className="flex gap-4 justify-center mt-6">
        <span className="flex items-center gap-1.5 text-sm border border-neutral-700 rounded-full px-4 py-1.5 text-neutral-300">
          <Star className="w-4 h-4 text-yellow-400" /> 2.4k stars
        </span>
        <span className="flex items-center gap-1.5 text-sm border border-neutral-700 rounded-full px-4 py-1.5 text-neutral-300">
          <Users className="w-4 h-4 text-blue-400" /> 120 contributors
        </span>
      </div>
    </GlowHeroSection>
  );
}`,
      },
    ],
  },

  "confetti-burst": {
    slug: "confetti-burst",
    overview:
      "ConfettiBurst fires a particle explosion from a point on screen — perfect for celebrating milestones like a completed form, a successful payment, or an unlocked achievement.",
    scenarios: [
      {
        title: "Success after form submission",
        description: "Trigger a confetti burst when the user completes a sign-up or checkout form.",
        code: `import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { useState } from "react";

export default function SignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTriggerConfetti(true);
    setTimeout(() => setTriggerConfetti(false), 100);
  };

  return (
    <div className="relative">
      {submitted ? (
        <div className="text-center text-white py-8">
          <p className="text-2xl font-bold">You're in! 🎉</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Your email" className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white" />
          <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold">
            Join waitlist
          </button>
        </form>
      )}
      <ConfettiBurst trigger={triggerConfetti} origin={{ x: 0.5, y: 0.5 }} />
    </div>
  );
}`,
      },
      {
        title: "Achievement unlock",
        description: "Celebrate when a user reaches a milestone inside a dashboard or onboarding flow.",
        code: `import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { useState } from "react";
import { Trophy } from "lucide-react";

export default function AchievementCard() {
  const [unlocked, setUnlocked] = useState(false);
  const [burst, setBurst] = useState(false);

  const unlock = () => {
    setUnlocked(true);
    setBurst(true);
    setTimeout(() => setBurst(false), 100);
  };

  return (
    <div className="relative p-6 rounded-2xl border border-neutral-800 bg-neutral-900 text-center space-y-4">
      <Trophy className={\`w-10 h-10 mx-auto transition-colors \${unlocked ? "text-yellow-400" : "text-neutral-600"}\`} />
      <p className="text-white font-semibold">First component added</p>
      {!unlocked && (
        <button onClick={unlock} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium">
          Claim reward
        </button>
      )}
      <ConfettiBurst trigger={burst} particleCount={80} />
    </div>
  );
}`,
      },
    ],
  },
  "shiny-text": {
    slug: "shiny-text",
    overview:
      "ShinyText adds a moving shimmer highlight that sweeps across your text using a CSS background-clip animation. Ideal for hero taglines, badge labels, or any copy that needs a premium metallic feel.",
    scenarios: [
      {
        title: "Hero tagline highlight",
        description: "Draw attention to a key phrase in your hero section with a continuous shimmer sweep.",
        code: `import { ShinyText } from "@/components/ui/shiny-text";

export default function HeroTagline() {
  return (
    <h1 className="text-5xl font-bold text-white">
      Build beautiful UIs{" "}
      <ShinyText text="effortlessly" speed={2.5} className="text-purple-400" />
    </h1>
  );
}`,
      },
      {
        title: "Premium badge label",
        description: "Use a smaller shimmer span inside a pill badge to signal a paid or featured tier.",
        code: `import { ShinyText } from "@/components/ui/shiny-text";

export default function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-xs font-semibold">
      ✦ <ShinyText text="PRO" speed={4} className="text-yellow-400" />
    </span>
  );
}`,
      },
      {
        title: "CTA button text",
        description: "Give a call-to-action button a shimmering label to make it pop on dark landing pages.",
        code: `import { ShinyText } from "@/components/ui/shiny-text";

export default function ShinyButton() {
  return (
    <button className="px-6 py-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-purple-500 transition-colors">
      <ShinyText text="Get started for free →" speed={3} className="text-white" />
    </button>
  );
}`,
      },
    ],
  },
  "blur-reveal": {
    slug: "blur-reveal",
    overview:
      "BlurReveal staggers a blur-fade-in animation across each character or word as the element enters the viewport. It creates an elegant reveal effect perfect for hero text and section headings.",
    scenarios: [
      {
        title: "Hero heading entrance",
        description: "Animate your primary headline character-by-character as the page loads.",
        code: `import { BlurReveal } from "@/components/ui/blur-reveal";

export default function HeroHeading() {
  return (
    <h1 className="text-6xl font-bold text-white">
      <BlurReveal text="Ship faster." animateBy="characters" duration={0.5} />
    </h1>
  );
}`,
      },
      {
        title: "Section subtitle word reveal",
        description: "Reveal a section subtitle word-by-word for a slightly slower, more dramatic effect.",
        code: `import { BlurReveal } from "@/components/ui/blur-reveal";

export default function SectionSubtitle() {
  return (
    <p className="text-xl text-neutral-400 max-w-xl">
      <BlurReveal
        text="Beautifully crafted components that make your UI stand out."
        animateBy="words"
        delay={0.1}
        duration={0.7}
      />
    </p>
  );
}`,
      },
    ],
  },
  "count-up": {
    slug: "count-up",
    overview:
      "CountUp animates a number from a starting value to a target value as it enters the viewport. It supports decimals, prefixes, suffixes, and thousands separators — perfect for stats and metrics sections.",
    scenarios: [
      {
        title: "Stats row",
        description: "Display key product metrics that animate in when the user scrolls to them.",
        code: `import { CountUp } from "@/components/ui/count-up";

const stats = [
  { label: "Components", value: 60, suffix: "+" },
  { label: "GitHub Stars", value: 4.2, suffix: "k", decimals: 1 },
  { label: "Downloads", value: 120, suffix: "k+" },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-3 gap-8 text-center">
      {stats.map(({ label, value, suffix, decimals }) => (
        <div key={label}>
          <p className="text-4xl font-bold text-white">
            <CountUp to={value} suffix={suffix} decimals={decimals} />
          </p>
          <p className="text-sm text-neutral-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}`,
      },
      {
        title: "Revenue counter with currency prefix",
        description: "Show an animated revenue or savings figure with a dollar sign prefix.",
        code: `import { CountUp } from "@/components/ui/count-up";

export default function RevenueCounter() {
  return (
    <div className="text-center space-y-1">
      <p className="text-5xl font-extrabold text-emerald-400">
        <CountUp from={0} to={1250000} prefix="$" separator="," duration={2.5} />
      </p>
      <p className="text-sm text-neutral-400">Total revenue generated</p>
    </div>
  );
}`,
      },
    ],
  },
  "border-beam": {
    slug: "border-beam",
    overview:
      "BorderBeam traces an animated glowing orb around the perimeter of any container using requestAnimationFrame. Wrap any card, input, or panel to give it a dynamic, premium border highlight.",
    scenarios: [
      {
        title: "Glowing feature card",
        description: "Wrap a feature card so a colorful beam traces its border continuously.",
        code: `import { BorderBeam } from "@/components/ui/border-beam";

export default function FeatureCard() {
  return (
    <BorderBeam colorFrom="#a855f7" colorTo="#06b6d4" duration={4}>
      <div className="p-6 rounded-2xl bg-neutral-900 space-y-2">
        <h3 className="text-lg font-semibold text-white">Motion-powered</h3>
        <p className="text-sm text-neutral-400">
          Every animation uses spring physics for natural, fluid movement.
        </p>
      </div>
    </BorderBeam>
  );
}`,
      },
      {
        title: "Highlighted input field",
        description: "Give a search or email input an animated border beam to draw focus.",
        code: `import { BorderBeam } from "@/components/ui/border-beam";

export default function BeamInput() {
  return (
    <BorderBeam colorFrom="#f59e0b" colorTo="#ef4444" borderWidth={2} duration={3}>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-4 py-3 rounded-xl bg-neutral-800 text-white outline-none text-sm"
      />
    </BorderBeam>
  );
}`,
      },
    ],
  },
  "ripple": {
    slug: "ripple",
    overview:
      "Ripple renders concentric animated rings that pulse outward from a center point. Use it as a background for icons, avatars, or buttons to convey activity, presence, or emphasis.",
    scenarios: [
      {
        title: "Live presence indicator",
        description: "Show a pulsing ripple behind an avatar to indicate a user is online or broadcasting.",
        code: `import { Ripple } from "@/components/ui/ripple";

export default function LivePresence() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <Ripple mainCircleSize={48} numCircles={5} color="#22c55e" duration={2.5} />
      <img
        src="/avatar.png"
        alt="User"
        className="relative z-10 w-12 h-12 rounded-full border-2 border-green-500"
      />
    </div>
  );
}`,
      },
      {
        title: "CTA focus ring",
        description: "Add a ripple effect behind a primary CTA button to make it visually magnetic.",
        code: `import { Ripple } from "@/components/ui/ripple";

export default function RippleCTA() {
  return (
    <div className="relative inline-flex items-center justify-center">
      <Ripple mainCircleSize={64} numCircles={4} color="#a855f7" duration={3} />
      <button className="relative z-10 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm">
        Get Started
      </button>
    </div>
  );
}`,
      },
    ],
  },
  "word-rotate": {
    slug: "word-rotate",
    overview:
      "WordRotate cycles through an array of words with configurable entrance and exit animations — slide, flip, or fade. Drop it inline within headings to convey multiple ideas without extra layout space.",
    scenarios: [
      {
        title: "Hero headline value rotator",
        description: "Cycle through your product's core benefits inline inside a headline.",
        code: `import { WordRotate } from "@/components/ui/word-rotate";

export default function HeroHeadline() {
  return (
    <h1 className="text-5xl font-bold text-white">
      The{" "}
      <WordRotate
        words={["fastest", "cleanest", "smartest"]}
        animation="slide-up"
        className="text-purple-400"
      />
      {" "}way to ship UI
    </h1>
  );
}`,
      },
      {
        title: "Feature list rotator with flip",
        description: "Use the flip animation for a more dramatic 3-D card-turning effect.",
        code: `import { WordRotate } from "@/components/ui/word-rotate";

export default function FlipRotator() {
  return (
    <p className="text-2xl font-semibold text-white">
      Built for{" "}
      <WordRotate
        words={["designers", "developers", "startups", "agencies"]}
        animation="flip"
        interval={2000}
        className="text-emerald-400"
      />
    </p>
  );
}`,
      },
      {
        title: "Subtle fade rotator in body copy",
        description: "Use the fade animation for a soft, unobtrusive rotation inside a paragraph.",
        code: `import { WordRotate } from "@/components/ui/word-rotate";

export default function FadeRotator() {
  return (
    <p className="text-base text-neutral-400">
      Perfect for{" "}
      <WordRotate
        words={["landing pages", "SaaS apps", "portfolios", "dashboards"]}
        animation="fade"
        interval={3000}
        className="text-white font-medium"
      />
    </p>
  );
}`,
      },
    ],
  },
};
