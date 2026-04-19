import registryData from "../public/registry.json";

type RegistryEntry = {
  name: string;
};

const registryEntries = registryData as RegistryEntry[];

export const registryComponentSlugs = registryEntries.map((entry) => entry.name);
export const registryComponentSlugSet = new Set(registryComponentSlugs);

/** Production base URL for shadcn-format registry items (`/r/<slug>.json`). */
export const SHADCN_REGISTRY_ORIGIN = "https://uniqueui.com/r";

export function getInstallCommand(slug: string) {
  return `npx uniqueui add ${slug}`;
}

/** Install the same component via the shadcn CLI (requires shadcn init + `@/lib/utils`). */
export function getShadcnInstallCommand(slug: string) {
  return `npx shadcn@latest add ${SHADCN_REGISTRY_ORIGIN}/${slug}.json -y`;
}
