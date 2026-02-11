# UniqueUI — Animated Component Library

> A premium collection of **animated, motion-powered React components** built with [Motion](https://motion.dev) and Tailwind CSS. Every component ships with rich animations out of the box — no basic, static primitives here.

---

## Tech Stack

| Layer        | Technology                  |
| ------------ | --------------------------- |
| Framework    | React 19 / Next.js         |
| Animations   | `motion` (motion/react)     |
| Styling      | Tailwind CSS                |
| Utilities    | `clsx` + `tailwind-merge`   |
| Distribution | CLI (`uniqueui-cli`) + JSON registry |

---

## Component Categories & Roadmap

### ✅ = Shipped &nbsp; 🔲 = Planned

---

## 1 · Animated Borders & Glows

| #  | Component               | Status | Description |
| -- | ----------------------- | ------ | ----------- |
| 1  | **Moving Border**       | ✅     | SVG-path-tracing animated border that orbits a button or card. |
| 2  | **Glowing Border Card** | 🔲     | Card with a pulsing neon glow border that intensifies on hover with radial gradient tracking. |
| 3  | **Beam Border**         | 🔲     | A thin light beam that races around the perimeter of any container, comet-trail style. |

---

## 2 · Text Animations

| #  | Component                    | Status | Description |
| -- | ---------------------------- | ------ | ----------- |
| 4  | **Typewriter Text**          | ✅     | Character-by-character typing with blinking cursor, configurable speed, and delete-retype loop. |
| 5  | **Gradient Text Reveal**     | 🔲     | Text fades in word-by-word with a shifting gradient mask that sweeps left to right. |
| 6  | **Scramble Text**            | 🔲     | Text randomizes through characters before settling on the final string (hacker/matrix effect). |
| 7  | **Text Shimmer**             | 🔲     | Animated shimmer highlight passes across text in an infinite loop, like a metallic reflection. |
| 8  | **Split Text Entrance**      | 🔲     | Each letter/word flies in from a random direction, spring-animates into position with stagger. |
| 9  | **Counting Numbers**         | 🔲     | Animates a number from 0 to target with easing, supports formatting (commas, decimals, prefix/suffix). |
| 10 | **Rotating Words**           | 🔲     | Cycles through an array of words with flip/slide/fade transitions at configurable intervals. |

---

## 3 · Cards & Containers

| #  | Component                      | Status | Description |
| -- | ------------------------------ | ------ | ----------- |
| 11 | **3D Tilt Card**               | ✅     | Perspective-shifting card that tilts toward the cursor with parallax layers and glare overlay. |
| 12 | **Spotlight Card**             | ✅     | Card with a radial spotlight that follows the mouse cursor across its surface. |
| 13 | **Meteors Card**               | 🔲     | Card background with animated meteor streaks raining diagonally across it. |
| 14 | **Hover Reveal Card**          | 🔲     | Content hidden behind a blur/mask that dissolves on hover to reveal details with spring animation. |
| 15 | **Flip Card**                  | 🔲     | 3D card flip (Y-axis rotation) toggling between front and back faces on hover or click. |
| 16 | **Stacked Cards**              | 🔲     | Deck of overlapping cards that fan out and re-stack on interaction with drag-to-dismiss support. |
| 17 | **Glass Card**                 | 🔲     | Frosted glass morphism card with animated noise texture and subtle floating motion. |
| 18 | **Expandable Card**            | 🔲     | Card that smoothly expands into a full modal/detail view using layout animations. |

---

## 4 · Backgrounds & Decorative

| #  | Component                     | Status | Description |
| -- | ----------------------------- | ------ | ----------- |
| 19 | **Dot Grid Background**       | 🔲     | Animated dot matrix where dots pulse/ripple outward from mouse position. |
| 20 | **Aurora Background**         | ✅     | Flowing aurora borealis gradient animation using layered blurred blobs. |
| 21 | **Particle Field**            | 🔲     | Canvas-based floating particles with mouse-repulsion/attraction physics. |
| 22 | **Grid Beam Background**      | 🔲     | Subtle grid lines with animated beam highlights tracing random paths. |
| 23 | **Starfield**                 | 🔲     | Parallax starfield with twinkling stars that zoom toward the viewer. |
| 24 | **Vortex Background**         | 🔲     | Spiraling concentric rings that rotate at different speeds creating a depth vortex. |
| 25 | **Noise Gradient**            | 🔲     | Animated gradient with SVG noise filter overlay that shifts colors smoothly over time. |

---

## 5 · Navigation & Menus

| #  | Component                        | Status | Description |
| -- | -------------------------------- | ------ | ----------- |
| 26 | **Magnetic Navbar**              | 🔲     | Nav items with magnetic pull effect — items subtly shift toward the cursor when nearby. |
| 27 | **Animated Tabs**                | ✅     | Tab bar with a sliding pill/underline that morphs between active tabs using layout animation. |
| 28 | **Floating Dock**                | 🔲     | macOS-style dock — icons scale up with spring physics as cursor approaches, with tooltip labels. |
| 29 | **Radial Menu**                  | 🔲     | Circular flyout menu that bursts items outward from a center trigger with staggered spring. |
| 30 | **Morphing Hamburger**           | 🔲     | Hamburger icon that morphs into X/arrow/close with SVG path animation on toggle. |
| 31 | **Breadcrumb Reveal**            | 🔲     | Breadcrumbs slide in from left with staggered animation, collapsing middle items into an expandable ellipsis. |

---

## 6 · Scroll-Driven Components

| #  | Component                       | Status | Description |
| -- | ------------------------------- | ------ | ----------- |
| 32 | **Scroll Reveal**               | ✅     | Elements animate into view (fade, slide, scale) when they enter the viewport, with configurable thresholds. |
| 33 | **Parallax Section**            | 🔲     | Multi-layer parallax scrolling with different speed multipliers per layer. |
| 34 | **Horizontal Scroll Gallery**   | 🔲     | Converts vertical scroll into horizontal movement for a gallery section with momentum physics. |
| 35 | **Sticky Scroll Section**       | 🔲     | Content sticks while scrolling through steps/phases — text updates while an image/illustration morphs. |
| 36 | **Scroll Progress Bar**         | 🔲     | Animated progress bar at top or side that fills based on scroll position with gradient coloring. |
| 37 | **Text Highlight on Scroll**    | 🔲     | Text highlights word-by-word or line-by-line as the user scrolls past it (Kindle-style reading indicator). |

---

## 7 · Interactive Feedback & Micro-Interactions

| #  | Component                         | Status | Description |
| -- | --------------------------------- | ------ | ----------- |
| 38 | **Ripple Button**                 | 🔲     | Material-style ripple effect on click radiating from the exact pointer position with customizable color. |
| 39 | **Magnetic Button**               | ✅     | Button that stretches/pulls toward the cursor when nearby and snaps back with spring physics. |
| 40 | **Confetti Burst**                | 🔲     | Trigger a burst of confetti particles on action (button click, form submit) with physics simulation. |
| 41 | **Animated Tooltip**              | 🔲     | Tooltip with spring entrance animation, follows cursor or anchors to element with smart positioning. |
| 42 | **Liquid Toggle**                 | 🔲     | Toggle switch with a liquid/blob morph animation as it transitions between states. |
| 43 | **Pulse Ping**                    | 🔲     | Concentric rings pulse outward from an element (like notification badges or live indicators). |
| 44 | **Shake Input**                   | 🔲     | Input field that shakes with spring physics on validation error, with color flash feedback. |

---

## 8 · Modals & Overlays

| #  | Component                        | Status | Description |
| -- | -------------------------------- | ------ | ----------- |
| 45 | **Morphing Modal**               | ✅     | Modal that expands from the trigger element using shared layout animation — feels like zooming into content. |
| 46 | **Drawer Slide**                 | 🔲     | Off-canvas drawer that slides in from any edge with spring physics and drag-to-dismiss. |
| 47 | **Spotlight Dialog**             | 🔲     | Cmd+K style search dialog with backdrop blur, spring entrance, and result items that animate in with stagger. |
| 48 | **Notification Stack**           | 🔲     | Toast notifications that stack, slide in, auto-dismiss with progress bar, and re-layout on removal. |

---

## 9 · Data Display & Visualization

| #  | Component                        | Status | Description |
| -- | -------------------------------- | ------ | ----------- |
| 49 | **Animated Testimonials**        | 🔲     | Testimonial cards auto-rotate with crossfade/slide, with avatar entrance animation and star ratings. |
| 50 | **Infinite Marquee**             | ✅     | Seamless infinite-scrolling ticker of logos/text with pause-on-hover and variable speed. |
| 51 | **Animated Timeline**            | 🔲     | Vertical/horizontal timeline where nodes and connectors animate in sequentially on scroll. |
| 52 | **Animated Pricing Table**       | 🔲     | Pricing cards with toggle animation between monthly/yearly, number count-up, and feature list stagger. |
| 53 | **Animated List**                | 🔲     | List items animate in/out with layout animation, reorder with drag, staggered entrance on mount. |
| 54 | **Comparison Slider**            | 🔲     | Before/after image comparison with draggable divider and smooth reveal animation. |
| 55 | **Animated Progress Ring**       | 🔲     | SVG circular progress indicator with animated stroke-dashoffset and gradient color along the arc. |

---

## 10 · Layout & Page Transitions

| #  | Component                          | Status | Description |
| -- | ---------------------------------- | ------ | ----------- |
| 56 | **Page Transition Wrapper**        | 🔲     | Wraps Next.js pages with enter/exit animations (fade, slide, morph) between route changes. |
| 57 | **Animate Presence List**          | 🔲     | AnimatePresence-powered list where items gracefully mount/unmount with configurable animation presets. |
| 58 | **Bento Grid**                     | 🔲     | Responsive grid with items that animate into their positions with staggered spring and hover-expand. |
| 59 | **Masonry Animate**                | 🔲     | Animated masonry layout that re-flows with layout animation when items are added, removed, or filtered. |
| 60 | **Hero Parallax**                  | 🔲     | Full-width hero section with parallax image layers, text entrance animation, and scroll-triggered reveals. |

---

## 11 · Cursor Effects

| #  | Component                     | Status | Description |
| -- | ----------------------------- | ------ | ----------- |
| 61 | **Custom Cursor**             | 🔲     | Replaces default cursor with an animated dot + ring that reacts to hover states (expand, color-shift). |
| 62 | **Cursor Trail**              | 🔲     | Glowing trail that follows the cursor with decay physics, like a sparkler or comet tail. |
| 63 | **Cursor Spotlight**          | 🔲     | A radial gradient spotlight centered on the cursor that illuminates content underneath. |

---

## 12 · Image & Media

| #  | Component                       | Status | Description |
| -- | ------------------------------- | ------ | ----------- |
| 64 | **Image Reveal**                | 🔲     | Image loads with a directional wipe/blinds/pixelate reveal animation. |
| 65 | **Hover Zoom Lens**             | 🔲     | Magnifying lens effect on image hover with smooth tracking and border glow. |
| 66 | **Image Carousel 3D**           | 🔲     | 3D perspective carousel with cards rotating in a circular orbit and depth-of-field blur. |
| 67 | **Ken Burns Gallery**           | 🔲     | Full-screen gallery with subtle pan + zoom (Ken Burns) effect on each image during transitions. |

---

## 13 · Loading & Skeleton States

| #  | Component                       | Status | Description |
| -- | ------------------------------- | ------ | ----------- |
| 68 | **Skeleton Shimmer**            | ✅     | Skeleton loading placeholders with animated shimmer gradient sweep and pulse fade. |
| 69 | **Orbit Loader**                | 🔲     | Animated loading spinner with orbiting dots/circles that scale and fade with spring physics. |
| 70 | **Progress Beam**               | 🔲     | Horizontal indeterminate progress bar with a glowing beam that bounces or sweeps continuously. |

---

## Component Anatomy (Standard Structure)

Every component in UniqueUI follows a consistent architecture:

```
registry/
  └── {component-name}.tsx      ← Source component file
registry/config.ts              ← Registry metadata (deps, tailwind config)
registry.json                   ← Auto-generated (via build:registry script)
apps/www/components/ui/
  └── {component-name}.tsx      ← Copy used in the docs site
```

### Required Exports per Component

```tsx
// 1. Named export(s) for the component
export function ComponentName({ ...props }: ComponentProps) { ... }

// 2. TypeScript props interface
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  // ... component-specific props
}
```

### Registry Entry Format

```ts
{
  name: "component-name",
  dependencies: ["motion", "clsx", "tailwind-merge"],
  files: [
    { path: "component-name.tsx", type: "registry:ui" },
    { path: "utils/cn.ts", type: "registry:util", content: "..." }
  ],
  tailwindConfig: {
    theme: { extend: { animation: {}, keyframes: {} } }
  }
}
```

---

## Installation (End User)

```bash
# Install CLI globally
npm i -g uniqueui-cli

# Initialize in your project
uniqueui init

# Add any component
uniqueui add moving-border
uniqueui add 3d-tilt-card
uniqueui add typewriter-text
```

---

## Priority Roadmap

### Phase 1 — Foundation (Next)
> High-impact, showcase-worthy components

1. Typewriter Text
2. 3D Tilt Card
3. Spotlight Card
4. Aurora Background
5. Animated Tabs
6. Magnetic Button
7. Infinite Marquee
8. Scroll Reveal
9. Skeleton Shimmer
10. Morphing Modal

### Phase 2 — Core Library
> Filling key categories for a complete offering

11. Gradient Text Reveal
12. Scramble Text
13. Meteors Card
14. Flip Card
15. Dot Grid Background
16. Floating Dock
17. Confetti Burst
18. Drawer Slide
19. Notification Stack
20. Animated Timeline

### Phase 3 — Premium & Polish
> Advanced components for differentiation

21. Particle Field
22. Stacked Cards
23. Horizontal Scroll Gallery
24. Radial Menu
25. Cursor Trail
26. Image Carousel 3D
27. Bento Grid
28. Animated Pricing Table
29. Comparison Slider
30. Page Transition Wrapper

### Phase 4 — Full Library
> Complete coverage across all categories

31–70. Remaining components across all categories.

---

## Design Principles

1. **Animation-First** — Every component MUST have meaningful motion. No static-only components.
2. **Physics-Based** — Prefer spring animations (`type: "spring"`) over linear/eased for natural feel.
3. **Performant** — Use `transform` and `opacity` only. Avoid layout-triggering properties in animations.
4. **Composable** — Components accept `className`, render as slots, and compose with each other.
5. **Accessible** — Respect `prefers-reduced-motion`. Provide `aria` attributes. Keyboard navigable.
6. **Copy-Paste Ready** — Each component is self-contained. One file, one install command, zero config.

---

## Contributing a New Component

1. Create `registry/{component-name}.tsx`
2. Add entry to `registry/config.ts` with dependencies and tailwind config
3. Run `pnpm build:registry` to regenerate `registry.json`
4. Add a showcase demo in `apps/www/app/page.tsx`
5. Test with `uniqueui add {component-name}` in a fresh project

---

> **Total: 70 animated components** across 13 categories — zero basic/static primitives.
