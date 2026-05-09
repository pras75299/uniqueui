"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** Responsive mega type: floor 6rem, cap 14.25rem, `10vw` active across typical viewports. */
const DEFAULT_FONT_SIZE = "clamp(6rem, 10vw, 14.25rem)";
const DEFAULT_LETTER_SPACING = "-0.02em";
const DEFAULT_LIGHT_STROKE = "var(--color-neutral-300)";
const DEFAULT_DARK_STROKE = "var(--color-neutral-700)";
const DEFAULT_STROKE_WIDTH = 1;
/** Stroke is clamped so it never renders thicker than one device pixel layer (overrides larger prop values). */
const MAX_STROKE_PX = 1;

/** Default vivid stops for the gradient stroke on hover (SVG linearGradient). */
const DEFAULT_OUTLINE_GRADIENT_STOPS = [
  "oklch(0.68 0.28 296)",
  "oklch(0.78 0.17 205)",
  "oklch(0.72 0.24 278)",
] as const;

const FALLBACK_VIEWBOX = "-480 -140 3360 480";

function parseViewBoxRect(vs: string): readonly [number, number, number, number] {
  const p = vs.trim().split(/[\s,]+/).map(Number);
  if (p.length === 4 && p.every((n) => Number.isFinite(n))) {
    return [p[0]!, p[1]!, p[2]!, p[3]!];
  }
  return [-480, -140, 3360, 480];
}

const FALLBACK_VB_RECT = parseViewBoxRect(FALLBACK_VIEWBOX);

const DEFAULT_OUTLINE_GRADIENT_LINE = {
  x1: "-15%",
  y1: "15%",
  x2: "115%",
  y2: "85%",
} as const;

/** Vivid outline `linearGradient`: colour stops plus optional line (SVG `userSpaceOnUse`). */
export type OutlinedMegaMarkOutlineGradient = {
  /** 2+ CSS colours, evenly spaced along the gradient. */
  stops: readonly string[];
  /** Optional endpoints; default sweeps top-left → bottom-right across the view box. */
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
};

function isValidStopList(
  list: readonly string[] | undefined,
): list is readonly string[] {
  return Boolean(
    list?.length && list.every((s) => typeof s === "string" && s.trim().length > 0),
  );
}

function resolveOutlineGradientConfig(
  outlineGradient: OutlinedMegaMarkOutlineGradient | undefined,
  outlineGradientStops: readonly string[] | undefined,
): { stops: string[]; x1: string; y1: string; x2: string; y2: string } {
  const line = { ...DEFAULT_OUTLINE_GRADIENT_LINE };

  if (outlineGradient && isValidStopList(outlineGradient.stops)) {
    const { stops, x1, y1, x2, y2 } = outlineGradient;
    return {
      stops: [...stops],
      x1: x1 ?? line.x1,
      y1: y1 ?? line.y1,
      x2: x2 ?? line.x2,
      y2: y2 ?? line.y2,
    };
  }

  if (isValidStopList(outlineGradientStops)) {
    return {
      stops: [...outlineGradientStops],
      ...line,
    };
  }

  return {
    stops: [...DEFAULT_OUTLINE_GRADIENT_STOPS],
    ...line,
  };
}

export type OutlinedMegaMarkProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className"
> & {
  /** Plain text. The component renders one visible label so stroke behavior stays predictable. */
  children: string;
  /** Any valid CSS `font-size` (e.g. `clamp(...)`, `rem`, `px`). */
  fontSize?: string;
  /** CSS `letter-spacing` value. */
  letterSpacing?: string;
  /** Stroke colour when the site is in light mode. */
  lightStrokeColor?: string;
  /** Stroke colour when the site is in dark mode. */
  darkStrokeColor?: string;
  /** Outline width: number → `px`; clamped so it never exceeds `1px` (hairline cap). Strings other than `<n>px` pass through unresolved. */
  strokeWidth?: number | string;
  /** When true (without `gradientOnHover`), hovering fills the headline with the stroke colour. */
  fillOnHover?: boolean;
  /**
   * When true (default), a spotlight mask follows the pointer and reveals vivid **gradient outline only**
   * near the cursor; baseline idle stroke stays themed and interiors stay hollow. If both this and
   * `fillOnHover` are set, this wins on the SVG path.
   */
  gradientOnHover?: boolean;
  /**
   * Colours for the hover outline gradient (2+ stops; evenly spaced).
   * @deprecated Ignored — use `outlineGradient` or `outlineGradientStops`.
   */
  hoverGradient?: string;
  /**
   * Full control over the vivid outline `linearGradient` (stops + optional `x1`…`y2`).
   * Takes precedence over `outlineGradientStops` when both are set.
   */
  outlineGradient?: OutlinedMegaMarkOutlineGradient;
  /** Shortcut: only colour stops (evenly spaced); default gradient line. Ignored if `outlineGradient` is set. */
  outlineGradientStops?: readonly string[];
  /** Extra classes on the outer wrapper (layout, padding). */
  containerClassName?: string;
  /** Extra classes on the rendered text (HTML `<p>` or SVG `<text>`). */
  className?: string;
};

