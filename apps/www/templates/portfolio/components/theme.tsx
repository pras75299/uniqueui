"use client";

/**
 * Hallmark · component: theme module · genre: editorial
 *
 * Local-only theme system for the Inkline portfolio template. Self-contained
 * by design: no dependency on apps/www's `ThemeProvider`, so the downloaded
 * standalone ZIP works without any wiring.
 *
 * Pattern matches `saas-fintech-landing/components/theme.ts` — a `getPortfolioTokens(theme)`
 * helper returns inline-style tokens — but with an added `usePortfolioTheme()`
 * hook (module-level store + `useSyncExternalStore`) so the toggle can live
 * anywhere in the tree and every section stays in sync without prop drilling.
 *
 * Token contract:
 *  • paper / ink invert across modes (dark ↔ light)
 *  • brass is the CONSTANT anchor — slightly retuned per mode for AA contrast
 *    on its paper, but it stays brass on both. The whole template is recognisable
 *    in either mode because of this.
 *  • hairlines + soft surfaces shift to fit each paper
 */

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark";

export type PortfolioTokens = {
  /** Base paper colour for the page */
  paper: string;
  /** Slightly raised surface for cards / hover affordances */
  paperRaise: string;
  /** Hairline rule colour (1px borders, dividers) */
  paperRule: string;
  /** Primary text — high-contrast against paper */
  ink: string;
  /** Secondary text — body, descriptions */
  inkSoft: string;
  /** Tertiary text — meta, dates */
  inkMute: string;
  /** The single chromatic anchor — used for the eyebrow, italic emphasis,
   *  hover underlines, the timeline dot. Constant identity across themes. */
  brass: string;
  /** Pressed / deep variant of brass */
  brassDeep: string;
  /** A faint brass wash, used in radial glows and edge fades */
  brassGlow: string;
  /** Hero orbiting-orb accent. In dark mode this is brass (warm light on
   *  deep paper). In light mode it shifts to a deep ink-blue — cool contrast
   *  against warm cream, like fountain-pen ink against magazine stock. This
   *  is the one place the design system allows a mode-specific accent
   *  divergence; brass elsewhere stays brass across both modes. */
  orbAccent: string;
};

// ── Token tables ────────────────────────────────────────────────────────────

const DARK_TOKENS: PortfolioTokens = {
  paper:      "#0B0D14",    // oklch(14% 0.012 250) — deep ink, not pure black
  paperRaise: "#13161F",
  paperRule:  "#1F2330",
  ink:        "#F2EEDB",    // oklch(95% 0.018 85) — warm cream
  inkSoft:    "#A8A292",    // oklch(70% 0.022 80)
  inkMute:    "#5C5849",    // oklch(42% 0.020 80)
  brass:      "#C09A6B",    // oklch(72% 0.10 60)
  brassDeep:  "#7A6242",
  brassGlow:  "rgba(192, 154, 107, 0.06)",
  orbAccent:  "#C09A6B",    // warm brass light on deep paper
};

const LIGHT_TOKENS: PortfolioTokens = {
  paper:      "#F8F5EC",    // warm cream
  paperRaise: "#FFFCF2",    // near-white inset
  paperRule:  "#E2DCC9",    // hairlines visible on cream
  ink:        "#1A1714",    // deep ink, slight warm cast
  inkSoft:    "#4A463C",
  inkMute:    "#7A766B",
  brass:      "#8E6938",    // darker brass — AA against cream paper
  brassDeep:  "#6B4F2A",
  brassGlow:  "rgba(142, 105, 56, 0.08)",
  orbAccent:  "#3D5174",    // deep ink-blue — cool contrast on cream
};

export function getPortfolioTokens(theme: Theme): PortfolioTokens {
  return theme === "light" ? LIGHT_TOKENS : DARK_TOKENS;
}

// ── Fonts (theme-invariant) ─────────────────────────────────────────────────

