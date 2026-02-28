<p align="center">
  <h1 align="center">✨ UniqueUI</h1>
  <p align="center">
    A collection of beautiful, animated React components you can copy-paste into your apps.
    <br />
    Built with <strong>React 19</strong>, <strong>Motion</strong>, and <strong>Tailwind CSS 4</strong>.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/uniqueui-cli"><img src="https://img.shields.io/npm/v/uniqueui-cli.svg" alt="npm version" /></a>
  <a href="https://github.com/pras75299/uniqueui/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/uniqueui-cli.svg" alt="license" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/uniqueui-cli.svg" alt="node" /></a>
</p>

<p align="center">
  <a href="#components">Components</a> •
  <a href="#installation">Installation</a> •
  <a href="#commands">Commands</a> •
  <a href="#project-setup-guide">Setup Guide</a> •
  <a href="#usage-examples">Examples</a> •
  <a href="#customization">Customization</a> •
  <a href="#development">Development</a> •
  <a href="#troubleshooting">Troubleshooting</a>
</p>

---

## Overview

UniqueUI is an open-source component library focused on **micro-interactions and animations**. Instead of installing a heavy package, you pick the components you need and add them directly to your project via the CLI — **no runtime dependency on UniqueUI itself**.

**Key features:**

- 🎯 **Copy-paste architecture** — Components live in your codebase, fully customizable
- 🎨 **24 animated components** — From subtle to spectacular
- ⚡ **CLI for instant setup** — `npx uniqueui init` → `npx uniqueui add <component>`
- 🧩 **Zero lock-in** — Uses standard React, Motion, and Tailwind CSS
- 📱 **Dark-first design** — Every component looks great out of the box

## Components

| Component | Category | Description |
|-----------|----------|-------------|
| **Moving Border** | Effects | SVG-path-tracing animated border that orbits a button or card |
| **Typewriter Text** | Text | Character-by-character typing with blinking cursor and delete-retype loop |
| **3D Tilt Card** | Cards | Perspective-shifting card that tilts toward the cursor with parallax layers |
| **Spotlight Card** | Cards | Card with a radial spotlight that follows the mouse cursor |
| **Aurora Background** | Backgrounds | Flowing aurora borealis gradient animation using layered blurred blobs |
| **Animated Tabs** | Navigation | Tab bar with a sliding pill that morphs between tabs using layout animation |
| **Magnetic Button** | Effects | Button that stretches toward the cursor and snaps back with spring physics |
| **Infinite Marquee** | Effects | Seamless infinite-scrolling ticker with pause-on-hover |
| **Scroll Reveal** | Effects | Elements animate into view on scroll, with 6 animation presets |
| **Skeleton Shimmer** | Loaders | Loading placeholders with animated shimmer gradient sweep |
| **Morphing Modal** | Overlays | Modal that expands from the trigger element with spring physics |
| **Gradient Text Reveal** | Text | Word-by-word text reveal with gradient coloring and blur-to-clear animation |
| **Scramble Text** | Text | Matrix-style text scramble effect that resolves characters left-to-right |
| **Meteors Card** | Cards | Card with animated shooting star particles through the background |
| **Flip Card** | Cards | 3D card flip with spring physics, hover or click triggers |
| **Dot Grid Background** | Backgrounds | Interactive dot-grid pattern with glowing cursor-following effect |
| **Floating Dock** | Navigation | macOS-style dock with magnetic scaling, spring physics, and tooltips |
| **Confetti Burst** | Effects | Click-triggered confetti particle explosion with customizable colors |
| **Drawer Slide** | Overlays | Slide-out drawer panel with drag-to-dismiss and backdrop blur |
| **Notification Stack** | Overlays | Stacked toast notifications with auto-dismiss and progress bars |
| **Animated Timeline** | Effects | Scroll-triggered timeline with staggered spring animations and per-item colors |
| **Nested Comments** | Social | Threaded comment section with infinite nesting and spring-physics animations |
| **Hover Reveal Card** | Cards | Card that slides up a full-detail panel on hover with staggered Motion animations |

## Installation

### Requirements

| Requirement | Version |
|---|---|
| **Node.js** | ≥ 18 |
| **React** | ≥ 18 |
| **Tailwind CSS** | ≥ 3 |

