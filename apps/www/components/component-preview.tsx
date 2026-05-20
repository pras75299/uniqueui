"use client";

import { forwardRef, useRef, type ForwardedRef, type RefObject } from "react";
import { motion, useInView } from "motion/react";
import { componentDemos } from "@/config/demos";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

type ComponentPreviewProps = {
  slug: string;
  /** Extra class names merged on the root motion.div via `cn` (consumer style overrides). */
  className?: string;
  /** "block" suppresses the grid backdrop and uses a full-hero min-height. */
  /** "thumbnail" — `/blocks` index cards: full hero height, content optically centered in crop. */
  variant?: "default" | "block" | "thumbnail";
  /**
   * When true, the inner demo only mounts while the preview is near or inside
   * the viewport. Used by `/blocks` to keep dozens of motion timelines / RAF
   * loops / pointer listeners from running on off-screen cards.
   *
   * Implementation note: we split into Eager / Lazy components so the
   * `useInView` hook (and its IntersectionObserver) only runs when actually
   * needed. The default `/components` pages render ~60 previews and don't
   * benefit from observing them.
   */
  lazy?: boolean;
  /**
   * When `lazy` is set, observe this root for intersection (e.g. the card
   * frame). Avoids missed mounts when the preview sits inside a transformed
   * scale wrapper on `/blocks`.
   */
  lazyRoot?: RefObject<Element | null>;
};

export default function ComponentPreview(props: ComponentPreviewProps) {
  return props.lazy ? <LazyPreview {...props} /> : <EagerPreview {...props} />;
}

function EagerPreview(props: ComponentPreviewProps) {
  return <PreviewShell {...props} shouldRender />;
}

function LazyPreview({ lazyRoot, ...props }: ComponentPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // `once: false` → demo unmounts on exit, freeing RAF / pointer listeners.
  // 200px above + below the viewport warms the demo before scroll reaches it.
  const isInView = useInView(lazyRoot ?? cardRef, {
    once: false,
    margin: "200px 0px",
  });
  return <PreviewShell {...props} shouldRender={isInView} ref={cardRef} />;
}

type PreviewShellProps = ComponentPreviewProps & { shouldRender: boolean };

const PreviewShell = forwardRef<HTMLDivElement, PreviewShellProps>(function PreviewShell(
  { slug, className, variant = "default", shouldRender },
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { theme } = useTheme();
  const Demo = componentDemos[slug];

  if (!Demo) {
    return (
      <div className="flex items-center justify-center p-12 text-neutral-500 bg-neutral-900/10 border border-neutral-800 rounded-lg border-dashed">
        Preview not available
      </div>
    );
  }

  const isDark = theme === "dark";
  const isBlock = variant === "block";
  const isThumbnail = variant === "thumbnail";
  const isHeroFrame = isBlock || isThumbnail;
  const hasOverflowHidden =
    isHeroFrame || (slug !== "horizontal-scroll-gallery" && slug !== "outlined-mega-mark");
  const isOutlinedMegaMark = !isHeroFrame && slug === "outlined-mega-mark";

  return (
    <motion.div
      ref={ref}
      className={cn(
        "w-full rounded-xl border relative flex",
        isThumbnail
          ? "min-h-[100svh] items-center justify-center"
          : isBlock
            ? "min-h-[70svh] items-stretch"
            : isOutlinedMegaMark
              ? "min-h-[min(32rem,82dvh)] flex-col items-stretch py-4 sm:py-6"
              : "min-h-[300px] items-center justify-center",
        hasOverflowHidden && "overflow-hidden",
        isThumbnail && "rounded-none border-0",
        isDark ? "border-neutral-800 bg-neutral-950/50" : "border-neutral-200 bg-neutral-50/80",
        className,
      )}
      initial={false}
      animate={{
        backgroundColor: isHeroFrame
          ? isDark
            ? "rgb(10,10,10)"
            : "rgb(255,255,255)"
          : isDark
            ? "rgba(10,10,10,0.5)"
            : "rgba(250,250,250,0.8)",
        borderColor: isThumbnail
          ? "transparent"
          : isDark
            ? "rgb(38,38,38)"
            : "rgb(229,229,229)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {!isHeroFrame && (
        <div
          className={cn(
            "absolute inset-0 z-0 opacity-20 pointer-events-none [background-size:24px_24px]",
            hasOverflowHidden ? "" : "rounded-xl overflow-hidden",
            isDark
              ? "[background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]"
              : "[background-image:linear-gradient(to_right,#d4d4d4_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d4_1px,transparent_1px)]",
          )}
        />
      )}
      <div
        className={cn(
          "relative z-10 w-full",
          isOutlinedMegaMark &&
            "flex min-h-0 flex-1 flex-col items-center justify-center",
        )}
      >
        {shouldRender ? (
          <Demo theme={theme} />
        ) : (
          <LazyPlaceholder
            isBlock={isBlock}
            isThumbnail={isThumbnail}
            isOutlinedMegaMark={isOutlinedMegaMark}
          />
        )}
      </div>
    </motion.div>
  );
});

/**
 * Placeholder mirrors the eager branch's min-height so the live demo can swap
 * in without triggering a layout shift. Sizing is kept in lockstep with the
 * `motion.div` className above (block / outlined-mega-mark / default).
 */
function LazyPlaceholder({
  isBlock,
  isThumbnail,
  isOutlinedMegaMark,
}: {
  isBlock: boolean;
  isThumbnail: boolean;
  isOutlinedMegaMark: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-full w-full",
        isThumbnail
          ? "min-h-[100svh]"
          : isBlock
            ? "min-h-[70svh]"
            : isOutlinedMegaMark
              ? "min-h-[min(32rem,82dvh)]"
              : "min-h-[300px]",
      )}
    />
  );
}