export const portfolioFonts = {
  display: `"Fraunces", "Newsreader", "Source Serif Pro", Georgia, "Times New Roman", serif`,
  body:    `"Geist", "Inter", system-ui, -apple-system, sans-serif`,
  mono:    `"Geist Mono", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`,
} as const;

// ── Module-level store + useSyncExternalStore hook ──────────────────────────

const STORAGE_KEY = "inkline-portfolio-theme";
const SSR_DEFAULT: Theme = "dark";

let cached: Theme = SSR_DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

// Cross-tab storage sync — registered ONCE at module scope, not per
// subscriber. Previously this was inside subscribe() and got attached once
// per component using the hook (10+ duplicate listeners + N² emit cascades
// on a storage event). The flag prevents double-registration under HMR.
let storageBound = false;
function bindStorageListener() {
  if (storageBound || typeof window === "undefined") return;
  storageBound = true;
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    if (e.newValue === "light" || e.newValue === "dark") {
      cached = e.newValue;
      emit();
    }
  });
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  bindStorageListener();
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Theme {
  // After hydration, return whatever the store currently holds.
  // Before hydration (or on the server), return the SSR default.
  if (typeof window === "undefined" || !hydrated) return SSR_DEFAULT;
  return cached;
}

function getServerSnapshot(): Theme {
  return SSR_DEFAULT;
}

export function usePortfolioTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Read stored preference once on mount. Guarded with `hydrated` so only
  // the FIRST mount across all hook consumers does the localStorage read +
  // emit. Without this guard every component using usePortfolioTheme
  // re-emitted on mount, causing redundant rerender cascades.
  useEffect(() => {
    if (hydrated) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        cached = stored;
      }
    } catch {
      // localStorage unavailable (SSR, private mode, etc.) — stay on default
    }
    hydrated = true;
    emit();
  }, []);

  const setTheme = useCallback((t: Theme) => {
    cached = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
    emit();
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = cached === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}

// ── ThemeToggle — small button used in nav ──────────────────────────────────

export function ThemeToggle() {
  const { theme, toggleTheme } = usePortfolioTheme();
  const tokens = getPortfolioTokens(theme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={!isDark}
      className="portfolio-theme-toggle"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        padding: 0,
        borderRadius: 999,
        background: "transparent",
        border: `1px solid ${tokens.paperRule}`,
        color: tokens.inkSoft,
        cursor: "pointer",
        transition: "color 200ms ease, border-color 200ms ease, background 200ms ease",
        flexShrink: 0,
        outline: "none",
      }}
    >
      {/* Two glyphs stacked, one fades in / one fades out by theme.
          Symbol-only — labels would compete with the email CTA two cells left.
          aria-label above carries the semantic meaning. */}
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 14,
          height: 14,
          display: "block",
        }}
      >
        {/* Moon — visible when dark */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            inset: 0,
            opacity: isDark ? 1 : 0,
            transform: `rotate(${isDark ? 0 : -45}deg)`,
            transition: "opacity 240ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <path d="M11 8.5A4.5 4.5 0 0 1 5.5 3a4.5 4.5 0 1 0 5.5 5.5z" />
        </svg>
        {/* Sun — visible when light */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            inset: 0,
            opacity: isDark ? 0 : 1,
            transform: `rotate(${isDark ? 45 : 0}deg)`,
            transition: "opacity 240ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <circle cx="7" cy="7" r="2.4" />
          <path d="M7 1.5v1.6M7 10.9v1.6M1.5 7h1.6M10.9 7h1.6M3 3l1.1 1.1M9.9 9.9l1.1 1.1M3 11l1.1-1.1M9.9 4.1l1.1-1.1" />
        </svg>
      </span>
      <style>{`
        .portfolio-theme-toggle:hover {
          color: ${tokens.brass};
          border-color: ${tokens.brass};
        }
        .portfolio-theme-toggle:focus-visible {
          outline: 2px solid ${tokens.brassDeep};
          outline-offset: 3px;
        }
      `}</style>
    </button>
  );
}