interface OutlinedStyle extends CSSProperties {
  "--omm-stroke-width": string;
  "--omm-stroke-light": string;
  "--omm-stroke-dark": string;
}

function strokeWidthToCss(strokeWidth: number | string): string {
  if (typeof strokeWidth === "number") {
    const n = Number.isFinite(strokeWidth)
      ? Math.min(Math.max(strokeWidth, 0), MAX_STROKE_PX)
      : MAX_STROKE_PX;
    return `${n}px`;
  }
  const trimmed = strokeWidth.trim();
  const pxMatch = /^(\d+(?:\.\d+)?|\.\d+)\s*px$/i.exec(trimmed);
  if (pxMatch) {
    const v = Number.parseFloat(pxMatch[1] ?? "");
    if (Number.isFinite(v)) {
      return `${Math.min(Math.max(v, 0), MAX_STROKE_PX)}px`;
    }
  }
  const unitlessPx = trimmed.match(/^(\d+(?:\.\d+)?|\.\d+)$/);
  if (unitlessPx) {
    const v = Number.parseFloat(unitlessPx[1] ?? "");
    if (Number.isFinite(v)) {
      return `${Math.min(Math.max(v, 0), MAX_STROKE_PX)}px`;
    }
  }
  return trimmed;
}

function strokeWidthPxForPad(strokeWidth: number | string): number {
  if (typeof strokeWidth === "number") {
    return Number.isFinite(strokeWidth)
      ? Math.min(Math.max(strokeWidth, 0), MAX_STROKE_PX)
      : MAX_STROKE_PX;
  }
  const trimmed = strokeWidth.trim();
  const pxMatchPx = /^(\d+(?:\.\d+)?|\.\d+)\s*px$/i.exec(trimmed);
  if (pxMatchPx) {
    const v = Number.parseFloat(pxMatchPx[1] ?? "");
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), MAX_STROKE_PX) : MAX_STROKE_PX;
  }
  const unitlessPx = trimmed.match(/^(\d+(?:\.\d+)?|\.\d+)$/);
  if (unitlessPx) {
    const v = Number.parseFloat(unitlessPx[1] ?? "");
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), MAX_STROKE_PX) : MAX_STROKE_PX;
  }
  /** rem/em/other — pad as hairline bounds (cap already documented as px-only clamp). */
  return MAX_STROKE_PX;
}

function strokeWidthToPadPx(strokeWidth: number | string): number {
  const w = strokeWidthPxForPad(strokeWidth);
  return Math.max(w, 0.5) * 4 + 20;
}

/**
 * Shared `-webkit-text-stroke` typography for hairline parity with plain CSS mega marks.
 */
interface HairlineOutlinedParagraphProps extends Pick<
  OutlinedMegaMarkProps,
  "children" | "fontSize" | "letterSpacing" | "strokeWidth" | "className"
> {
  lightStrokeColor: string;
  darkStrokeColor: string;
  ariaHidden?: boolean;
  paragraphClassName?: string;
  paragraphStyleExtras?: CSSProperties;
}

