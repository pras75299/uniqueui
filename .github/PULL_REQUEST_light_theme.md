<!--
PR title (conventional commits): feat(www): add light theme support and theme toggle
-->

## Type of Change

- [ ] 🚀 New Component
- [ ] 🐛 Bug Fix
- [ ] 📝 Documentation Update
- [x] 💄 Styling or Animation adjustment
- [ ] 🔧 CLI Tooling
- [x] 🧹 Refactoring / Chore

## Description

Adds optional light theme support across the UniqueUI showcase and all 30 registry components.

**Theme infrastructure**
- **Theme context** (`apps/www/contexts/theme-context.tsx`): `ThemeProvider` with `theme` / `setTheme`, persisted to `localStorage` and synced to `document.documentElement.dataset.theme`. Optional `beforeInteractive` script in root layout to avoid theme flash on load.
- **Theme toggle** (`apps/www/components/theme-toggle.tsx`): Client toggle (sun/moon) with motion spring animation; used on landing and components layout.

**Pages**
- **Landing** (`apps/www/app/page.tsx`): Reads theme from context; theme-dependent classes for main, header, hero, feature cards, footer, and featured section; `motion.main` with spring transition for background.
- **Components layout** (`apps/www/app/components/layout.tsx`): Theme-aware sidebar, header, and main; theme toggle in sidebar (desktop) and mobile header; `motion.div` with spring for layout background.

**Demos and preview**
- **ComponentPreview** and **BentoVariantSwitcher**: Read theme from context and render demos as `<Demo theme={theme} />`. Preview containers are theme-aware with motion transition.
- **Demos** (`apps/www/config/demos.tsx`): `componentDemos` refactored to `Record<string, DemoComponent>` where each demo accepts `theme` and passes it into UI components; wrapper divs use theme-based classes.

**Components**
- All 30 registry components (and their `apps/www/components/ui/` copies) accept optional `theme?: "light" | "dark"` (default `"dark"`) and use it for backgrounds, borders, and text. Motion used where applicable for smooth theme transitions.

**Global styles**
- **globals.css**: Body no longer forced dark; `[data-theme="dark"]` and `[data-theme="light"]` set body background and color so layouts control theme.

**Docs**
- Theme prop documented in `apps/www/config/components.ts` for moving-border and typewriter-text (same pattern can be applied to remaining components).

## Testing

- Ran `pnpm build:registry` — success.
- Ran `pnpm build` in `apps/www` — success.
- Manually: toggle theme on landing and components layout; confirm previews and component pages respond to theme; confirm persistence after refresh.

## Checklist (for New Components)

N/A — no new components added.

## Related Issues

<!-- Add issue reference if applicable -->
