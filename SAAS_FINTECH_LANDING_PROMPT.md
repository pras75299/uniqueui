# SaaS Fintech Landing — Build Prompt and Extraction Spec

> Source visual: `landingpage1.webp` (1080-wide product reference). This document is the source of truth for the `saas-fintech-landing` template under `apps/www/templates/saas-fintech-landing/`.

## 0) Goal

Ship a premium `saas-fintech-landing` template that:

- Visually matches the reference screenshot (editorial fintech aesthetic).
- Animates with `motion/react` (alias `motion.dev`) using spring transitions and `whileInView` scroll reveals.
- Renders cleanly across desktop (≥1024px), tablet (768–1023px), and mobile (<768px).
- Supports both light and dark themes — both intentional, neither a flipped afterthought.
- Reuses existing UniqueUI registry components where possible, and spells out which new pieces are extraction candidates.

## 1) Visual Direction (extracted from reference)

- **Aesthetic:** minimal-luxury fintech, high-contrast, generous whitespace, precise typography.
- **Layout:** asymmetrical hero, 50/50 split feature blocks alternating L/R, three-up feature grid, FAQ + side card, dark CTA banner, four-column footer.
- **Surface language:** layered cards with thin borders, soft shadows, no glass/blur. Pastel feature cards in the "Our Features" grid.
- **Signature memory:** dashboard-like finance snapshots embedded directly in the marketing flow (phone mock with tickers, KPI revenue card, bar chart + circular gauge).
- **Brand moniker used in copy:** `VaultPay` (placeholder — easily themable).

### 1.1 Light theme palette (reference accurate)

| Token | Value | Use |
|---|---|---|
| pageBg | `#F6F7FB` | overall canvas |
| surface | `#FFFFFF` | cards, phone frame |
| elevated | `#EEF1F7` | nested card on revenue panel |
| text | `#161A24` | headings & body |
| textMuted | `#5E6475` | secondary text |
| border | `#D8DDE8` | hairline borders |
| accent.primary | `#0B0D12` | primary CTA bg, dark CTA banner |
| accent.onPrimary | `#FFFFFF` | text on primary CTA |
| feature.mint | `#E8F4EE` | features card 1 |
| feature.peach | `#F6EBE3` | features card 2 |
| feature.blush | `#F1E5EE` | features card 3 |
| chart.bar | `#0B0D12` | bars in security visual |
| chart.gauge | `#0B0D12` | gauge ring |

### 1.2 Dark theme palette

| Token | Value | Use |
|---|---|---|
| pageBg | `#07090F` | overall canvas |
| surface | `#0E131F` | cards |
| elevated | `#161D2B` | nested card |
| text | `#F4F5F8` | headings & body |
| textMuted | `#9097A6` | secondary text |
| border | `rgba(255,255,255,0.10)` | hairline borders |
| accent.primary | `#FFFFFF` | primary CTA bg |
| accent.onPrimary | `#0B0D12` | text on primary CTA |
| feature.mint | `#171C28` | features card 1 |
| feature.peach | `#1A1F2C` | features card 2 |
| feature.blush | `#201A25` | features card 3 |

## 2) Typography System

- **Family:** inherit project sans (Geist via app `font-sans`), weights 400/500/600/700 only.
- **Headlines:** `font-semibold`, `tracking-tight`, `leading-[1.08–1.15]`, always `text-balance`.
- **Numerics:** balances/KPIs always `tabular-nums` so they don't dance in animation.
- **Hierarchy:**
  - Hero H1: `text-4xl` → `sm:text-5xl` → `lg:text-6xl`
  - Section H2: `text-3xl` → `sm:text-4xl`
  - Card title: `text-lg`
  - Body: `text-sm` → `sm:text-base`
  - Eyebrow / label: `text-[10px]–text-xs uppercase tracking-[0.12em]`

## 3) Section-by-Section Build Instructions

### 3.1 Top Preview Bar (host site, not in template)
The site `/templates/[slug]` route already wraps with a preview header + download button. The template should render below it without conflicting sticky behavior — `Nav` uses `sticky top-12` to sit under the preview bar.

### 3.2 `<Nav />`
- Sticky top bar (`sticky top-12 z-40`) with `backdrop-blur-md` and bottom hairline.
- Left: brand mark `VP` (small caps, semibold).
- Center: links — `Features`, `How it works`, `Customers`, `Contact` (hidden below `md`).
- Right: `MovingBorderButton` (UniqueUI registry) labelled `Sign In`, compact (h-8 w-24).
- Motion: opacity+y spring on mount.

### 3.3 `<Hero />` — "Invest intelligently, Live Independently"
- Two-column on `md+`, single-column on mobile.
- Left column:
  - H1 across two lines (`Invest intelligently,` / `Live Independently`).
  - Body: short value prop, ≤ 2 lines.
  - CTA row: solid black `Get Started` + outlined `Watch Us`.
