import { redirect } from "next/navigation";
import { componentsList } from "@/config/components";

export function generateStaticParams() {
  return componentsList.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

export default async function DocSlugRedirect(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  redirect(`/components/${slug}`);
}
