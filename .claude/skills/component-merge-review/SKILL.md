---
name: component-merge-review
description: Pre-PR merge gate for UniqueUI registry changes. Runs the section-G component quality checklist plus the recurring CodeRabbit findings (className/cn merge, stale catalog metadata, .hallmark duplicates, SSR safety, a11y). Use before opening or updating any PR that touches registry/, apps/www components, or templates.
---

# Component Merge Review

Reviewer-independent pre-PR gate. Run this before `gh pr create` (or before pushing
an update) on any branch that changes `registry/**`, `apps/www/components/**`,
`apps/www/templates/**`, or `apps/www/config/**`.

The goal: catch the issues CodeRabbit and the section-G checklist raise on *every*
PR, so review cycles aren't spent on the same findings.

## When to run

- Any new or changed component / hero block under `registry/`.
- Any change to docs UI, templates, or the three config files
  (`components.ts`, `demos.tsx`, `docs-scenarios.ts`).
- Skip for pure CLI / script / non-component changes.

## Step 1 — Identify changed component files

```bash
git diff --name-only origin/main...HEAD
```

Focus on `.tsx` under `registry/` and `apps/www`, and the manifests under
`registry/components/`. For each, walk Steps 2–3.

## Step 2 — Component quality checklist (per `.github/pull_request_template.md`)

This list mirrors the **"Component quality gate"** section of
`.github/pull_request_template.md` (the template labels it "Section I from
`backlogs.md`"; the backlog/CLAUDE.md call the same list "Section G" — same content,
the template is authoritative). For every new/changed component:

- [ ] `"use client"` present where any hook, browser API, or Motion interactivity is used.
- [ ] Accepts `className?: string` and merges via `cn(...)` on the root element (see Step 3 #1).
- [ ] Props extend the correct DOM/motion props; variants documented in `registry/components/{slug}.json`.
- [ ] Motion: prefers `type: "spring"`; does not animate `width`/`height`/`top`/`left` when a transform works.
- [ ] `useReducedMotion` respected for continuous/ambient animation, with a static fallback.
- [ ] No layout shift: space reserved / skeleton where an entrance animation would shift layout.
- [ ] Cleanup: `useEffect` subscriptions / `rAF` / `useAnimationFrame` cancel on unmount.
- [ ] SSR: no `window`/`document` at module scope; guards for canvas/WebGL.
- [ ] a11y: semantic element or correct `role`; keyboard operable if interactive; visible focus; `aria-*` where needed.
- [ ] Dependencies: only declared registry deps; **no cross-import from other registry components**.
- [ ] Tests: at least one render test, or inclusion in the visual suite for high-risk components.

## Step 3 — Recurring CodeRabbit findings (fix before they're raised)

These repeat across reviews on this repo. Verify each against the changed files.

1. **`className` + `cn` on every exported component.** Every exported component —
   including section subcomponents, root templates, and helpers like `ThemeToggle` —
   must accept `className?: string`, import `cn` from `@/lib/utils`, and apply
   `className={cn("…", className)}` on the root. Catches components whose root only has
   inline `style={{…}}`.
   ```bash
   git diff --name-only origin/main...HEAD | grep -E '\.tsx$' | xargs grep -Ln 'cn(' 2>/dev/null
   ```
   Any file listed exports a component but never calls `cn(` — inspect it.

2. **Stale catalog metadata vs implemented behavior.** When behavior changes, update
   *all* of: `apps/www/config/templates.ts` `description` + `components[]` (remove dropped
   components), `.hallmark/log.json`, and any registry/docs metadata referencing the old
   behavior. Mismatch misleads users.

3. **Duplicate / conflicting `.hallmark/log.json` entries.** One authoritative entry per
   design pass. On redesign, REPLACE or MERGE the prior entry — never append a contradictory
   one. No two entries should share `date`+`brief` or contradict on `theme_axes` / `vibe` / `motion`.

4. **Hydration / SSR safety.**
   - No `new Date(` / `Math.random(` inside JSX — hoist to module scope or guard in `useEffect`.
   - No `localStorage` reads during render — use `useEffect` with a hydrated flag.
   - Register storage/event listeners once at module scope, not per-subscriber.
   ```bash
   git diff --name-only origin/main...HEAD | grep -E '\.tsx$' | xargs grep -nE 'new Date\(|Math\.random\(|localStorage' 2>/dev/null
   ```
   Triage each hit — module scope / `useEffect` is fine; in render is not.

5. **Accessibility on interactive elements.** `:focus-visible` outline for anything with a
   hover affordance; `aria-label` / `aria-pressed` on custom buttons; `aria-hidden` on
   decorative SVGs/spans.

## Step 4 — Manifest + changelog

- [ ] `registry/components/{slug}.json` metadata current: `tags` (≥1, kebab-case),
      `accessibility`, `motion` (with `performanceNotes` when `reducedMotion` is `"partial"`/`"none"`).
- [ ] User-visible change → a new semver entry prepended to the `changelog` array on the
      same manifest.

## Step 5 — Run the verification suite

Generated artifacts and checks must be clean. (For the build-artifact diff specifically,
the `registry-rebuild-verify` skill is the focused tool.)

```bash
pnpm build:registry          # then: git status — diff limited to your slug's files
pnpm registry:validate
pnpm check:reduced-motion
pnpm test:repo
pnpm typecheck
pnpm lint
```

## Step 6 — Write the PR from the template

Only after Steps 1–5 pass. The PR body **must** follow
`.github/pull_request_template.md` — fill every section, don't paste a freeform summary:

- **Title** — Conventional Commits: `<type>(<scope>): <subject>`. Types: `feat | fix |
  docs | chore | refactor | test | style | perf | ci | build`. Scopes: `registry | cli |
  www | docs | <component-slug>`. (Matches the repo's commit rules in CLAUDE.md.)
- **Type** — check exactly the boxes that apply (`New component / block`, `CLI change`,
  `Docs site`, `Build / scripts / CI`, `Bug fix`, `Refactor / chore`).
- **Summary** — one or two sentences on *why*; the "what" is in the diff.
- **Screenshots / video** — required for UI changes; skip for CLI/docs-only.
- **Test plan** — check only the boxes for commands you actually ran, and list them.
  `pnpm test`; `pnpm build:registry` if you touched `registry/` or
  `scripts/build-registry.ts`; `pnpm --filter uniqueui-cli build` if you touched
  `packages/cli/`; manual `apps/www` verification for UI changes. "I tested it" is not
  enough — name what ran.
- **New component checklist** — if the PR adds a component/block, complete *both*
  sub-sections (Registry sources + Component quality gate). The quality-gate boxes are
  the same items you verified in Step 2. Skip this whole section otherwise.
- **Related issues** — `Closes #123` / `Refs #45` when applicable.

Tick a checkbox only when the underlying step is genuinely done; an unchecked box is
honest, a falsely-ticked one is not (CLAUDE.md Rule 12).

## Output

Report a checklist pass/fail summary. For each failure: the file, the rule it violates,
and the minimal fix. Then produce the filled PR body per Step 6. Do not claim the gate
passed if any command above was skipped or errored (CLAUDE.md Rule 12 — fail loud).
