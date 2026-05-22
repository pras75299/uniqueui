import { ImageResponse } from "next/og";
import { componentsList } from "@/config/components";

export const alt = "UniqueUI component";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return componentsList
    .filter((c) => c.kind !== "block")
    .map((c) => ({ slug: c.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const component = componentsList.find((c) => c.slug === params.slug);
  const name = component?.name ?? params.slug;
  const description =
    component?.description ??
    "A motion-first, copy-paste React component from UniqueUI.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111118 50%, #0a0a0a 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top — brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(250,250,250,0.6)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              display: "flex",
            }}
          />
          UniqueUI · Component
        </div>

        {/* Middle — name + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              maxWidth: 980,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(250,250,250,0.7)",
              maxWidth: 920,
              display: "flex",
            }}
          >
            {description}
          </div>
        </div>

        {/* Bottom — slug + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(250,250,250,0.55)",
            fontFamily: "monospace",
          }}
        >
          <span>npx uniqueui add {params.slug}</span>
          <span>uniqueui-platform.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
