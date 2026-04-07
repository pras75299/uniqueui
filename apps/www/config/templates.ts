export type TemplateConfig = {
  id: string;
  name: string;
  description: string;
  niche: string;
  difficulty: "Starter" | "Pro";
  status: "available" | "coming-soon";
  components: string[];
  /** Filenames (without .tsx) of @/components/ui/* used by this template */
  componentFiles?: string[];
  gradient: string;
  accentColor: string;
  stars?: number;
};

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "saas-landing",
    name: "SaaS Landing Page",
    description:
      "A full-featured SaaS landing with isometric hero, features bento, pricing cards, and a testimonials section. Motion-rich and conversion-optimized.",
    niche: "SaaS",
    difficulty: "Pro",
    status: "available",
    components: ["Isometric Hero", "Feature Grid", "Pricing Table", "Testimonials", "Stats Counter"],
    componentFiles: [
      "scroll-reveal",
      "count-up",
      "bento-grid",
      "infinite-marquee",
      "shiny-text",
      "border-beam",
      "moving-border",
    ],
    gradient: "from-cyan-900 via-sky-900 to-indigo-950",
    accentColor: "text-cyan-300",
  },
  {
    id: "portfolio",
    name: "Developer Portfolio",
    description:
      "Minimal dark portfolio for engineers. Aurora background hero, project cards with hover-reveal, and an animated skills timeline.",
    niche: "Portfolio",
    difficulty: "Starter",
    status: "coming-soon",
    components: ["Aurora Background", "3D Tilt Card", "Hover Reveal Card", "Animated Timeline", "Typewriter Text"],
    gradient: "from-emerald-900 via-teal-900 to-cyan-950",
    accentColor: "text-emerald-300",
  },
  {
    id: "agency",
    name: "Creative Agency",
    description:
      "Bold, editorial layout for design studios. Gradient text reveals, morphing card stacks, horizontal scroll gallery, and a limelight navbar.",
    niche: "Agency",
    difficulty: "Pro",
    status: "coming-soon",
    components: ["Gradient Text Reveal", "Morphing Card Stack", "Horizontal Scroll Gallery", "Limelight Nav", "Moving Border"],
    gradient: "from-rose-900 via-pink-900 to-fuchsia-950",
    accentColor: "text-rose-300",
  },
  {
    id: "dashboard",
    name: "Analytics Dashboard",
    description:
      "A clean dark dashboard shell with a data table, bento KPI grid, notification stack, and skeleton loading states.",
    niche: "Dashboard",
    difficulty: "Pro",
    status: "coming-soon",
    components: ["Data Table", "Bento Grid", "Notification Stack", "Skeleton Shimmer", "Animated Tabs"],
    gradient: "from-blue-900 via-slate-900 to-neutral-950",
    accentColor: "text-blue-300",
  },
  {
    id: "blog",
    name: "Developer Blog",
    description:
      "Article-first layout with scroll-reveal sections, a scramble-text headline effect, nested comments, and a floating share dock.",
    niche: "Blog",
    difficulty: "Starter",
    status: "coming-soon",
    components: ["Scroll Reveal", "Scramble Text", "Nested Comments", "Floating Dock", "Animated Timeline"],
    gradient: "from-amber-900 via-orange-900 to-red-950",
    accentColor: "text-amber-300",
  },
  {
    id: "ecommerce",
    name: "Product Store",
    description:
      "E-commerce product page with a horizontal scroll gallery, flip-card product variants, morphing modal quickview, and a confetti add-to-cart.",
    niche: "E-commerce",
    difficulty: "Pro",
    status: "coming-soon",
    components: ["Horizontal Scroll Gallery", "Flip Card", "Morphing Modal", "Confetti Burst", "Magnetic Button"],
    gradient: "from-green-900 via-emerald-900 to-teal-950",
    accentColor: "text-green-300",
  },
];
