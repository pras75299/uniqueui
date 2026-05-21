import { TEMPLATES } from "@/config/templates";
import { notFound } from "next/navigation";
import SaasLanding from "@/templates/saas-landing";
import SaasFintechLanding from "@/templates/saas-fintech-landing";
import Portfolio from "@/templates/portfolio";
import type { ComponentType } from "react";

// Map of slug → template component (add new templates here)
const TEMPLATE_COMPONENTS: Record<string, ComponentType> = {
  "saas-landing": SaasLanding,
  "saas-fintech-landing": SaasFintechLanding,
  "portfolio": Portfolio,
};

export function generateStaticParams() {
  return TEMPLATES.filter((t) => t.status === "available").map((t) => ({
    slug: t.id,
  }));
}

export const dynamicParams = true;

export default async function TemplatePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const template = TEMPLATES.find((t) => t.id === slug);

  if (!template || template.status !== "available") notFound();

  const TemplateComponent = TEMPLATE_COMPONENTS[slug];
  if (!TemplateComponent) notFound();

  return <TemplateComponent />;
}
