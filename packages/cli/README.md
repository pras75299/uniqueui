# UniqueUI CLI

> Add beautiful, animated UI components to your React project with a single command.

[![npm version](https://img.shields.io/npm/v/uniqueui-cli.svg)](https://www.npmjs.com/package/uniqueui-cli)
[![license](https://img.shields.io/npm/l/uniqueui-cli.svg)](https://github.com/pras75299/uniqueui/blob/main/LICENSE)

UniqueUI is a collection of **copy-paste animated components** built with React, Tailwind CSS, and Motion. The CLI fetches components from the registry and drops them directly into your project — no runtime dependency on UniqueUI itself.

---

## Quick Start

### 1. Initialize your project

```bash
npx uniqueui init
```

This creates a `components.json` config file with your preferences:

- Component install directory (default: `components/ui`)
- TypeScript support
- Tailwind config path

### 2. Add a component

```bash
npx uniqueui add moving-border
```

The CLI will:
- Fetch the component source code from the registry
- Install required dependencies (`motion`, `clsx`, `tailwind-merge`)
- Update your Tailwind config with any needed animations/keyframes
- Write the component file to your configured directory

---

## Installation

You can use `npx` directly (no install needed):

```bash
npx uniqueui <command>
```

Or install globally:

```bash
npm install -g uniqueui-cli
```

---

## Commands

### `init`

Configure your project for UniqueUI.

```bash
uniqueui init
```

You'll be prompted for:

| Prompt | Default | Description |
|---|---|---|
| Components directory | `components/ui` | Where component files are saved |
| TypeScript | `yes` | Whether to use `.tsx` files |
| Tailwind config path | `tailwind.config.ts` | Path to your Tailwind config |

### `add <component>`

Add a component to your project.

```bash
uniqueui add <component-name>
```

**Options:**

| Flag | Default | Description |
|---|---|---|
| `--url <url>` | GitHub registry | Custom registry URL |

---

## Available Components

| Component | Description |
|---|---|
| `moving-border` | SVG-path-tracing animated border that orbits a button or card |
| `typewriter-text` | Character-by-character typing with blinking cursor and delete-retype loop |
| `3d-tilt-card` | Perspective-shifting card that tilts toward the cursor with parallax layers |
| `spotlight-card` | Card with a radial spotlight that follows the mouse cursor |
| `aurora-background` | Flowing aurora borealis gradient animation using layered blurred blobs |
| `animated-tabs` | Tab bar with a sliding pill that morphs between tabs using layout animation |
| `magnetic-button` | Button that stretches toward the cursor and snaps back with spring physics |
| `infinite-marquee` | Seamless infinite-scrolling ticker with pause-on-hover |
| `scroll-reveal` | Elements animate into view on scroll, with 6 animation presets |
| `skeleton-shimmer` | Loading placeholders with animated shimmer gradient sweep |
| `morphing-modal` | Modal that expands from the trigger element with spring physics |
| `gradient-text-reveal` | Word-by-word text reveal with gradient coloring and blur-to-clear animation |
| `scramble-text` | Matrix-style text scramble effect that resolves characters left-to-right |
| `meteors-card` | Card with animated shooting star particles through the background |
| `flip-card` | 3D card flip with spring physics, hover or click triggers |
| `dot-grid-background` | Interactive dot-grid pattern with glowing cursor-following effect |
| `floating-dock` | macOS-style dock with magnetic scaling, spring physics, and tooltips |
| `confetti-burst` | Click-triggered confetti particle explosion with customizable colors |
| `drawer-slide` | Slide-out drawer panel with drag-to-dismiss and backdrop blur |
| `notification-stack` | Stacked toast notifications with auto-dismiss and progress bars |
| `animated-timeline` | Scroll-triggered timeline with staggered spring animations |

---

## Requirements

- **Node.js** ≥ 18
- **React** ≥ 18
- **Tailwind CSS** ≥ 3

---

## How It Works

UniqueUI follows the **copy-paste component** model (similar to shadcn/ui):

1. Components live in a public GitHub registry
2. The CLI fetches component source code at install time
3. Files are written directly into your project — you own the code
4. No runtime dependency on UniqueUI

This means you can freely customize every component after adding it.

---

## Example

```bash
# Initialize
npx uniqueui-cli init

# Add components
npx uniqueui add aurora-background
npx uniqueui add magnetic-button
npx uniqueui add animated-tabs
```

Then use in your React code:

```tsx
import { AuroraBackground } from "@/components/ui/aurora-background";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Hero() {
  return (
    <AuroraBackground>
      <h1>Welcome to my site</h1>
      <MagneticButton>Get Started</MagneticButton>
    </AuroraBackground>
  );
}
```

---

## Links

- [GitHub Repository](https://github.com/pras75299/uniqueui)
- [Report an Issue](https://github.com/pras75299/uniqueui/issues)

---

## License

MIT © [pras75299](https://github.com/pras75299)
