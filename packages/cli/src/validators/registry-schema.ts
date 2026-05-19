// Zod schemas for end-user registry validation via `uniqueui registry validate`.
// Mirrors `scripts/validate-registry.lib.mjs`; that file remains the CI source
// of truth for monorepo artifact validation. Drift between the two is caught
// by `registry-schema.test.ts` exercising the same fixtures the script tests.
import { z } from "zod";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
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
