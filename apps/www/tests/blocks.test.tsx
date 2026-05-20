// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import React from "react";

// ── jsdom shims (motion + the heroes touch these) ──────────────────────────
// We capture the original descriptors so `afterAll` can restore them — otherwise
// the patched globals leak to subsequent test files in the same Vitest run.
const originalIntersectionObserver = (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
const originalResizeObserver = (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
const originalMatchMedia = window.matchMedia;
const originalGetContext = HTMLCanvasElement.prototype.getContext;

beforeAll(() => {
    class MockIntersectionObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = "";
        thresholds: number[] = [];
    }
    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        configurable: true,
        value: MockIntersectionObserver,
    });
    Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        configurable: true,
        value: class {
            observe = vi.fn();
            disconnect = vi.fn();
            unobserve = vi.fn();
        },
    });
    if (!window.matchMedia) {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: (q: string) => ({
                matches: false,
                media: q,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }),
        });
    }
    // noise-dot-field uses <canvas>. jsdom returns null from getContext; pass a
    // benign stub so the early-return-if-null branch runs cleanly.
    if (!HTMLCanvasElement.prototype.getContext) {
        // @ts-expect-error — minimal stub, callers only need .getContext to not throw
        HTMLCanvasElement.prototype.getContext = () => null;
    }
});

afterAll(() => {
    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        configurable: true,
        value: originalIntersectionObserver,
    });
    Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        configurable: true,
        value: originalResizeObserver,
    });
    if (originalMatchMedia) {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: originalMatchMedia,
        });
    } else {
        delete (window as unknown as { matchMedia?: unknown }).matchMedia;
    }
    if (originalGetContext) {
        HTMLCanvasElement.prototype.getContext = originalGetContext;
    } else {
        // @ts-expect-error — undo the stub we installed in beforeAll
        delete HTMLCanvasElement.prototype.getContext;
    }
});

afterEach(() => cleanup());

import { ReferencePulseHero } from "@/components/ui/hero-reference-pulse";
import { IridescentSweepHero } from "@/components/ui/hero-iridescent-sweep";
import { LiquidAuroraMeshHero } from "@/components/ui/hero-liquid-aurora-mesh";
import { NoiseDotFieldHero } from "@/components/ui/hero-noise-dot-field";
import { LogoMarqueeHero, LogoMarqueeRow } from "@/components/ui/hero-logo-marquee";

// Two contracts every hero block must keep:
//  1. Render a single <h1> headline (semantic structure used by SEO + a11y).
//  2. When children are passed, render them in place of the default copy
//     (the "drop-in slot" the registry advertises). The copy substring checks
//     guard against accidentally rewiring the slot to render alongside default
//     content instead of replacing it.
describe("Hero blocks — render contract", () => {
    it.each([
        { name: "ReferencePulseHero", Component: ReferencePulseHero },
        { name: "IridescentSweepHero", Component: IridescentSweepHero },
        { name: "LiquidAuroraMeshHero", Component: LiquidAuroraMeshHero },
        { name: "NoiseDotFieldHero", Component: NoiseDotFieldHero },
        { name: "LogoMarqueeHero", Component: LogoMarqueeHero },
    ])("$name exposes a single <h1> heading via the default-content slot", ({ Component }) => {
        const { getAllByRole } = render(<Component />);
        const headings = getAllByRole("heading", { level: 1 });
        expect(headings).toHaveLength(1);
        // Headline node has non-empty accessible text (defends against the
        // headline being wired up as an empty container by mistake).
        expect((headings[0].textContent ?? "").trim().length).toBeGreaterThan(0);
    });

    it.each([
        { name: "ReferencePulseHero", Component: ReferencePulseHero },
        { name: "IridescentSweepHero", Component: IridescentSweepHero },
        { name: "LiquidAuroraMeshHero", Component: LiquidAuroraMeshHero },
        { name: "NoiseDotFieldHero", Component: NoiseDotFieldHero },
        { name: "LogoMarqueeHero", Component: LogoMarqueeHero },
    ])("$name renders children in place of the default copy", ({ Component }) => {
        const { getByTestId, queryByRole } = render(
            <Component>
                <div data-testid="override-slot">Custom hero content</div>
            </Component>,
        );
        // The slot is rendered…
        expect(getByTestId("override-slot")).toHaveTextContent("Custom hero content");
        // …and the default headline is *replaced*, not rendered alongside.
        // (Background SVG <text> elements aren't headings, so no h1 should exist.)
        expect(queryByRole("heading", { level: 1 })).toBeNull();
    });

    // Light coverage of the default copy guards against accidentally swapping
    // a hero's identity (e.g. wiring NoiseDotFieldHero to render the pulse
    // default content). One substring per hero — kept minimal on purpose.
    it("default copies are still wired to the right hero", () => {
        expect(render(<ReferencePulseHero />).container.textContent).toContain(
            "Build with light, not boxes.",
        );
        cleanup();
        expect(render(<IridescentSweepHero />).container.textContent).toContain(
            "Pressed in light.",
        );
        cleanup();
        expect(render(<LiquidAuroraMeshHero />).container.textContent).toContain(
            "Liquid · Aurora · Mesh",
        );
        cleanup();
        expect(render(<NoiseDotFieldHero />).container.textContent).toContain(
            "Engineered, down to the pixel.",
        );
        cleanup();
        expect(render(<LogoMarqueeHero />).container.textContent).toContain(
            "The platform shipping teams ship with.",
        );
    });
});

