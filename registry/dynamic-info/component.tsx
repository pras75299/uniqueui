"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react";

export type DynamicInfoPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"
  | "static";

export type DynamicInfoMergeEdge = "top" | "bottom" | "none";

export interface DynamicInfoSocial {
  id: string;
  icon: React.ReactNode;
  label?: string;
  href?: string;
  onClick?: () => void;
}

export interface DynamicInfoStatus {
  label: string;
  color?: string;
}

export interface DynamicInfoCustomTheme {
  background?: string;
  foreground?: string;
  mutedForeground?: string;
  border?: string;
  avatarBackground?: string;
  socialBackground?: string;
  socialForeground?: string;
  socialHoverBackground?: string;
  socialHoverForeground?: string;
  statusBackground?: string;
}

export type DynamicInfoTheme =
  | "light"
  | "dark"
  | "system"
  | DynamicInfoCustomTheme;

export interface DynamicInfoProps
  extends Omit<HTMLMotionProps<"div">, "onClick" | "onKeyDown"> {
  name: string;
  role?: string;
  avatar?: string;
  fallback?: string;
  position?: DynamicInfoPosition;
  mergeEdge?: DynamicInfoMergeEdge;
  cornerSize?: number;
  socials?: DynamicInfoSocial[];
  status?: DynamicInfoStatus;
  showTime?: boolean;
  timeFormat?: "12h" | "24h";
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  theme?: DynamicInfoTheme;
}

const positionClasses: Record<DynamicInfoPosition, string> = {
  "top-left": "fixed top-0 left-0 z-50",
  "top-right": "fixed top-0 right-0 z-50",
  "top-center": "fixed top-0 left-1/2 -translate-x-1/2 z-50",
  "bottom-left": "fixed bottom-0 left-0 z-50",
  "bottom-right": "fixed bottom-0 right-0 z-50",
  "bottom-center": "fixed bottom-0 left-1/2 -translate-x-1/2 z-50",
  static: "",
};

function deriveMergeEdge(position: DynamicInfoPosition): DynamicInfoMergeEdge {
  if (position.startsWith("top-")) return "top";
  if (position.startsWith("bottom-")) return "bottom";
  return "none";
}

function getRadiusStyle(edge: DynamicInfoMergeEdge, radius: number) {
  if (edge === "top") {
    return {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    };
  }
  if (edge === "bottom") {
    return {
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    };
  }
  return {
    borderRadius: radius,
  };
}

const lightPalette: Required<DynamicInfoCustomTheme> = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  mutedForeground: "#737373",
  border: "#e5e5e5",
  avatarBackground: "#e5e5e5",
  socialBackground: "#f5f5f5",
  socialForeground: "#525252",
  socialHoverBackground: "#e5e5e5",
  socialHoverForeground: "#0a0a0a",
  statusBackground: "#f5f5f5",
};

const darkPalette: Required<DynamicInfoCustomTheme> = {
  background: "#0a0a0a",
  foreground: "#ffffff",
  mutedForeground: "#a3a3a3",
  border: "#262626",
  avatarBackground: "#262626",
  socialBackground: "#171717",
  socialForeground: "#d4d4d4",
  socialHoverBackground: "#262626",
  socialHoverForeground: "#ffffff",
  statusBackground: "#171717",
};

function useResolvedPalette(
  theme: DynamicInfoTheme,
): Required<DynamicInfoCustomTheme> {
  const [systemMode, setSystemMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemMode(media.matches ? "dark" : "light");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  return useMemo(() => {
    if (theme === "light") return lightPalette;
    if (theme === "dark") return darkPalette;
    if (theme === "system")
      return systemMode === "dark" ? darkPalette : lightPalette;
    return { ...darkPalette, ...theme };
  }, [theme, systemMode]);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(date: Date, format: "12h" | "24h") {
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  if (format === "24h") {
    return `${hours24.toString().padStart(2, "0")}:${minutes}`;
  }
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.7,
};

const SAFE_EXTERNAL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function getSafeHref(href?: string) {
  if (!href) return null;
  try {
    const parsed = new URL(href, "https://uniqueui.local");
    if (!SAFE_EXTERNAL_PROTOCOLS.has(parsed.protocol)) return null;
    return href;
  } catch {
    return null;
  }
}

function getSafeAvatarSrc(src?: string) {
  if (!src) return null;
  if (src.startsWith("/")) return src;
  try {
    const parsed = new URL(src);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return src;
    return null;
  } catch {
    return null;
  }
}

function InvertedCorner({
  edge,
  side,
  size,
  color,
}: {
  edge: "top" | "bottom";
  side: "left" | "right";
  size: number;
  color: string;
}) {
  const verticalAnchor = edge === "top" ? "top" : "bottom";
  const horizontalAnchor = side === "left" ? "right" : "left";
  const maskX = side === "left" ? "0%" : "100%";
  const maskY = edge === "top" ? "100%" : "0%";
  const mask = `radial-gradient(circle ${size}px at ${maskX} ${maskY}, transparent ${
    size - 1
  }px, rgba(0, 0, 0, 0.92) ${size - 0.35}px, #000 ${size}px)`;

  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        [verticalAnchor]: 0,
        [horizontalAnchor]: "calc(100% - 0.5px)",
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: mask,
        maskImage: mask,
        pointerEvents: "none",
      }}
    />
  );
}

