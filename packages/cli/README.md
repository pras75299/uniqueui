# UniqueUI CLI

> Add beautiful, animated UI components to your React project with a single command.

[![npm version](https://img.shields.io/npm/v/uniqueui-cli.svg)](https://www.npmjs.com/package/uniqueui-cli)
[![license](https://img.shields.io/npm/l/uniqueui-cli.svg)](https://github.com/pras75299/uniqueui/blob/main/LICENSE)

UniqueUI is a collection of **copy-paste animated components** built with React, Tailwind CSS, and Motion. The CLI fetches components from the registry and drops them directly into your project — no runtime dependency on UniqueUI itself.

---

## Quick Start

### 1. Initialize your project

```bash
npx uniqueui-cli init
```

This creates a `components.json` config file with your preferences:

- Component install directory (default: `components/ui`)
- TypeScript support
- Tailwind config path

### 2. Add a component

```bash
npx uniqueui-cli add moving-border
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
npx uniqueui-cli <command>
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
| `moving-border` | Animated glowing border that follows a path |
| `typewriter-text` | Text that types itself character by character |
| `3d-tilt-card` | Card that tilts on hover with 3D perspective |
| `spotlight-card` | Card with a spotlight effect following the cursor |
| `aurora-background` | Animated aurora borealis gradient background |
| `animated-tabs` | Tab navigation with smooth animated indicator |
| `magnetic-button` | Button that magnetically follows cursor on hover |
| `infinite-marquee` | Continuously scrolling horizontal content |
| `scroll-reveal` | Elements that animate in on scroll |
| `skeleton-shimmer` | Loading skeleton with shimmer animation |
| `morphing-modal` | Modal with smooth morphing open/close transitions |
| `gradient-text-reveal` | Text with animated gradient color reveal |
| `scramble-text` | Text that scrambles/unscrambles on hover |
| `meteors-card` | Card with animated falling meteor effects |
| `flip-card` | Card that flips to reveal back content |
| `dot-grid-background` | Animated dot grid pattern background |
| `floating-dock` | macOS‑style floating dock navigation |
| `confetti-burst` | Confetti particle burst animation |
| `drawer-slide` | Slide-in drawer panel with smooth transitions |
| `notification-stack` | Stacked notification cards with animations |
| `animated-timeline` | Vertical timeline with scroll-triggered animations |

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
npx uniqueui-cli add aurora-background
npx uniqueui-cli add magnetic-button
npx uniqueui-cli add animated-tabs
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
