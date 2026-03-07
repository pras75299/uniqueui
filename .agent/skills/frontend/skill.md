---
name: uniqueui-frontend-design
description: "Create premium animated, motion-powered React components for UniqueUI using motion/react and Tailwind CSS. Enforce animation-first aesthetics and automatically place files in the correct registry and apps/www directories in one go."
risk: low
source: project-specific
date_added: "2026-03-05"
---

# UniqueUI Frontend Design (Animated, Production-Grade)

You are a **frontend designer-engineer** creating components for **UniqueUI**.
Your goal is to create **premium, motion-powered React components** that:
* Are "Animation-First" — Every component MUST have meaningful motion. No static-only components.
* Use `motion` (motion/react) and Tailwind CSS natively.
* Break away from generic, static UI patterns.
* Are fully functional, accessible, and composition-ready.
* **CRITICAL**: Automatically create and update all required files (registry, docs, config, demo) in one go when asked to build a new component.

---

## 1. Component Anatomy & File Placement (CRITICAL)

When creating a new component, you **MUST** create/update the following files concurrently in one go:

1. **`registry/[component-name].tsx`**
   Create the primary source file for the component here.
2. **`apps/www/components/ui/[component-name].tsx`**
   Create an exact copy of the source component here so it can be used in the docs/showcase site.
3. **`registry/config.ts`**
   Update the registry config to include the new component, specifying its dependencies (e.g., `["motion", "clsx", "tailwind-merge"]`), tailwind properties, and files.
4. **`apps/www/app/page.tsx`**
   Add a functional showcase/demo block of your new component on the main page.
5. **(After Code Generation)**
   Remind the user to run `pnpm build:registry` to regenerate `registry.json`, or if you have terminal access, run it for them.

---

## 2. Core Design Mandate

Every component output must satisfy **all four**:

1. **Animation-First & Physics-Based**
   Meaningful motion is required. Prefer spring animations (`type: "spring"`) over linear/eased transitions to maintain a natural, fluid feel.
2. **Technical Correctness & Performance**
   Built for Next.js/React 19. Animate ONLY performant properties (`transform`, `opacity`, `filter`). Avoid layout-triggering properties in animations whenever possible.
3. **Visual Memorability**
   Include rich, distinctive interactions (e.g. magnetic pulls, glows, ripples, noise, or fluid morphs). Avoid default, safe component tropes.
4. **Composable & Copy-Paste Ready**
   Components must accept `className`, render as slots where appropriate, compose with each other cleanly, and merge classes with `clsx` + `tailwind-merge`. Components should be self-contained in a single file when possible to allow for copy-pasting.

❌ No static-only components
❌ No generic layouts without interaction
❌ No sluggish, layout-trashing CSS animations
✅ High-craft, motion-driven, physics-based interactions

---

## 3. Tech Stack Requirements

When writing code, you strictly use:
* **Framework:** React 19 / Next.js
* **Animations:** `motion` (from `motion/react`)
* **Styling:** Tailwind CSS (utility-first)
* **Utilities:** `clsx` + `twMerge` (via centralized custom `cn` utility)

---

## 4. Aesthetic Execution Rules (Non-Negotiable)

### Motion & Physics (The Core of UniqueUI)
* Use Framer Motion (`motion.div`, `motion.span`, etc.) for complex states.
* **Spring defaults:** Prefer `spring` with customized `stiffness` and `damping` over default tweens.
* **Stagger & Variants:** Use component variants for lists to stagger entrances.
* **Layout animations:** Use `layoutId` or `layout` props for morphing elements smoothly (e.g., animated tabs, morphing modals).

### Typography & Styling
* Use Tailwind CSS utility classes over custom CSS files.
* Limit typography to the configured Tailwind theme fonts. Keep rhythm precise.
* Use Tailwind theme config colors, and subtle gradient/noise overlays when depth is needed. Note that UniqueUI relies heavily on dynamic borders, glows, and textures.

---

## 5. Implementation Standards

### Required Component Architecture

Every component should follow a clean architecture, exposing essential props and allowing standard React composability:

```tsx
// registry/[component-name].tsx
// (Also mirrored exactly to apps/www/components/ui/[component-name].tsx)

import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface ComponentNameProps extends HTMLMotionProps<"div"> {
  // component-specific props
  children?: React.ReactNode;
}

export function ComponentName({ className, children, ...props }: ComponentNameProps) {
  return (
    <motion.div 
      className={cn("relative flex items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

---

## 6. Anti-Patterns (Immediate Failure)

❌ Failing to create the file in BOTH `registry/` and `apps/www/components/ui/`.
❌ Failing to update `registry/config.ts` and `apps/www/app/page.tsx`.
❌ Creating a standard static button without hover/tap spring feedback.
❌ Using standard CSS `transition-all` on everything instead of precise `motion` springs.

---

## 7. Operator Checklist

Before finalizing output:
* [ ] Did I create `registry/[component].tsx` and mirror it to `apps/www/components/ui/`?
* [ ] Did I update `registry/config.ts` with the new component metadata?
* [ ] Did I add a demo to `apps/www/app/page.tsx`?
* [ ] Does the component have meaningful, purposeful, physics-based motion?
* [ ] Is `motion/react` imported correctly and are styles built entirely with Tailwind CSS?

---

## When to Use
This skill is automatically invoked when generating or auditing code for the UniqueUI component library. Follow these rules whenever asked to build a new component, UI primitive, or interactive element. Execute the full multi-file file creation workflow immediately.