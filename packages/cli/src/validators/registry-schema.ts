// Zod schemas for end-user registry validation via `uniqueui registry validate`.
// Mirrors `scripts/validate-registry.lib.mjs` (the CI source of truth for
// monorepo artifact validation). The two are intentionally separate: the
// script can't be imported from CJS-compiled CLI code, and the CLI ships
// without scripts/. Keep both in sync when changing slug/NPM rules.
import { z } from "zod";

export const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const NPM_DEP_RE = /^(?:@[a-z0-9-][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/i;

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
