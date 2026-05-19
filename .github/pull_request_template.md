<!--
PR title must follow Conventional Commits: <type>(<scope>): <subject>
  feat(registry): add magnetic-button
  fix(cli): detect bun.lockb on add
  docs(www): document --dry-run flag
Types: feat | fix | docs | chore | refactor | test | style | perf | ci | build
Scopes: registry | cli | www | docs | <component-slug>
-->

## Type

- [ ] New component / block (registry)
- [ ] CLI change (init / add / list / info / doctor / search / shadcn JSON)
- [ ] Docs site (apps/www)
- [ ] Build / scripts / CI
- [ ] Bug fix
- [ ] Refactor / chore

## Summary

<!-- One or two sentences on *why*. The "what" is in the diff. -->

## Screenshots / video (UI changes only)

<!-- Drop a clip or before/after PNG. Skip for CLI / docs-only PRs. -->

## Test plan

<!-- Bulleted list of what you actually ran. "I tested it" is not enough. -->

- [ ] `pnpm test`
- [ ] `pnpm build:registry` (if you touched `registry/` or `scripts/build-registry.ts`)
- [ ] `pnpm --filter uniqueui-cli build` (if you touched `packages/cli/`)
- [ ] Manually verified in `apps/www` dev server (UI changes)

---

## New component checklist

Skip this section if your PR doesn't add a component or block.

**Registry sources**

- [ ] `registry/<slug>/component.tsx` created (or `registry/blocks/<category>/<slug>/component.tsx` for blocks)
- [ ] `registry/config.ts` entry added with `name`, `dependencies`, `files`, and `tailwindConfig` (v3) and/or `tailwindCss` (v4) as needed
- [ ] `registry/docs.json` entry added (title, description, category, props)
- [ ] `registry/demos.tsx` demo added
- [ ] `pnpm build:registry` run — no `git diff` in `apps/www/public/registry/`, `apps/www/public/r/`, or `apps/www/components/ui/`

**Component quality gate (Section I from `backlogs.md`)**

- [ ] `"use client"` at the top if it uses any hook, browser API, or Motion interactivity
- [ ] Accepts `className` and merges via `cn` (`@/utils/cn` or `@/lib/utils`)
- [ ] Props extend the correct DOM/motion type and omit conflicting handlers
- [ ] Uses `motion` from `motion/react` (not `framer-motion`); prefers `type: "spring"` over duration easing
- [ ] Honors `useReducedMotion` for continuous/ambient animation; static fallback provided
- [ ] No layout shift on mount — reserve space, or use a skeleton, where entrance animation would shift other content
- [ ] All `useEffect` subscriptions / rAF / `useAnimationFrame` are cancelled on unmount
- [ ] SSR-safe — no `window` / `document` access at module scope; canvas/WebGL is guarded
- [ ] Keyboard operable + visible focus + correct `role` / `aria-*` for any interactive element
- [ ] No cross-imports between registry components; only declared `dependencies` are used
- [ ] At least one render test (see `apps/www/tests/components.test.tsx` or `apps/www/tests/blocks.test.tsx`)

## Related issues

<!-- "Closes #123" / "Refs #45" -->