function HairlineOutlinedParagraph({
  children,
  fontSize = DEFAULT_FONT_SIZE,
  letterSpacing = DEFAULT_LETTER_SPACING,
  lightStrokeColor = DEFAULT_LIGHT_STROKE,
  darkStrokeColor = DEFAULT_DARK_STROKE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  ariaHidden,
  paragraphClassName,
  paragraphStyleExtras,
  className,
}: HairlineOutlinedParagraphProps) {
  const strokeWidthCss = strokeWidthToCss(strokeWidth);
  const paragraphStyle: CSSProperties & OutlinedStyle = {
    fontSize,
    letterSpacing,
    "--omm-stroke-width": strokeWidthCss,
    "--omm-stroke-light": lightStrokeColor,
    "--omm-stroke-dark": darkStrokeColor,
    WebkitTextStroke: "var(--omm-stroke-width) var(--omm-stroke-current)",
    ...paragraphStyleExtras,
  };

  return (
    <p
      aria-hidden={ariaHidden}
      className={cn(
        "pointer-events-none relative z-0 w-full text-center font-sans font-bold leading-none text-transparent antialiased",
        "[--omm-stroke-current:var(--omm-stroke-light)] dark:[--omm-stroke-current:var(--omm-stroke-dark)]",
        paragraphClassName,
        className,
      )}
      style={paragraphStyle}
    >
      {children}
    </p>
  );
}

/**
 * Plain WebKit-stroke headline (no SVG) — `fillOnHover` and static outline only.
 */
function OutlinedMegaMarkPlain({
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
}: Omit<
  OutlinedMegaMarkProps,
  | "gradientOnHover"
  | "hoverGradient"
  | "outlineGradient"
  | "outlineGradientStops"
>) {
  const { style: outerStyle, ...divRest } = rest;

  return (
    <div
      {...divRest}
      className={cn("w-full shrink-0 px-2 pt-8 md:pt-10", containerClassName)}
      style={
        {
          "--omm-stroke-light": lightStrokeColor,
          "--omm-stroke-dark": darkStrokeColor,
          "--omm-stroke-current": "var(--omm-stroke-light)",
          ...(outerStyle as CSSProperties),
        } as CSSProperties
      }
    >
      <HairlineOutlinedParagraph
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        lightStrokeColor={lightStrokeColor}
        darkStrokeColor={darkStrokeColor}
        strokeWidth={strokeWidth}
        paragraphClassName={
          fillOnHover
            ? "pointer-events-auto transition-colors duration-300 ease-out hover:text-[color:var(--omm-stroke-current)]"
            : undefined
        }
        className={className}
      >
        {children}
      </HairlineOutlinedParagraph>
    </div>
  );
}

/**
 * Classic dual-layer SVG mega mark: themed idle stroke + vivid gradient stroke, both clipped by coordinated
 * masks so only one hairline shows per pixel. Wrapper-level pointer mapping keeps spotlight tracking reliable.
 */
