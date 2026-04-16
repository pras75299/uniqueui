import registryData from "../public/registry.json";

type RegistryEntry = {
  name: string;
};

const registryEntries = registryData as RegistryEntry[];

export const registryComponentSlugs = registryEntries.map((entry) => entry.name);
export const registryComponentSlugSet = new Set(registryComponentSlugs);

export function getInstallCommand(slug: string) {
  return `npx uniqueui add ${slug}`;
}