> All components use [Motion](https://motion.dev) (formerly Framer Motion). The CLI installs `motion` automatically.

### Option A — Use with `npx` (recommended)

```bash
npx uniqueui <command>
```

### Option B — Install globally

```bash
npm install -g uniqueui-cli
uniqueui <command>
```

### Option C — Install as a dev dependency

```bash
npm install -D uniqueui-cli
npx uniqueui <command>
```

### Quick Start

```bash
# 1. Initialize UniqueUI in your project
npx uniqueui init

# 2. Add a component
npx uniqueui add spotlight-card
```

```tsx
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function Page() {
  return (
    <SpotlightCard>
      <h2>Hover me</h2>
      <p>Watch the spotlight follow your cursor.</p>
    </SpotlightCard>
  );
}
```

## Commands

| Command | Description |
|---------|-------------|
| `uniqueui init` | Set up UniqueUI config for your project — creates `components.json`, installs base dependencies, and adds the `cn` utility |
| `uniqueui add <component>` | Fetch a component from the registry, install dependencies, and write it to your project |
| `uniqueui list` | Display all components available in the registry |

### `init` details

You'll be prompted for:

| Prompt | Default | Description |
|---|---|---|
| Components directory | `components/ui` | Where component files will be saved |
| TypeScript | `yes` | Whether to use `.tsx` files |
| Tailwind config path | `tailwind.config.ts` | Path to your Tailwind configuration |

Creates `components.json` in your project root:

```json
{
  "componentsDir": "components/ui",
  "typescript": true,
  "tailwindConfig": "tailwind.config.ts"
}
```

### `add` details

```bash
npx uniqueui add <component-name> [--url <custom-registry-url>]
```

What happens:
1. Fetches the component source from the GitHub registry
2. Installs any required npm dependencies (`motion`, `clsx`, `tailwind-merge`)
3. Merges required Tailwind animations/keyframes into your config
4. Writes the component `.tsx` file to your configured directory
5. Writes a `utils/cn.ts` helper file (if not already present)

## Project Setup Guide

### Next.js Setup

```bash
# 1. Create project (skip if you already have one)
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app

# 2. Initialize UniqueUI
npx uniqueui init
# Components directory: components/ui
# Tailwind config: tailwind.config.ts

# 3. Add components
npx uniqueui add moving-border
npx uniqueui add aurora-background
```

Ensure `tsconfig.json` has the `@` alias (Next.js sets this up by default):

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

```tsx
// app/page.tsx
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/moving-border";

export default function Home() {
  return (
    <AuroraBackground>
      <div className="text-center text-white z-10">
        <h1 className="text-5xl font-bold mb-6">Welcome</h1>
        <Button borderRadius="1.75rem">Get Started</Button>
      </div>
    </AuroraBackground>
  );
}
```

### Vite + React Setup

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `vite.config.ts` to add the `@` alias:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

```bash
npx uniqueui init   # Components directory: src/components/ui
npx uniqueui add typewriter-text
```

### Create React App Setup

```bash
npx create-react-app my-app --template typescript
cd my-app
npm install -D tailwindcss && npx tailwindcss init
npm install -D @craco/craco
```

Create `craco.config.js`:

```js
const path = require("path");
module.exports = { webpack: { alias: { "@": path.resolve(__dirname, "src") } } };
```

```bash
npx uniqueui init
npx uniqueui add magnetic-button
```

## Usage Examples

### Hero section with Aurora + Moving Border

```tsx
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/moving-border";
import { TypewriterText } from "@/components/ui/typewriter-text";

export default function Hero() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="text-center text-white z-10 px-4">
        <h1 className="text-6xl font-bold mb-4">
          Build with{" "}
          <TypewriterText words={["Motion", "Style", "UniqueUI"]} className="text-purple-400" />
        </h1>
        <Button borderRadius="1.75rem" className="bg-zinc-950 text-white mt-6">
          Get Started
        </Button>
      </div>
    </AuroraBackground>
  );
}
```

### Features section with Scroll Reveal

```tsx
import { ScrollRevealGroup } from "@/components/ui/scroll-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const features = [
  { title: "Animated", desc: "Every component ships with beautiful motion." },
  { title: "Copy-paste", desc: "You own the code. No lock-in." },
  { title: "Tailwind", desc: "Styled with utility classes you already know." },
];

export default function Features() {
  return (
    <ScrollRevealGroup animation="fade-up" staggerDelay={0.15} className="grid md:grid-cols-3 gap-6 p-12">
      {features.map((f) => (
        <SpotlightCard key={f.title} className="p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
          <p className="text-neutral-400 text-sm">{f.desc}</p>
        </SpotlightCard>
      ))}
    </ScrollRevealGroup>
  );
}
```

### Navigation with Floating Dock

```tsx
import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, User, Briefcase, Mail } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: <Home />, href: "/" },
  { id: "about", label: "About", icon: <User />, href: "/about" },
  { id: "work", label: "Work", icon: <Briefcase />, href: "/work" },
  { id: "contact", label: "Contact", icon: <Mail />, href: "/contact" },
];

export default function Nav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <FloatingDock items={navItems} />
    </div>
  );
}
```

## Customization

Since you own the component files after installing, you can customize anything:

```tsx
// Change colors to your brand
<Button className="bg-indigo-950 text-indigo-100 border-indigo-700">Click me</Button>

// Slow down typewriter typing
<TypewriterText words={["Hello"]} typingSpeed={200} deletingSpeed={100} />

// Add responsive / dark-mode variants
<SpotlightCard className="md:p-8 lg:p-12 dark:bg-neutral-950">
  {/* your content */}
</SpotlightCard>
```

## Compatibility

- **Tailwind CSS**: Native support for v3 and v4
- **Shadcn UI**: Drop-in compatible — both use the copy-paste model and `cn` utility
- **Other React UI Libraries**: No runtime dependency means zero conflicts with Chakra UI, Radix, NextUI, etc.

## Development

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces |
| **Showcase** | Next.js (App Router) |
| **Framework** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Motion 12 (motion/react) |
| **Icons** | Lucide React |
| **CLI** | Commander + Chalk + Ora |

### Getting Started

```bash
git clone https://github.com/pras75299/uniqueui.git
cd uniqueui
pnpm install

# Run the showcase site
cd apps/www
pnpm dev
```

The showcase site will be available at `http://localhost:3000`.

### Building

```bash
# Build the showcase site
cd apps/www && pnpm build

# Build the CLI
cd packages/cli && pnpm build

# Build the registry (from root)
pnpm build:registry

# Run component tests
npx ts-node scripts/test-all-components.ts
```

## Project Structure

```
uniqueui/
├── apps/
│   └── www/                    # Next.js showcase & documentation site
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── components/     # Component documentation pages
│       │   │   ├── page.tsx    # Component listing
│       │   │   └── [slug]/     # Individual component pages
│       │   ├── layout.tsx      # Root layout
│       │   └── globals.css     # Global styles & keyframes
│       ├── components/
│       │   └── ui/             # All 24 UI components
│       └── config/
│           ├── components.ts   # Component metadata (name, slug, icon, description)
│           └── demos.tsx       # Component demo configurations
├── packages/
│   └── cli/                    # UniqueUI CLI tool
│       └── src/
│           ├── index.ts        # CLI entry point (Commander)
│           └── commands/
│               ├── init.ts     # `uniqueui init` command
│               ├── add.ts      # `uniqueui add` command
│               └── list.ts     # `uniqueui list` command
├── registry/                   # Component source files + config
│   ├── config.ts               # Registry configuration (dependencies, files)
│   └── *.tsx                   # 24 component source files
├── scripts/
│   └── build-registry.ts      # Generates registry.json from config
├── registry.json               # Generated registry manifest
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root package.json
```

## How It Works

```
Registry (GitHub)
       │
       │  npx uniqueui add <component>
       ▼
  Your project
  └── components/
       └── ui/
            └── moving-border.tsx   ← You own this file
  └── utils/
       └── cn.ts                    ← Shared utility
```

1. **Registry** — Each component is defined in `registry/config.ts` with its name, dependencies, and file paths. `build-registry.ts` outputs `registry.json` with embedded source code.
2. **CLI** — Fetches `registry.json` from GitHub, finds the component, writes files to your project, and installs missing npm dependencies.
3. **Showcase** — The `apps/www` Next.js site serves as marketing landing page and component documentation with live previews and install commands.

## Troubleshooting

### `Cannot find module '@/utils/cn'`

Update the import to match your project's `cn` location:
```ts
import { cn } from "@/lib/utils"; // Next.js shadcn-style setup
```
Or re-run `npx uniqueui add <component>` to regenerate `utils/cn.ts`.

### `Module not found: Can't resolve 'motion/react'`

```bash
npm install motion
```

### Tailwind animations not working

Ensure `content` in `tailwind.config.ts` includes component files:
```ts
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",  // ← required
],
```

### Component file not appearing after `add`

Check `components.json` to confirm `componentsDir` matches your actual directory:
```bash
cat components.json
```

### `npx uniqueui` — command not found

```bash
node --version  # must be v18 or higher
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-component`)
3. Add your component to `registry/` and update `registry/config.ts`
4. Add it to `apps/www/components/ui/`, `config/components.ts`, and `config/demos.tsx`
5. Run `pnpm build` to ensure everything compiles
6. Submit a pull request

## Links

- [GitHub Repository](https://github.com/pras75299/uniqueui)
- [Report an Issue](https://github.com/pras75299/uniqueui/issues)
- [npm Package](https://www.npmjs.com/package/uniqueui-cli)

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built by <a href="https://github.com/pras75299">@pras75299</a>
</p>