function OutlinedMegaMarkSvg({
  children,
  fontSize = DEFAULT_FONT_SIZE,
  letterSpacing = DEFAULT_LETTER_SPACING,
  lightStrokeColor = DEFAULT_LIGHT_STROKE,
  darkStrokeColor = DEFAULT_DARK_STROKE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  outlineGradient,
  outlineGradientStops,
  containerClassName,
  className,
  ...rest
}: Omit<
  OutlinedMegaMarkProps,
  "gradientOnHover" | "fillOnHover" | "hoverGradient"
>) {
  const { style: outerStyle, ...divRest } = rest;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const vbDimsRef = useRef({
    x: FALLBACK_VB_RECT[0],
    y: FALLBACK_VB_RECT[1],
    w: FALLBACK_VB_RECT[2],
    h: FALLBACK_VB_RECT[3],
  });
  const rafMoveRef = useRef(0);
  const pendingPtRef = useRef<{ x: number; y: number } | null>(null);

  const rawId = useId();
  const gradId = `omm-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const spotMaskRadId = `${gradId}-spot-rad`;
  /** Complement of `spotMaskRadId` — suppresses themed idle stroke under the hotspot so it never stacks. */
  const idleSubtractRadId = `${gradId}-idle-subtract-rad`;
  const spotMaskId = `${gradId}-spot-mask`;
  const idleSubtractMaskId = `${gradId}-idle-subtract-mask`;
  const textMeasureRef = useRef<SVGTextElement | null>(null);
  const [vbState, setVbState] = useState(() => ({
    str: FALLBACK_VIEWBOX,
    rect: FALLBACK_VB_RECT,
  }));
  const [pointerSvg, setPointerSvg] = useState<{ x: number; y: number } | null>(
    null,
  );
  const reducedMotion = useReducedMotion();

  const { stops, x1: gx1, y1: gy1, x2: gx2, y2: gy2 } =
    resolveOutlineGradientConfig(outlineGradient, outlineGradientStops);

  const strokeWidthCss = strokeWidthToCss(strokeWidth);
  const pad = strokeWidthToPadPx(strokeWidth);

  const vb = vbState.str;
  const [vbX, vbY, vbW, vbH] = vbState.rect;
  const spotRadius = Math.max(
    72,
    Math.hypot(vbW, vbH) * (reducedMotion ? 0.14 : 0.1),
  );

  useLayoutEffect(() => {
    vbDimsRef.current = { x: vbX, y: vbY, w: vbW, h: vbH };
  }, [vbX, vbY, vbW, vbH]);

  const flushPointerRaf = useCallback(() => {
    rafMoveRef.current = 0;
    const p = pendingPtRef.current;
    if (p) setPointerSvg(p);
  }, []);

  const onWrapPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const root = wrapRef.current;
      const svg = svgRef.current;
      if (!root || !svg || typeof svg.createSVGPoint !== "function") return;
      const rect = root.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();

      let ux: number;
      let uy: number;
      if (ctm) {
        const loc = pt.matrixTransform(ctm.inverse());
        ux = loc.x;
        uy = loc.y;
      } else {
        const { x: vx, y: vy, w: vbw, h: vbh } = vbDimsRef.current;
        ux = vx + (px / rect.width) * vbw;
        uy = vy + (py / rect.height) * vbh;
      }
      pendingPtRef.current = { x: ux, y: uy };

      if (!rafMoveRef.current) {
        rafMoveRef.current = requestAnimationFrame(flushPointerRaf);
      }
    },
    [flushPointerRaf],
  );

  const onWrapPointerLeave = useCallback(() => {
    pendingPtRef.current = null;
    setPointerSvg(null);
    if (rafMoveRef.current) {
      cancelAnimationFrame(rafMoveRef.current);
      rafMoveRef.current = 0;
    }
  }, []);

  useLayoutEffect(() => {
    if (!textMeasureRef.current) return;

    let raf = 0;

    function measure() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try {
          const node = textMeasureRef.current;
          if (!node || typeof node.getBBox !== "function") return;
          const bbox = node.getBBox();
          if (!(bbox.width > 4 && bbox.height > 4)) return;
          const minX = bbox.x - pad;
          const minY = bbox.y - pad;
          const w = bbox.width + pad * 2;
          const h = bbox.height + pad;
          const str = `${minX} ${minY} ${w} ${h}`;
          setVbState({ str, rect: [minX, minY, w, h] });
        } catch {
          /* empty */
        }
      });
    }

    measure();
    let ro: ResizeObserver | undefined;
    const root = wrapRef.current;
    if (root && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(root);
    }
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    document.fonts?.ready.then(measure).catch(() => measure());

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [children, fontSize, letterSpacing, strokeWidthCss, pad]);

  useLayoutEffect(() => {
    return () => {
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
    };
  }, []);

  const offsets = stops.map((_, i, arr) =>
    arr.length === 1 ? "0%" : `${(100 * i) / (arr.length - 1)}%`,
  );

  return (
    <div
      {...divRest}
      ref={wrapRef}
      role="presentation"
      onPointerMove={onWrapPointerMove}
      onPointerLeave={onWrapPointerLeave}
      className={cn(
        "[--omm-stroke-idle:var(--omm-stroke-light)] dark:[--omm-stroke-idle:var(--omm-stroke-dark)]",
        "relative isolate w-full shrink-0 cursor-crosshair overflow-visible px-2 pt-8 md:pt-10",
        "pointer-events-auto outline-none selection:bg-transparent",
        containerClassName,
      )}
      style={
        {
          "--omm-stroke-light": lightStrokeColor,
          "--omm-stroke-dark": darkStrokeColor,
          ...(outerStyle as CSSProperties),
        } as CSSProperties
      }
    >
      <span className="sr-only">{children}</span>
      <svg
        ref={svgRef}
        className={cn(
          "pointer-events-none block w-full overflow-visible select-none font-sans font-bold [&_text]:leading-none",
          className,
        )}
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
        viewBox={vb}
      >
        <defs>
          <radialGradient
            id={spotMaskRadId}
            gradientUnits="userSpaceOnUse"
            cx={pointerSvg?.x ?? vbX + vbW * 0.5}
            cy={pointerSvg?.y ?? vbY + vbH * 0.5}
            r={spotRadius}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="42%" stopColor="white" stopOpacity={0.75} />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <radialGradient
            id={idleSubtractRadId}
            gradientUnits="userSpaceOnUse"
            cx={pointerSvg?.x ?? vbX + vbW * 0.5}
            cy={pointerSvg?.y ?? vbY + vbH * 0.5}
            r={spotRadius}
          >
            <stop offset="0%" stopColor="black" />
            <stop offset="42%" stopColor="#434343" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <linearGradient
            id={gradId}
            x1={gx1}
            y1={gy1}
            x2={gx2}
            y2={gy2}
            gradientUnits="userSpaceOnUse"
          >
            {stops.map((color, idx) => (
              <stop
                key={`h-${idx}`}
                offset={offsets[idx]}
                stopColor={color}
              />
            ))}
          </linearGradient>
          <linearGradient
            id={`${gradId}-idle`}
            x1={gx1}
            y1={gy1}
            x2={gx2}
            y2={gy2}
            gradientUnits="userSpaceOnUse"
          >
            {stops.map((_, idx) => (
              <stop
                key={`i-${idx}`}
                offset={offsets[idx]}
                stopColor="var(--omm-stroke-idle, var(--omm-stroke-light))"
              />
            ))}
          </linearGradient>
          <mask
            id={spotMaskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x={vbX}
            y={vbY}
            width={vbW}
            height={vbH}
          >
            <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="black" />
            {pointerSvg ? (
              <rect
                x={vbX}
                y={vbY}
                width={vbW}
                height={vbH}
                fill={`url(#${spotMaskRadId})`}
              />
            ) : null}
          </mask>
          <mask
            id={idleSubtractMaskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x={vbX}
            y={vbY}
            width={vbW}
            height={vbH}
          >
            <rect
              x={vbX}
              y={vbY}
              width={vbW}
              height={vbH}
              fill={`url(#${idleSubtractRadId})`}
            />
          </mask>
        </defs>
        {/* Themed idle stroke */}
        <text
          ref={textMeasureRef}
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="none"
          stroke={`url(#${gradId}-idle)`}
          strokeWidth={strokeWidthCss}
          vectorEffect="nonScalingStroke"
          shapeRendering="geometricPrecision"
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke fill"
          mask={pointerSvg ? `url(#${idleSubtractMaskId})` : undefined}
          style={{
            fontSize,
            letterSpacing,
          }}
        >
          {children}
        </text>
        {/* Vivid gradient stroke — spotlight only */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidthCss}
          vectorEffect="nonScalingStroke"
          shapeRendering="geometricPrecision"
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke fill"
          mask={`url(#${spotMaskId})`}
          style={{
            fontSize,
            letterSpacing,
          }}
        >
          {children}
        </text>
      </svg>
    </div>
  );
}

