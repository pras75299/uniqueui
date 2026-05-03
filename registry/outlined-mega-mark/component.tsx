import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/** Responsive mega type: floor 6rem, cap 14.25rem, `10vw` active across typical viewports. */
const DEFAULT_FONT_SIZE = "clamp(6rem, 10vw, 14.25rem)";
const DEFAULT_LETTER_SPACING = "-0.02em";
const DEFAULT_LIGHT_STROKE = "var(--color-neutral-300)";
const DEFAULT_DARK_STROKE = "var(--color-neutral-700)";
const DEFAULT_STROKE_WIDTH = 1;

function strokeStyle(
  width: number | string,
  color: string,
): Pick<CSSProperties, "WebkitTextStroke"> {
  const w = typeof width === "number" ? `${width}px` : width;
  return { WebkitTextStroke: `${w} ${color}` };
}

export type OutlinedMegaMarkProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className"
> & {
  /** Same content is rendered for light and dark stroke layers (must be text-friendly). */
  children: ReactNode;
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
  /** Extra classes on the outer wrapper (layout, padding). */
  containerClassName?: string;
  /** Extra classes on the inner `<p>` (typography overrides). */
  className?: string;
};

/**
 * Huge responsive outlined headline (transparent fill + `-webkit-text-stroke`),
 * with configurable size, stroke width, and light / dark stroke colours.
 */
export function OutlinedMegaMark({
  children,
  fontSize = DEFAULT_FONT_SIZE,
  letterSpacing = DEFAULT_LETTER_SPACING,
  lightStrokeColor = DEFAULT_LIGHT_STROKE,
  darkStrokeColor = DEFAULT_DARK_STROKE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  containerClassName,
  className,
  ...rest
}: OutlinedMegaMarkProps) {
  const paragraphStyle: CSSProperties = {
    fontSize,
    letterSpacing,
  };

  return (
    <div
      {...rest}
      className={cn("w-full shrink-0 px-2 pt-8 md:pt-10", containerClassName)}
    >
      <p
        className={cn(
          "w-full text-center font-bold leading-[1.05] text-transparent",
          className,
        )}
        style={paragraphStyle}
      >
        <span
          className="dark:hidden"
          style={strokeStyle(strokeWidth, lightStrokeColor)}
        >
          {children}
        </span>
        <span
          className="hidden dark:inline"
          style={strokeStyle(strokeWidth, darkStrokeColor)}
        >
          {children}
        </span>
      </p>
    </div>
  );
}