- Right column — phone mockup:
  - Realistic phone shape: `rounded-[36px] border-[6px]` outer, `rounded-[28px]` inner screen.
  - Top status row with notch dot, "9:41" sim time.
  - Top header inside screen: balance label "Total Balance", `$10,400.22`, percent delta chip `+2.8%`.
  - Two ticker rows under it (red/green): `$LOFP  $1,540.04 ▼ -1.2%`, `$LARP  $156.00 ▲ +0.8%`.
  - Floating off-card chips at bottom-left ("Cashflow $956.00") and right-mid ("Reserve $54,600") with shadow + small motion `y` loop.
- Motion: staggered springs (0, 0.08, 0.16). Float chips use a slow `[0, -4, 0]` y loop (4–6s) with reduced-motion guard.

### 3.4 `<LogoStrip />`
- Centered single row of 5 monochrome wordmarks: `Dropbox`, `airbnb`, `GitHub`, `NETFLIX`, `HBO`.
- Even spacing via `flex justify-between` on `max-w-5xl`.
- Subtle `whileInView` fade-up.

### 3.5 `<PaymentsFeature />` — "Streamline Sales with Seamless Payments"
- Grid: `[0.95fr_1.05fr]` md+. Visual on left, copy on right.
- Visual card:
  - Header eyebrow: "Revenue" + ticker label "PIVOT" in semibold.
  - Big KPI: `$16,058.94` (`text-3xl`, tabular-nums).
  - Calculator-style chip row: 4 chips labelled `A`, `B`, `C`, `D` — first chip filled black/white, rest neutral.
  - Subtle horizontal sparkline (10–14 bars) below, rendered with 1–2px wide divs animated `scaleY` from 0.4→1 with stagger.
- Copy column:
  - H2 in two lines.
  - Bulleted list (3 items) with check-dot (•) prefix, light gray copy.
  - Primary CTA `Create Account`.
- Motion: visual reveals first; copy reveals 50ms later. Bars stagger after card is in view.

### 3.6 `<SecurityFeature />` — "Sell Smarter With Fast, Secure Payments"
- Reverse layout md+: copy LEFT, visual RIGHT (so the page rhythm alternates with section 3.5).
- On mobile: visual stacks first.
- Visual card consists of two stacked panels:
  - **Bar chart panel:** 7 vertical bars, heights `[42, 70, 56, 88, 64, 76, 50]%`, with a tooltip pill on the tallest reading "$8.6K". Bars animate `scaleY` from 0 → height when in view, 60ms stagger.
  - **Gauge / total panel:** circular SVG ring (stroke-dasharray animated 0 → 78%), centered label `$50.8K`, sub-label `Total reserve`.
- Copy column:
  - H2 in two lines.
  - 3 bullets.
  - CTA `Learn More`.

### 3.7 `<FeaturesGrid />` — "Our Features"
- H2 centered.
- 3 equal cards on `md+`, single column on mobile, two columns optional `sm:grid-cols-2 md:grid-cols-3`.
- Each card:
  - Pastel surface from §1.1 / §1.2 palette.
  - Icon glyph (use a simple inline SVG mark — 18×18 — rounded square, accent-tinted to card color).
  - Title `text-lg font-semibold`.
  - 1 short paragraph.
  - Subtle `Read More →` link in muted text.
- Reveal: stagger 60ms.

### 3.8 `<Faq />` — "Frequently Asked Questions"
- H2 centered.
- Split: `[1.25fr_0.75fr]` on `lg+`, stacked below `lg`.
- Left card:
  - 4 expandable rows (`button` with `aria-expanded`), divider between rows, `+` indicator that rotates 45° to `×` on open. Use `motion` height `auto` via `layout` prop or `AnimatePresence` for body.
  - Pre-fill the first row open.
- Right card (support):
  - Tinted neutral surface (light gray / dark navy).
  - Eyebrow: "Need help?"
  - Title: "Don't have the answer you need?"
  - Body line: "Let us know and we can help."
  - CTA `Contact Us`.

### 3.9 `<FinalCta />` — "Take Full Control of Your Financial Future Starting Today"
- Full-bleed black banner inside max-w-5xl wrap, with rounded-2xl corners.
- Background: `bg-black` plus a soft radial-gradient glow at top-left (cyan/indigo at very low alpha).
- H2 centered, two-line, white.
- Sub-copy line, neutral-400.
- CTA: white pill `Learn More`.
- Motion: section reveal + glow `opacity` pulse 0.4 → 0.6 → 0.4 (slow 6s loop, reduced-motion off).

### 3.10 `<Footer />`
- 4 columns (About / Product / Resource / Contact).
- Bottom rule + copyright row.
- Optional small social icon row (text-only acceptable).

## 4) Motion.dev Animation Spec