function MergeBar({
  edge,
  height,
  color,
}: {
  edge: "top" | "bottom";
  height: number;
  color: string;
}) {
  const verticalAnchor = edge === "top" ? "top" : "bottom";
  const sideOffset = "calc(100% - 0.5px)";

  return (
    <>
      <span
        aria-hidden
        style={{
          position: "absolute",
          [verticalAnchor]: 0,
          right: sideOffset,
          width: "100vw",
          height,
          backgroundColor: color,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          [verticalAnchor]: 0,
          left: sideOffset,
          width: "100vw",
          height,
          backgroundColor: color,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}

export function DynamicInfo({
  name,
  role,
  avatar,
  fallback,
  position = "static",
  mergeEdge,
  cornerSize = 24,
  socials,
  status,
  showTime = true,
  timeFormat = "12h",
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  theme = "dark",
  className,
  ...rest
}: DynamicInfoProps) {
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? expanded : internalExpanded;

  const hasExtras = (socials && socials.length > 0) || !!status;

  const toggle = () => {
    if (!hasExtras) return;
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const [now, setNow] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (!showTime) return;
    const tick = () => setNow(new Date());
    const start = window.setTimeout(() => {
      tick();
      intervalRef.current = window.setInterval(tick, 1000);
    }, 0);
    return () => {
      window.clearTimeout(start);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [showTime]);

  const timeLabel = useMemo(
    () => (now ? formatTime(now, timeFormat) : ""),
    [now, timeFormat],
  );

  const palette = useResolvedPalette(theme);
  const initials = fallback ?? getInitials(name);
  const statusColor = status?.color ?? "#22c55e";
  const edge = mergeEdge ?? deriveMergeEdge(position);
  const radiusStyle = getRadiusStyle(edge, cornerSize);
  const mergeBarHeight = Math.max(6, Math.round(cornerSize * 0.5));
  const safeAvatarSrc = getSafeAvatarSrc(avatar);

  const extrasId = React.useId();

  return (
    <motion.div
      {...rest}
      layout
      transition={spring}
      style={{
        backgroundColor: palette.background,
        color: palette.foreground,
        borderWidth: 0,
        ...radiusStyle,
      }}
      className={cn(
        "relative inline-flex flex-col select-none shadow-lg",
        positionClasses[position],
        className,
      )}
    >
      {edge !== "none" && (
        <>
          <MergeBar
            edge={edge}
            height={mergeBarHeight}
            color={palette.background}
          />
          <InvertedCorner
            edge={edge}
            side="left"
            size={cornerSize}
            color={palette.background}
          />
          <InvertedCorner
            edge={edge}
            side="right"
            size={cornerSize}
            color={palette.background}
          />
        </>
      )}

      <motion.button
        type="button"
        layout
        onClick={hasExtras ? toggle : undefined}
        aria-expanded={hasExtras ? isExpanded : undefined}
        aria-controls={hasExtras ? extrasId : undefined}
        disabled={!hasExtras}
        className={cn(
          "relative z-10 flex w-full items-center gap-3 px-3 py-2.5 border-0 bg-transparent text-left appearance-none",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-current",
          hasExtras ? "cursor-pointer" : "cursor-default",
        )}
        style={{ color: "inherit", borderRadius: "inherit" }}
      >
        <motion.div
          layout
          className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            width: 36,
            height: 36,
            backgroundColor: palette.avatarBackground,
          }}
        >
          {safeAvatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={safeAvatarSrc}
              alt={name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="text-sm font-semibold">{initials}</span>
          )}
        </motion.div>

        <motion.div layout className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{name}</span>
          {role && (
            <span
              className="truncate text-xs"
              style={{ color: palette.mutedForeground }}
            >
              {role}
            </span>
          )}
        </motion.div>

        {showTime && (
          <motion.span
            layout
            className="ml-6 shrink-0 pr-2 text-sm font-medium tabular-nums"
            aria-label="current time"
          >
            {timeLabel || " "}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && hasExtras && (
          <motion.div
            id={extrasId}
            role="region"
            key="extras"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <motion.div
              layout
              className="relative z-10 flex items-center justify-between gap-3 px-3 pb-3 pt-0"
            >
              <div className="flex items-center gap-2">
                {socials?.map((social) => (
                  <SocialButton
                    key={social.id}
                    social={social}
                    palette={palette}
                  />
                ))}
              </div>

              {status && (
                <motion.div
                  layout
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: palette.statusBackground,
                    color: statusColor,
                  }}
                >
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statusColor }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {status.label}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SocialButton({
  social,
  palette,
}: {
  social: DynamicInfoSocial;
  palette: Required<DynamicInfoCustomTheme>;
}) {
  const [hovered, setHovered] = useState(false);
  const safeHref = getSafeHref(social.href);
  const openInNewTab = !!safeHref && (safeHref.startsWith("http://") || safeHref.startsWith("https://"));

  const content = (
    <motion.span
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        backgroundColor: hovered
          ? palette.socialHoverBackground
          : palette.socialBackground,
        color: hovered
          ? palette.socialHoverForeground
          : palette.socialForeground,
      }}
      className="flex h-7 w-7 items-center justify-center rounded-md"
    >
      {social.icon}
    </motion.span>
  );

  const shared = {
    "aria-label": social.label ?? social.id,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      social.onClick?.();
    },
  };

  return safeHref ? (
    <a
      href={safeHref}
      {...(openInNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...shared}
    >
      {content}
    </a>
  ) : (
    <button type="button" {...shared}>
      {content}
    </button>
  );
}