/**
 * Huge responsive outlined headline — transparent fill; `gradientOnHover` renders dual-layer SVG strokes with a
 * pointer spotlight reveal, or `-webkit-text-stroke` only when gradients are disabled.
 */
export function OutlinedMegaMark({
  children,
  fontSize = DEFAULT_FONT_SIZE,
  letterSpacing = DEFAULT_LETTER_SPACING,
  lightStrokeColor = DEFAULT_LIGHT_STROKE,
  darkStrokeColor = DEFAULT_DARK_STROKE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  fillOnHover = false,
  gradientOnHover = true,
  hoverGradient,
  outlineGradient,
  outlineGradientStops,
  containerClassName,
  className,
  ...rest
}: OutlinedMegaMarkProps) {
  void hoverGradient;

  if (!gradientOnHover) {
    return (
      <OutlinedMegaMarkPlain
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        lightStrokeColor={lightStrokeColor}
        darkStrokeColor={darkStrokeColor}
        strokeWidth={strokeWidth}
        fillOnHover={fillOnHover}
        containerClassName={containerClassName}
        className={className}
        {...rest}
      >
        {children}
      </OutlinedMegaMarkPlain>
    );
  }

  return (
    <OutlinedMegaMarkSvg
      fontSize={fontSize}
      letterSpacing={letterSpacing}
      lightStrokeColor={lightStrokeColor}
      darkStrokeColor={darkStrokeColor}
      strokeWidth={strokeWidth}
      outlineGradient={outlineGradient}
      outlineGradientStops={outlineGradientStops}
      containerClassName={containerClassName}
      className={className}
      {...rest}
    >
      {children}
    </OutlinedMegaMarkSvg>
  );
}
