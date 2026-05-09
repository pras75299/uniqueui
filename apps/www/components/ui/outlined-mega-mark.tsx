import type {
  ComponentPropsWithoutRef,
  CSSProperties,
} from "react";

import { cn } from "@/lib/utils";

/** Responsive mega type: floor 6rem, cap 14.25rem, `10vw` active across typical viewports. */
const DEFAULT_FONT_SIZE = "clamp(6rem, 10vw, 14.25rem)";
const DEFAULT_LETTER_SPACING = "-0.02em";
const DEFAULT_LIGHT_STROKE = "var(--color-neutral-300)";
const DEFAULT_DARK_STROKE = "var(--color-neutral-700)";
const DEFAULT_STROKE_WIDTH = 1;

export type OutlinedMegaMarkProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className"
> & {
  /** Plain text. The component renders one `<p>` so accepting only string keeps the stroke behavior predictable. */
  children: string;
  /** Any valid CSS `font-size` (e.g. `clamp(...)`, `rem`, `px`). */
  fontSize?: string;
  /** CSS `letter-spacing` value. */
  letterSpacing?: string;
  /** Stroke colour when the site is in light mode. */
  lightStrokeColor?: string;
  /** Stroke colour when the site is in dark mode. */
  darkStrokeColor?: string;
  /** Outline width: number → `px`; string passes through (e.g. `2px`, `0.125rem`). */
  strokeWidth?: number | string;
  /** When true, hovering fills the headline with the stroke colour for a smooth ink-fill effect. */
  fillOnHover?: boolean;
  /** Extra classes on the outer wrapper (layout, padding). */
  containerClassName?: string;
  /** Extra classes on the inner `<p>` (typography overrides). */
  className?: string;
};

interface OutlinedStyle extends CSSProperties {
  // Custom CSS variables consumed by the dual-mode stroke definition below.
  "--omm-stroke-width": string;
  "--omm-stroke-light": string;
  "--omm-stroke-dark": string;
}

/**
 * Huge responsive outlined headline — transparent fill, `-webkit-text-stroke`,
 * with configurable size, stroke width, and light / dark stroke colours.
 *
 * The light/dark stroke is driven by CSS variables and a `dark:` variant on
 * the same element, so the children render exactly once (the previous version
 * rendered twice — once per theme — which doubled effects for any non-text
 * children).
 */
export function OutlinedMegaMark({
  children,
  fontSize = DEFAULT_FONT_SIZE,
  letterSpacing = DEFAULT_LETTER_SPACING,
  lightStrokeColor = DEFAULT_LIGHT_STROKE,
  darkStrokeColor = DEFAULT_DARK_STROKE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  fillOnHover = false,
  containerClassName,
  className,
  ...rest
}: OutlinedMegaMarkProps) {
  const strokeWidthCss =
    typeof strokeWidth === "number" ? `${strokeWidth}px` : strokeWidth;

  const paragraphStyle: OutlinedStyle = {
    fontSize,
    letterSpacing,
    "--omm-stroke-width": strokeWidthCss,
    "--omm-stroke-light": lightStrokeColor,
    "--omm-stroke-dark": darkStrokeColor,
    // -webkit-text-stroke reads from a CSS var; switching the var via `dark:`
    // means a single text node powers both themes — no second hidden span.
    WebkitTextStroke: "var(--omm-stroke-width) var(--omm-stroke-current)",
  };

  return (
    <div
      {...rest}
      className={cn("w-full shrink-0 px-2 pt-8 md:pt-10", containerClassName)}
      style={
        {
          "--omm-stroke-current": "var(--omm-stroke-light)",
        } as CSSProperties
      }
    >
      <p
        className={cn(
          "w-full text-center font-bold leading-[1.05] text-transparent",
          // Switch the active stroke variable when the document is in dark mode.
          "[--omm-stroke-current:var(--omm-stroke-light)] dark:[--omm-stroke-current:var(--omm-stroke-dark)]",
          fillOnHover &&
            "transition-colors duration-300 ease-out hover:text-[color:var(--omm-stroke-current)]",
          className,
        )}
        style={paragraphStyle}
      >
        {children}
      </p>
    </div>
  );
}
