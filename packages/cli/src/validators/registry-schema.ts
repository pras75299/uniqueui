// Zod schemas for end-user registry validation via `uniqueui registry validate`.
// Partial mirror of `@uniqueui/registry-schema` (the source of truth for
// repo-side artifact validation and shared type exports). The two are
// intentionally separate for now: this trimmed copy keeps the CLI's
// install footprint small and avoids a workspace dep until the CLI moves
// to full consumption in Phase 10 (`update`/`diff` consume the schema
// package directly). Keep both in sync when changing slug/NPM rules.
import { z } from "zod";

export const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
// npm package names must be all lowercase (see npm naming rules); no `/i`.
const NPM_DEP_RE = /^(?:@[a-z0-9-][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;

export const Slug = z.string().regex(SLUG_RE, "slug must be kebab-case (a-z0-9-)");
export const NpmDep = z.string().regex(NPM_DEP_RE, "invalid npm dependency name");

export const RegistryFileType = z.enum([
    "registry:ui",
    "registry:util",
    "registry:hook",
    "registry:lib",
]);

export const RegistryFile = z.object({
    path: z.string().min(1),
    content: z.string(),
    type: RegistryFileType,
});

export const TailwindConfig = z
    .object({
        theme: z
            .object({ extend: z.record(z.unknown()).optional() })
            .passthrough()
            .optional(),
    })
    .passthrough();

export const RegistryEntry = z.object({
    name: Slug,
    dependencies: z.array(NpmDep),
    files: z.array(RegistryFile).min(1),
    tailwindConfig: TailwindConfig.optional(),
    tailwindCss: z.string().min(1).optional(),
});

export const RegistryArray = z.array(RegistryEntry).min(1);

export const SplitIndex = z.object({
    components: z.array(Slug).min(1),
});

export type SplitIndexT = z.infer<typeof SplitIndex>;
export type RegistryEntryT = z.infer<typeof RegistryEntry>;