describe("LogoMarqueeHero — logo wiring", () => {
    it("renders each logo twice (seamless loop relies on a duplicated list)", () => {
        const logos = ["Vercel", "Linear", "Stripe"];
        const { container } = render(<LogoMarqueeHero logos={logos} secondaryLogos={null} />);
        // Match the brand text inside list items. The component renders 2x logos.length
        // <li> children for the primary row; secondaryLogos={null} disables the second row.
        const items = container.querySelectorAll("li");
        expect(items.length).toBe(logos.length * 2);
        for (const brand of logos) {
            const matches = Array.from(items).filter((li) => li.textContent?.includes(brand));
            expect(matches.length).toBe(2);
        }
    });

    it("hides the second row when secondaryLogos={null}", () => {
        const { container } = render(<LogoMarqueeHero secondaryLogos={null} />);
        // Each row renders one <ul>; only the primary row should be present.
        expect(container.querySelectorAll("ul")).toHaveLength(1);
    });

    it("exposes data-slot=marquee so /blocks thumbnails can hide the ticker region", () => {
        const { container } = render(<LogoMarqueeHero />);
        expect(container.querySelector('[data-slot="marquee"]')).toBeInTheDocument();
    });

    it("LogoMarqueeRow renders standalone with custom logos", () => {
        const { container } = render(<LogoMarqueeRow logos={["A", "B"]} />);
        expect(container.querySelectorAll("li")).toHaveLength(4);
    });

    it("LogoMarqueeRow exposes a default accessible name — screen readers must not get an anonymous ticker", () => {
        const { getByRole } = render(<LogoMarqueeRow logos={["A", "B"]} />);
        expect(getByRole("list", { name: "Customer logos" })).toBeInTheDocument();
    });

    it("LogoMarqueeRow honors a custom `label` prop", () => {
        const { getByRole } = render(<LogoMarqueeRow logos={["A"]} label="Trusted by" />);
        expect(getByRole("list", { name: "Trusted by" })).toBeInTheDocument();
    });

    it("LogoMarqueeHero distinguishes its two rows by label — avoids identical SR announcements", () => {
        const { getByRole } = render(<LogoMarqueeHero logos={["A", "B"]} />);
        expect(getByRole("list", { name: "Customer logos" })).toBeInTheDocument();
        expect(getByRole("list", { name: "More customer logos" })).toBeInTheDocument();
    });
});

describe("Hero blocks — pointer listeners do not throw", () => {
    it("LiquidAuroraMeshHero survives a window pointermove", () => {
        const { container } = render(<LiquidAuroraMeshHero />);
        expect(() => {
            window.dispatchEvent(
                new PointerEvent("pointermove", { clientX: 10, clientY: 20 }),
            );
        }).not.toThrow();
        expect(container).toBeTruthy();
    });

    it("NoiseDotFieldHero survives a window pointermove", () => {
        const { container } = render(<NoiseDotFieldHero />);
        expect(() => {
            window.dispatchEvent(
                new PointerEvent("pointermove", { clientX: 10, clientY: 20 }),
            );
        }).not.toThrow();
        expect(container).toBeTruthy();
    });
});
