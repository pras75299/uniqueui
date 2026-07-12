import type { MetadataRoute } from "next";
import { componentsList } from "@/config/components";
import { TEMPLATES } from "@/config/templates";
import { SITE_URL } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/components",
    "/blocks",
    "/templates",
    "/changelog",
    "/docs",
    "/docs/ai",
    "/docs/theming",
    "/docs/compatibility",
  ];

  const componentPaths = componentsList.map((c) =>
    c.kind === "block" ? `/blocks/${c.slug}` : `/components/${c.slug}`,
  );

  const templatePaths = TEMPLATES.filter((t) => t.status === "available").map(
    (t) => `/templates/${t.id}`,
  );

  return [...staticPaths, ...componentPaths, ...templatePaths].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
