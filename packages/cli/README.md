# UniqueUI CLI

> Add beautiful, animated UI components to your React project with a single command.

[![npm version](https://img.shields.io/npm/v/uniqueui-cli.svg)](https://www.npmjs.com/package/uniqueui-cli)
[![license](https://img.shields.io/npm/l/uniqueui-cli.svg)](https://github.com/pras75299/uniqueui/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/uniqueui-cli.svg)](https://nodejs.org)

UniqueUI is a collection of **copy-paste animated components** built with React, Tailwind CSS, and Motion. The CLI fetches components from the registry and drops them directly into your project — **no runtime dependency on UniqueUI itself**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Requirements](#requirements)
- [Commands](#commands)
  - [init](#init)
  - [add](#add-component)
  - [list](#list)
- [Project Setup Guide](#project-setup-guide)
  - [Next.js](#nextjs-setup)
  - [Vite + React](#vite--react-setup)
  - [Create React App](#create-react-app-setup)
- [Available Components](#available-components)
- [Usage Examples](#usage-examples)
- [How It Works](#how-it-works)
- [Customization](#customization)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Links](#links)

---

## Quick Start

```bash
# 1. Initialize UniqueUI in your project
npx uniqueui init

# 2. Add your first component
npx uniqueui add moving-border

# 3. Import and use it
```

```tsx
import { Button } from "@/components/ui/moving-border";

export default function Hero() {
  return <Button>Get Started</Button>;
}
```

---

## Installation

### Option A — Run directly (recommended)

```bash
npx uniqueui <command>
# or
pnpm dlx uniqueui <command>
# or
bunx uniqueui <command>
```

### Option B — Install globally

```bash
npm install -g uniqueui-cli
# then use directly
uniqueui <command>
```

### Option C — Install as a dev dependency

```bash
npm install -D uniqueui-cli
# then run via npx or package scripts
npx uniqueui <command>
```

---

## Requirements

| Requirement | Version |
|---|---|
| **Node.js** | ≥ 18 |
| **React** | ≥ 18 |
| **Tailwind CSS** | ≥ 3 |

> **Note:** All components use [Motion](https://motion.dev) (formerly Framer Motion). The CLI installs `motion` automatically when you add a component that needs it.

---

## Commands

### `init`

Set up UniqueUI configuration for your project. Run this **once** before adding any components.

```bash
npx uniqueui init
```

You'll be prompted for:

| Prompt | Default | Description |
|---|---|---|
| Components directory | `components/ui` | Where component files will be saved |
| TypeScript | `yes` | Whether to use `.tsx` files |
| Tailwind config path | `tailwind.config.ts` | Path to your Tailwind configuration file |

This creates a `components.json` file in your project root:

```json
{
  "componentsDir": "components/ui",
  "typescript": true,
  "tailwindConfig": "tailwind.config.ts"
}
```

---

### `add <component>`

Fetch a component from the registry and install it into your project.

```bash
npx uniqueui add <component-name>
```

**What happens when you run `add`:**

1. Fetches the component source code from the GitHub registry
2. Installs any required npm dependencies (`motion`, `clsx`, `tailwind-merge`)
3. Merges required Tailwind animations/keyframes into your `tailwind.config.ts`
4. Writes the component `.tsx` file to your configured directory
5. Writes a `utils/cn.ts` helper file (if not already present)

**Options:**

| Flag | Description |
|---|---|
| `--url <url>` | Use a custom registry URL instead of the default GitHub registry |

**Examples:**

```bash
# Add a single component
npx uniqueui add aurora-background

# Add multiple components in sequence
npx uniqueui add moving-border
npx uniqueui add magnetic-button
npx uniqueui add animated-tabs

# Add from a custom registry
npx uniqueui add my-component --url https://my-registry.com/components
```

---

### `list`

Display all components available in the registry.

```bash
npx uniqueui list
```

---

## Project Setup Guide

### Next.js Setup

**Step 1 — Create a Next.js project (skip if you already have one)**

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
```

**Step 2 — Initialize UniqueUI**

```bash
npx uniqueui init
```

When prompted, use:
- Components directory: `components/ui`
- Tailwind config: `tailwind.config.ts`

**Step 3 — Add components**

```bash
npx uniqueui add moving-border
npx uniqueui add aurora-background
```

**Step 4 — Configure your path alias**

Ensure `tsconfig.json` has the `@` alias set up (Next.js does this by default):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Step 5 — Use in your page**

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

---

### Vite + React Setup

**Step 1 — Create a Vite project**

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

**Step 2 — Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.ts`:

```ts
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Add Tailwind directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3 — Configure the `@` path alias**

Install the path resolver:

```bash
npm install -D @types/node
```

Update `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 4 — Initialize UniqueUI**

```bash
npx uniqueui init
```

When prompted, use:
- Components directory: `src/components/ui`

**Step 5 — Add and use components**

```bash
npx uniqueui add typewriter-text
```

```tsx
// src/App.tsx
import { TypewriterText } from "@/components/ui/typewriter-text";

function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <TypewriterText
        words={["Beautiful", "Animated", "Components"]}
        className="text-4xl font-bold text-purple-400"
      />
    </div>
  );
}

export default App;
```

---

### Create React App Setup

**Step 1 — Create a CRA project**

```bash
npx create-react-app my-app --template typescript
cd my-app
```

**Step 2 — Install Tailwind CSS**

```bash
npm install -D tailwindcss
npx tailwindcss init
```

**Step 3 — Configure Tailwind**

Update `tailwind.config.js`:

```js
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4 — Add `@` path alias** (CRA via `craco` or `react-app-rewired`)

```bash
npm install -D @craco/craco
```

Create `craco.config.js`:

```js
const path = require("path");
module.exports = {
  webpack: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
};
```

Update `package.json` scripts to use `craco`:

```json
"scripts": {
  "start": "craco start",
  "build": "craco build"
}
```

**Step 5 — Initialize and add components**

```bash
npx uniqueui init
npx uniqueui add magnetic-button
```

---

## Available Components

| Component | Install Command | Category | Description |
|---|---|---|---|
| `moving-border` | `npx uniqueui add moving-border` | Effects & Animations | SVG-path-tracing animated border that orbits a button or card. |
| `typewriter-text` | `npx uniqueui add typewriter-text` | Text | Character-by-character typing with blinking cursor, configurable speed, and delete-retype loop. |
| `3d-tilt-card` | `npx uniqueui add 3d-tilt-card` | Cards | Perspective-shifting card that tilts toward the cursor with parallax layers and glare overlay. |
| `spotlight-card` | `npx uniqueui add spotlight-card` | Cards | Card with a radial spotlight that follows the mouse cursor across its surface. |
| `aurora-background` | `npx uniqueui add aurora-background` | Backgrounds | Flowing aurora borealis gradient animation using layered blurred blobs. |
| `animated-tabs` | `npx uniqueui add animated-tabs` | Navigation & Overlays | Tab bar with a sliding pill that morphs between active tabs using layout animation. |
| `magnetic-button` | `npx uniqueui add magnetic-button` | Effects & Animations | Button that stretches toward the cursor when nearby and snaps back with spring physics. |
| `infinite-marquee` | `npx uniqueui add infinite-marquee` | Effects & Animations | Seamless infinite-scrolling ticker with pause-on-hover and variable speed. |
| `scroll-reveal` | `npx uniqueui add scroll-reveal` | Effects & Animations | Elements animate into view when they enter the viewport, with 6 animation presets. |
| `skeleton-shimmer` | `npx uniqueui add skeleton-shimmer` | Effects & Animations | Skeleton loading placeholders with animated shimmer gradient sweep and pulse fade. |
| `morphing-modal` | `npx uniqueui add morphing-modal` | Navigation & Overlays | Modal that expands from the trigger element with spring physics and backdrop blur. |
| `gradient-text-reveal` | `npx uniqueui add gradient-text-reveal` | Text | Word-by-word text reveal with gradient coloring and blur-to-clear spring animation. |
| `scramble-text` | `npx uniqueui add scramble-text` | Text | Matrix-style text scramble effect that resolves characters left-to-right. |
| `meteors-card` | `npx uniqueui add meteors-card` | Cards | Card with animated meteor/shooting star particles falling through the background. |
| `flip-card` | `npx uniqueui add flip-card` | Cards | 3D card flip with spring physics, supporting hover or click triggers. |
| `dot-grid-background` | `npx uniqueui add dot-grid-background` | Backgrounds | Interactive dot-grid pattern with a glowing cursor-following effect. |
| `floating-dock` | `npx uniqueui add floating-dock` | Navigation & Overlays | macOS-style dock with magnetic scaling, spring physics, and tooltips. |
| `confetti-burst` | `npx uniqueui add confetti-burst` | Effects & Animations | Click-triggered confetti particle explosion with customizable colors and physics. |
| `drawer-slide` | `npx uniqueui add drawer-slide` | Navigation & Overlays | Slide-out drawer panel with drag-to-dismiss, spring physics, and backdrop blur. |
| `notification-stack` | `npx uniqueui add notification-stack` | Navigation & Overlays | Stacked toast notifications with auto-dismiss progress, sliding animations, and multiple types. |
| `animated-timeline` | `npx uniqueui add animated-timeline` | Effects & Animations | Scroll-triggered timeline with 4 distinct Motion.dev animation variants: vertical spring, horizontal growing line, alternating cards, and numbered steps. |
| `nested-comments` | `npx uniqueui add nested-comments` | Social & Interaction | Threaded comment section with infinite nesting, animated expand/collapse, inline reply composer, and spring-physics like button. |
| `hover-reveal-card` | `npx uniqueui add hover-reveal-card` | Cards | Card that displays an image with teaser content, then slides up a full details panel on hover with staggered Motion.dev animations. |
| `bento-grid` | `npx uniqueui add bento-grid` | Cards | Responsive masonry-style grid layout with staggered scroll-reveal entrance, hover border glow, and icon scale animations per cell. |
| `particle-field` | `npx uniqueui add particle-field` | Backgrounds | Canvas-based floating particles with mouse-repulsion physics and responsive connecting lines. |
| `horizontal-scroll-gallery` | `npx uniqueui add horizontal-scroll-gallery` | Effects & Animations | Converts vertical scroll into horizontal movement with momentum physics for immersive galleries. |
| `radial-menu` | `npx uniqueui add radial-menu` | Navigation & Overlays | Circular flyout menu that bursts items outward from a center trigger with staggered spring animation. |
| `cursor-trail` | `npx uniqueui add cursor-trail` | Cursor Effects | Glowing trail that follows the cursor with decay physics, like a sparkler or comet tail. |

---

## Usage Examples

### Hero section with Aurora Background + Moving Border

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
          <TypewriterText
            words={["Motion", "Style", "UniqueUI"]}
            className="text-purple-400"
          />
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
    <ScrollRevealGroup
      animation="fade-up"
      staggerDelay={0.15}
      className="grid md:grid-cols-3 gap-6 p-12"
    >
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
  { title: "Home", icon: <Home />, href: "/" },
  { title: "About", icon: <User />, href: "/about" },
  { title: "Work", icon: <Briefcase />, href: "/work" },
  { title: "Contact", icon: <Mail />, href: "/contact" },
];

export default function Nav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <FloatingDock items={navItems} />
    </div>
  );
}
```

### Toast notifications

```tsx
"use client";
import { useState } from "react";
import { NotificationStack } from "@/components/ui/notification-stack";

export default function App() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = () => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now(), message: "Action completed!", type: "success" },
    ]);
  };

  return (
    <>
      <button onClick={addNotification}>Trigger notification</button>
      <NotificationStack
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />
    </>
  );
}
```

---

## How It Works

UniqueUI follows the **copy-paste component model** (similar to shadcn/ui):

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

1. Components live in a public GitHub registry
2. The CLI fetches the source code at install time
3. Files are written **directly into your project** — you own and can edit them freely
4. **No runtime dependency on UniqueUI** — components only depend on `motion`, `clsx`, and `tailwind-merge`

---

## Customization

Since you own the component files after installing, you can customize anything:

### Change colors & styling

```tsx
// Before
<Button className="bg-zinc-950 text-white">Click me</Button>

// After — your brand colors
<Button className="bg-indigo-950 text-indigo-100 border-indigo-700">Click me</Button>
```

### Adjust animation speed

```tsx
// TypewriterText - slow down typing
<TypewriterText words={["Hello"]} typingSpeed={200} deletingSpeed={100} />

// MovingBorder - speed up orbit
<Button duration={1500}>Fast border</Button>
```

### Add Tailwind variants

Components are plain `.tsx` files — add variants, dark mode, responsive styles as needed:

```tsx
<SpotlightCard className="md:p-8 lg:p-12 dark:bg-neutral-950">
  {/* your content */}
</SpotlightCard>
```

---

## Configuration Reference

`components.json` (created by `npx uniqueui init`):

```json
{
  "componentsDir": "components/ui",
  "typescript": true,
  "tailwindConfig": "tailwind.config.ts"
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `componentsDir` | `string` | `components/ui` | Directory where component files are installed |
| `typescript` | `boolean` | `true` | Use `.tsx` file extension for components |
| `tailwindConfig` | `string` | `tailwind.config.ts` | Path to your Tailwind config for auto-merging animations |

---

## Troubleshooting

### `Cannot find module '@/utils/cn'`

The `cn` utility your component imports is not at `@/utils/cn` in your setup. Fix by either:

**A)** Update the import to match where `cn` lives in your project:
```ts
import { cn } from "@/lib/utils"; // if using Next.js shadcn-style setup
```

**B)** Or ensure `utils/cn.ts` exists (the CLI creates this automatically — re-run `npx uniqueui add <component>`).

---

### `Module not found: Can't resolve 'motion/react'`

Install the motion package manually:

```bash
npm install motion
```

---

### Tailwind animations not working

Ensure your `tailwind.config.ts` `content` array includes the component files:

```ts
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",  // ← make sure this is here
  "./src/**/*.{ts,tsx}",
],
```

---

### Component file not appearing after `add`

Check your `components.json` `componentsDir` matches the actual directory:

```bash
cat components.json
# Look at "componentsDir" — this is where the file was written
```

---

### `npx uniqueui` — command not found

Ensure you're running Node.js ≥ 18:

```bash
node --version  # should be v18 or higher
```

---

## Links

- [GitHub Repository](https://github.com/pras75299/uniqueui)
- [Report an Issue](https://github.com/pras75299/uniqueui/issues)
- [npm Package](https://www.npmjs.com/package/uniqueui-cli)

---

## License

MIT © [pras75299](https://github.com/pras75299)
