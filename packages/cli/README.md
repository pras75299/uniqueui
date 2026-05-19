# UniqueUI CLI

> Add beautiful, animated UI components to your React project with a single command.

[![npm version](https://img.shields.io/npm/v/uniqueui-cli.svg)](https://www.npmjs.com/package/uniqueui-cli)
[![npm total downloads](https://img.shields.io/npm/dt/uniqueui-cli.svg)](https://www.npmjs.com/package/uniqueui-cli)
[![npm monthly downloads](https://img.shields.io/npm/dm/uniqueui-cli.svg)](https://www.npmjs.com/package/uniqueui-cli)
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
  - [info](#info-component)
  - [doctor](#doctor)
  - [search](#search-query)
- [Installing with the shadcn CLI](#installing-with-the-shadcn-cli)
- [Project Setup Guide](#project-setup-guide)
  - [Next.js](#nextjs-setup)
  - [Vite + React](#vite--react-setup)
  - [Create React App](#create-react-app-setup)
- [Available Components](#available-components)
- [Usage Examples](#usage-examples)
- [How It Works](#how-it-works)
- [Customization](#customization)
- [Configuration Reference](#configuration-reference)
- [Security](#security)
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

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 18 | 20 LTS / 22 LTS recommended. The UniqueUI monorepo itself pins Node 24 for contributors — that does **not** apply to end users of this CLI. |
| **React** | 18 or 19 | Components target both. |
| **Tailwind CSS** | 3.4+ or 4.x | The CLI detects your major (via `@tailwindcss/postcss`, a 4.x `tailwindcss` range, or `@import "tailwindcss"` in your CSS). v3: tokens auto-merge into `tailwind.config.*`. v4: a marker-wrapped `@theme` snippet is appended to `components.json#tailwind.css`. Idempotent + dry-run safe. |

> **Tailwind v4 note:** `uniqueui add` detects v4 projects and appends a marker-wrapped `@theme` snippet to the file pointed at by `components.json#tailwind.css` (default `app/globals.css`). Re-running is safe — slug markers make the append idempotent — and `--dry-run` prints the snippet without writing. On v3 projects the same command merges `theme.extend` into `tailwind.config.*` instead. The full matrix lives at [`/docs/compatibility`](https://uniqueui-platform.vercel.app/docs/compatibility).

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
  "$schema": "https://uniqueui-platform.vercel.app/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils"
  },
  "paths": {
    "components": "components/ui",
    "lib": "utils"
  }
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
| `--dry-run` | Print every file that would be written + every dependency that would be installed, write nothing |
| `--force` | Overwrite existing component files without prompting (default behavior is to prompt with a `skip` / `overwrite` / `diff` choice) |
| `-y, --yes` | Skip the dependency-install confirmation prompt |

**Examples:**

```bash
# Add a single component
npx uniqueui add aurora-background

# Preview what would change without writing anything
npx uniqueui add moving-border --dry-run

# Re-fetch and overwrite a component you've already customized (be careful)
npx uniqueui add moving-border --force

# Add from a custom registry
npx uniqueui add my-component --url https://my-registry.com/components
```

**Overwrite behavior:** When `add` finds an existing `components/ui/<slug>.tsx`, it prompts for `skip` / `overwrite` / `diff`. Choose `diff` to see a line-by-line comparison between your file and the registry version before deciding. In non-interactive shells (CI) the default is to skip — pass `--force` to overwrite.

---

## Installing with the shadcn CLI

The same components are published in **shadcn registry** format at **`https://uniqueui-platform.vercel.app/r/<slug>.json`** (and `https://uniqueui-platform.vercel.app/r/registry.json` for the full catalog). Use this if your app already follows the shadcn/ui workflow (`components.json`, `@/lib/utils` with `cn`, Tailwind v3-style config).

```bash
npx shadcn@latest add https://uniqueui-platform.vercel.app/r/moving-border.json -y
```

- Component snippets import **`@/lib/utils`** — the shadcn registry item does **not** ship a second `cn` file (your project should already have it from `shadcn init`).
- The CLI writes **`components/ui/<slug>.tsx`** (plus Tailwind merges when the component defines them).
- **UniqueUI CLI vs shadcn:** `uniqueui add` uses the split registry under `/registry/` and can scaffold `utils/cn.ts`; `shadcn add` uses `/r/*.json` and expects a shadcn-aligned project.

Upstream repo: after `pnpm build:registry`, the same JSON files exist under `apps/www/public/r/` for local testing.

---

### `list`

Display every component available in the registry, sorted alphabetically with descriptions when the source exposes them.

```bash
npx uniqueui list
```

**Options:**

| Flag | Description |
|---|---|
| `--url <url>` | List from a custom registry URL or local path (e.g. `./apps/www/public`) instead of the default hosted registry |

**Output:**

```text
UniqueUI components — 59 available
Source: https://uniqueui-platform.vercel.app

3d-tilt-card        Perspective-shifting card that tilts toward the cursor.
aurora-background   Smooth aurora light background mimicking the northern lights.
…
```

The command tries `<url>/r/registry.json` (shadcn format, has descriptions) first, falls back to `<url>/registry/index.json` (split index, names only), then `<url>/registry.json` (legacy aggregate).

### `info <component>`

Print metadata for a single registry component without writing anything to disk — useful for previewing dependencies, files, and Tailwind requirements before `add`.

```bash
npx uniqueui info moving-border
```

**Options:**

| Flag | Description |
|---|---|
| `--url <url>` | Look up the component in a custom registry URL or local path instead of the default hosted registry |

**Output:**

```text
moving-border — Moving Border
SVG-path-tracing animated border that orbits a button or card.
Source: https://uniqueui-platform.vercel.app/registry/moving-border.json

Dependencies
  - motion
  - clsx
  - tailwind-merge

Files
  - moving-border/component.tsx (registry:ui)
  - utils/cn.ts (registry:util)

Tailwind
  v3 JS config: 1 animation(s), 1 keyframe(s)
    animations: border-spin
    keyframes:  border-spin
  v4 CSS snippet: 151 bytes (appended to globals.css on add)

Add it with: npx uniqueui add moving-border
```

Exits non-zero when the slug is not found in the registry source.

### `doctor`

Diagnose your project's setup for UniqueUI. Reads only — never writes — and prints a checklist with hints for anything that would block `add`.

```bash
npx uniqueui doctor
```

**What it checks:**

- **Node.js** — must be ≥ 18 (fails the run otherwise).
- **Package manager** — which lockfile is present (`bun` → `pnpm` → `yarn` → `npm`).
- **Framework** — Next, Vite, Remix, or Astro (informational).
- **`components.json`** — present and valid JSON object.
- **Tailwind** — v3 (config file present) or v4 (globals CSS path resolves), with hints when the configured path is missing.
- **`tsconfig.json` paths** — `@/*` alias is defined so registry imports like `@/utils/cn` resolve.
- **`cn` helper** — `utils/cn.ts` (UniqueUI default) or `lib/utils.ts` (shadcn convention) exists.
- **Components directory** — informational; created on first `add` if missing.

Exits `1` when any check fails, `0` otherwise.

### `search <query>`

Search the registry by name, title, or description and rank results. Useful when you know roughly what you want but not the exact slug.

```bash
npx uniqueui search border
npx uniqueui search "cursor follow" --limit 5
```

**Options:**

| Flag | Description |
|---|---|
| `--url <url>` | Search a custom registry URL or local path instead of the default hosted registry |
| `--limit <n>` | Maximum results to show (default 20). A truncation hint prints when more results exist. |

**Ranking (highest to lowest):**

1. Exact name match
2. Name starts with the query
3. Name contains the query
4. Title contains the query
5. Description contains the query

Within the same tier, shorter fields rank higher (tighter match), and ties break alphabetically by name for deterministic output. Exits non-zero only on registry-load failure or empty query.

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
| `pen-cursor` | `npx uniqueui add pen-cursor` | Cursor Effects | Spring-smoothed stroke with fast-fading ink tail; system cursor visible by default; grey by default. |
| `mini-mac-keyboard` | `npx uniqueui add mini-mac-keyboard` | Decorative | Compact decorative Mac-style keyboard strip for hero/device scenes and desktop mockups. |
| `macbook-mock` | `npx uniqueui add macbook-mock` | Device Mockups | Animated 3D MacBook-style frame with reveal screen, dynamic island states, and accessible interactions. |

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
       ├── npx uniqueui add <component>
       │        ▼
       │   Your project (UniqueUI components.json + utils/cn)
       │
       └── npx shadcn add https://uniqueui-platform.vercel.app/r/<slug>.json
                ▼
            Your project (shadcn components.json + @/lib/utils)
```

1. Components live in a public registry; builds also emit **shadcn-compatible** `r/*.json` URLs.
2. The UniqueUI CLI (or shadcn CLI) fetches the source at install time.
3. Files are written **directly into your project** — you own and can edit them freely.
4. **No runtime dependency on UniqueUI** — components only depend on `motion`, `clsx`, and `tailwind-merge` (and whatever your app already uses for icons, etc.).

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
  "$schema": "https://uniqueui-platform.vercel.app/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils"
  },
  "paths": {
    "components": "components/ui",
    "lib": "utils"
  }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `tsx` | `boolean` | `true` | Use `.tsx` file extension for components |
| `tailwind.config` | `string` | `tailwind.config.ts` | Path to your Tailwind config for auto-merging animations (v3) |
| `tailwind.css` | `string` | `app/globals.css` | Path to the global stylesheet |
| `tailwind.baseColor` | `string` | `slate` | Tailwind color scale used for defaults |
| `tailwind.cssVariables` | `boolean` | `true` | Whether the project uses CSS variables for theming |
| `aliases.components` | `string` | `@/components` | Import alias for components |
| `aliases.utils` | `string` | `@/utils` | Import alias for the `cn` helper |
| `paths.components` | `string` | `components/ui` | Disk directory where component files are installed |
| `paths.lib` | `string` | `utils` | Disk directory for `cn.ts` |

---

## Security

**Registry trust:** `uniqueui add` downloads a registry and then installs npm packages and writes files into your project. Using `--url` with an **untrusted** host is equivalent to trusting arbitrary remote code.

- Prefer the **default** registry URL or a **local** `./registry.json` you control.
- The CLI prints a **warning** when `--url` is not a known official host; set `UNIQUEUI_SKIP_REGISTRY_WARN=1` only in CI after you have verified the URL.
- Dependency names are **validated** before `npm`/`pnpm`/`yarn` runs, and installs use **no shell** to limit injection from tampered registry data.
- Only `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, and `.cjs` filenames from the registry are written.

See the repository root [**SECURITY.md**](https://github.com/pras75299/uniqueui/blob/main/SECURITY.md) for reporting vulnerabilities and more detail.

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
