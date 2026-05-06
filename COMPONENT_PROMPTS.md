# UniqueUI — 2026 Component Build Prompts

Detailed implementation prompts for 10 net-new components aligned with the 2026 "Solar Winter" design era (Liquid Glass, GPU shaders, grainy aurora, kinetic type, cognitive clarity).

Each prompt is written to be self-contained and handed to an implementer (human or agent). All prompts assume the project conventions in `CLAUDE.md`:

- One file: `registry/{slug}/component.tsx`
- `"use client"` directive at top
- Animations via `motion` from `motion/react` (NOT `framer-motion`); prefer `type: "spring"`
- All styles via Tailwind + `cn()` (clsx + tailwind-merge)
- TypeScript: extend `HTMLMotionProps<"div">` (or appropriate element) and `Omit` conflicting handlers
- Add registry entry to `registry/config.ts`, demo to `apps/www/config/demos.tsx`, docs metadata to `registry/docs.json`, then run `pnpm build:registry`
- No cross-component imports inside `registry/`

Each prompt includes: goal, visual behavior, technical approach, props API, animation specifics, accessibility/perf notes, and acceptance criteria.

---

## 1. `liquid-glass-panel`

**Trend:** Liquid Glass / sub-pixel refraction. The "Generic Blur is dead" replacement.

### Goal
A frosted container that physically refracts the content behind it — not a `backdrop-filter: blur()` shortcut. Used as a card, navbar, modal surface, or HUD overlay on top of imagery, video, or animated backgrounds.

### Visual behavior
- Surface is translucent and warps the underlying pixels via UV displacement (Perlin/turbulence noise).
- Edge highlight (Fresnel-like) on the inner border, brighter on the top-left, softer on the bottom-right.
- Subtle inner specular sheen that drifts very slowly (~20s loop).
- On hover, displacement strength eases up by ~15%, sheen accelerates slightly.
- Text inside the panel must remain crisp — never apply the displacement filter to the text container.

### Technical approach
- Render a single `<svg>` with `<defs>` containing a `<filter>` composed of `<feTurbulence baseFrequency="0.012 0.018" numOctaves="2" seed="…">` → `<feDisplacementMap scale="…" xChannelSelector="R" yChannelSelector="G">`.
- Apply the filter to a sibling absolutely-positioned div that is `backdrop-filter: blur(2px)` and clipped to the panel's rounded shape. The text/content layer sits ABOVE this and has no filter (avoids composite jitter, preserves sub-pixel antialiasing).
- Edge highlight: layered `box-shadow: inset` + a conic gradient masked by a 1px ring.
- Animate `baseFrequency` and `scale` via React state on a slow RAF loop, OR use an animated `<animate>` SVG element if simpler.

### Props API
```ts
interface LiquidGlassPanelProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  displacementScale?: number;       // default 24
  noiseFrequency?: number;          // default 0.014
  tint?: string;                    // default "rgba(255,255,255,0.08)"
  borderHighlight?: boolean;        // default true
  intensityOnHover?: number;        // default 1.15
  children: React.ReactNode;
}
```

### Animation
- Spring on hover: `{ stiffness: 180, damping: 22 }` for displacement scale.
- Sheen drift: linear, 20s, infinite, `ease: "linear"`.

