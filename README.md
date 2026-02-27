<p align="center">
  <h1 align="center">✨ UniqueUI</h1>
  <p align="center">
    A collection of beautiful, animated React components you can copy-paste into your apps.
    <br />
    Built with <strong>React 19</strong>, <strong>Motion</strong>, and <strong>Tailwind CSS 4</strong>.
  </p>
</p>

<p align="center">
  <a href="#components">Components</a> •
  <a href="#installation">Installation</a> •
  <a href="#cli">CLI</a> •
  <a href="#development">Development</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#license">License</a>
</p>

---

## Overview

UniqueUI is an open-source component library focused on **micro-interactions and animations**. Instead of installing a heavy package, you pick the components you need and add them directly to your project via the CLI — no runtime dependency on UniqueUI itself.

**Key features:**

- 🎯 **Copy-paste architecture** — Components live in your codebase, fully customizable
- 🎨 **21 animated components** — From subtle to spectacular
- ⚡ **CLI for instant setup** — `npx uniqueui init` → `npx uniqueui add <component>`
- 🧩 **Zero lock-in** — Uses standard React, Motion, and Tailwind CSS
- 📱 **Dark-first design** — Every component looks great out of the box

## Components

| Component | Description |
|-----------|-------------|
| **Moving Border** | SVG-path-tracing animated border that orbits a button or card |
| **Typewriter Text** | Character-by-character typing with blinking cursor and delete-retype loop |
| **3D Tilt Card** | Perspective-shifting card that tilts toward the cursor with parallax layers |
| **Spotlight Card** | Card with a radial spotlight that follows the mouse cursor |
| **Aurora Background** | Flowing aurora borealis gradient animation using layered blurred blobs |
| **Animated Tabs** | Tab bar with a sliding pill that morphs between tabs using layout animation |
| **Magnetic Button** | Button that stretches toward the cursor and snaps back with spring physics |
| **Infinite Marquee** | Seamless infinite-scrolling ticker with pause-on-hover |
| **Scroll Reveal** | Elements animate into view on scroll, with 6 animation presets |
| **Skeleton Shimmer** | Loading placeholders with animated shimmer gradient sweep |
| **Morphing Modal** | Modal that expands from the trigger element with spring physics |
| **Gradient Text Reveal** | Word-by-word text reveal with gradient coloring and blur-to-clear animation |
| **Scramble Text** | Matrix-style text scramble effect that resolves characters left-to-right |
| **Meteors Card** | Card with animated shooting star particles through the background |
| **Flip Card** | 3D card flip with spring physics, hover or click triggers |
| **Dot Grid Background** | Interactive dot-grid pattern with glowing cursor-following effect |
| **Floating Dock** | macOS-style dock with magnetic scaling, spring physics, and tooltips |
| **Confetti Burst** | Click-triggered confetti particle explosion with customizable colors |
| **Drawer Slide** | Slide-out drawer panel with drag-to-dismiss and backdrop blur |
| **Notification Stack** | Stacked toast notifications with auto-dismiss and progress bars |
| **Animated Timeline** | Scroll-triggered timeline with staggered spring animations |

## Installation

### Prerequisites

- **Node.js** ≥ 18
- **React** ≥ 18
- **Tailwind CSS** ≥ 3

### Quick Start

**1. Initialize your project:**

```bash
npx uniqueui init
```

This configures your project by setting up the required utility function (`cn`) and ensuring dependencies are installed.

**2. Add a component:**

```bash
npx uniqueui add spotlight-card
```

The CLI will:
- Fetch the component source from the registry
- Copy it into your project's component directory
- Install any missing dependencies (`motion`, `clsx`, `tailwind-merge`)

**3. Use it:**

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

## CLI

The UniqueUI CLI provides two commands:

| Command | Description |
|---------|-------------|
| `uniqueui init` | Configure your project for UniqueUI (sets up `cn` utility and installs base dependencies) |
| `uniqueui add <component>` | Add a specific component to your project |

### Options

```
uniqueui add <component> [options]

Options:
  --url <url>    Custom registry URL (default: GitHub raw URL)
```

### Dependencies

Each component declares its own dependencies. Most components need:

- [`motion`](https://motion.dev) — Animation library (successor to Framer Motion)
- [`clsx`](https://github.com/lukeed/clsx) — Conditional class names
- [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) — Merge Tailwind classes without conflicts

## Compatibility

UniqueUI components are designed to be universally compatible:
- **Tailwind CSS**: Native support for Tailwind CSS (v3 and v4).
- **Shadcn UI**: Seamlessly integrates into any Shadcn UI project because both use the copy-paste philosophy and `cn` utility logic.
- **Other React UI Libraries**: Since there is no runtime dependency for the library itself, components can be used alongside Chakra UI, Radix Primitives, NextUI, or any other React framework without conflicts.

## Development

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces |
| **Showcase** | Next.js 16.1.1 (App Router) |
| **Framework** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Motion 12 (motion/react) |
| **Icons** | Lucide React |
| **CLI** | Commander + Chalk + Ora |

### Getting Started

```bash
# Clone the repo
git clone https://github.com/pras75299/uniqueui.git
cd uniqueui

# Install dependencies
pnpm install

# Run the showcase site
cd apps/www
pnpm dev
```

The showcase site will be available at `http://localhost:3000`.

### Building

```bash
# Build the showcase site
cd apps/www
pnpm build

# Build the CLI
cd packages/cli
pnpm build

# Build the registry
pnpm build:registry   # from root
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
│       │   ├── layout.tsx      # Root layout (Geist font)
│       │   └── globals.css     # Global styles & keyframes
│       ├── components/
│       │   └── ui/             # All 21 UI components
│       └── config/
│           ├── components.ts   # Component metadata (name, slug, icon, description)
│           └── demos.tsx       # Component demo configurations
├── packages/
│   └── cli/                    # UniqueUI CLI tool
│       └── src/
│           ├── index.ts        # CLI entry point (Commander)
│           └── commands/
│               ├── init.ts     # `uniqueui init` command
│               └── add.ts      # `uniqueui add` command
├── registry/                   # Component source files + config
│   ├── config.ts               # Registry configuration (dependencies, files)
│   └── *.tsx                   # 21 component source files
├── scripts/
│   └── build-registry.ts      # Generates registry.json from config
├── registry.json               # Generated registry manifest
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root package.json
```

## How It Works

1. **Registry** — Each component is defined in `registry/config.ts` with its name, dependencies, and file paths. The `build-registry` script reads the source files and outputs `registry.json` with embedded source code.

2. **CLI** — When a user runs `uniqueui add <component>`, the CLI fetches `registry.json` from GitHub, finds the requested component, writes the source files to the user's project, and installs any missing npm dependencies.

3. **Showcase** — The `apps/www` Next.js site serves as both the marketing landing page and component documentation. Each component has a dedicated page with a live preview and install command.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-component`)
3. Add your component to `registry/` and update `registry/config.ts`
4. Add it to the showcase in `apps/www/components/ui/`, `config/components.ts`, and `config/demos.tsx`
5. Run `pnpm build` to ensure everything compiles
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built by <a href="https://github.com/pras75299">@pras75299</a>
</p>