- Source: `import { motion, useReducedMotion, AnimatePresence } from "motion/react"`.
- All section reveals via `whileInView` with `viewport={{ once: true, amount: 0.25 }}`.
- Default transition: `{ type: "spring", stiffness: 220, damping: 24 }`.
- Stagger: 50–80ms between siblings.
- Continuous motion (float chips, glow pulse): `repeat: Infinity`, `repeatType: "mirror"`, soft easing.
- `useReducedMotion()` check on every animated component — disable y/scale movements, keep opacity static.
- Avoid layout thrash: only animate `opacity`, `transform`, `clipPath`, or SVG attributes.

## 5) Responsive Spec

- Mobile (<768px):
  - Single column.
  - Hero phone mock scales to ~280px.
  - Floating chips reposition to inside the phone container so they don't overflow.
  - Section padding `py-10 px-4`.
- Tablet (768–1023px):
  - Two columns where the design calls for it (PaymentsFeature, SecurityFeature, Hero).
  - Section padding `py-12 px-6`.
- Desktop (≥1024px):
  - All blocks at `max-w-5xl mx-auto`.
  - Section padding `py-14 px-6`.
- No horizontal scroll at any breakpoint. Test at 375 / 768 / 1024 / 1440.

## 6) Theme Spec (Light & Dark)

- Provided by `getFintechThemeTokens(isDark)` in `components/theme.ts`.
- The page reads `useTheme()` from the existing `@/contexts/theme-context` and passes tokens down — every section accepts `tokens` as a prop. No section reads the theme directly.
- Borders should remain visible in both themes (`border-white/10` dark, `border-[#D8DDE8]` light).
- CTA contrast tested: black-on-white in light, white-on-black in dark.

## 7) Reusable Component Candidates (registry extraction targets)

These are not yet in the registry. Each block below is a self-contained brief for extracting a reusable component later via `pnpm build:registry`.

### Candidate A — `fintech-stat-tile-grid`
- **Purpose:** metric tile panel for hero/feature financial snapshots.
- **Props:**
  - `title?: string`
  - `items: Array<{ label: string; value: string; tone?: "neutral" | "positive" | "negative" }>`
  - `theme?: "light" | "dark" | "auto"`
  - `className?: string`
- **Priority:** High — reused in hero phone and revenue card.

### Candidate B — `split-feature-section`
- **Purpose:** generic two-column marketing section.
- **Props:**
  - `title: string`, `description?: string`, `bullets?: string[]`
  - `visual: ReactNode`
  - `reverse?: boolean`
  - `cta?: { label: string; href: string }`
  - `tokens?: ThemeTokens`
- **Priority:** High — used twice in this template alone.

### Candidate C — `trust-logo-strip`
- **Purpose:** monochrome wordmark trust row.
- **Props:** `logos: string[]`, `animated?: boolean`, `marquee?: boolean`, `className?: string`.
- **Priority:** Medium.

### Candidate D — `faq-split-panel`
- **Purpose:** accordion + side support card.
- **Props:**
  - `questions: { q: string; a: string }[]`
  - `support: { eyebrow: string; title: string; body: string; cta: { label: string; href: string } }`
- **Priority:** Medium — animated open/close with `AnimatePresence`.

### Candidate E — `phone-mock-frame`
- **Purpose:** lightweight phone-shaped mock for embedding any UI.
- **Props:** `children: ReactNode`, `size?: "sm" | "md" | "lg"`, `notch?: boolean`, `className?: string`.
- **Priority:** High — design pattern reused by other landing templates.

### Candidate F — `mini-bar-chart`
- **Purpose:** decorative bar chart that animates on scroll into view.
- **Props:** `values: number[]`, `tooltip?: { index: number; label: string }`, `barClassName?: string`, `className?: string`.
- **Priority:** Medium.

## 8) Build Quality Checklist

- [ ] Every section file lives under `apps/www/templates/saas-fintech-landing/sections/*.tsx`.
- [ ] Every section is `"use client"` and accepts `{ tokens }` from the theme helper.
- [ ] Motion respects `useReducedMotion()`.
- [ ] All numerics use `tabular-nums`.
- [ ] No horizontal scroll at 375/768/1024/1440.
- [ ] Light + dark both pass a visual sanity check.
- [ ] `pnpm lint` clean.
- [ ] `pnpm test` green.
- [ ] `/templates/saas-fintech-landing` renders with the existing preview/download chrome.

## 9) File Map (current)

```
apps/www/templates/saas-fintech-landing/
├── index.tsx                    # composes the page, reads theme
├── components/
│   ├── theme.ts                 # getFintechThemeTokens(isDark)
│   └── reveal.tsx               # whileInView spring wrapper
└── sections/
    ├── nav.tsx
    ├── hero.tsx
    ├── logo-strip.tsx
    ├── payments-feature.tsx
    ├── security-feature.tsx
    ├── features-grid.tsx
    ├── faq.tsx
    ├── final-cta.tsx
    └── footer.tsx
```

`apps/www/config/templates.ts` already has the `saas-fintech-landing` entry with `status: "available"` and `componentFiles: ["moving-border"]`. Extend `componentFiles` when extracted reusable components from §7 are added to the registry.