### A11y / perf
- Honor `prefers-reduced-motion`: freeze noise animation; keep static refraction (still beautiful, no motion).
- Each instance generates a unique filter `id` (e.g., `useId()`) so multiple panels don't collide.
- Document: do NOT nest panels — chained displacement is a separate component (#10).

### Acceptance criteria
- Reads as glass on top of the demo's image background — clearly distorts pixels behind it.
- Text inside is pixel-crisp at all sizes.
- Works in Chrome, Safari, Firefox 2026.
- < 2ms scripting per frame on a mid-tier laptop; no GC churn.

---

## 2. `shader-mesh-gradient`

**Trend:** GPU-powered web shaders. WebGPU shipped in Safari 26 (Sept 2025) → universally available 2026.

### Goal
A full-bleed animated mesh gradient background driven by a fragment shader. Pointer-reactive flow, smooth across resizes, OKLCH-aware color stops.

### Visual behavior
- 3–6 color blobs flowing through each other like fluid, never freezing into a static pattern.
- Pointer position attracts/perturbs the nearest blob (subtle — not a draggable toy, just a "live" hint).
- On reduced motion: still renders, but the flow time is paused and the gradient is locked to a beautiful static frame.

### Technical approach
- Wrap a `<canvas>` in a React component. Use WebGPU when available, fall back to WebGL2.
- Fragment shader: layered 2D simplex noise (3 octaves) sampled into UV offsets, then mixed across the input color stops in OKLCH space (use `oklab`/`oklch` mix manually in shader — define a tiny conversion utility).
- RAF loop updates `uTime`; pointer events update `uMouse` (normalized 0–1).
- Resize observer recomputes canvas size at devicePixelRatio (cap at 2 for perf).
- Cleanup: cancel RAF, destroy GPU device/context on unmount.

### Props API
```ts
interface ShaderMeshGradientProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  colors?: string[];          // default 4 OKLCH stops, accepts hex or oklch()
  speed?: number;             // default 1.0
  pointerInfluence?: number;  // default 0.4 (0 = ignore pointer)
  grain?: number;             // default 0.04 — adds film grain on top
  children?: React.ReactNode; // overlay content
}
```

### Animation
- Continuous `uTime += deltaTime * speed` — no springs (this is a shader, not DOM motion).
- Pointer follow uses an exponential lerp inside the shader-side state (not the shader itself).

### A11y / perf
- No motion mode: snapshot one frame, freeze.
- Detect WebGPU once, cache. If neither WebGPU nor WebGL2: render a static CSS radial-gradient fallback.
- Single canvas per component; do not run more than ~2 instances per page (document this).

### Acceptance criteria
- 60fps on a 2020-era MacBook Air.
- Visibly distinct from a CSS gradient (continuous flow, not just radial blobs).
- Resizes without flicker.
- Works in WebGL2-only browsers (graceful degradation, no crash).

### Shared infrastructure note
Components 2, 4, and 8 all need: WebGPU detect → WebGL2 fallback → RAF loop → cleanup. Either inline this small helper into each component file (per "no cross-component imports" rule), OR introduce `registry/_shared/shader-runtime.ts` and update the registry build to allow it. Decide before starting #2.

---

## 3. `refractive-cursor-lens`

**Trend:** Liquid Glass + iOS 26 magnifier patterns trending on Dribbble.

### Goal
A circular liquid-glass lens that follows the cursor and refracts the content underneath (text, images, UI). Reading aid, image inspector, or playful flourish.

### Visual behavior
- Circle (default 120px) springs to follow the pointer (with slight lag).
- Inside the circle: backdrop appears slightly magnified (~1.2x) AND distorted by a radial-falloff displacement (strongest at the rim, near-zero at center — opposite of fisheye).
- A glossy specular highlight sits on the upper-left inside the circle.
- Soft outer ring shadow.
- Disappears on `mouseleave` of the wrapping bounds.

### Technical approach
- A wrapper div that captures pointer events; the lens is `position: fixed`, `pointer-events: none`.
- The lens uses `backdrop-filter: url(#lens-displace)` where the SVG filter has a radial gradient feeding `feDisplacementMap` (so distortion intensity falls off from rim to center).
- Magnification: a CSS `transform: scale()` on a duplicated child layer — OR rely on the displacement alone if magnification is not needed (cleaner, recommended default).
- Cursor follow via `motion`'s `useSpring` on `clientX/clientY`.

### Props API
```ts
interface RefractiveCursorLensProps {
  size?: number;                 // default 120
  displacementScale?: number;    // default 18
  showOnlyOver?: React.RefObject<HTMLElement>; // optional bounds
  springConfig?: { stiffness: number; damping: number }; // default 220/26
  children: React.ReactNode;     // the content the lens distorts
}
```

### Animation
- Spring follow with slight lag → feels like the lens has weight.
- Fade in/out (opacity 0 → 1) over 200ms when entering/leaving bounds.

### A11y / perf
- Disabled entirely on touch devices (`pointer: coarse`).
- Disabled on reduced-motion.
- Hidden from screen readers (`aria-hidden`).

### Acceptance criteria
- Visibly distorts text underneath in a way that's clearly more than a magnifier.
- No jank when moving the cursor fast.
- Doesn't capture clicks (pass-through).

---

## 4. `caustic-light-card`

**Trend:** Premium shader effects — caustics, chromatic dispersion (Lucky Graphics flagged these as 2026 quality signals).

### Goal
A card with animated water-caustic light patterns shimmering across its surface — the kind of light you'd see at the bottom of a pool.

### Visual behavior
- Caustic pattern animates slowly across the card's lower 40–60%, brightest at the bottom.
- Light has a tint (default warm white, configurable).
- On hover, caustic intensity increases ~30% and animation accelerates slightly.
- Card content (title, body) reads cleanly on top — caustics are an overlay, not a background-killer.

### Technical approach
- Small `<canvas>` (sized to card) running a fragment shader that generates caustics: `caustic = pow(1.0 - abs(sin(noise(uv + time))), 8.0)` layered 2x with offsets.
- Canvas is positioned absolutely, blend-mode `screen` or `plus-lighter` over the card's gradient base.
- Mask to fade caustics from bottom (1.0) to ~30% at the top (or fully transparent at top edge).
- Reuse the shader runtime from #2 (or inline it).

### Props API
```ts
interface CausticLightCardProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  causticColor?: string;     // default "#fff7e0"
  intensity?: number;        // default 0.6
  speed?: number;            // default 0.5
  coverage?: number;         // 0–1, fraction of card height covered, default 0.5
  children: React.ReactNode;
}
```

### Animation
- Continuous shader time.
- Hover → spring on `intensity` (stiffness 160, damping 20) and `speed`.

### A11y / perf
- Reduced-motion: render a single frozen caustic frame.
- One shader instance per card; cap at 4 simultaneously visible (document; intersection-observer pause when off-screen).

### Acceptance criteria
- Reads as light shimmer, not "noisy texture."
- Headline + body text inside remain WCAG AA contrast.
- Pauses rendering when scrolled out of view.

---

## 5. `chromatic-aberration-reveal`

**Trend:** Expressive motion + cognitive clarity. RGB-split as a *meaningful* state cue (loading → settled).

### Goal
An image (or any visual block) that reveals itself by splitting RGB channels apart and converging back together — used for hero images, blog covers, gallery items as they enter the viewport.

### Visual behavior
- On enter: three copies of the image are offset (R: -16px, G: 0, B: +16px) and at 0.6 opacity.
- They spring back to 0px offset and 1.0 opacity in a slightly staggered way (R settles first, B last).
- A soft horizontal ripple/wave passes through during the convergence (CSS `clip-path` or per-row offset).
- Triggered by `IntersectionObserver` (or controlled `inView` prop).

### Technical approach
- Three stacked `<img>` (or background-image divs) with `mix-blend-mode: screen` on a black wrapper background. Apply CSS `filter: brightness(...) saturate(...) hue-rotate(0/120/240deg)` to isolate channels — OR use SVG `feColorMatrix` to mask each to one channel.
- Each layer gets its own `motion.div` wrapper with a spring on `x`.
- Wave: a wrapper-level `clip-path: polygon(...)` animated as a tilted line moving left → right, OR a CSS mask gradient sliding.

### Props API
```ts
interface ChromaticAberrationRevealProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  src: string;
  alt: string;
  splitDistance?: number;    // default 16 (px)
  staggerMs?: number;        // default 80
  trigger?: "in-view" | "mount" | "manual";
  isVisible?: boolean;       // for "manual"
  className?: string;
}
```

### Animation
- Three independent springs: R `{ stiffness: 220, damping: 26 }`, G slightly slower, B slowest. Stagger via `delay` prop.
- Wave: 700ms ease-out, runs once.

### A11y / perf
- Reduced-motion: do a plain fade-in; skip the split entirely.
- `<img>` for the base layer (alt text); other two are `aria-hidden`.

### Acceptance criteria
- The split is *visible* but does not distort the final image (channels converge perfectly).
- Doesn't double-fire when the element re-enters the viewport (use `inView` once: true semantics).

---

## 6. `iridescent-foil-button`

**Trend:** Holographic / foil materials — the 2026 answer to flat shadcn buttons. Pure CSS, no shader cost.

### Goal
A button whose surface looks like holographic foil — colors shift based on cursor position, with a fine grain texture overlaid. Drop-in replacement for primary CTA.

### Visual behavior
- Default state: subtle iridescent sheen, mostly cool tones.
- On pointer-move within the button: hue shifts in real-time based on pointer position relative to button center (left = magenta, right = cyan, top = yellow, bottom = blue — or however you tune it).
- Grain layer is constant (3–5% opacity SVG turbulence).
- On hover: slight scale up (1.02) and increased sheen brightness.
- On press: scale down (0.98), faster snap.

### Technical approach
- Layered backgrounds:
  1. Base: `linear-gradient` button color
  2. Foil layer: `conic-gradient(from var(--angle), …)` masked by the button shape, with `mix-blend-mode: color-dodge` or `screen`
  3. Grain layer: SVG `feTurbulence` data-URI background, 5% opacity
- `--angle` and a CSS `filter: hue-rotate(var(--hue))` are updated on `pointermove` via inline style.
- Pure CSS for the press/hover springs (or `motion` if cleaner).

### Props API
```ts
interface IridescentFoilButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  variant?: "default" | "subtle" | "vivid";
  grainOpacity?: number;     // default 0.05
  hueRange?: number;         // default 120 (degrees of swing)
  children: React.ReactNode;
}
```

### Animation
- Hover scale: spring `{ stiffness: 300, damping: 22 }`.
- Hue/angle updates: direct (no spring) so it tracks the cursor 1:1.

### A11y / perf
- Maintain WCAG AA contrast on the text — foil sheen must not bring text contrast below 4.5:1. Test against `variant="vivid"`.
- Keyboard focus: clear focus ring (outline 2px, offset 2px), distinct from sheen.
- Reduced-motion: keep the foil but disable hover scale.

### Acceptance criteria
- Cursor movement visibly shifts color across the button face.
- Grain is visible but not noisy at 1x and 2x DPR.
- Works as a drop-in for `<button>`; passes through `disabled`, `type`, `onClick`, etc.

---

## 7. `kinetic-variable-headline`

**Trend:** Expressive 120px+ kinetic display type — anti-AI, pro-craft. Variable-font weight axis as a motion channel.

### Goal
A massive headline (default 120px+) that animates each glyph's font weight on entrance and on pointer proximity, creating an "inflate/breathe" effect that feels handcrafted.

### Visual behavior
- On mount / inView: each glyph starts at `wght: 200` and springs to `wght: 700` with a per-letter stagger (left → right).
- Continuous mode (optional): glyphs near the pointer bump to higher weight; glyphs far from the pointer settle back. Like a magnetic field on type.
- Optional secondary axis animation (e.g., `slnt` or `wdth`) if the font supports it.

### Technical approach
- Wrap each character in a `motion.span` with `style={{ fontVariationSettings: \`"wght" \${wght}\` }}`.
- Per-glyph `useSpring` on the weight value.
- For pointer-proximity mode: on `pointermove`, compute distance from pointer to each glyph's bounding box center, map distance → weight via a falloff function.
- Use a variable font (default: Inter Variable, or accept a `fontFamily` prop). Document the `font-variation-settings` requirement.

### Props API
```ts
interface KineticVariableHeadlineProps {
  text: string;
  mode?: "entrance" | "pointer" | "both"; // default "both"
  weightRange?: [number, number];          // default [200, 700]
  staggerMs?: number;                      // default 25
  className?: string;
  as?: "h1" | "h2" | "h3";                 // default "h1"
}
```

### Animation
- Entrance spring: `{ stiffness: 120, damping: 14 }` per glyph.
- Pointer follow: `{ stiffness: 200, damping: 24 }` — fast enough to feel reactive, smooth enough not to twitch.

### A11y / perf
- Reduced-motion: render the final state at full weight, skip animation entirely.
- The original `text` must remain in the DOM as readable text (use `aria-label` on the wrapper if splitting glyphs visually breaks reading).
- Only animate while in viewport (intersection observer).

### Acceptance criteria
- Glyphs visibly inflate, not just fade in.
- Works with multi-line headlines and respects line breaks.
- Pointer mode: the "magnetic field" feels physical, not random.

---

## 8. `plasma-shader-orb`

**Trend:** Shader-as-component — small, composable GPU primitives (shaders.com, OpenShaders).

### Goal
A small (~120px) animated plasma orb rendered via a fragment shader. Doubles as a loader, AI-thinking indicator, status accent, or CTA flourish.

### Visual behavior
- Sphere-like orb with layered noise plasma flowing inside.
- Color palette accepts 2–3 stops; flows through them.
- Optional `progress` prop (0–1): when supplied, the orb's plasma intensifies and a thin ring fills around it.
- Idle pulse: very subtle scale breathe (1.0 → 1.02 → 1.0) over 4s.

### Technical approach
- 120x120 `<canvas>` with WebGPU/WebGL2 fallback (reuse infra from #2).
- Fragment shader: 3 octaves of simplex noise mapped onto a UV-distance sphere mask. `length(uv - 0.5) < 0.5` for the disc; smooth alpha at the edge.
- Optional ring: SVG circle stroke with `stroke-dasharray` driven by `progress`.

### Props API
```ts
interface PlasmaShaderOrbProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  size?: number;                // default 120
  colors?: [string, string, string]; // default OKLCH triad
  progress?: number;            // 0–1, optional
  speed?: number;               // default 1.0
  showRing?: boolean;           // default = progress !== undefined
}
```

### Animation
- Continuous shader time.
- Idle breathe via CSS keyframes or `motion`.
- Ring fill: spring on `strokeDashoffset` when `progress` changes.

### A11y / perf
- If used as a loader: `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` when `progress` is supplied; otherwise `role="status"` + `aria-label="Loading"`.
- Reduced-motion: freeze the plasma, keep only the ring fill.

### Acceptance criteria
- Visually distinct from a CSS gradient circle — clearly *flowing*.
- Tiny: < 6KB gzipped including shader strings.
- Pauses when off-screen.

---

## 9. `grainy-aurora-spotlight`

**Trend:** Aurora gradient + grain at 3–8% opacity (Kittl's "secret ingredient"). Differentiates from existing `aurora-background` by being **reactive** and including the required grain layer.

### Goal
A hero/section background combining a slow aurora gradient flow, an SVG turbulence grain overlay, and a cursor-tracking spotlight that locally brightens the grain and gradient.

### Visual behavior
- Base layer: 4–6 large radial gradients in OKLCH soft pastels, slowly drifting positions over 30s.
- Grain layer: SVG `feTurbulence` at 5% opacity, full-bleed.
- Spotlight: a soft radial mask (~400px) follows the cursor; inside the spotlight, gradient saturation +20% and grain opacity +50%.
- On `pointerleave`: spotlight fades out over 800ms.

### Technical approach
- Layered divs:
  1. Aurora: 4 absolutely-positioned blurred radial-gradient circles, each animated independently with `motion` (cycle position over 30s, eased).
  2. Grain: a single `<svg>` with `feTurbulence` filter applied to a fill, full-bleed, blend-mode `overlay`.
  3. Spotlight: a `radial-gradient` mask layer that follows the cursor via `useSpring` on `clientX/clientY`.
- Differentiate from `aurora-background` clearly: this one is reactive + grainy + spotlight-driven.

### Props API
```ts
interface GrainyAuroraSpotlightProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  colors?: string[];          // default 5 OKLCH stops
  grainOpacity?: number;      // default 0.05
  spotlightSize?: number;     // default 420
  spotlightBoost?: number;    // default 0.2
  drift?: boolean;            // default true
  children?: React.ReactNode;
}
```

### Animation
- Aurora drift: `motion` with `repeat: Infinity, repeatType: "mirror"`, 30s, ease-in-out.
- Spotlight follow: spring `{ stiffness: 150, damping: 22 }`.
- Spotlight fade: 800ms ease-out on `pointerleave`.

### A11y / perf
- Reduced-motion: freeze drift; keep static aurora + grain; spotlight still follows cursor (cursor-follow is not "motion" in the WCAG sense if it's pointer-direct).
- `pointer: coarse` (touch): drop the spotlight, keep the static aurora + grain.

### Acceptance criteria
- Visibly different from `aurora-background` side-by-side: this one *responds* to the user.
- Grain is visible but never feels like "TV static."
- No layout shift on resize.

---

## 10. `liquid-glass-stack-accordion`

**Trend:** Liquid Glass + cognitive clarity. Stacked panels disclose one item at a time without losing spatial context.

### Goal
A vertical stack of refractive glass slabs. On hover/focus, the active slab expands and the slabs *behind* it visibly bend through the active glass — chained displacement. Use for FAQ, feature lists, plan tiers, settings groups.

### Visual behavior
- 3–8 stacked slabs, slightly overlapping (each peeks ~24px below the one above).
- On hover/focus of a slab: it expands to its full content height; siblings compress and slide.
- The expanded slab refracts the (now smaller) slabs visible behind/through it.
- Smooth layout transition; nothing snaps.

### Technical approach
- Each slab is built like `liquid-glass-panel` (#1) — own SVG displacement filter, own unique id.
- Use `motion`'s `LayoutGroup` + `layout` prop on each slab so the resize animates smoothly.
- For the chained refraction: when slab N is active, slabs N-1 and N+1 receive an additional CSS filter that samples slab N's displacement (visually, this means slabs behind appear bent inside the active glass — achieved by stacking the active slab in z-order with `backdrop-filter` already pulling the underlying pixels).
- Single source of truth: `activeIndex` state + `setActiveIndex` on hover/focus/click.

### Props API
```ts
interface LiquidGlassStackAccordionProps {
  items: { id: string; title: React.ReactNode; content: React.ReactNode }[];
  defaultActiveId?: string;
  trigger?: "hover" | "click" | "focus"; // default "click"
  className?: string;
}
```

### Animation
- Layout spring: `{ stiffness: 200, damping: 28 }` (smooth, not bouncy — cognitive clarity).
- Slab content fade-in once layout settles (delay ~120ms).

### A11y / perf
- Full keyboard support: arrow up/down moves focus, Enter/Space activates.
- ARIA: each slab is a `<button aria-expanded>` for the trigger + `<div role="region">` for the content.
- Reduced-motion: cross-fade content swap, skip layout animation.
- Document: differentiates from existing `morphing-card-stack`, `flip-card`, `drawer-slide` — those swap content; this *layers refraction*.

### Acceptance criteria
- One-at-a-time expansion that animates smoothly with no jump.
- Clear visual hierarchy — user always knows which slab is active.
- Refraction through the active glass is visible (not just translucency).
- Keyboard-only users get the same experience as mouse users.

---

## Build order recommendation

1. **#2 `shader-mesh-gradient`** — establishes the canvas/shader plumbing. Decide on `registry/_shared/shader-runtime.ts` vs inlining first.
2. **#1 `liquid-glass-panel`** — establishes the SVG-displacement plumbing reused by #3 and #10.
3. **#6 `iridescent-foil-button`** — pure CSS, quick win, ships polish.
4. **#7 `kinetic-variable-headline`** — pure JS/motion, no shaders.
5. **#5 `chromatic-aberration-reveal`** — DOM + motion only.
6. **#9 `grainy-aurora-spotlight`** — DOM + SVG turbulence + motion.
7. **#3 `refractive-cursor-lens`** — depends on #1's filter pattern.
8. **#4 `caustic-light-card`** — depends on #2's shader runtime.
9. **#8 `plasma-shader-orb`** — depends on #2's shader runtime.
10. **#10 `liquid-glass-stack-accordion`** — depends on #1; ship last as the "headliner."

## Cross-cutting reminders

- After each component: update `registry/config.ts`, `registry/docs.json`, `apps/www/config/demos.tsx`, then `pnpm build:registry`.
- All components must respect `prefers-reduced-motion`.
- All shader/canvas components must pause on intersection (off-screen).
- All filter `id`s must be unique per instance via `useId()`.
- Test on Safari, Chrome, Firefox; verify WebGPU detect path and WebGL2 fallback path explicitly.
